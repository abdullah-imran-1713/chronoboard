import { defineStore } from 'pinia'
import type { LayoutSettings, WidgetBoardPosition } from '../types/settings'
import {
  WIDGET_BOARD_CARD_MIN_WIDTH_PX,
  WIDGET_BOARD_CARD_WIDTH_PX,
  WIDGET_BOARD_MAX_COLS,
} from '../types/settings'

/** Bump to invalidate layouts that clamped widgets into the clock */
export const WIDGET_LAYOUT_REV = 7

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Extra space so last row clears the FAB rail */
const BOARD_BOTTOM_PAD_PX = 120

function resolvePackColumns(widgetCount: number, canvasWidth: number, gap: number): number {
  if (widgetCount <= 1) return 1
  const gutter = canvasWidth < 480 ? 20 : 32
  const available = Math.max(0, canvasWidth - gutter)
  const minCard = Math.min(WIDGET_BOARD_CARD_MIN_WIDTH_PX, available)
  const maxByWidth = Math.max(
    1,
    Math.floor((available + gap) / (Math.max(minCard, 140) + gap)),
  )
  return Math.min(WIDGET_BOARD_MAX_COLS, widgetCount, maxByWidth)
}

interface PxRect {
  left: number
  top: number
  right: number
  bottom: number
}

function overlaps(a: PxRect, b: PxRect, pad = 8): boolean {
  return !(
    a.right + pad <= b.left
    || a.left >= b.right + pad
    || a.bottom + pad <= b.top
    || a.top >= b.bottom + pad
  )
}

export const useLayoutStore = defineStore('layout', {
  state: (): LayoutSettings => ({
    alignment: 'center',
    widgetColumns: 2,
    widgetGap: '1rem',
    showSettingsButton: true,
    widgetPositions: {},
    widgetMoved: {},
    widgetLayoutRev: 0,
  }),

  getters: {
    getPosition: (state) => {
      return (id: string): WidgetBoardPosition | null => state.widgetPositions[id] ?? null
    },

    wasMoved: (state) => {
      return (id: string): boolean => !!state.widgetMoved[id]
    },
  },

  actions: {
    migrateLayoutRev() {
      if ((this.widgetLayoutRev ?? 0) >= WIDGET_LAYOUT_REV) return false
      this.widgetPositions = {}
      this.widgetMoved = {}
      this.widgetLayoutRev = WIDGET_LAYOUT_REV
      return true
    },

    setWidgetPosition(id: string, position: WidgetBoardPosition, options?: { moved?: boolean }) {
      this.widgetPositions[id] = {
        x: clamp(position.x, 0, 100),
        y: clamp(position.y, 0, 100),
      }
      if (options?.moved) {
        this.widgetMoved[id] = true
      }
    },

    /**
     * Pack unmoved widgets in a row-major grid below the clock.
     * Extra rows extend the board height (page grows). No clamping into the hero.
     */
    packDefaultLayout(
      ids: string[],
      canvasWidth: number,
      viewportHeight: number,
      heightsPx: Record<string, number>,
      options?: { forceAll?: boolean, originYPx?: number },
    ): { cardWidth: number, boardHeight: number } {
      const gap = 16
      const fallback = {
        cardWidth: WIDGET_BOARD_CARD_WIDTH_PX,
        boardHeight: Math.max(viewportHeight, 1),
      }
      if (canvasWidth <= 0 || viewportHeight <= 0 || ids.length === 0) return fallback

      const forceAll = options?.forceAll === true
      const packIds = forceAll
        ? [...ids]
        : ids.filter(id => !this.widgetMoved[id])

      const cols = resolvePackColumns(
        packIds.length || ids.length,
        canvasWidth,
        gap,
      )
      const gutter = canvasWidth < 480 ? 20 : 32
      const available = Math.max(0, canvasWidth - gutter)
      const ideal = (available - gap * (cols - 1)) / cols
      const colWidth = Math.min(
        WIDGET_BOARD_CARD_WIDTH_PX,
        Math.max(Math.min(WIDGET_BOARD_CARD_MIN_WIDTH_PX, available), Math.min(ideal, available)),
      )
      const gridWidth = Math.min(available, colWidth * cols + gap * (cols - 1))
      const originX = (canvasWidth - gridWidth) / 2
      const originY = options?.originYPx
        ?? Math.max(viewportHeight * 0.52, viewportHeight * 0.48 + 64)

      // Obstacles from user-moved widgets (in px vs current board ≈ viewport on first pass)
      const obstacles: PxRect[] = []
      let contentBottom = originY

      for (const id of ids) {
        if (packIds.includes(id)) continue
        const pos = this.widgetPositions[id]
        if (!pos) continue
        const h = Math.max(heightsPx[id] ?? 168, 120)
        const boardH = Math.max(viewportHeight, 1)
        const left = (pos.x / 100) * canvasWidth
        const top = (pos.y / 100) * boardH
        obstacles.push({
          left,
          top,
          right: left + colWidth,
          bottom: top + h,
        })
        contentBottom = Math.max(contentBottom, top + h)
      }

      if (packIds.length === 0) {
        return {
          cardWidth: colWidth,
          boardHeight: Math.max(viewportHeight, contentBottom + BOARD_BOTTOM_PAD_PX),
        }
      }

      let col = 0
      let rowY = originY
      let rowMaxH = 0
      let guard = 0
      const placements: { id: string, left: number, top: number, height: number }[] = []

      for (const id of packIds) {
        const height = Math.max(heightsPx[id] ?? 168, 120)
        let placed = false

        while (!placed && guard < 240) {
          guard++
          const left = originX + col * (colWidth + gap)
          const top = rowY
          const candidate: PxRect = {
            left,
            top,
            right: left + colWidth,
            bottom: top + height,
          }

          if (!obstacles.some(o => overlaps(candidate, o))) {
            placements.push({ id, left, top, height })
            obstacles.push(candidate)
            contentBottom = Math.max(contentBottom, candidate.bottom)
            placed = true

            rowMaxH = Math.max(rowMaxH, height)
            col++
            if (col >= cols) {
              rowY += rowMaxH + gap
              rowMaxH = 0
              col = 0
            }
            break
          }

          col++
          if (col >= cols) {
            rowY += Math.max(rowMaxH, height) + gap
            rowMaxH = 0
            col = 0
          }
        }

        if (!placed) {
          const left = originX
          const top = contentBottom + gap
          placements.push({ id, left, top, height })
          contentBottom = top + height
        }
      }

      const boardHeight = Math.max(viewportHeight, contentBottom + BOARD_BOTTOM_PAD_PX)

      for (const p of placements) {
        this.widgetPositions[p.id] = {
          x: clamp((p.left / canvasWidth) * 100, 0, 100),
          y: clamp((p.top / boardHeight) * 100, 0, 100),
        }
      }

      return { cardWidth: colWidth, boardHeight }
    },

    clearMoved(id: string) {
      const { [id]: _, ...rest } = this.widgetMoved
      this.widgetMoved = rest
    },

    resetWidgetPositions() {
      this.widgetPositions = {}
      this.widgetMoved = {}
    },
  },
})
