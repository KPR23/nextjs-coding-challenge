"use client"

import { useEffect, useState } from "react"
import { Id } from "@/convex/_generated/dataModel"
import { NewPlayerDialog } from "../components/NewPlayerDialog"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Input } from "../components/ui/input"

export default function Page() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [playerId, setPlayerId] = useState<Id<"players"> | null>(null)
  const [typedText, setTypedText] = useState("")
  const [now, setNow] = useState(() => Date.now())

  const updateProgress = useMutation(api.round.updateProgress)
  const ensureActiveRound = useMutation(api.round.ensureActiveRound)
  const joinRound = useMutation(api.round.joinRound)
  const activeRound = useQuery(api.round.getActiveRound)

  const handleUpdateProgress = async () => {
    if (!playerId || !activeRound) {
      return
    }
    await updateProgress({
      playerId,
      roundId: activeRound._id,
      typedText,
    })
  }

  useEffect(() => {
    const init = async () => {
      const storedPlayerId = localStorage.getItem("playerId")

      if (!storedPlayerId) {
        setOpen(true)
        return
      }

      const parsedPlayerId = storedPlayerId as Id<"players">
      setPlayerId(parsedPlayerId)

      const roundId = await ensureActiveRound()
      await joinRound({
        playerId: parsedPlayerId,
        roundId,
      })
    }

    void init()
  }, [ensureActiveRound, joinRound])

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!playerId || !activeRound) return

    const remaining = timeLeft(activeRound)
    if (remaining > 0) return

    const rotateRound = async () => {
      const newRoundId = await ensureActiveRound()
      await joinRound({
        playerId,
        roundId: newRoundId,
      })
      setTypedText("")
    }

    void rotateRound()
  }, [now, playerId, activeRound, ensureActiveRound, joinRound])

  const timeLeft = (round: { endsAt: number } | null | undefined) => {
    if (!round) return 0
    return round.endsAt - now
  }

  const formatTimeLeft = (round: { endsAt: number } | null | undefined) => {
    const ms = Math.max(0, timeLeft(round))
    const seconds = Math.floor(ms / 1000)
    return `${seconds}s`
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <NewPlayerDialog
        open={open}
        onOpenChange={setOpen}
        name={name}
        setName={setName}
        onJoined={setPlayerId}
      />
      <div className="flex flex-col gap-4">
        {playerId ? <div>Player joined: {playerId}</div> : null}

        <div className="text-sm text-muted-foreground">
          {activeRound?.sentence}
        </div>

        <div className="text-sm text-muted-foreground tabular-nums">
          {formatTimeLeft(activeRound)}
        </div>

        <Input
          type="text"
          placeholder="Wpisz tekst"
          value={typedText}
          onChange={async (e) => {
            const value = e.target.value
            setTypedText(value)

            if (!playerId || !activeRound) return

            await updateProgress({
              playerId,
              roundId: activeRound._id,
              typedText: value,
            })
          }}
        />
      </div>
    </div>
  )
}
