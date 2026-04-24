type DashboardStat = {
  label: string
  value: string
  helper: string
}

type DashboardStatsProps = {
  stats: DashboardStat[]
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-white/10 bg-white/4 p-5 shadow-lg backdrop-blur-xl"
        >
          <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {stat.value}
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-500">{stat.helper}</p>
        </div>
      ))}
    </section>
  )
}