'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  color?: string
  width?: number
  height?: number
  maxOpacity?: number
}

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color,
  width,
  height,
  className,
  maxOpacity = 0.3,
  ...props
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [resolvedColor, setResolvedColor] = useState('rgb(0, 0, 0)')

  const resolveColor = useCallback((colorValue: string | undefined) => {
    if (typeof window === 'undefined') {
      return 'rgb(0, 0, 0)'
    }

    const colorToResolve = colorValue || 'var(--foreground)'

    if (colorToResolve.startsWith('var(')) {
      const tempEl = document.createElement('div')
      tempEl.style.color = colorToResolve
      tempEl.style.position = 'absolute'
      tempEl.style.visibility = 'hidden'
      document.body.appendChild(tempEl)
      const computedColor = window.getComputedStyle(tempEl).color
      document.body.removeChild(tempEl)
      return computedColor || 'rgb(0, 0, 0)'
    }

    return colorToResolve
  }, [])

  useEffect(() => {
    const updateColor = () => {
      setResolvedColor(resolveColor(color))
    }

    updateColor()

    const observer = new MutationObserver(updateColor)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => {
      observer.disconnect()
    }
  }, [color, resolveColor])

  const memoizedColor = useMemo(() => {
    const toRGBA = (colorValue: string) => {
      if (typeof window === 'undefined') {
        return 'rgba(0, 0, 0,'
      }

      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        return 'rgba(0, 0, 0,'
      }

      ctx.fillStyle = colorValue
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data)
      return `rgba(${r}, ${g}, ${b},`
    }

    return toRGBA(resolvedColor)
  }, [resolvedColor])

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, canvasWidth: number, canvasHeight: number) => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvasWidth * dpr
      canvas.height = canvasHeight * dpr
      canvas.style.width = `${canvasWidth}px`
      canvas.style.height = `${canvasHeight}px`

      const cols = Math.floor(canvasWidth / (squareSize + gridGap))
      const rows = Math.floor(canvasHeight / (squareSize + gridGap))
      const squares = new Float32Array(cols * rows)

      for (let index = 0; index < squares.length; index += 1) {
        squares[index] = Math.random() * maxOpacity
      }

      return { cols, rows, squares, dpr }
    },
    [gridGap, maxOpacity, squareSize]
  )

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let index = 0; index < squares.length; index += 1) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[index] = Math.random() * maxOpacity
        }
      }
    },
    [flickerChance, maxOpacity]
  )

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      canvasWidth: number,
      canvasHeight: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number
    ) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      for (let col = 0; col < cols; col += 1) {
        for (let row = 0; row < rows; row += 1) {
          const opacity = squares[col * rows + row]
          ctx.fillStyle = `${memoizedColor}${opacity})`
          ctx.fillRect(
            col * (squareSize + gridGap) * dpr,
            row * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr
          )
        }
      }
    },
    [gridGap, memoizedColor, squareSize]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current

    if (!canvas || !container) {
      return
    }

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return
    }

    let animationFrameId = 0
    let gridParams: ReturnType<typeof setupCanvas>

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth
      const newHeight = height || container.clientHeight
      setCanvasSize({ width: newWidth, height: newHeight })
      gridParams = setupCanvas(canvas, newWidth, newHeight)
    }

    updateCanvasSize()

    let lastTime = 0
    const animate = (time: number) => {
      if (!isInView) {
        return
      }

      const deltaTime = (time - lastTime) / 1000
      lastTime = time

      updateSquares(gridParams.squares, deltaTime)
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr
      )
      animationFrameId = requestAnimationFrame(animate)
    }

    const resizeObserver = new ResizeObserver(updateCanvasSize)
    resizeObserver.observe(container)

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    })
    intersectionObserver.observe(canvas)

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate)
    }

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
    }
  }, [drawGrid, height, isInView, setupCanvas, updateSquares, width])

  return (
    <div ref={containerRef} className={cn('h-full w-full', className)} {...props}>
      <canvas
        ref={canvasRef}
        className='pointer-events-none'
        style={{
          width: canvasSize.width,
          height: canvasSize.height
        }}
      />
    </div>
  )
}
