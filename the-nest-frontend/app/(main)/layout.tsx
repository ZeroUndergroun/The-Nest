import Sidebar from '@/components/layout/Sidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import BottomNav from '@/components/layout/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left sidebar — hidden on mobile, visible md+ */}
      <aside className="sticky top-0 hidden h-screen w-20 flex-shrink-0 border-r border-gray-200 md:block xl:w-64 2xl:w-72 dark:border-gray-700">
        <Sidebar />
      </aside>

      {/* Main content — full width on mobile, constrained on desktop */}
      <main className="w-full max-w-[680px] flex-shrink-0 border-r border-gray-200 pb-16 md:pb-0 dark:border-gray-700">
        {children}
      </main>

      {/* Right sidebar — hidden on mobile */}
      <aside className="hidden min-w-0 flex-1 lg:block">
        <RightSidebar />
      </aside>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  )
}
