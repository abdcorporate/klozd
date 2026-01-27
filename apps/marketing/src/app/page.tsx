"use client";

import { useRef } from "react";
import Script from "next/script";

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div id="root" ref={rootRef} style={{ paddingTop: '80px' }}></div>
      <Script
        src="/assets/index-BgtM3Jyb.js"
        strategy="afterInteractive"
        onError={(e) => {
          console.error('Failed to load main bundle:', e);
        }}
      />
    </>
  );
}
