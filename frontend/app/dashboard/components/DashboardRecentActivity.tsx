import { Clock3 } from "lucide-react"

type ActivityItem = {
  title: string
  description: string
  timestamp: string
}

type DashboardRecentActivityProps = {
  items: ActivityItem[]
}

export default function DashboardRecentActivity({
  items,
}: DashboardRecentActivityProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/4 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Recent Activity
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Latest account activity
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-zinc-300">
                <Clock3 className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <span className="text-xs text-zinc-500">{item.timestamp}</span>
                </div>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}