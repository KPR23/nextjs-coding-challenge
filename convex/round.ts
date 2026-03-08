import { mutation } from "./_generated/server"
import { v } from "convex/values"

export const joinGame = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now()
    const existing = await ctx.db
      .query("players")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first()

    if (!existing) {
      return await ctx.db.insert("players", {
        name: args.name,
        createdAt: now,
        updatedAt: now,
      })
    }

    return existing._id
  },
})
