import apiClient from './client'
import type { ApiResponse, ToolModelLeaderboardVO } from '@/types'

export const toolModelApi = {
  getLeaderboard(params?: {
    scopeType?: string
    scopeId?: number
    toolName?: string
    limit?: number
  }) {
    return apiClient.get<ApiResponse<ToolModelLeaderboardVO[]>>(
      '/v1/tool-models/leaderboard',
      { params },
    )
  },
}
