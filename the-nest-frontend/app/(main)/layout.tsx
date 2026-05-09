import Sidebar from '@/components/layout/Sidebar'
import RightSidebar from '@/components/layout/RightSidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 h-screen w-20 flex-shrink-0 border-r border-gray-200 xl:w-64 2xl:w-72 dark:border-gray-700">
        <Sidebar />
      </aside>
      <main className="w-full max-w-[680px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
        {children}
      </main>
      <aside className="min-w-0 flex-1">
        <RightSidebar />
      </aside>
    </div>
  )
}
