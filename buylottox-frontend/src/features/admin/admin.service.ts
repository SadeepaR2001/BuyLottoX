import type { ApiResult } from '../../types/shared'
import { apiGet, apiPatch, apiPost } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import type { AdminGrid, AdminUser, CreateGridPayload, GridDetail } from './admin.types'

export const adminService = {
  listUsers(): Promise<ApiResult<AdminUser[]>> {
    return apiGet(endpoints.admin.users)
  },
  blockUser(id: string): Promise<ApiResult<AdminUser>> {
    return apiPatch(endpoints.admin.blockUser(id))
  },
  unblockUser(id: string): Promise<ApiResult<AdminUser>> {
    return apiPatch(endpoints.admin.unblockUser(id))
  },
  createAdmin(payload: { name: string; mobileNumber: string; password: string }): Promise<ApiResult<AdminUser>> {
    return apiPost(endpoints.admin.createAdmin, payload)
  },
  makeAdmin(id: string): Promise<ApiResult<AdminUser>> {
    return apiPatch(endpoints.admin.makeAdmin(id))
  },
  removeAdmin(id: string): Promise<ApiResult<AdminUser>> {
    return apiPatch(endpoints.admin.removeAdmin(id))
  },
  listGrids(): Promise<ApiResult<AdminGrid[]>> {
    return apiGet(endpoints.admin.grids)
  },
  createGrid(payload: CreateGridPayload): Promise<ApiResult<any>> {
    return apiPost(endpoints.admin.grids, payload)
  },
  getGrid(id: string): Promise<ApiResult<GridDetail>> {
    return apiGet(endpoints.admin.grid(id))
  },
  openGrid(id: string): Promise<ApiResult<any>> {
    return apiPatch(endpoints.admin.openGrid(id))
  },
  closeGrid(id: string): Promise<ApiResult<any>> {
    return apiPatch(endpoints.admin.closeGrid(id))
  },
  setWinningNumber(id: string, winningNumber: number): Promise<ApiResult<any>> {
    return apiPatch(endpoints.admin.setWinningNumber(id), { winningNumber })
  },
}
