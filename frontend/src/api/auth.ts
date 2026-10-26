import type { LoginResponse, MessageResponse, Resource, User } from '../types/api'
import { apiFetch } from './client'

export interface LoginInput {
  email: string
  password: string
}

export function login(input: LoginInput): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: input,
    auth: false,
  })
}

export function logout(): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/auth/logout', { method: 'POST' })
}

export function fetchMe(): Promise<Resource<User>> {
  return apiFetch<Resource<User>>('/auth/me')
}
