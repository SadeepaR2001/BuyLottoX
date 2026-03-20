import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { AuthLayout } from '../app/layout/AuthLayout'
import { AppLayout } from '../app/layout/AppLayout'

import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Dashboard from '../pages/user/Dashboard'
import BuyTicket from '../pages/user/BuyTicket'
import MyTickets from '../pages/user/MyTickets'
import Payments from '../pages/user/Payments'
import AdminDashboard from '../pages/admin/AdminDashboard'
import Draws from '../pages/admin/Draws'
import Users from '../pages/admin/Users'
import AdminPayments from '../pages/admin/Payments'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <AuthLayout><Login /></AuthLayout> },
  { path: '/register', element: <AuthLayout><Register /></AuthLayout> },

  { path: '/dashboard', element: <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute> },
  { path: '/buy-ticket', element: <ProtectedRoute><RoleRoute allow={['USER']}><AppLayout><BuyTicket /></AppLayout></RoleRoute></ProtectedRoute> },
  { path: '/my-tickets', element: <ProtectedRoute><RoleRoute allow={['USER']}><AppLayout><MyTickets /></AppLayout></RoleRoute></ProtectedRoute> },
  { path: '/payments', element: <ProtectedRoute><RoleRoute allow={['USER']}><AppLayout><Payments /></AppLayout></RoleRoute></ProtectedRoute> },

  { path: '/admin', element: <ProtectedRoute><RoleRoute allow={['ADMIN']}><AppLayout><AdminDashboard /></AppLayout></RoleRoute></ProtectedRoute> },
  { path: '/admin/users', element: <ProtectedRoute><RoleRoute allow={['ADMIN']}><AppLayout><Users /></AppLayout></RoleRoute></ProtectedRoute> },
  { path: '/admin/payments', element: <ProtectedRoute><RoleRoute allow={['ADMIN']}><AppLayout><AdminPayments /></AppLayout></RoleRoute></ProtectedRoute> },
  { path: '/admin/draws', element: <ProtectedRoute><RoleRoute allow={['ADMIN']}><AppLayout><Draws /></AppLayout></RoleRoute></ProtectedRoute> },
])
