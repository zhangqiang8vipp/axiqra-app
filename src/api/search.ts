import apiClient from './client'
import type { ApiResponse, SearchRequest, SearchResponseVO } from '@/types'

export const searchApi = {
  search(data: SearchRequest) {
    return apiClient.post<ApiResponse<SearchResponseVO>>('/search/before-act', data)
  },
}
