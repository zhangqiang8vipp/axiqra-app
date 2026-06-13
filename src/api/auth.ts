import apiClient from './client'
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ProfileUpdateRequest,
  NavResponseVO,
} from '@/types'

export const authApi = {
  login(data: LoginRequest) {
    return apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data)
  },

  register(data: RegisterRequest) {
    return apiClient.post<ApiResponse<LoginResponse>>('/auth/register', data)
  },

  logout() {
    return apiClient.post('/auth/logout')
  },

  getMe() {
    return apiClient.get<ApiResponse<LoginResponse>>('/auth/me')
  },

  updateProfile(data: ProfileUpdateRequest) {
    return apiClient.put<ApiResponse<LoginResponse>>('/auth/profile', data)
  },

  getNav() {
    return apiClient.get<ApiResponse<NavResponseVO>>('/auth/nav')
  },
}
