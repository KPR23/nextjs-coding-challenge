"use client"

import { useEffect, useState } from "react"
import { Id } from "@/convex/_generated/dataModel"
import { NewPlayerDialog } from "../components/NewPlayerDialog"

export default function Page() {
  const [open, setOpen] = useState(false)
  const [player, setPlayer] = useState<{ name: string } | null>(null)
  const [playerId, setPlayerId] = useState<Id<"players"> | null>(null)

  useEffect(() => {
    const storedPlayerId = localStorage.getItem("playerId")

    if (!storedPlayerId) {
      setOpen(true)
      return
    }

    setPlayerId(storedPlayerId as Id<"players">)
  }, [])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <NewPlayerDialog
        open={open}
        onOpenChange={setOpen}
        player={player}
        setPlayer={setPlayer}
        onJoined={setPlayerId}
      />

      {playerId ? <div>Player joined: {playerId}</div> : null}
    </div>
  )
}
