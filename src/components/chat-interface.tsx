'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Smile, Phone, Video } from 'lucide-react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  sender: string;
  senderName: string;
  content: string;
  timestamp: Date;
  attachments?: string[];
  read: boolean;
}

interface ChatInterfaceProps {
  conversationId: string;
  currentUserId: string;
  recipientId: string;
  recipientName: string;
}

export function ChatInterface({
  conversationId,
  currentUserId,
  recipientId,
  recipientName,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchMessages();

    // Setup Socket
    const socket = io({
      path: '/api/socket/io',
      addTrailingSlash: false,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-chat', conversationId);
    });

    socket.on('new-message', (message: Message) => {
      // Ensure we don't duplicate messages if they are from the current user 
      // (handled by the sender itself adding it to state, though appending here is also fine if we track _id)
      setMessages((prev) => {
        if (!prev.find((m) => m._id === message._id)) {
          return [...prev, message];
        }
        return prev;
      });
      scrollToBottom();
    });

    // Fallback polling (every 10s) just in case socket disconnects silently
    const interval = setInterval(fetchMessages, 10000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages?conversationId=${conversationId}`);
      setMessages(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageContent = newMessage;
    setNewMessage(''); // optimistic clear
    
    try {
      const response = await axios.post('/api/messages', {
        conversationId,
        sender: currentUserId,
        recipient: recipientId,
        content: messageContent,
      });
      
      const savedMessage = response.data.data;
      
      // Update local state quickly
      setMessages((prev) => [...prev, savedMessage]);
      scrollToBottom();

      // Emit to others via socket
      if (socketRef.current?.connected) {
        socketRef.current.emit('send-message', {
          chatId: conversationId,
          message: savedMessage,
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageContent); // Restore on fail
    } finally {
      setSending(false);
    }
  };

  // Check if messages array holds correctly structured timestamps, fallback to internal Date parse
  const getMessageTime = (msg: Message) => {
    return new Date(msg.timestamp || (msg as any).createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg">{recipientName}</h3>
          <p className="text-purple-200 text-sm">Online • Live Chat</p>
        </div>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <Phone size={20} className="text-white" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <Video size={20} className="text-white" />
          </motion.button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => {
              const isCurrentUser = message.sender === currentUserId;
              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      isCurrentUser
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm'
                        : 'bg-slate-700 text-gray-100 rounded-bl-sm border border-slate-600'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed break-words">{message.content}</p>
                    <p className={`text-[10px] mt-1 ${isCurrentUser ? 'text-purple-200' : 'text-gray-400'} text-right`}>
                      {getMessageTime(message)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-700 p-4 bg-slate-800"
      >
        <div className="flex items-center space-x-2 bg-slate-700/50 rounded-full p-1 border border-slate-600 transition-all focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 pl-3 text-gray-400 hover:text-white transition-colors"
          >
            <Paperclip size={18} />
          </motion.button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-white px-2 py-2 focus:outline-none text-[15px]"
          />

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-400 hover:text-white transition-colors pr-3"
          >
            <Smile size={18} />
          </motion.button>

          <motion.button
            type="submit"
            disabled={sending || !newMessage.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="m-1 p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <Send size={18} className={sending ? "opacity-50" : ""} />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

export default ChatInterface;
