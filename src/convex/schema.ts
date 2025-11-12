import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// User roles for ProDeX
export const ROLES = {
  ADMIN: "admin" as const,
  MANAGER: "manager" as const,
  EMPLOYEE: "employee" as const,
};

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.MANAGER),
  v.literal(ROLES.EMPLOYEE),
);
export type Role = Infer<typeof roleValidator>;

// Task status
export const taskStatusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("review"),
  v.literal("completed"),
);
export type TaskStatus = Infer<typeof taskStatusValidator>;

// Project priority
export const priorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
);
export type Priority = Infer<typeof priorityValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      employeeId: v.optional(v.string()),
      skills: v.optional(v.array(v.string())),
      department: v.optional(v.string()),
      availability: v.optional(v.number()), // 0-100 percentage
      currentWorkload: v.optional(v.number()), // hours per week
    }).index("email", ["email"]),

    teams: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      department: v.string(),
      leadId: v.id("users"),
      isActive: v.boolean(),
    })
      .index("by_department", ["department"])
      .index("by_lead", ["leadId"]),

    teamMembers: defineTable({
      teamId: v.id("teams"),
      userId: v.id("users"),
      role: v.string(),
    })
      .index("by_team", ["teamId"])
      .index("by_user", ["userId"]),

    projects: defineTable({
      name: v.string(),
      description: v.string(),
      goal: v.optional(v.string()),
      priority: priorityValidator,
      startDate: v.number(),
      endDate: v.number(),
      managerId: v.id("users"),
      teamId: v.id("teams"),
      status: v.string(), // planning, active, on-hold, completed
      progress: v.number(), // 0-100
    })
      .index("by_team", ["teamId"])
      .index("by_manager", ["managerId"])
      .index("by_status", ["status"])
      .index("by_priority", ["priority"]),

    tasks: defineTable({
      title: v.string(),
      description: v.string(),
      projectId: v.id("projects"),
      assigneeId: v.optional(v.id("users")),
      status: taskStatusValidator,
      priority: priorityValidator,
      estimatedHours: v.number(),
      actualHours: v.optional(v.number()),
      dueDate: v.number(),
      dependencies: v.optional(v.array(v.id("tasks"))),
      tags: v.optional(v.array(v.string())),
      parentTaskId: v.optional(v.id("tasks")),
    })
      .index("by_project", ["projectId"])
      .index("by_assignee", ["assigneeId"])
      .index("by_status", ["status"])
      .index("by_priority", ["priority"]),

    notifications: defineTable({
      userId: v.id("users"),
      title: v.string(),
      message: v.string(),
      type: v.string(), // task_assigned, deadline, update, etc.
      isRead: v.boolean(),
      relatedId: v.optional(v.string()), // task/project ID
    })
      .index("by_user", ["userId"])
      .index("by_read_status", ["userId", "isRead"]),

    activityLogs: defineTable({
      userId: v.id("users"),
      action: v.string(),
      entityType: v.string(), // task, project, team
      entityId: v.string(),
      details: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_entity", ["entityType", "entityId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;