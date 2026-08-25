import type { ReactNode } from "react"

/** CSS split for layouts that still keep a non-board fallback (slug write-ups). */
export default function BoardSwitch({
  board,
  fallback,
}: {
  board: ReactNode
  fallback: ReactNode
}) {
  return (
    <>
      <div className="max-[700px]:hidden">{board}</div>
      <div className="min-[701px]:hidden">{fallback}</div>
    </>
  )
}
