import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

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
      <DialogTrigger>New player</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New player</DialogTitle>
          <DialogDescription>
            Enter a name for the new player.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Name"
          value={player?.name ?? ""}
          onChange={(e) => setPlayer({ name: e.target.value })}
        />
        <Button
          onClick={() => {
            localStorage.setItem(
              "player",
              JSON.stringify({ name: player?.name })
            )
            setPlayer(null)
            onOpenChange(false)
          }}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  )
}
