import apiClient from './client'
import type {
  ApiResponse,
  WorkspaceVO,
  WorkspaceCreateRequest,
  WorkspaceUpdateRequest,
  MemberVO,
  MemberRoleUpdateRequest,
  PageResponse,
} from '@/types'

export const workspaceApi = {
  list(params?: { pageNum?: number; pageSize?: number }) {
    return apiClient.get<ApiResponse<PageResponse<WorkspaceVO>>>('/workspaces', { params })
  },

  getById(id: number) {
    return apiClient.get<ApiResponse<WorkspaceVO>>(`/workspaces/${id}`)
  },

  create(data: WorkspaceCreateRequest) {
    return apiClient.post<ApiResponse<WorkspaceVO>>('/workspaces', data)
  },

  update(id: number, data: WorkspaceUpdateRequest) {
    return apiClient.put<ApiResponse<WorkspaceVO>>(`/workspaces/${id}`, data)
  },

  remove(id: number) {
    return apiClient.delete(`/workspaces/${id}`)
  },

  listMembers(workspaceId: number, params?: { pageNum?: number; pageSize?: number }) {
    return apiClient.get<ApiResponse<PageResponse<MemberVO>>>(
      `/workspaces/${workspaceId}/members`,
      { params },
    )
  },

  addMember(workspaceId: number, userId: number, role = 'member') {
    return apiClient.post<ApiResponse<MemberVO>>(
      `/workspaces/${workspaceId}/members`,
      null,
      { params: { userId, role } },
    )
  },

  updateMemberRole(workspaceId: number, data: MemberRoleUpdateRequest) {
    return apiClient.put(`/workspaces/${workspaceId}/members`, data)
  },

  removeMember(workspaceId: number, memberId: number) {
    return apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`)
  },
}
