export default function CustomerPill({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 font-medium">
      {name}
    </span>
  )
}
