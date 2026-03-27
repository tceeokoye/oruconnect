"use client"

import { animate, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"

function formatShort(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${Math.floor(value / 1_000)}K`
  return value.toString()
}

export function CountUpShort({
  to,
  prefix = "",
  suffix = "+",
  duration = 1.6,
}: {
  to: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return

    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate(v) {
        setValue(v)
      },
    })

    return () => controls.stop()
  }, [inView, to, duration])

  return (
    <span ref={ref}>
      {prefix}
      {formatShort(value)}
      {suffix}
    </span>
  )
}
