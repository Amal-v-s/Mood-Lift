export function MetricsBar() {
  const sessions = 12
  const avgMoodChange = 2.3

  return (
    <div className="border-b border-border bg-card/50 px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 text-sm">
        <div className="text-center">
          <span className="text-muted-foreground">Sessions: </span>
          <span className="font-semibold text-foreground">{sessions}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="text-center">
          <span className="text-muted-foreground">Avg mood change: </span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">+{avgMoodChange.toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}
