import React, { useEffect, useRef } from 'react';

interface LegacyHtmlPageProps {
  html: string;
}

export const LegacyHtmlPage: React.FC<LegacyHtmlPageProps> = ({ html }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log("LegacyHtmlPage: Rendering new HTML content");
    // Use DOMParser to extract body content and styles
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (doc.querySelector('parsererror')) {
      console.error("LegacyHtmlPage: HTML parsing error", doc.querySelector('parsererror')?.textContent);
    }

    // 1. Move styles to head
    const styles = doc.querySelectorAll('style, link[rel="stylesheet"]');
    console.log(`LegacyHtmlPage: Found ${styles.length} styles`);
    styles.forEach(s => {
      // Avoid duplicates
      if (!document.head.querySelector(`style[data-legacy], link[href="${(s as HTMLLinkElement).href}"]`)) {
        const clone = s.cloneNode(true) as HTMLElement;
        clone.setAttribute('data-legacy', 'true');
        document.head.appendChild(clone);
      }
    });

    // 2. Set body content
    const bodyContent = doc.body.innerHTML;
    containerRef.current.innerHTML = bodyContent;

    // 3. Apply body classes to container
    containerRef.current.className = doc.body.className;
    console.log(`LegacyHtmlPage: Applied body classes: ${doc.body.className}`);

    // 4. Execute scripts in sequence
    const scripts = Array.from(doc.querySelectorAll('script'));
    const executeScripts = async () => {
      for (const oldScript of scripts) {
        await new Promise<void>((resolve) => {
          const newScript = document.createElement('script');
          newScript.setAttribute('data-legacy-script', 'true');
          
          // Copy attributes
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.onload = () => resolve();
            newScript.onerror = () => resolve();
            document.body.appendChild(newScript);
          } else {
            try {
              // Using a script element with textContent is generally safer,
              // but we'll try to explicitly make it global by appending it
              // and also logging.
              newScript.textContent = oldScript.textContent;
              document.body.appendChild(newScript);
              console.log("LegacyHtmlPage: Executed inline script");
            } catch (e) {
              console.error("LegacyHtmlPage: Error executing inline script", e);
            }
            resolve();
          }
        });
      }
      
      // Give the browser a moment to process the scripts
      const triggerAlpine = () => {
        const el = containerRef.current;
        if (!el) return;
        
        console.log("LegacyHtmlPage: Container info:", {
          id: el.id,
          className: el.className,
          xData: el.getAttribute('x-data'),
          childrenCount: el.childElementCount
        });

        if ((window as any).Alpine) {
          console.log("LegacyHtmlPage: Initializing Alpine tree on container");
          (window as any).Alpine.initTree(el);
          // Also try to start Alpine if it hasn't started
          if (!(window as any).Alpine.initialized) {
             (window as any).Alpine.start();
          }
        } else {
          console.warn("LegacyHtmlPage: Alpine not found, waiting...");
          document.addEventListener('alpine:init', () => {
            console.log("LegacyHtmlPage: Alpine initialized, initTree...");
            (window as any).Alpine.initTree(el);
          }, { once: true });
        }
      };

      setTimeout(triggerAlpine, 500);
    };




    executeScripts();

    return () => {
      // Optional: cleanup scripts
      const scriptsInBody = document.querySelectorAll('script[data-legacy-script]');
      scriptsInBody.forEach(s => s.remove());
    };

  }, [html]);

  return <div ref={containerRef} />;
};
