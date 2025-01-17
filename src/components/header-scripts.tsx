"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface HeaderElement {
  id: string;
  label: string;
  type: 'script' | 'meta' | 'html';
  script?: string | null;
  meta_name?: string | null;
  meta_content?: string | null;
  html_content?: string | null;
  is_enabled: boolean;
  position: number;
  created_at?: string;
}

export function HeaderScripts() {
  const [headerElements, setHeaderElements] = useState<HeaderElement[]>([]);

  useEffect(() => {
    const fetchHeaderElements = async () => {
      try {
        const { data, error } = await supabase
          .from("header_scripts")
          .select("id, label, type, script, meta_name, meta_content, html_content, is_enabled, position")
          .eq("is_enabled", true)
          .order("position", { ascending: true });

        if (error) throw error;
        setHeaderElements(data || []);
      } catch (error) {
        console.error("Error fetching header elements:", error);
      }
    };

    fetchHeaderElements();
  }, []);

  useEffect(() => {
    // Handle script and HTML elements after component mounts
    headerElements.forEach(element => {
      if (element.type === 'script' && element.script) {
        // Add data attribute to identify our scripts
        const scriptEl = document.createElement('script');
        scriptEl.innerHTML = element.script;
        scriptEl.setAttribute('data-header-script', element.id);
        // Only add if not already present
        if (!document.querySelector(`script[data-header-script="${element.id}"]`)) {
          document.head.appendChild(scriptEl);
        }
      }
      
      if (element.type === 'meta' && element.meta_name && element.meta_content) {
        // Remove existing meta tag with same name if exists
        const existingMeta = document.querySelector(`meta[name="${element.meta_name}"]`);
        if (existingMeta) {
          existingMeta.remove();
        }
        // Add meta tag directly to head
        const metaEl = document.createElement('meta');
        metaEl.setAttribute('name', element.meta_name);
        metaEl.setAttribute('content', element.meta_content);
        
        // Only add tracking attribute for non-verification meta tags
        if (!element.meta_name.includes('verification')) {
          metaEl.setAttribute('data-header-meta', element.id);
        }
        document.head.appendChild(metaEl);
      }
      
      if (element.type === 'html' && element.html_content) {
        const container = document.createElement('div');
        container.innerHTML = element.html_content;
        const validHeadTags = Array.from(container.children).filter(el => 
          ['link', 'meta', 'title', 'style', 'script', 'noscript', 'base'].includes(el.tagName.toLowerCase())
        );
        validHeadTags.forEach(tag => {
          const isVerificationMeta = tag.tagName.toLowerCase() === 'meta' && 
                                   tag.getAttribute('name')?.includes('verification');
          
          // Only add tracking attribute for non-verification tags
          if (!isVerificationMeta) {
            tag.setAttribute('data-header-html', element.id);
          }
          
          // Only add if not already present with same content
          const selector = isVerificationMeta ? 
            `meta[name="${tag.getAttribute('name')}"]` : 
            `[data-header-html="${element.id}"]`;
            
          if (!document.querySelector(selector)) {
            document.head.appendChild(tag);
          }
        });
      }
    });

    // Cleanup function
    return () => {
      // Clean up all our injected elements except verification meta tags
      document.querySelectorAll('[data-header-script], [data-header-meta], [data-header-html]')
        .forEach(el => el.remove());
    };
  }, [headerElements]);

  // Don't render anything in the component since we're handling everything in useEffect
  return null;
} 