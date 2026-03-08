import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { cn } from "../lib/utils"

export function NewPlayerDialog({
  open,
  onOpenChange,
  name,
  setName,
  onJoined,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  setName: (name: string) => void
  onJoined: (playerData: { id: Id<"players">; name: string }) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const joinGame = useMutation(api.round.joinGame)
  const ensureActiveRound = useMutation(api.round.ensureActiveRound)
  const joinRound = useMutation(api.round.joinRound)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      const trimmedName = (name ?? "").trim()
      if (!trimmedName) {
        setError("Nick nie może być pusty")
        return
      }
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wpisz nick</DialogTitle>
          <DialogDescription>
            Podaj swój nick, żeby dołączyć do gry.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={async (e) => {
            e.preventDefault()

            const trimmedName = (name ?? "").trim()
            if (!trimmedName) {
              setError("Nick nie może być pusty")
              return
            }

            setError(null)

            const playerId = await joinGame({ name: trimmedName })
            const roundId = await ensureActiveRound()

            await joinRound({
              playerId,
              roundId,
            })

            localStorage.setItem(
              "playerData",
              JSON.stringify({ id: playerId, name: trimmedName })
            )
            onJoined({ id: playerId, name: trimmedName })
            onOpenChange(false)
          }}
          className="flex flex-col gap-3"
        >
          <Input
            type="text"
            placeholder="Nick"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
            className={cn(error && "border-destructive")}
            autoFocus
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit">Dołącz</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
