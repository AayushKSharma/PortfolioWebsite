"use client"

import { useTheme } from "next-themes"
import LightsSwitch from "./LightsSwitch"

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === "dark"

  return (
    <LightsSwitch
      on={dark}
      onClick={() => setTheme(dark ? "light" : "dark")}
      size="sm"
    />
  )
}
