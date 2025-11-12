import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    department: v.string(),
    leadName: v.string(),
    leadEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.leadEmail))
      .first();

    let leadId;
    if (existingUser) {
      leadId = existingUser._id;
    } else {
      // Create new user for the team lead
      leadId = await ctx.db.insert("users", {
        name: args.leadName,
        email: args.leadEmail,
        role: "manager",
        department: args.department,
      });
    }

    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      department: args.department,
      leadId: leadId,
      isActive: true,
    });

    return teamId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    
    const teamsWithDetails = await Promise.all(
      teams.map(async (team) => {
        const lead = await ctx.db.get(team.leadId);
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();
        
        return {
          ...team,
          leadName: lead?.name || "Unknown",
          memberCount: members.length,
        };
      })
    );

    return teamsWithDetails;
  },
});

export const addMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: args.userId,
      role: args.role,
    });
  },
});

export const getTeamMembers = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          user,
        };
      })
    );

    return membersWithDetails;
  },
});
