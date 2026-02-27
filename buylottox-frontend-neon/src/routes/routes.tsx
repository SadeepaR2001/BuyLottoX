import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { AuthLayout } from '../app/layout/AuthLayout'
import { AppLayout } from '../app/layout/AppLayout'

import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Dashboard from '../pages/user/Dashboard'
import BuyTicket from '../pages/user/BuyTicket'
import MyTickets from '../pages/user/MyTickets'
import AdminDashboard from '../pages/admin/AdminDashboard'
import Draws from '../pages/admin/Draws'

export const router = createBrowserRouter([
  { path: '/', element: <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute> },
  { path: '/login', element: <AuthLayout><Login /></AuthLayout> },
  { path: '/register', element: <AuthLayout><Register /></AuthLayout> },

  { path: '/dashboard', element: <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute> },
  { path: '/buy-ticket', element: <ProtectedRoute><AppLayout><BuyTicket /></AppLayout></ProtectedRoute> },
  { path: '/my-tickets', element: <ProtectedRoute><AppLayout><MyTickets /></AppLayout></ProtectedRoute> },

  { path: '/admin', element: <ProtectedRoute><RoleRoute allow={['ADMIN']}><AppLayout><AdminDashboard /></AppLayout></RoleRoute></ProtectedRoute> },
  { path: '/admin/draws', element: <ProtectedRoute><RoleRoute allow={['ADMIN']}><AppLayout><Draws /></AppLayout></RoleRoute></ProtectedRoute> },
])
