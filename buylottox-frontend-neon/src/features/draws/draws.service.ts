import { data } from '../../services/data'

export const drawsService = {
  getActive: () => data.draws.getActive(),
  listAll: () => data.draws.listAll(),
}
