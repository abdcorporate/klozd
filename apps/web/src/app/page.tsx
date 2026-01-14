'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger immédiatement vers login sans dépendances
    router.replace('/login');
  }, []); // Tableau de dépendances vide pour éviter les re-renders

  return null;
}
