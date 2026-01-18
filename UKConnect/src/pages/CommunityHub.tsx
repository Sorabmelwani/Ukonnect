import { useState, useEffect, useRef } from 'react'
import { fetchPosts, createPost, createReply, fetchStats, updatePost, deletePost, type CommunityPost, type PostReply, type CommunityStats } from '../api/community'
import { HiOutlineChatAlt2, HiOutlineSparkles, HiOutlineLightBulb, HiOutlinePaperAirplane, HiOutlineUsers, HiOutlinePencil, HiOutlineTrash, HiDotsVertical, HiOutlineX } from 'react-icons/hi'
import ThemeToggle from '../components/ThemeToggle'
import PageHeader from '../components/PageHeader'

// Utility function to decode JWT token and get user ID
const getCurrentUserId = (): string | null => {
  try {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken')
    if (!token) return null
    
    // JWT token format: header.payload.signature
    const payload = token.split('.')[1]
    if (!payload) return null
    
    // Decode base64 payload
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded.sub || null
  } catch (err) {
    console.error('Failed to decode token:', err)
    return null
  }
}


type PostType = 'question' | 'success' | 'tip'

interface Reply {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  timestamp: string
}

interface Post {
  id: string
  userId: string
  author: {
    name: string
    location: string
    avatar: string
  }
  type: PostType
  content: string
  timestamp: string
  likes: number
  comments: number
  replies: Reply[]
}

