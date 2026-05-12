export interface ConversationPartner {
  username: string
  display_name: string
  avatar_url: string | null
}

export interface Conversation {
  other_user: ConversationPartner
  latest_message: string
  latest_at: string
  unread_count: number
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  is_read: boolean
  created_at: string
}
