import { Id } from "@/convex/_generated/dataModel"

export type PlayerData = {
  id: Id<"players">
  name: string
}

export type LeaderboardEntry = {
  playerId: Id<"players">
  playerName: string
  typedText: string
  correctChars: number
  typedChars: number
  wpm: number
  accuracy: number
  createdAt: number
  updatedAt: number
}

export type SortBy = "name" | "wpm" | "accuracy"
export type SortDirection = "asc" | "desc"
