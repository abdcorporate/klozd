'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/auth-layout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus sur le premier input au chargement
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Compteur de 60 secondes pour le renvoi de code
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    // Ne permettre que les chiffres
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Passer au champ suivant si un chiffre est saisi
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Vérifier automatiquement si tous les champs sont remplis
    if (newCode.every((digit) => digit !== '') && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Supprimer et revenir au champ précédent
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Vérifier que c'est un code à 6 chiffres
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setCode(digits);
      setError(null);
      inputRefs.current[5]?.focus();
      // Vérifier automatiquement
      setTimeout(() => handleVerify(pastedData), 100);
    }
  };

  const handleVerify = async (verificationCode: string) => {
    if (!email) {
      setError('Email manquant. Veuillez vous réinscrire.');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/auth/verify-email-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la vérification');
      }

      // Rediriger vers la page de connexion avec un message de succès
      router.push('/login?verified=true');
    } catch (err: any) {
      setError(err.message || 'Code invalide. Veuillez réessayer.');
      // Réinitialiser le code
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email manquant. Veuillez vous réinscrire.');
      return;
    }

    if (resendCooldown > 0) {
      return; // Empêcher l'envoi si le compteur est actif
    }

    try {
      setIsResending(true);
      setError(null);
      setResendSuccess(false);

      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'envoi du code');
      }

      setResendSuccess(true);
      setResendCooldown(60); // Démarrer le compteur de 60 secondes
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du code. Veuillez réessayer.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <AuthLayout>
        <div className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Email manquant
            </h2>
            <p className="text-gray-600 mb-6">
              Veuillez vous inscrire pour recevoir un code de vérification.
            </p>
            <button
              onClick={() => router.push('/register')}
              className="px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange-dark transition-colors"
            >
              S'inscrire
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-orange/10 mb-4">
            <svg
              className="h-8 w-8 text-brand-orange"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vérifiez votre email
          </h2>
          <p className="text-gray-600 mb-2">
            Nous avons envoyé un code de vérification à
          </p>
          <p className="text-gray-900 font-semibold mb-6">
            {email}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {resendSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            Un nouveau code a été envoyé à votre adresse email.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Entrez le code à 6 chiffres
          </label>
          <div className="flex justify-center gap-2 mb-4">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isLoading}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleVerify(code.join(''))}
            disabled={isLoading || code.some((digit) => !digit)}
            className="w-full px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Vérification...' : 'Vérifier'}
          </button>

          <div className="text-center">
            <button
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
              className="text-sm text-brand-orange hover:text-brand-orange-dark hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending 
                ? 'Envoi en cours...' 
                : resendCooldown > 0 
                ? `Renvoyer le code (${resendCooldown}s)`
                : "Je n'ai pas reçu le code"}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Le code expire dans 15 minutes
        </p>
      </div>
    </AuthLayout>
  );
}

