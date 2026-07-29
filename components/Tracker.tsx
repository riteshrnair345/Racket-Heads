'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/track', { method: 'POST' }).catch(() => {});
  }, [pathname]);

  return null;
}
