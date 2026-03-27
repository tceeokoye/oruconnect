'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatInterface } from '@/components/chat-interface';
import axios from 'axios';

interface Conversation {
  _id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: Date;
  relatedJobRequestId?: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    fetchConversations();
    // Get current user ID from auth
    // setCurrentUserId(getCurrentUserId());
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      setConversations(response.data.data || []);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedConversation(response.data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="h-[calc(100vh-5rem)] flex gap-6 p-6 max-w-7xl mx-auto">
        {/* Conversations List */}
        <motion.div
          className="w-80 bg-slate-800/50 rounded-xl border border-gray-700 overflow-hidden flex flex-col backdrop-blur-sm"
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Messages</h2>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto space-y-2 p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Loading conversations...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <p>No conversations yet</p>
                </div>
              </div>
            ) : (
              conversations.map((conversation) => (
                <motion.button
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${selectedConversation?._id === conversation._id
                      ? 'bg-purple-600/30 border border-purple-500'
                      : 'bg-slate-700/50 hover:bg-slate-700 border border-gray-700'
                    }`}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        Conversation {conversation._id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{conversation.lastMessage}</p>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>

        {/* Chat Interface */}
        {selectedConversation ? (
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ChatInterface
              conversationId={selectedConversation._id}
              currentUserId={currentUserId}
              recipientId={
                selectedConversation.participants.find((p) => p !== currentUserId) || ''
              }
              recipientName="Provider Name"
            />
          </motion.div>
        ) : (
          <motion.div
            className="flex-1 flex items-center justify-center bg-slate-800/50 rounded-xl border border-gray-700 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">Select a conversation to start messaging</p>
              <p className="text-sm">or create a new one</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
