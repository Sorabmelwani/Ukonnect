import { useState, useRef, useEffect } from 'react'
import { sendChatMessage, type ChatResponse, type ChatSource } from '../api/ai'
import { HiOutlineChatAlt2, HiOutlinePaperAirplane, HiOutlineX, HiOutlineInformationCircle, HiOutlineBookOpen } from 'react-icons/hi'

interface ChatMessage {
  question: string
  answer: string
  disclaimer: string
  sources: ChatSource[]
  timestamp: Date
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, chatHistory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate message length
    if (message.trim().length < 2) {
      setError('Please enter a question with at least 2 characters.')
      return
    }
    
    if (message.trim().length > 1000) {
      setError('Question must be 1000 characters or less.')
      return
    }

    const question = message.trim()
    setMessage('')
    setError(null)
    setLoading(true)

    try {
      const response: ChatResponse = await sendChatMessage(question)
      
      const newMessage: ChatMessage = {
        question,
        answer: response.answer,
        disclaimer: response.disclaimer,
        sources: response.sources || [],
        timestamp: new Date()
      }
      
      setChatHistory(prev => [...prev, newMessage])
    } catch (err: any) {
      console.error('Failed to send message', err)
      setError(err.response?.data?.message || 'Failed to get answer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setMessage(example)
    inputRef.current?.focus()
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className="chatbot-toggle-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <HiOutlineChatAlt2 />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <HiOutlineChatAlt2 className="chatbot-header-icon" />
              <div>
                <h3 className="chatbot-header-title">AI Assistant</h3>
                <p className="chatbot-header-subtitle">Ask me anything</p>
              </div>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <HiOutlineX />
            </button>
          </div>

          <div className="chatbot-messages">
            {chatHistory.length === 0 && !loading && (
              <div className="chatbot-welcome">
                <HiOutlineChatAlt2 className="chatbot-welcome-icon" />
                <h4>How can I help you today?</h4>
                <p>Ask questions about UK immigration, services, or settlement tasks.</p>
                <div className="chatbot-examples">
                  <button
                    className="chatbot-example-btn"
                    onClick={() => handleExampleClick("What documents do I need for a UK visa?")}
                  >
                    What documents do I need for a UK visa?
                  </button>
                  <button
                    className="chatbot-example-btn"
                    onClick={() => handleExampleClick("How do I register with a GP?")}
                  >
                    How do I register with a GP?
                  </button>
                  <button
                    className="chatbot-example-btn"
                    onClick={() => handleExampleClick("How do I open a UK bank account?")}
                  >
                    How do I open a UK bank account?
                  </button>
                </div>
              </div>
            )}

            {chatHistory.map((msg, index) => (
              <div key={index} className="chatbot-message-group">
                <div className="chatbot-question">
                  <div className="chatbot-question-content">
                    <strong>You:</strong> {msg.question}
                  </div>
                </div>
                <div className="chatbot-answer">
                  <div className="chatbot-answer-content">
                    <strong>AI:</strong>
                    <div className="chatbot-answer-text" style={{ whiteSpace: 'pre-wrap' }}>{msg.answer}</div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="chatbot-sources">
                        <div className="chatbot-sources-header">
                          <HiOutlineBookOpen className="chatbot-sources-icon" />
                          <span className="chatbot-sources-title">Related Items ({msg.sources.length}):</span>
                        </div>
                        <ul className="chatbot-sources-list">
                          {msg.sources.map((source, idx) => (
                            <li key={idx} className="chatbot-source-item">
                              <span className="chatbot-source-type">{source.type}</span>
                              <span className="chatbot-source-title">{source.title}</span>
                              <span className="chatbot-source-content">{source.content}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="chatbot-disclaimer">
                    <HiOutlineInformationCircle className="chatbot-disclaimer-icon" />
                    <span>{msg.disclaimer}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="chatbot-loading">
                <div className="chatbot-loading-spinner"></div>
                <span>Getting answer...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-form" onSubmit={handleSubmit}>
            {error && <div className="chatbot-error">{error}</div>}
            <div className="chatbot-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="chatbot-input"
                placeholder="Type your question..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setError(null)
                }}
                disabled={loading}
                maxLength={1000}
              />
              <button
                type="submit"
                className="chatbot-submit-btn"
                disabled={loading || message.trim().length < 2}
                aria-label="Send message"
              >
                <HiOutlinePaperAirplane />
              </button>
            </div>
            <div className="chatbot-char-count">
              {message.length}/1000
            </div>
          </form>
        </div>
      )}
    </>
  )
}

