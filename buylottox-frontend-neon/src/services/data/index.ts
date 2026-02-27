import * as mockAuth from '../../mock/auth.mock'
import * as mockTickets from '../../mock/tickets.mock'
import * as mockDraws from '../../mock/draws.mock'

// Later you can add api providers here and switch by env.
const provider = (import.meta.env.VITE_DATA_PROVIDER || 'mock').toLowerCase()

export const data = {
  provider,
  auth: mockAuth,
  tickets: mockTickets,
  draws: mockDraws,
}
