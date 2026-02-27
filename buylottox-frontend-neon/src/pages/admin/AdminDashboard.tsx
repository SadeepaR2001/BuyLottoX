import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export default function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="blx-panel p-6">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <p className="mt-1 text-sm text-white/55">Manage draws and platform settings (mock).</p>

        <div className="mt-5 flex gap-3">
          <Link to="/admin/draws">
            <Button>Manage Draws</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      </div>

      <div className="blx-panel p-6">
        <h2 className="font-semibold">Next steps</h2>
        <ul className="mt-3 space-y-2 text-sm text-white/55">
          <li>• Create draw UI</li>
          <li>• Close draw with winning numbers</li>
          <li>• Winners report</li>
        </ul>
      </div>
    </div>
  )
}
