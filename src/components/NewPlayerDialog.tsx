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

export function NewPlayerDialog({
  open,
  onOpenChange,
  player,
  setPlayer,
  onJoined,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: { name: string } | null
  setPlayer: (player: { name: string } | null) => void
  onJoined: (playerId: Id<"players">) => void
}) {
  const joinGame = useMutation(api.round.joinGame)
  const ensureActiveRound = useMutation(api.round.ensureActiveRound)
  const joinRound = useMutation(api.round.joinRound)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

            const name = (player?.name ?? "").trim()
            if (!name) return

            const playerId = await joinGame({ name })
            const roundId = await ensureActiveRound()

            await joinRound({
              playerId,
              roundId,
            })

            localStorage.setItem("playerId", String(playerId))
            onJoined(playerId)
            setPlayer(null)
            onOpenChange(false)
          }}
          className="flex flex-col gap-3"
        >
          <Input
            type="text"
            placeholder="Nick"
            value={player?.name ?? ""}
            onChange={(e) => setPlayer({ name: e.target.value })}
            autoFocus
          />
          <Button type="submit">Dołącz</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
