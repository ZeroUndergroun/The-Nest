export interface Post {
  id: string
  user_id: string
  content: string
  parent_post_id: string | null
  is_reply: boolean
  like_count: number
  reply_count: number
  repost_count: number
  edit_count: number
  media_url?: string | null
  media_type?: string | null
  created_at: string
  updated_at: string
  reposted_by?: string
  user?: {
    username: string
    display_name: string
    avatar_url: string | null
    role: string
  }
}
