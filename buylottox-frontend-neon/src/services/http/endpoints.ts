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
    create: '/draws',
    close: (id: string) => `/draws/${id}/close`,
  },
  tickets: {
    mine: '/tickets/me',
    create: '/tickets',
  },
}
