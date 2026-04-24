import { RegisterFormData } from "./RegisterWizard"

type PlanStepProps = {
  formData: RegisterFormData
  updateField: <K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K]
  ) => void
}

const plans = [
  {
    value: "free",
    name: "Free",
    price: "$0",
    subtitle: "Get started",
    description: "A basic entry point for exploring the platform.",
    features: [
      "Core account access",
      "Basic dashboard access",
      "Limited analysis usage",
    ],
  },
  {
    value: "pro",
    name: "Pro",
    price: "$19",
    subtitle: "For individuals",
    description: "A lighter paid tier for recurring personal usage.",
    features: [
      "Expanded analysis access",
      "Improved workflow limits",
      "Upgrade path into larger plans",
    ],
  },
  {
    value: "expert",
    name: "Expert",
    price: "$49",
    subtitle: "For serious use",
    description: "Built for higher-volume and more advanced workflows.",
    features: [
      "Higher usage thresholds",
      "Support for larger uploads",
      "Best fit for power users",
    ],
  },
  {
    value: "enterprise",
    name: "Enterprise",
    price: "Custom",
    subtitle: "For teams",
    description: "For organizations, multiple seats, or admin controls later.",
    features: [
      "Team-oriented access",
      "Future admin controls",
      "Custom support path",
    ],
  },
] as const

export default function PlanStep({ formData, updateField }: PlanStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-2">
        {plans.map((plan) => {
          const selected = formData.selectedPlan === plan.value

          return (
            <button
              key={plan.value}
              type="button"
              onClick={() => updateField("selectedPlan", plan.value)}
              className={`group rounded-2xl border p-5 text-left transition ${
                selected
                  ? "border-blue-400/50 bg-blue-500/10"
                  : "border-white/10 bg-white/3 hover:bg-white/6"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {plan.name}
                    </h3>
                    <span className="rounded-full border border-white/10 bg-white/4 px-2.5 py-1 text-xs text-zinc-300">
                      {plan.subtitle}
                    </span>
                  </div>

                  <div className="text-2xl font-bold tracking-tight text-white">
                    {plan.price}
                    {plan.price !== "Custom" && (
                      <span className="ml-1 text-sm font-medium text-zinc-400">
                        /mo later
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-6 text-zinc-400">
                    {plan.description}
                  </p>
                </div>

                <div
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected
                      ? "border-blue-400 bg-blue-500 text-white"
                      : "border-white/20"
                  }`}
                >
                  {selected ? "✓" : ""}
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-zinc-300"
                  >
                    <span className="text-blue-300">•</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-dashed border-white/15 bg-white/2 p-4">
        <p className="text-sm leading-6 text-zinc-400">
          Plan selection is visual scaffolding right now. No billing logic is
          attached yet, but the selected plan is ready to be stored and used
          later.
        </p>
      </div>
    </div>
  )
}