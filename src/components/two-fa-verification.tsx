'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface TwoFAVerificationProps {
  email: string;
  userId: string;
  role: string;
  requiresSetup?: boolean;
  onVerified: (token: string) => void;
  onBackClick: () => void;
}

export function TwoFAVerification({
  email,
  userId,
  role,
  requiresSetup,
  onVerified,
  onBackClick,
}: TwoFAVerificationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [setupMode, setSetupMode] = useState(requiresSetup || false);

  const handleSetup2FA = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post('/api/auth/2fa/setup', {
        method: 'email',
      });

      if (response.data.success) {
        setError('');
        // Show the setup confirmation and wait for them to enter the verification code
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post('/api/auth/2fa/verify', {
        code,
        method: 'email',
        deviceId: trustDevice ? `device_${Date.now()}` : undefined,
        deviceName: trustDevice ? deviceName : undefined,
        userAgent: navigator.userAgent,
        ipAddress: 'client_ip',
      });

      if (response.data.success) {
        // Generate a temporary token or session
        const tempToken = btoa(JSON.stringify({ userId, email, role }));
        onVerified(tempToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  if (setupMode && requiresSetup) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">2FA Required</h2>
          <p className="text-gray-600">
            As an admin, two-factor authentication is mandatory for your account.
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            We'll help you set up 2FA to secure your account. You can choose between email or
            authenticator apps.
          </p>
        </div>

        <button
          onClick={handleSetup2FA}
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Setup 2FA
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <button
          onClick={onBackClick}
          className="w-full mt-4 px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
        >
          Back
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify 2FA</h2>
        <p className="text-gray-600">
          Enter the verification code from your email or authenticator app
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Verification Code Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
          maxLength={6}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-center text-2xl tracking-widest"
        />
      </div>

      {/* Trust Device */}
      {!requiresSetup && (
        <label className="mb-4 flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={trustDevice}
            onChange={(e) => setTrustDevice(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-700">Trust this device for 30 days</span>
        </label>
      )}

      {trustDevice && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Device Name (optional)
          </label>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g., My iPhone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-sm"
          />
        </div>
      )}

      {/* Verify Button */}
      <button
        onClick={handleVerify2FA}
        disabled={loading}
        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            Verify & Login
            <CheckCircle className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Back Button */}
      <button
        onClick={onBackClick}
        className="w-full mt-4 px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
      >
        Back
      </button>
    </motion.div>
  );
}

export default TwoFAVerification;
