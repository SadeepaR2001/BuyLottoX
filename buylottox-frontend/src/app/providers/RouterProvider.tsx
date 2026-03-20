import { RouterProvider as RRProvider } from 'react-router-dom'
import { router } from '../../routes/routes'

export function RouterProvider() {
  return <RRProvider router={router} />
}
