'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, AlertCircle, Save, Loader2 } from 'lucide-react';
import axios from 'axios';

interface NotificationPreferences {
  emailNotifications: Record<string, boolean>;
  pushNotifications: Record<string, boolean>;
  inAppNotifications: Record<string, boolean>;
  notificationFrequency: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const notificationTypes = [
  { key: 'order', label: 'Orders', icon: '📦' },
  { key: 'message', label: 'Messages', icon: '💬' },
  { key: 'payment', label: 'Payments', icon: '💳' },
  { key: 'dispute', label: 'Disputes', icon: '⚠️' },
  { key: 'system', label: 'System Updates', icon: '⚙️' },
  { key: 'jobUpdate', label: 'Job Updates', icon: '💼' },
  { key: 'rating', label: 'Ratings', icon: '⭐' },
  { key: 'marketing', label: 'Marketing', icon: '📢' },
];

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications/preferences');
      setPreferences(response.data.data);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load notification settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: 'emailNotifications' | 'pushNotifications' | 'inAppNotifications', type: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [field]: {
        ...preferences[field],
        [type]: !preferences[field][type],
      },
    });
  };

  const handleFrequencyChange = (frequency: string) => {
    if (!preferences) return;
    setPreferences({ ...preferences, notificationFrequency: frequency });
  };

  const handleQuietHoursChange = (key: string, value: string) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      await axios.put('/api/notifications/preferences', preferences);
      setMessage({ type: 'success', text: 'Notification settings saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save notification settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AlertCircle className="w-8 h-8 text-red-500 mr-2" />
        <p className="text-gray-600">Failed to load notification settings</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
        </div>
        <p className="text-gray-600">Manage how and when you receive notifications</p>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Main Settings */}
      <div className="space-y-6">
        {/* Notification Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Frequency</h2>
          <div className="space-y-3">
            {['instant', 'daily_digest', 'weekly_digest'].map((freq) => (
              <label key={freq} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value={freq}
                  checked={preferences.notificationFrequency === freq}
                  onChange={(e) => handleFrequencyChange(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">
                  {freq === 'instant' && 'Get notifications instantly'}
                  {freq === 'daily_digest' && 'Daily digest'}
                  {freq === 'weekly_digest' && 'Weekly digest'}
                </span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Quiet Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiet Hours</h2>
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.quietHoursEnabled}
              onChange={(e) => 
                setPreferences({ ...preferences, quietHoursEnabled: e.target.checked })
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-gray-700">Enable quiet hours</span>
          </label>

          {preferences.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => handleQuietHoursChange('quietHoursStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => handleQuietHoursChange('quietHoursEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Notification Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Types</h2>

          <div className="space-y-6">
            {notificationTypes.map((type) => (
              <div key={type.key} className="pb-6 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{type.icon}</span>
                  <h3 className="font-medium text-gray-900">{type.label}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-11">
                  {/* Email Notifications */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications[type.key] || false}
                      onChange={() => handleToggle('emailNotifications', type.key)}
                      className="w-4 h-4 rounded"
                    />
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Email</span>
                    </div>
                  </label>

                  {/* Push Notifications */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications[type.key] || false}
                      onChange={() => handleToggle('pushNotifications', type.key)}
                      className="w-4 h-4 rounded"
                    />
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Push</span>
                    </div>
                  </label>

                  {/* In-App Notifications */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.inAppNotifications[type.key] || false}
                      onChange={() => handleToggle('inAppNotifications', type.key)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">In-App</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          first={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={savePreferences}
          disabled={saving}
          className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
