"use client"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { useEffect, useState } from "react"
import { Leaderboard } from "../components/Leaderboard"
import { NewPlayerDialog } from "../components/NewPlayerDialog"
import { Input } from "../components/ui/input"
import { PlayerData } from "../lib/types"

export default function Home() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [typedText, setTypedText] = useState("")
  const [now, setNow] = useState(() => Date.now())
  const [error, setError] = useState<string | null>(null)

  const updateProgress = useMutation(api.round.updateProgress)
  const ensureActiveRound = useMutation(api.round.ensureActiveRound)
  const joinRound = useMutation(api.round.joinRound)
  const activeRound = useQuery(api.round.getActiveRound)
  const leaderboard =
    useQuery(
      api.round.getRoundEntries,
      activeRound ? { roundId: activeRound._id } : "skip"
    ) ?? []

  const handleUpdateProgress = async () => {
    if (!playerData || !activeRound) {
      return
    }
    try {
      await updateProgress({
        playerId: playerData.id,
        roundId: activeRound._id,
        typedText,
      })
    } catch (err) {
      console.error(err)
      setError("Failed to update progress. Please try again.")
    }
  }

  useEffect(() => {
    const init = async () => {
      const storedPlayerData = localStorage.getItem("playerData")

      if (!storedPlayerData) {
        setOpen(true)
        return
      }

      const parsedPlayerData = JSON.parse(storedPlayerData) as {
        id: Id<"players">
        name: string
      }
      setPlayerData(parsedPlayerData)

      try {
        const roundId = await ensureActiveRound()
        await joinRound({
          playerId: parsedPlayerData.id,
          roundId,
        })
      } catch (err) {
        console.error(err)
        setError("Failed to join round. Please refresh the page.")
      }
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
    if (!playerData || !activeRound) return

    const remaining = timeLeft(activeRound)
    if (remaining > 0) return

    const rotateRound = async () => {
      try {
        const newRoundId = await ensureActiveRound()
        await joinRound({
          playerId: playerData.id,
          roundId: newRoundId,
        })
        setTypedText("")
      } catch (err) {
        console.error(err)
        setError("Failed to start next round. Please try again.")
      }
    }

    void rotateRound()
  }, [now, playerData, activeRound, ensureActiveRound, joinRound])

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
        onJoined={setPlayerData}
      />
      <div className="flex flex-col gap-4">
        {playerData ? <div>Player joined: {playerData.name}</div> : null}

        {error ? (
          <div className="text-sm text-destructive" role="alert">
            {error}
          </div>
        ) : null}

        <div className="text-sm text-muted-foreground">
          {activeRound === undefined
            ? "Loading round..."
            : activeRound === null
              ? "Waiting for next round..."
              : activeRound.sentence}
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

            if (!playerData || !activeRound) return

            try {
              await updateProgress({
                playerId: playerData.id,
                roundId: activeRound._id,
                typedText: value,
              })
            } catch (err) {
              console.error(err)
              setError("Failed to update progress. Please try again.")
            }
          }}
        />

        <Leaderboard leaderboard={leaderboard} currentPlayer={playerData} />
      </div>
    </div>
  )
}
