'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Today' },
  { href: '/backlog', label: 'Backlog' },
  { href: '/roadmap', label: 'Roadmap' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="bg-nav text-white h-14 flex items-center px-6 gap-8 sticky top-0 z-50 shadow-md">
      <span className="font-semibold text-base tracking-tight mr-4">
        <span className="text-blue-400">Z</span>ocket Backlog
      </span>
      <div className="flex items-center gap-1">
        {links.map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
