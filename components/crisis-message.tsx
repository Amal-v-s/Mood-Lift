import { AlertCircle } from "lucide-react"

interface CrisisMessageProps {
  content: string
}

export function CrisisMessage({ content }: CrisisMessageProps) {
  return (
    <div className="w-full max-w-2xl bg-amber-50 dark:bg-amber-950 border-2 border-amber-200 dark:border-amber-800 rounded-2xl px-6 py-4">
      <div className="flex gap-3">
        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Safety Notice</p>
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  )
}
