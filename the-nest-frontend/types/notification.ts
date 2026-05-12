export interface NotificationActor {
  username: string
  display_name: string
  avatar_url: string | null
}

export interface Notification {
  id: string
  type: 'like' | 'repost' | 'reply' | 'follow' | 'mention'
  is_read: boolean
  created_at: string
  post_id: string | null
  actor: NotificationActor
}
