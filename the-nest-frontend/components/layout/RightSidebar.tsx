export default function RightSidebar() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-3 text-base font-bold text-gray-900 dark:text-white">
          University Updates
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          News and events from Cal State LA will appear here.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-3 text-base font-bold text-gray-900 dark:text-white">
          Upcoming Events
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Campus events and deadlines coming soon.
        </p>
      </div>
    </div>
  )
}
