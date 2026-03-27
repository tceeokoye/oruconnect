'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatInterface } from '@/components/chat-interface';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Loader2 } from 'lucide-react';

interface Conversation {
  _id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: Date;
  relatedJobRequestId?: string;
}

export default function ClientMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

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

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">Communicate directly with your providers</p>
      </motion.div>

      <div className="h-[calc(100vh-14rem)] flex flex-col md:flex-row gap-6 bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r border-border flex flex-col bg-muted/20">
          <div className="p-4 border-b border-border bg-card">
            <h2 className="font-semibold">Recent Conversations</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <p className="text-muted-foreground text-sm">No messages yet.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">When you contact a provider, your conversation will appear here.</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedConversation?._id === conversation._id
                      ? 'bg-primary/10 border-primary/20 shadow-sm'
                      : 'hover:bg-muted bg-transparent border-transparent'
                  } border`}
                >
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
                      {/* Simple placeholder avatar */}
                      P
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        Provider
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 pl-13">
                    {conversation.lastMessage}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 bg-card relative">
          {selectedConversation ? (
            <div className="absolute inset-0">
              <ChatInterface
                conversationId={selectedConversation._id}
                currentUserId={user.id || (user as any)._id}
                recipientId={
                  selectedConversation.participants.find((p) => p !== (user.id || (user as any)._id)) || ''
                }
                recipientName="Provider"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg font-medium">Your Messages</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Select a conversation from the sidebar to start messaging, or post a job to connect with new providers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
