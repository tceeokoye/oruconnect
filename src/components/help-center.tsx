'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Send, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface HelpTicket {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  messages: any[];
  createdAt: Date;
  assignedToAdmin?: boolean;
  transferredToTechAdmin?: boolean;
}

interface HelpCenterProps {
  userId: string;
}

export function HelpCenter({ userId }: HelpCenterProps) {
  const [tickets, setTickets] = useState<HelpTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`/api/help-center?userId=${userId}`);
      setTickets(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      //const response = await axios.post('/api/help-center/create', {
      //  userId,
      //  ...formData,
      //});
      // setTickets([...tickets, response.data.data]);
      setFormData({ title: '', description: '', category: 'general', priority: 'medium' });
      setShowCreateForm(false);
      // Fetch updated tickets
      fetchTickets();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      //await axios.post(`/api/help-center/${selectedTicket}/message`, {
      //  message: newMessage,
      //  userId,
      //});
      setNewMessage('');
      fetchTickets();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="h-screen flex bg-slate-900">
      {/* Left Panel - Tickets List */}
      <motion.div
        className="w-80 border-r border-gray-700 bg-slate-800 flex flex-col"
        initial={{ x: -400 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Help Center</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(true)}
              className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
            >
              <Plus size={20} />
            </motion.button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 text-xs">
            <button className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full">
              All
            </button>
            <button className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full hover:bg-gray-600">
              Open
            </button>
            <button className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full hover:bg-gray-600">
              Resolved
            </button>
          </div>
        </div>

        {/* Tickets List */}
        <div className="flex-1 overflow-y-auto space-y-2 p-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <p>No support tickets yet</p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {tickets.map((ticket) => (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => setSelectedTicket(ticket._id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedTicket === ticket._id
                      ? 'bg-purple-600/30 border border-purple-500'
                      : 'bg-slate-700/50 hover:bg-slate-700 border border-gray-700'
                  }`}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white truncate flex-1">
                      {ticket.title}
                    </h4>
                    {getStatusIcon(ticket.status)}
                  </div>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                    {ticket.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded border ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                    {ticket.transferredToTechAdmin && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        Tech Admin
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Right Panel - Ticket Details */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {selectedTicket ? (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              {/* Ticket Header */}
              <div className="p-4 border-b border-gray-700">
                {(() => {
                  const ticket = tickets.find((t) => t._id === selectedTicket);
                  return (
                    ticket && (
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{ticket.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(ticket.status)}
                            <span className="capitalize">{ticket.status}</span>
                          </span>
                          <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(
                            ticket.priority
                          )}`}>
                            {ticket.priority}
                          </span>
                          {ticket.assignedToAdmin && (
                            <span className="text-purple-400">Assigned to Admin</span>
                          )}
                          {ticket.transferredToTechAdmin && (
                            <span className="text-blue-400">Transferred to Tech Admin</span>
                          )}
                        </div>
                      </div>
                    )
                  );
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(() => {
                  const ticket = tickets.find((t) => t._id === selectedTicket);
                  return (
                    ticket && (
                      <>
                        {/* Initial Description */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-700/50 p-4 rounded-lg border border-gray-700"
                        >
                          <p className="text-gray-100">{ticket.description}</p>
                        </motion.div>

                        {/* Messages */}
                        <AnimatePresence>
                          {ticket.messages.map((msg, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${
                                msg.senderRole === 'client' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-md px-4 py-2 rounded-lg ${
                                  msg.senderRole === 'client'
                                    ? 'bg-purple-600/30 text-white'
                                    : 'bg-blue-600/30 text-blue-100'
                                }`}
                              >
                                <p className="text-sm font-semibold text-xs mb-1 opacity-70">
                                  {msg.senderRole === 'tech_admin' ? 'Tech Admin' : 'Support Team'}
                                </p>
                                <p>{msg.message}</p>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </>
                    )
                  );
                })()}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg"
                  >
                    <Send size={20} />
                  </motion.button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center text-gray-400">
                <p className="mb-4">Select a ticket or create a new one</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateForm(true)}
                  className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create Support Ticket
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.form
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onSubmit={handleCreateTicket}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-xl p-6 w-96 max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Create Support Ticket</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief title of your issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Detailed description of your issue"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="payment">Payment</option>
                      <option value="account">Account</option>
                      <option value="dispute">Dispute</option>
                      <option value="job">Job</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg py-2 font-semibold hover:from-purple-700 hover:to-blue-700"
                >
                  Create Ticket
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HelpCenter;
