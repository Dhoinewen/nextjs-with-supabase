'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

const CLARITY_PROJECT_ID = 'rvfw5dt9vk';

export default function ClarityAnalytics() {
  useEffect(() => {
    // Only initialize Clarity on the client side
    if (typeof window !== 'undefined') {
      Clarity.init(CLARITY_PROJECT_ID);
      Clarity.identify("custom-id", "custom-session-id", "custom-page-id", "friendly-name");
    }
  }, []);

  // This component doesn't render anything
  return null;
}
