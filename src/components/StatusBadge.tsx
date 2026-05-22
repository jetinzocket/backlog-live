import { STATUS_MAP } from '@/lib/constants'
import type { Status } from '@/lib/types'

export default function StatusBadge({ status, size }: { status: Status; size?: 'xs' | 'sm' }) {
  const { label, className } = STATUS_MAP[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  const padding = size === 'xs' ? 'px-1.5 py-0' : 'px-2 py-0.5'
  const text = size === 'xs' ? 'text-[9px]' : 'text-xs'
  return (
    <span className={`inline-flex items-center ${padding} rounded-full ${text} font-medium ${className}`}>
      {label}
    </span>
  )
}
