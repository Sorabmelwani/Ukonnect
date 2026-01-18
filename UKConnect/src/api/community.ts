import apiClient from './client'

export interface CreatePostPayload {
  body: string
  tags?: string
}

export interface PostReply {
  id: string
  postId: string
  userId: string
  body: string
  createdAt: string
  user: PostUser
}

export interface UserProfile {
  fullName: string
  [key: string]: any
}

export interface PostUser {
  id: string
  email: string
  profile: UserProfile
}

export interface CommunityPost {
  id: string
  userId: string
  body: string
  city?: string | null
  tags?: string | null
  createdAt: string
  user: PostUser
  replies: PostReply[]
}

export interface PostsResponse {
  ok: boolean
  posts: CommunityPost[]
}

export interface CreatePostResponse {
  ok: boolean
  post?: CommunityPost
}

export const fetchPosts = async (): Promise<CommunityPost[]> => {
  const response = await apiClient.get<PostsResponse>('/community/posts')
  return response.data.posts || []
}

export const createPost = async (data: CreatePostPayload): Promise<CommunityPost> => {
  const response = await apiClient.post<CreatePostResponse>('/community/posts', data)
  if (response.data.post) {
    return response.data.post
  }
  // If post is not in response, throw error or return a minimal post
  throw new Error('Post creation failed')
}

export interface CreateReplyPayload {
  body: string
}

export interface CreateReplyResponse {
  ok: boolean
  reply?: PostReply
}

export const createReply = async (postId: string, data: CreateReplyPayload): Promise<PostReply> => {
  const response = await apiClient.post<CreateReplyResponse>(`community/posts/${postId}/replies`, data)
  if (response.data.reply) {
    return response.data.reply
  }
  throw new Error('Reply creation failed')
}

export interface CommunityStats {
  activeMembers: number
  countries: number
  successStories: number
  questionsAnswered: number
}

export interface StatsResponse {
  ok: boolean
  stats: CommunityStats
}

export const fetchStats = async (): Promise<CommunityStats> => {
  const response = await apiClient.get<StatsResponse>('/community/stats')
  return response.data.stats
}

export interface UpdatePostPayload {
  body: string
  tags?: string
}

export interface UpdatePostResponse {
  ok: boolean
  post?: CommunityPost
}

export const updatePost = async (postId: string, data: UpdatePostPayload): Promise<CommunityPost> => {
  const response = await apiClient.put<UpdatePostResponse>(`/community/posts/${postId}`, data)
  if (response.data.post) {
    return response.data.post
  }
  throw new Error('Post update failed')
}

export interface DeletePostResponse {
  ok: boolean
}

export const deletePost = async (postId: string): Promise<void> => {
  await apiClient.delete<DeletePostResponse>(`/community/posts/${postId}`)
}

