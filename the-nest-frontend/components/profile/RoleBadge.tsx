import type { Role } from '@/types/user'

const labels: Record<Role, string> = {
  current_student: 'Student',
  alumni: 'Alumni',
  incoming_student: 'Incoming',
  staff: 'Staff',
}

const colors: Record<Role, string> = {
  current_student: 'bg-blue-100 text-blue-800',
  alumni: 'bg-amber-100 text-amber-800',
  incoming_student: 'bg-green-100 text-green-800',
  staff: 'bg-purple-100 text-purple-800',
}

export default function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[role]}`}>
      {labels[role]}
    </span>
  )
}
