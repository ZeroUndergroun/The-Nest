import { BookOpen, Calendar, Megaphone, Pin } from 'lucide-react'

const PINS = [
  {
    Icon: Megaphone,
    tag: 'Announcement',
    title: 'Spring 2026 Commencement Details Released',
    date: 'May 15, 2026',
  },
  {
    Icon: Calendar,
    tag: 'Event',
    title: 'Golden Eagle Resource Fair — Student Union',
    date: 'May 20, 2026',
  },
  {
    Icon: BookOpen,
    tag: 'Deadline',
    title: 'Fall 2026 Enrollment Opens',
    date: 'June 1, 2026',
  },
]

export default function RightSidebar() {
  return (
    <div className="max-w-sm p-4">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <Pin size={15} className="text-amber-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Bulletin Board</h2>
        </div>

        <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
          {PINS.map(({ Icon, tag, title, date }) => (
            <div key={title} className="flex gap-3 px-4 py-3">
              <Icon size={17} className="mt-0.5 flex-shrink-0 text-amber-500" />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">
                  {tag}
                </span>
                <p className="mt-0.5 text-sm font-medium leading-snug text-gray-900 dark:text-white">
                  {title}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{date}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Featured by the Cal State LA community
          </p>
        </div>
      </div>
    </div>
  )
}
