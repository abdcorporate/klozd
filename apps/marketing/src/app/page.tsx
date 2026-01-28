"use client";

import { useRef, useEffect } from "react";
import Script from "next/script";

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remove legal section from bundled footer
    const removeLegalSection = () => {
      const root = document.getElementById("root");
      if (!root) return;

      try {
        // Find and remove links containing "Confidentialité", "Privacy", "CGU", "Terms"
        const allLinks = root.querySelectorAll("a");
        allLinks.forEach((link) => {
          if (!link.isConnected) return;
          const text = link.textContent?.toLowerCase() || "";
          const href = link.getAttribute("href") || "";
          if (
            text.includes("confidentialité") ||
            text.includes("privacy") ||
            text.includes("cgu") ||
            text.includes("terms") ||
            href.includes("privacy") ||
            href.includes("terms")
          ) {
            const parentLi = link.closest("li");
            if (parentLi && parentLi.isConnected && parentLi.parentNode) {
              parentLi.style.display = "none";
            } else if (link.parentNode) {
              link.style.display = "none";
            }
          }
        });

        // Find and remove "Légal" or "Legal" section headers
        const allElements = root.querySelectorAll("h4, h3, h5");
        allElements.forEach((el) => {
          if (!el.isConnected) return;
          const text = el.textContent?.trim().toLowerCase() || "";
          if (text === "légal" || text === "legal") {
            const parent = el.parentElement;
            if (parent && parent.isConnected) {
              parent.style.display = "none";
            }
          }
        });

        // Remove border from footer
        const footer = root.querySelector("footer");
        if (footer) {
          const borderElements = footer.querySelectorAll("[class*='border']");
          borderElements.forEach((el) => {
            if (el instanceof HTMLElement && el.isConnected) {
              el.style.borderTop = "none";
              el.style.borderBottom = "none";
              el.style.border = "none";
            }
          });
        }

        // Change 2025 to 2026
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (node.textContent?.includes("2025")) {
            node.textContent = node.textContent.replace(/2025/g, "2026");
          }
        }
      } catch (e) {
        // Ignore DOM manipulation errors
      }
    };

    // Run after a short delay to ensure bundle has rendered
    const timer = setTimeout(removeLegalSection, 500);
    const timer2 = setTimeout(removeLegalSection, 1000);
    const timer3 = setTimeout(removeLegalSection, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <>
      <div id="root" ref={rootRef} style={{ paddingTop: '60px' }}></div>
      <Script
        src="/assets/index-BgtM3Jyb.js"
        strategy="afterInteractive"
      />
    </>
  );
}
