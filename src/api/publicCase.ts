import apiClient from './client'
import type { ApiResponse, PublicCaseDetailVO } from '@/types'

export const publicCaseApi = {
  list(params?: { limit?: number }) {
    return apiClient.get<ApiResponse<PublicCaseDetailVO[]>>('/public-cases', { params })
  },

  getById(id: number) {
    return apiClient.get<ApiResponse<PublicCaseDetailVO>>(`/public-cases/${id}`)
  },

  publish(projectCaseId: number) {
    return apiClient.post<ApiResponse<PublicCaseDetailVO>>(
      `/public-cases/publish/${projectCaseId}`,
    )
  },
}
