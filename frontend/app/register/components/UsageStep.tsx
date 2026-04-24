import { RegisterFormData } from "./RegisterWizard"

type UsageStepProps = {
  formData: RegisterFormData
  updateField: <K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K]
  ) => void
}

const usageOptions = [
  {
    value: "personal",
    title: "Personal Use",
    description: "Independent exploration and one-off analysis.",
  },
  {
    value: "professional",
    title: "Professional Work",
    description: "Client-facing or recurring project analysis.",
  },
  {
    value: "research",
    title: "Research / Investigation",
    description: "Methodical review and evidence-focused use cases.",
  },
  {
    value: "creative",
    title: "Creative Projects",
    description: "Use the platform for experimental, artistic, or media-driven workflows.",
  },
  {
    value: "other",
    title: "Other",
    description: "A different use case that does not cleanly fit the categories above.",
  },
] as const

const experienceOptions = [
  {
    value: "beginner",
    title: "Beginner",
    description: "New to audio review tools and guided workflows.",
  },
  {
    value: "intermediate",
    title: "Intermediate",
    description: "Comfortable with analysis, but still wants structure.",
  },
  {
    value: "advanced",
    title: "Advanced",
    description: "Prefers fast access, clarity, and deeper controls later.",
  },
  {
    value: "professional",
    title: "Professional",
    description: "Experienced and looking for a more production-ready workflow.",
  },
] as const

export default function UsageStep({
  formData,
  updateField,
}: UsageStepProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Intended Usage
          </h3>
          <p className="text-sm text-zinc-500">
            Choose the closest match. This can be adjusted later.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {usageOptions.map((option) => {
            const selected = formData.usage === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("usage", option.value)}
                className={`rounded-2xl border p-5 text-left transition ${
                  selected
                    ? "border-blue-400/50 bg-blue-500/10"
                    : "border-white/10 bg-white/3 hover:bg-white/6"
                }`}
              >
                <div className="space-y-2">
                  <div className="text-base font-semibold text-white">
                    {option.title}
                  </div>
                  <p className="text-sm leading-6 text-zinc-400">
                    {option.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Experience Level
          </h3>
          <p className="text-sm text-zinc-500">
            This can later drive onboarding depth and UI defaults.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {experienceOptions.map((option) => {
            const selected = formData.experience === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("experience", option.value)}
                className={`rounded-2xl border p-5 text-left transition ${
                  selected
                    ? "border-violet-400/50 bg-violet-500/10"
                    : "border-white/10 bg-white/3 hover:bg-white/6"
                }`}
              >
                <div className="space-y-2">
                  <div className="text-base font-semibold text-white">
                    {option.title}
                  </div>
                  <p className="text-sm leading-6 text-zinc-400">
                    {option.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}