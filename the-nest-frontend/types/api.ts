export interface ApiError {
  detail: string
}

export interface ToggleLikeResponse {
  liked: boolean
  like_count: number
}

export interface ToggleRepostResponse {
  reposted: boolean
  repost_count: number
}

export interface ToggleFollowResponse {
  following: boolean
}
