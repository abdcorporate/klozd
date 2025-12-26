'use client';

import Image from 'next/image';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Motifs subtils en arrière-plan */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-brand-orange/4 to-transparent rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-brand-purple/4 to-transparent rounded-full blur-[100px]"></div>
      </div>
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="KLOZD"
              width={300}
              height={100}
              className="h-20 w-auto"
              priority
              unoptimized
            />
          </div>
          <p className="text-gray-600">La plateforme tout-en-un</p>
        </div>
        {children}
      </div>
    </div>
  );
}


