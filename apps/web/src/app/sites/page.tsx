'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SitesPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers /forms avec l'onglet sites
    router.replace('/pages?tab=sites');
  }, [router]);

  return null;
}
