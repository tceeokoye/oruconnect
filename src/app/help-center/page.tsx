'use client';

import React from 'react';
import { HelpCenter } from '@/components/help-center';

export default function HelpCenterPage() {
  // Get user ID from session/auth
  const userId = 'user-id-here'; // This should come from your auth context

  return <HelpCenter userId={userId} />;
}
