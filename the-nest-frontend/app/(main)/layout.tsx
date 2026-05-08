import Sidebar from '@/components/layout/Sidebar'
import RightSidebar from '@/components/layout/RightSidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="sticky top-0 h-screen w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
        <Sidebar />
      </aside>
      <main className="w-full max-w-2xl flex-1 border-r border-gray-200 dark:border-gray-700">
        {children}
      </main>
      <aside className="hidden w-80 flex-shrink-0 xl:block">
        <RightSidebar />
      </aside>
    </div>
  )
}
