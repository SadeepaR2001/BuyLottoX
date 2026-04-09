import type { PropsWithChildren } from 'react'
import { Topbar } from '../../components/common/Topbar'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-black text-blx-text">
      <Topbar />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="blx-panel-strong p-6">{children}</div>
      </main>
    </div>
  )
}
