"use client"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { Suspense, useEffect, useState } from "react"
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
  const playerStats =
    useQuery(
      api.round.getPlayerStats,
      playerData ? { playerId: playerData.id } : "skip"
    ) ?? null

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

    setTypedText("")

    const rotateRound = async () => {
      try {
        const newRoundId = await ensureActiveRound()
        await joinRound({
          playerId: playerData.id,
          roundId: newRoundId,
        })
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
    <div className="min-h-svh bg-background">
      <NewPlayerDialog
        open={open}
        onOpenChange={setOpen}
        name={name}
        setName={setName}
        onJoined={setPlayerData}
      />

      <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-5 px-4 py-10">
        <header className="mb-1 flex flex-col gap-1 text-xs text-muted-foreground">
          <span>Real-time typing race</span>
          {playerData ? (
            <div className="flex flex-col gap-0.5">
              <span>
                Playing as{" "}
                <span className="font-medium text-foreground">
                  {playerData.name}
                </span>
              </span>
              {playerStats ? (
                <span className="tabular-nums">
                  Rounds: {playerStats.roundsPlayed} · Best WPM:{" "}
                  {playerStats.bestWpm.toFixed(1)} · Avg WPM:{" "}
                  {playerStats.avgWpm.toFixed(1)} · Avg acc:{" "}
                  {(playerStats.avgAccuracy * 100).toFixed(0)}%
                </span>
              ) : null}
            </div>
          ) : (
            <span>Pick a nickname to join the current round.</span>
          )}
          {error ? (
            <span className="text-destructive" role="alert">
              {error}
            </span>
          ) : null}
        </header>

        <section className="rounded-md border border-border/60 bg-card/20 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-medium text-foreground">
                {activeRound === undefined
                  ? "Loading round..."
                  : activeRound === null
                    ? "Waiting for next round..."
                    : null}
                {activeRound && (
                  <span className="inline-block font-mono">
                    {(() => {
                      const sentence = activeRound.sentence
                      const typed = typedText

                      if (!sentence) return null

                      let correctPrefixLength = 0
                      const maxPrefix = Math.min(typed.length, sentence.length)
                      for (let i = 0; i < maxPrefix; i++) {
                        if (typed[i] === sentence[i]) {
                          correctPrefixLength++
                        } else {
                          break
                        }
                      }

                      const incorrectUntil = Math.min(
                        typed.length,
                        sentence.length
                      )
                      const correctPart = sentence.slice(0, correctPrefixLength)
                      const incorrectPart = sentence.slice(
                        correctPrefixLength,
                        incorrectUntil
                      )
                      const remainingPart = sentence.slice(incorrectUntil)

                      return (
                        <>
                          {correctPart && (
                            <span className="text-emerald-500">
                              {correctPart}
                            </span>
                          )}
                          {incorrectPart && (
                            <span className="bg-destructive/15 text-destructive underline decoration-destructive">
                              {incorrectPart}
                            </span>
                          )}
                          {remainingPart && (
                            <span className="text-muted-foreground">
                              {remainingPart}
                            </span>
                          )}
                        </>
                      )
                    })()}
                  </span>
                )}
              </p>
              <div className="rounded-sm bg-muted px-3 py-1 text-xs text-muted-foreground tabular-nums">
                {formatTimeLeft(activeRound)}
              </div>
            </div>

            <Input
              type="text"
              placeholder="Start typing here..."
              value={typedText}
              className="mt-2 h-11 rounded-sm text-base"
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
          </div>
        </section>

        <Suspense
          fallback={
            <section className="mt-6 rounded-md border border-border/60 bg-background/10 p-3">
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading leaderboard...
              </div>
            </section>
          }
        >
          <Leaderboard leaderboard={leaderboard} currentPlayer={playerData} />
        </Suspense>
      </main>
    </div>
  )
}
