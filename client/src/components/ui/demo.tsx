import { LiquidNavbar, NimbusIcons } from "@/components/ui/liquid-glass-navbar"
import { AntiMetalButton } from "@/components/ui/anti-metal-button"

export default function Demo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        padding: "0 16px",
        background: "#080C07",
      }}
    >
      <div style={{ width: "100%", maxWidth: "680px" }}>
        <LiquidNavbar
          tone="dark"
          defaultActive={0}
          sound={false}
          items={[
            { label: "Home", icon: NimbusIcons.home, fx: "glow" },
            { label: "Explore", icon: NimbusIcons.globe, fx: "spin" },
            { label: "Flights", icon: NimbusIcons.plane, fx: "plane" },
            { label: "Weather", icon: NimbusIcons.drop, fx: "drop" },
            { label: "Profile", icon: NimbusIcons.user, fx: "wave" },
          ]}
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        <span
          style={{
            font: "500 12px/1 ui-sans-serif, -apple-system, 'Segoe UI', system-ui, sans-serif",
            color: "rgba(196,241,103,.7)",
          }}
        >
          Jobzy UI · AntiMetal Button Component
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <AntiMetalButton />
          <AntiMetalButton
            label="Analyze My Resume"
            className="w-56"
            accentFrom="#C4F167"
            accentTo="#A8DE3B"
          />
        </div>
      </div>
    </div>
  )
}
