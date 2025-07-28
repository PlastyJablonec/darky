import { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle, Users } from 'lucide-react'
import { contributionService } from '@/services/contributionService'
import type { ContributionMessage } from '@/types'

interface ContributorChatProps {
  giftId: string
  className?: string
}

export function ContributorChat({ giftId, className = '' }: ContributorChatProps) {
  const [messages, setMessages] = useState<ContributionMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadMessages()
  }, [giftId])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const fetchedMessages = await contributionService.getContributionMessages(giftId)
      setMessages(fetchedMessages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání zpráv')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return

    setIsSending(true)
    setError('')

    try {
      const message = await contributionService.sendContributionMessage(giftId, newMessage)
      setMessages(prev => [...prev, message])
      setNewMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při odesílání zprávy')
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center space-x-2 p-4 border-b border-gray-100">
        <MessageCircle className="h-5 w-5 text-blue-600" />
        <h3 className="font-medium text-gray-900">Komunikace přispěvatelů</h3>
        <Users className="h-4 w-4 text-gray-500" />
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Zatím žádné zprávy. Buďte první, kdo napíše!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {message.senderName}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(message.createdAt)}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {message.message}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-100 p-4">
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-md p-2">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Napište zprávu ostatním přispěvatelům..."
            className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={2}
            disabled={isSending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2">
          Stiskněte Enter pro odeslání, Shift+Enter pro nový řádek
        </p>
      </div>
    </div>
  )
}