export default function CommunityHub() {
  const [postContent, setPostContent] = useState('')
  const [selectedType, setSelectedType] = useState<PostType | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})
  const [replying, setReplying] = useState<Record<string, boolean>>({})
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editContent, setEditContent] = useState<Record<string, string>>({})
  const [updating, setUpdating] = useState<Record<string, boolean>>({})
  const [deleting, setDeleting] = useState<Record<string, boolean>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [stats, setStats] = useState<CommunityStats>({
    activeMembers: 0,
    countries: 0,
    successStories: 0,
    questionsAnswered: 0
  })

  useEffect(() => {
    setCurrentUserId(getCurrentUserId())
    loadPosts()
    loadStats()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const menuElement = menuRefs.current[openMenuId]
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuId])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const apiPosts = await fetchPosts()
      const formattedPosts = apiPosts.map(formatPost)
      setPosts(formattedPosts)
    } catch (err) {
      console.error('Failed to load posts', err)
      setError('Unable to load posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await fetchStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load stats', err)
      // Don't show error for stats, just keep default values
    }
  }

  const formatPost = (apiPost: CommunityPost): Post => {
    // Extract post type from tags (tags might be like "question" or "question,banking")
    const tags = apiPost.tags?.toLowerCase() || ''
    let postType: PostType = 'tip' // default
    if (tags.includes('question')) postType = 'question'
    else if (tags.includes('success')) postType = 'success'
    else if (tags.includes('tip')) postType = 'tip'

    // Get city from post or localStorage
    const city = apiPost.city || 'Unknown'
    const locationDisplay = city

    // Get user info from API response
    const userName = apiPost.user?.profile?.fullName || 'User'
    const avatar = userName.charAt(0).toUpperCase()

    // Format replies
    const formattedReplies: Reply[] = (apiPost.replies || []).map((reply: PostReply) => {
      const replyUserName = reply.user?.profile?.fullName || 'User'
      const replyAvatar = replyUserName.charAt(0).toUpperCase()
      return {
        id: reply.id,
        author: {
          name: replyUserName,
          avatar: replyAvatar
        },
        content: reply.body,
        timestamp: reply.createdAt
      }
    })

    return {
      id: apiPost.id,
      userId: apiPost.userId,
      author: {
        name: userName,
        location: locationDisplay,
        avatar
      },
      type: postType,
      content: apiPost.body,
      timestamp: apiPost.createdAt,
      likes: 0, // API doesn't provide likes
      comments: apiPost.replies?.length || 0,
      replies: formattedReplies
    }
  }

  const handleShare = async () => {
    if (!postContent.trim() || !selectedType) return

    // Validate length requirements
    if (postContent.trim().length < 10) {
      setError('Content must be at least 10 characters')
      return
    }

    try {
      setPosting(true)
      setError(null)

      // Generate title from body (first 120 chars or first sentence)
      const body = postContent.trim()


      // Map post type to tags
      const tags = selectedType

      await createPost({
        body: body,
        tags: tags
      })

      // Clear form
      setPostContent('')
      setSelectedType(null)

      // Reload posts
      await loadPosts()
    } catch (err) {
      console.error('Failed to create post', err)
      setError('Unable to create post. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  const getTypeIcon = (type: PostType) => {
    switch (type) {
      case 'question': return <HiOutlineChatAlt2 />
      case 'success': return <HiOutlineSparkles />
      case 'tip': return <HiOutlineLightBulb />
    }
  }

  const getTypeColor = (type: PostType) => {
    switch (type) {
      case 'question': return '#ff9944'
      case 'success': return '#00cc99'
      case 'tip': return '#1f7ce1'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleReplyClick = (postId: string) => {
    if (replyingTo === postId) {
      setReplyingTo(null)
      setReplyContent(prev => ({ ...prev, [postId]: '' }))
    } else {
      setReplyingTo(postId)
      if (!replyContent[postId]) {
        setReplyContent(prev => ({ ...prev, [postId]: '' }))
      }
    }
  }

  const handleReplySubmit = async (postId: string) => {
    const content = replyContent[postId]?.trim()
    if (!content || content.length < 1) {
      setError('Reply cannot be empty')
      return
    }

    try {
      setReplying(prev => ({ ...prev, [postId]: true }))
      setError(null)

      await createReply(postId, { body: content })

      // Clear reply input
      setReplyContent(prev => ({ ...prev, [postId]: '' }))
      setReplyingTo(null)

      // Reload posts to get updated reply count
      await loadPosts()
    } catch (err) {
      console.error('Failed to create reply', err)
      setError('Unable to post reply. Please try again.')
    } finally {
      setReplying(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handleMenuToggle = (postId: string) => {
    setOpenMenuId(openMenuId === postId ? null : postId)
  }

  const handleEditClick = (post: Post) => {
    setEditingPost(post.id)
    setEditContent(prev => ({ ...prev, [post.id]: post.content }))
    setReplyingTo(null) // Close reply section if open
    setOpenMenuId(null) // Close menu
  }

  const handleEditCancel = (postId: string) => {
    setEditingPost(null)
    setEditContent(prev => {
      const updated = { ...prev }
      delete updated[postId]
      return updated
    })
  }

  const handleEditSubmit = async (post: Post) => {
    const content = editContent[post.id]?.trim()
    if (!content || content.length < 10) {
      setError('Content must be at least 10 characters')
      return
    }

    try {
      setUpdating(prev => ({ ...prev, [post.id]: true }))
      setError(null)

      await updatePost(post.id, {
        body: content,
        tags: post.type
      })

      // Clear edit state
      setEditingPost(null)
      setEditContent(prev => {
        const updated = { ...prev }
        delete updated[post.id]
        return updated
      })

      // Reload posts
      await loadPosts()
    } catch (err: any) {
      console.error('Failed to update post', err)
      setError(err.response?.data?.error || 'Unable to update post. Please try again.')
    } finally {
      setUpdating(prev => ({ ...prev, [post.id]: false }))
    }
  }

  const handleDeleteClick = (postId: string) => {
    setOpenMenuId(null) // Close menu first
    setPostToDelete(postId)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return

    try {
      setDeleting(prev => ({ ...prev, [postToDelete]: true }))
      setError(null)
      setDeleteModalOpen(false)

      await deletePost(postToDelete)

      // Reload posts
      await loadPosts()
    } catch (err: any) {
      console.error('Failed to delete post', err)
      setError(err.response?.data?.error || 'Unable to delete post. Please try again.')
    } finally {
      setDeleting(prev => ({ ...prev, [postToDelete]: false }))
      setPostToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setPostToDelete(null)
  }

  const isOwnPost = (post: Post): boolean => {
    return currentUserId !== null && post.userId === currentUserId
  }

  return (
    <div className="community-hub-page">
      <PageHeader
        title="Community Hub"
        subtitle="Connect with fellow newcomers and share experiences."
        showBackButton={true}
        backButtonPath="/dashboard"
        rightContent={<ThemeToggle />}
        className="community-hub"
      />

      <main className="community-hub-main">
        <div className="community-hub-container">
          <div className="community-hub-content">
            {/* Left Column - Main Feed */}
            <div className="community-hub-feed">
              {/* Share Section */}
              <div className="share-section">
                <h2 className="share-section-title">Share with the community</h2>
                <textarea
                  className="share-textarea"
                  placeholder="Ask a question, share a success story, or give advice to fellow newcomers..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={4}
                  maxLength={2000}
                />
                {postContent.length > 0 && postContent.length < 10 && (
                  <p className="validation-hint" style={{ marginTop: '-0.75rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#ef4444' }}>
                    Content must be at least 10 characters
                  </p>
                )}
                <div className="share-actions">
                  <div className="post-type-buttons">
                    <button
                      className={`post-type-btn ${selectedType === 'question' ? 'active' : ''}`}
                      onClick={() => setSelectedType('question')}
                      style={{ '--type-color': '#ff9944' } as React.CSSProperties}
                    >
                      <HiOutlineChatAlt2 />
                      Question
                    </button>
                    <button
                      className={`post-type-btn ${selectedType === 'success' ? 'active' : ''}`}
                      onClick={() => setSelectedType('success')}
                      style={{ '--type-color': '#00cc99' } as React.CSSProperties}
                    >
                      <HiOutlineSparkles />
                      Success
                    </button>
                    <button
                      className={`post-type-btn ${selectedType === 'tip' ? 'active' : ''}`}
                      onClick={() => setSelectedType('tip')}
                      style={{ '--type-color': '#1f7ce1' } as React.CSSProperties}
                    >
                      <HiOutlineLightBulb />
                      Tip
                    </button>
                  </div>
                  <button
                    className="share-button"
                    onClick={handleShare}
                    disabled={!postContent.trim() || !selectedType || posting}
                  >
                    <HiOutlinePaperAirplane />
                    {posting ? 'Sharing...' : 'Share'}
                  </button>
                </div>
                {error && <p className="auth-error" style={{ marginTop: '0.75rem' }}>{error}</p>}
              </div>

              {/* Posts Feed */}
              <div className="posts-feed">
                {loading ? (
                  <div className="empty-feed">
                    <p>Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="empty-feed">
                    <p>No posts yet. Be the first to share!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="post-card">
                      <div className="post-header">
                        <div className="post-author">
                          <div className="post-avatar">{post.author.avatar}</div>
                          <div className="post-author-info">
                            <div className="post-author-name">{post.author.name}</div>
                            <div className="post-author-location">{post.author.location}</div>
                          </div>
                        </div>
                        <div className="post-meta">
                          <div className="post-meta-left">
                            <span
                              className="post-type-badge"
                              style={{ backgroundColor: getTypeColor(post.type) }}
                            >
                              {getTypeIcon(post.type)}
                              {post.type}
                            </span>
                            <span className="post-timestamp">{formatTimestamp(post.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      {editingPost === post.id ? (
                        <div className="edit-section">
                          <textarea
                            className="edit-textarea"
                            value={editContent[post.id] || ''}
                            onChange={(e) => setEditContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                            rows={4}
                            maxLength={2000}
                          />
                          {editContent[post.id] && editContent[post.id].length < 10 && (
                            <p className="validation-hint" style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ef4444' }}>
                              Content must be at least 10 characters
                            </p>
                          )}
                          <div className="edit-actions">
                            <button
                              className="edit-cancel-btn"
                              onClick={() => handleEditCancel(post.id)}
                              disabled={updating[post.id]}
                            >
                              Cancel
                            </button>
                            <button
                              className="edit-submit-btn"
                              onClick={() => handleEditSubmit(post)}
                              disabled={!editContent[post.id]?.trim() || editContent[post.id]?.trim().length < 10 || updating[post.id]}
                            >
                              {updating[post.id] ? 'Updating...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="post-content">{post.content}</div>
                      )}
                      <div className="post-actions">
                        <button
                          className="post-action-btn"
                          onClick={() => handleReplyClick(post.id)}
                        >
                          <HiOutlineChatAlt2 />
                          {post.comments}
                        </button>
                        {isOwnPost(post) && (
                          <div className="post-menu-wrapper" ref={(el) => menuRefs.current[post.id] = el}>
                            <button
                              className="post-menu-btn"
                              onClick={() => handleMenuToggle(post.id)}
                              disabled={editingPost === post.id || deleting[post.id]}
                              title="Post options"
                              aria-label="Post options"
                            >
                              <HiDotsVertical />
                            </button>
                            {openMenuId === post.id && (
                              <div className="post-menu-dropdown">
                                <button
                                  className="post-menu-item"
                                  onClick={() => handleEditClick(post)}
                                  disabled={updating[post.id] || deleting[post.id]}
                                >
                                  <HiOutlinePencil />
                                  <span>Edit</span>
                                </button>
                                <button
                                  className="post-menu-item post-menu-item-danger"
                                  onClick={() => handleDeleteClick(post.id)}
                                  disabled={updating[post.id] || deleting[post.id]}
                                >
                                  <HiOutlineTrash />
                                  <span>{deleting[post.id] ? 'Deleting...' : 'Delete'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {replyingTo === post.id && (
                        <div className="reply-section">
                          <textarea
                            className="reply-textarea"
                            placeholder="Write a reply..."
                            value={replyContent[post.id] || ''}
                            onChange={(e) => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                            rows={3}
                          />
                          <div className="reply-actions">
                            <button
                              className="reply-cancel-btn"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyContent(prev => ({ ...prev, [post.id]: '' }))
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="reply-submit-btn"
                              onClick={() => handleReplySubmit(post.id)}
                              disabled={!replyContent[post.id]?.trim() || replying[post.id]}
                            >
                              {replying[post.id] ? 'Posting...' : 'Post Reply'}
                            </button>
                          </div>
                        </div>
                      )}
                      {post.replies && post.replies.length > 0 && (
                        <div className="replies-section">
                          {(() => {
                            const maxInitialReplies = 3
                            const isExpanded = expandedReplies[post.id] || false
                            const repliesToShow = isExpanded
                              ? post.replies
                              : post.replies.slice(0, maxInitialReplies)
                            const hasMore = post.replies.length > maxInitialReplies

                            return (
                              <>
                                {repliesToShow.map((reply) => (
                                  <div key={reply.id} className="reply-item">
                                    <div className="reply-author">
                                      <div className="reply-avatar">{reply.author.avatar}</div>
                                      <div className="reply-author-info">
                                        <div className="reply-author-name">{reply.author.name}</div>
                                        <div className="reply-timestamp">{formatTimestamp(reply.timestamp)}</div>
                                      </div>
                                    </div>
                                    <div className="reply-content">{reply.content}</div>
                                  </div>
                                ))}
                                {hasMore && !isExpanded && (
                                  <button
                                    className="show-more-replies-btn"
                                    onClick={() => setExpandedReplies(prev => ({ ...prev, [post.id]: true }))}
                                  >
                                    Show {post.replies.length - maxInitialReplies} more {post.replies.length - maxInitialReplies === 1 ? 'reply' : 'replies'}
                                  </button>
                                )}
                                {hasMore && isExpanded && (
                                  <button
                                    className="show-more-replies-btn"
                                    onClick={() => setExpandedReplies(prev => ({ ...prev, [post.id]: false }))}
                                  >
                                    Show less
                                  </button>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column - Sidebars */}
            <div className="community-hub-sidebar">
              {/* Community Stats */}
              <div className="community-stats-section">
                <h3 className="community-stats-title">
                  <HiOutlineUsers />
                  Community Stats
                </h3>
                <div className="community-stats-list">
                  <div className="community-stats-item">
                    <span className="community-stats-label">Active Members</span>
                    <span className="community-stats-value">{stats.activeMembers.toLocaleString()}</span>
                  </div>
                  <div className="community-stats-item">
                    <span className="community-stats-label">Countries</span>
                    <span className="community-stats-value">{stats.countries}</span>
                  </div>
                  <div className="community-stats-item">
                    <span className="community-stats-label">Success Stories</span>
                    <span className="community-stats-value">{stats.successStories.toLocaleString()}</span>
                  </div>
                  <div className="community-stats-item">
                    <span className="community-stats-label">Questions Answered</span>
                    <span className="community-stats-value">{stats.questionsAnswered.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="delete-modal-overlay" onClick={handleDeleteCancel}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3 className="delete-modal-title">Delete Post</h3>
              <button
                className="delete-modal-close"
                onClick={handleDeleteCancel}
                aria-label="Close"
              >
                <HiOutlineX />
              </button>
            </div>
            <div className="delete-modal-content">
              <p>Are you sure you want to delete this post?</p>
              <p className="delete-modal-warning">
                All comments will also be deleted. This action cannot be undone.
              </p>
            </div>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-cancel-btn"
                onClick={handleDeleteCancel}
                disabled={deleting[postToDelete || '']}
              >
                Cancel
              </button>
              <button
                className="delete-modal-confirm-btn"
                onClick={handleDeleteConfirm}
                disabled={deleting[postToDelete || '']}
              >
                {deleting[postToDelete || ''] ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
