import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  rounds: defineTable({
    sentence: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    status: v.union(v.literal("active"), v.literal("finished")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"]),

  players: defineTable({
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

  entries: defineTable({
    roundId: v.id("rounds"),
    playerId: v.id("players"),
    typedText: v.string(),
    correctChars: v.number(),
    typedChars: v.number(),
    finishedAt: v.optional(v.number()),
    wpm: v.number(),
    accuracy: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_round", ["roundId"])
    .index("by_player", ["playerId"])
    .index("by_round_and_player", ["roundId", "playerId"]),
})
