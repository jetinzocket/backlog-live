import { PRIORITY_MAP } from '@/lib/constants'
import type { Priority } from '@/lib/types'

export default function PriorityBadge({ priority, size }: { priority: Priority; size?: 'xs' | 'sm' }) {
  const { label, className } = PRIORITY_MAP[priority] ?? { label: priority, className: 'bg-gray-100 text-gray-500' }
  const padding = size === 'xs' ? 'px-1.5 py-0' : 'px-2 py-0.5'
  const text = size === 'xs' ? 'text-[9px]' : 'text-xs'
  return (
    <span className={`inline-flex items-center ${padding} rounded-full ${text} font-medium ${className}`}>
      {label}
    </span>
  )
}
