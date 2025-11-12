import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    projectId: v.id("projects"),
    assigneeId: v.optional(v.id("users")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    estimatedHours: v.number(),
    dueDate: v.number(),
    tags: v.optional(v.array(v.string())),
    parentTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const taskId = await ctx.db.insert("tasks", {
      ...args,
      status: "todo",
    });

    if (args.assigneeId) {
      await ctx.db.insert("notifications", {
        userId: args.assigneeId,
        title: "New Task Assigned",
        message: `You have been assigned: ${args.title}`,
        type: "task_assigned",
        isRead: false,
        relatedId: taskId,
      });
    }

    return taskId;
  },
});

export const list = query({
  args: { projectId: v.optional(v.id("projects")) },
  handler: async (ctx, args) => {
    let tasks;
    
    if (args.projectId !== undefined) {
      const projectId = args.projectId;
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .collect();
    } else {
      tasks = await ctx.db.query("tasks").collect();
    }
    
    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const assignee = task.assigneeId ? await ctx.db.get(task.assigneeId) : null;
        const project = await ctx.db.get(task.projectId);
        
        return {
          ...task,
          assigneeName: assignee?.name || "Unassigned",
          projectName: project?.name || "Unknown",
        };
      })
    );

    return tasksWithDetails;
  },
});

export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("review"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.taskId, {
      status: args.status,
    });
  },
});

export const assignTask = mutation({
  args: {
    taskId: v.id("tasks"),
    assigneeId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.taskId, {
      assigneeId: args.assigneeId,
    });

    await ctx.db.insert("notifications", {
      userId: args.assigneeId,
      title: "New Task Assigned",
      message: `You have been assigned: ${task.title}`,
      type: "task_assigned",
      isRead: false,
      relatedId: args.taskId,
    });
  },
});

export const getMyTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assigneeId", userId))
      .collect();

    const tasksWithProjects = await Promise.all(
      tasks.map(async (task) => {
        const project = await ctx.db.get(task.projectId);
        return {
          ...task,
          projectName: project?.name || "Unknown",
        };
      })
    );

    return tasksWithProjects;
  },
});
