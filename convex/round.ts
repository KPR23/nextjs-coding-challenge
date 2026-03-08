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

    if (existing) {
      await ctx.db.patch(existing._id, {
        updatedAt: now,
      })

      return existing._id
    }

    return await ctx.db.insert("players", {
      name: args.name,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const joinRound = mutation({
  args: { playerId: v.id("players"), roundId: v.id("rounds") },
  handler: async (ctx, args) => {
    const now = Date.now()
    const round = await ctx.db.get(args.roundId)
    if (!round) {
      throw new Error("Round not found")
    }

    if (round.status !== "active") {
      throw new Error("Round is not active")
    }

    const existingEntry = await ctx.db
      .query("entries")
      .withIndex("by_round_and_player", (q) =>
        q.eq("roundId", args.roundId).eq("playerId", args.playerId)
      )
      .first()

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, {
        updatedAt: now,
      })

      return existingEntry._id
    }

    const entry = await ctx.db.insert("entries", {
      roundId: args.roundId,
      playerId: args.playerId,
      typedText: "",
      correctChars: 0,
      typedChars: 0,
      wpm: 0,
      accuracy: 0,
      createdAt: now,
      updatedAt: now,
    })

    return entry
  },
})

export const ensureActiveRound = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()

    const activeRound = await ctx.db
      .query("rounds")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first()

    if (activeRound && activeRound.endsAt > now) {
      return activeRound._id
    }

    if (activeRound && activeRound.endsAt <= now) {
      await ctx.db.patch(activeRound._id, {
        status: "finished",
        updatedAt: now,
      })
    }

    const sentence = "The quick brown fox jumps over the lazy dog."

    return await ctx.db.insert("rounds", {
      sentence,
      startsAt: now,
      endsAt: now + 60_000,
      status: "active",
      createdAt: now,
      updatedAt: now,
    })
  },
})
