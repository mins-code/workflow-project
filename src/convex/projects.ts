import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    startDate: v.number(),
    endDate: v.number(),
    managerId: v.id("users"),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const projectId = await ctx.db.insert("projects", {
      ...args,
      status: "planning",
      progress: 0,
    });

    return projectId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const manager = await ctx.db.get(project.managerId);
        const team = await ctx.db.get(project.teamId);
        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        
        const completedTasks = tasks.filter(t => t.status === "completed").length;
        
        return {
          ...project,
          managerName: manager?.name || "Unknown",
          teamName: team?.name || "Unknown",
          totalTasks: tasks.length,
          completedTasks,
        };
      })
    );

    return projectsWithDetails;
  },
});

export const getById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const manager = await ctx.db.get(project.managerId);
    const team = await ctx.db.get(project.teamId);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return {
      ...project,
      manager,
      team,
      tasks,
    };
  },
});

export const updateProgress = mutation({
  args: {
    projectId: v.id("projects"),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      progress: args.progress,
    });
  },
});
