"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type {
  LeaderboardEntry,
  PlayerData,
  SortBy,
  SortDirection,
} from "../lib/types"

type LeaderboardProps = {
  leaderboard: LeaderboardEntry[]
  currentPlayer: PlayerData | null
}

export function Leaderboard({ leaderboard, currentPlayer }: LeaderboardProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [sortBy, setSortBy] = useState<SortBy>(() => {
    const value = searchParams.get("sortBy")
    if (value === "name" || value === "wpm" || value === "accuracy") {
      return value
    }
    return "wpm"
  })

  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    const value = searchParams.get("sortDirection")
    if (value === "asc" || value === "desc") {
      return value
    }
    return "desc"
  })

  const [page, setPage] = useState<number>(() => {
    const value = Number(searchParams.get("page") ?? "1")
    return Number.isNaN(value) || value < 1 ? 1 : value
  })

  const [pageSize, setPageSize] = useState<number>(() => {
    const value = Number(searchParams.get("pageSize") ?? "10")
    return Number.isNaN(value) || value <= 0 ? 10 : value
  })

  const sortedLeaderboard: LeaderboardEntry[] = useMemo(() => {
    const data = [...leaderboard]

    data.sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      if (sortBy === "name") {
        aVal = a.playerName.toLowerCase()
        bVal = b.playerName.toLowerCase()
      } else if (sortBy === "wpm") {
        aVal = a.wpm
        bVal = b.wpm
      } else {
        aVal = a.accuracy
        bVal = b.accuracy
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [leaderboard, sortBy, sortDirection, page, pageSize])

  const totalPages = Math.max(1, Math.ceil(leaderboard.length / pageSize))

  const updateUrlParams = (params: {
    sortBy?: SortBy
    sortDirection?: SortDirection
    page?: number
    pageSize?: number
  }) => {
    const current = new URLSearchParams(searchParams.toString())
    if (params.sortBy) current.set("sortBy", params.sortBy)
    if (params.sortDirection) current.set("sortDirection", params.sortDirection)
    if (params.page) current.set("page", String(params.page))
    if (params.pageSize) current.set("pageSize", String(params.pageSize))
    router.replace(`${pathname}?${current.toString()}`, { scroll: false })
  }

  const handleSort = (column: SortBy) => {
    setPage(1)
    const nextDirection =
      sortBy === column && sortDirection === "desc" ? "asc" : "desc"
    setSortBy(column)
    setSortDirection(nextDirection)
    updateUrlParams({ sortBy: column, sortDirection: nextDirection, page: 1 })
  }

  const handlePageChange = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages)
    setPage(clamped)
    updateUrlParams({ page: clamped })
  }

  const handlePageSizeChange = (value: number) => {
    const safe = value <= 0 ? 10 : value
    setPageSize(safe)
    setPage(1)
    updateUrlParams({ pageSize: safe, page: 1 })
  }

  const formatProgress = (text: string) => {
    const maxChars = 30
    if (!text) return "\u2014"
    if (text.length <= maxChars) return text
    return "\u2026" + text.slice(-maxChars)
  }

  return (
    <section className="mt-6 rounded-md border border-border/60 bg-background/10 p-3">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Live leaderboard</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Rows per page:</span>
          <select
            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      <div className="mt-1 overflow-x-auto">
        <table
          className="w-full table-fixed text-left text-xs md:text-sm"
          style={{ minWidth: 320 }}
        >
          <colgroup>
            <col style={{ width: "45%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-2 py-2 font-medium">Live progress</th>
              <th
                className="cursor-pointer px-2 py-2 font-medium select-none"
                onClick={() => handleSort("name")}
              >
                Player name
              </th>
              <th
                className="cursor-pointer px-2 py-2 text-right font-medium select-none"
                onClick={() => handleSort("wpm")}
              >
                WPM
              </th>
              <th
                className="cursor-pointer px-2 py-2 text-right font-medium select-none"
                onClick={() => handleSort("accuracy")}
              >
                Accuracy
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedLeaderboard.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-2 py-6 text-center text-xs text-muted-foreground"
                >
                  No players yet. Start typing to join the leaderboard.
                </td>
              </tr>
            ) : (
              sortedLeaderboard.map((entry) => {
                const isCurrentPlayer =
                  currentPlayer && entry.playerId === currentPlayer.id
                return (
                  <tr
                    key={`${entry.playerId}-${entry.updatedAt}`}
                    className={
                      "border-b border-border/60 last:border-0" +
                      (isCurrentPlayer ? " bg-primary/5" : "")
                    }
                  >
                    <td className="overflow-hidden px-2 py-2 text-xs whitespace-nowrap md:text-sm">
                      {formatProgress(entry.typedText)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {entry.playerName}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {entry.wpm.toFixed(1)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {(entry.accuracy * 100).toFixed(0)}%
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-input bg-background px-2 py-1 text-xs disabled:opacity-50"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            type="button"
            className="rounded-md border border-input bg-background px-2 py-1 text-xs disabled:opacity-50"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
