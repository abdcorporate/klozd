'use client';

import Image from 'next/image';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Motifs subtils en arrière-plan */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
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
          <p className="text-muted-foreground">Le CRM tout-en-un</p>
        </div>
        {children}
      </div>
    </div>
  );
}


