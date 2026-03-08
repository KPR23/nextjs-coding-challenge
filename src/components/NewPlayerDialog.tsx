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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Introduce yourself</DialogTitle>
          <DialogDescription>
            Enter a name for the new player to start typing.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            localStorage.setItem(
              "player",
              JSON.stringify({ name: player?.name })
            )
            setPlayer(null)
            onOpenChange(false)
          }}
          className="flex flex-col gap-3"
        >
          <Input
            type="text"
            placeholder="Name"
            value={player?.name ?? ""}
            onChange={(e) => setPlayer({ name: e.target.value })}
            autoFocus
          />
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
