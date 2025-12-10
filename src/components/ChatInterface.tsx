import React, { useState, useRef, useEffect, useCallback } from 'react';

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  metadata?: {
    confidence?: number;
    processingTime?: number;
    tokensUsed?: number;
  };
}

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isTyping?: boolean;
  placeholder?: string;
  disabled?: boolean;
  showTimestamps?: boolean;
  showMetadata?: boolean;
  className?: string;
}

const TypingIndicator: React.FC = () => (
  <div className="typing-indicator flex items-center gap-1 px-4 py-3">
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <span className="text-xs text-white/40 ml-2">thinking...</span>
  </div>
);

const MessageBubble: React.FC<{
  message: ChatMessage;
  showTimestamp: boolean;
  showMetadata: boolean;
  isLatest: boolean;
}> = ({ message, showTimestamp, showMetadata, isLatest }) => {
  const [hasEntered, setHasEntered] = useState(!isLatest);

  useEffect(() => {
    if (isLatest) {
      const timer = setTimeout(() => setHasEntered(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isLatest]);

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isSystem) {
    return (
      <div
        className={`
          chat-message chat-message-system
          flex justify-center my-4
          ${hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          transition-all duration-300
        `}
      >
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        chat-message flex flex-col
        ${isUser ? 'items-end' : 'items-start'}
        ${hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        transition-all duration-300 ease-out
      `}
    >
      {/* Role label */}
      <div className={`text-xs text-white/40 mb-1 ${isUser ? 'mr-2' : 'ml-2'}`}>
        {isUser ? 'You' : 'Assistant'}
      </div>

      {/* Message bubble */}
      <div
        className={`
          chat-bubble relative max-w-[80%] px-4 py-3 rounded-2xl
          ${isUser
            ? 'bg-blue-500/20 border border-blue-500/30 rounded-br-md'
            : 'bg-white/5 border border-white/10 rounded-bl-md'
          }
          ${message.status === 'error' ? 'border-red-500/50 bg-red-500/10' : ''}
          ${message.status === 'sending' ? 'opacity-70' : ''}
        `}
      >
        {/* Content */}
        <div className="text-sm text-white/90 whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Metadata for assistant messages */}
        {!isUser && showMetadata && message.metadata && (
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5 text-xs text-white/30">
            {message.metadata.confidence !== undefined && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {Math.round(message.metadata.confidence * 100)}%
              </span>
            )}
            {message.metadata.processingTime !== undefined && (
              <span>{message.metadata.processingTime}ms</span>
            )}
            {message.metadata.tokensUsed !== undefined && (
              <span>{message.metadata.tokensUsed} tokens</span>
            )}
          </div>
        )}

        {/* Status indicator */}
        {isUser && message.status === 'sending' && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4">
            <svg className="animate-spin text-blue-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="10" cy="10" r="7" strokeOpacity={0.3} />
              <path d="M10 3a7 7 0 0 1 7 7" strokeLinecap="round" />
            </svg>
          </div>
        )}
        {isUser && message.status === 'error' && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 text-red-400">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Timestamp */}
      {showTimestamp && (
        <div className={`text-xs text-white/30 mt-1 ${isUser ? 'mr-2' : 'ml-2'}`}>
          {formatTime(message.timestamp)}
        </div>
      )}
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isTyping = false,
  placeholder = 'Type a message...',
  disabled = false,
  showTimestamps = true,
  showMetadata = false,
  className = '',
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  }, [input, disabled, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className={`chat-interface flex flex-col h-full ${className}`}>
      {/* Messages area */}
      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <svg className="w-12 h-12 mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <p className="text-sm">Start a conversation</p>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            showTimestamp={showTimestamps}
            showMetadata={showMetadata}
            isLatest={index === messages.length - 1}
          />
        ))}

        {isTyping && (
          <div className="chat-message flex flex-col items-start">
            <div className="text-xs text-white/40 mb-1 ml-2">Assistant</div>
            <div className="chat-bubble bg-white/5 border border-white/10 rounded-2xl rounded-bl-md">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area border-t border-white/10 p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="
                w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white/90 placeholder-white/30
                resize-none overflow-hidden
                focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            />
          </div>
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="
              p-3 rounded-xl
              bg-blue-500/20 border border-blue-500/30
              text-blue-300
              hover:bg-blue-500/30 hover:border-blue-500/50
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200
              flex-shrink-0
            "
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        <div className="text-xs text-white/30 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
