import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

type QuickAction = {
  title: string
  description: string
  href: string
}

type DashboardQuickActionsProps = {
  actions: QuickAction[]
}

export default function DashboardQuickActions({
  actions,
}: DashboardQuickActionsProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/4 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Quick Actions
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Move through the platform faster
        </h2>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-blue-400/30 hover:bg-white/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">{action.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {action.description}
                </p>
              </div>

              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-blue-300" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}