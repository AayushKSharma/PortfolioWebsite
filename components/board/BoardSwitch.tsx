import type { ReactNode } from "react"

/** CSS split so phones keep the existing list/article layouts. */
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
