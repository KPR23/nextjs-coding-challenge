import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
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
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: { name: string } | null
  setPlayer: (player: { name: string } | null) => void
}) {
  const joinGame = useMutation(api.round.joinGame)

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
            localStorage.setItem("playerId", playerId)
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
