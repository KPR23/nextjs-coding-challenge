"use client"

import { useState, useEffect } from "react"
import { NewPlayerDialog } from "../components/NewPlayerDialog"
import { Button } from "../components/ui/button"

export default function Page() {
  const [open, setOpen] = useState(false)
  const [player, setPlayer] = useState<{ name: string } | null>(null)

  useEffect(() => {
    const storedPlayer = localStorage.getItem("player")
    if (!storedPlayer) {
      setOpen(true)
      return
    }
    try {
      const { name } = JSON.parse(storedPlayer)
      if (name == null || name === "") {
        setOpen(true)
      }
    } catch {
      setOpen(true)
    }
  }, [])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <NewPlayerDialog
        open={open}
        onOpenChange={setOpen}
        player={player}
        setPlayer={setPlayer}
      />
    </div>
  )
}
