import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const projects = await ctx.db.query("projects").collect();
    const tasks = await ctx.db.query("tasks").collect();
    const teams = await ctx.db.query("teams").collect();
    const users = await ctx.db.query("users").collect();

    const activeProjects = projects.filter(p => p.status === "active").length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
    const overdueTasks = tasks.filter(t => t.dueDate < Date.now() && t.status !== "completed").length;

    return {
      totalProjects: projects.length,
      activeProjects,
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalTeams: teams.length,
      totalEmployees: users.length,
      completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
    };
  },
});

export const getTeamPerformance = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    
    const teamStats = await Promise.all(
      teams.map(async (team) => {
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();
        
        const allTasks = await Promise.all(
          projects.map(async (project) => {
            return await ctx.db
              .query("tasks")
              .withIndex("by_project", (q) => q.eq("projectId", project._id))
              .collect();
          })
        );
        
        const tasks = allTasks.flat();
        const completedTasks = tasks.filter(t => t.status === "completed").length;
        
        return {
          teamName: team.name,
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks,
          completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        };
      })
    );

    return teamStats;
  },
});
