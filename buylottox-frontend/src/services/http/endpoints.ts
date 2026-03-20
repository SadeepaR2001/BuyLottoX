export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  draws: {
    active: '/draws/active',
    list: '/draws',
    close: (id: number) => `/draws/${id}/close`,
  },
  tickets: {
    create: '/tickets',
    mine: '/tickets/me',
    update: (id: number) => `/admin/tickets/${id}`,
  },
  payments: {
    list: '/payments',
    create: '/payments',
    slip: (id: number) => `/payments/${id}/slip`,
  },
  admin: {
    users: '/admin/users',
    userHistory: (id: number) => `/admin/users/${id}/history`,
    payments: '/admin/payments',
    paymentUpdate: (id: number) => `/admin/payments/${id}`,
  },
}
