"use client"

type Size = "sm" | "lg"

const DIM = {
  sm: {
    hitW: 52,
    hitH: 44,
    plateW: 48,
    plateH: 30,
    screw: 4,
    screwEdge: 4,
    rockerL: 11,
    rockerT: 7,
    rockerW: 26,
    rockerH: 16,
    thumb: 11,
    inset: 1.5,
    axis: "x" as const,
  },
  lg: {
    hitW: 48,
    hitH: 76,
    plateW: 48,
    plateH: 76,
    screw: 5,
    screwEdge: 7,
    rockerL: 11,
    rockerT: 17,
    rockerW: 26,
    rockerH: 42,
    thumb: 19,
    inset: 2,
    axis: "y" as const,
  },
}

export default function LightsSwitch({
  on,
  onClick,
  size = "sm",
  label = "Lights",
}: {
  on: boolean
  onClick: () => void
  size?: Size
  label?: string
}) {
  const d = DIM[size]
  const horizontal = d.axis === "x"

  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      type="button"
      style={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: d.hitW,
        height: d.hitH,
        padding: 0,
        border: "none",
        background: "transparent",
        appearance: "none",
      }}
    >
      <span
        style={{
          position: "relative",
          display: "block",
          width: d.plateW,
          height: d.plateH,
          borderRadius: 5,
          background: on ? "linear-gradient(150deg,#4a453b,#332f28)" : "linear-gradient(150deg,#faf6ec,#e4ddcd)",
          boxShadow: on
            ? "0 3px 7px rgba(0,0,0,.5), 0 1px 0 rgba(255,240,214,.12) inset"
            : "0 3px 7px rgba(52,34,14,.3), 0 1px 0 rgba(255,255,255,.85) inset",
        }}
      >
        <span
          style={
            horizontal
              ? { position: "absolute", top: "50%", left: d.screwEdge, width: d.screw, height: d.screw, marginTop: -d.screw / 2, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #cfc8b8, #9c9483)" }
              : { position: "absolute", left: "50%", top: d.screwEdge, width: d.screw, height: d.screw, marginLeft: -d.screw / 2, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #cfc8b8, #9c9483)" }
          }
        />
        <span
          style={
            horizontal
              ? { position: "absolute", top: "50%", right: d.screwEdge, width: d.screw, height: d.screw, marginTop: -d.screw / 2, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #cfc8b8, #9c9483)" }
              : { position: "absolute", left: "50%", bottom: d.screwEdge, width: d.screw, height: d.screw, marginLeft: -d.screw / 2, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #cfc8b8, #9c9483)" }
          }
        />
        <span
          style={{
            position: "absolute",
            left: d.rockerL,
            top: d.rockerT,
            width: d.rockerW,
            height: d.rockerH,
            borderRadius: 3,
            background: "linear-gradient(#d7d0c0,#bcb5a5)",
            boxShadow: "0 1px 3px rgba(52,34,14,.35) inset",
          }}
        >
          <span
            style={
              horizontal
                ? {
                    position: "absolute",
                    top: d.inset,
                    bottom: d.inset,
                    left: d.inset,
                    width: d.thumb,
                    borderRadius: 2,
                    background: "linear-gradient(#fffdf8,#e6e0d2)",
                    boxShadow: "0 2px 3px rgba(52,34,14,.35)",
                    transform: `translateX(${on ? d.thumb : 0}px)`,
                    transition: "transform .16s ease",
                  }
                : {
                    position: "absolute",
                    left: d.inset,
                    right: d.inset,
                    top: d.inset,
                    height: d.thumb,
                    borderRadius: 2,
                    background: "linear-gradient(#fffdf8,#e6e0d2)",
                    boxShadow: "0 2px 3px rgba(52,34,14,.35)",
                    transform: `translateY(${on ? d.thumb : 0}px)`,
                    transition: "transform .16s ease",
                  }
            }
          />
        </span>
      </span>
    </button>
  )
}
