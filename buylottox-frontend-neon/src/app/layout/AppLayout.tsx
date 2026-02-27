import type { PropsWithChildren } from 'react'
import { Sidebar } from '../../components/common/Sidebar'
import { Topbar } from '../../components/common/Topbar'

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-black text-blx-text">
      <div className="flex">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
