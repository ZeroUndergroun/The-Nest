export type Role = 'current_student' | 'alumni' | 'incoming_student' | 'staff'

export interface User {
  id: string
  email: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  role: Role
  email_verified: boolean
  is_active: boolean
  created_at: string
}

export interface UserPublicProfile {
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  role: Role
  created_at: string
  follower_count: number
  following_count: number
  is_following: boolean
}
