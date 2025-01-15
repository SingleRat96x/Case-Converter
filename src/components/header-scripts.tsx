"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface HeaderElement {
  id: string;
  type: 'script' | 'meta' | 'html';
  script?: string;
  meta_name?: string;
  meta_content?: string;
  html_content?: string;
  is_enabled: boolean;
  position: number;
}

export function HeaderScripts() {
  const [headerElements, setHeaderElements] = useState<HeaderElement[]>([]);

  useEffect(() => {
    const fetchHeaderElements = async () => {
      try {
        const { data, error } = await supabase
          .from("header_scripts")
          .select("*")
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

  const renderElement = (element: HeaderElement) => {
    if (element.type === 'meta' && element.meta_name && element.meta_content) {
      return (
        <meta
          key={element.id}
          name={element.meta_name}
          content={element.meta_content}
        />
      );
    }

    if (element.type === 'script' && element.script) {
      return (
        <div
          key={element.id}
          dangerouslySetInnerHTML={{ __html: element.script }}
        />
      );
    }

    if (element.type === 'html' && element.html_content) {
      return (
        <div
          key={element.id}
          dangerouslySetInnerHTML={{ __html: element.html_content }}
        />
      );
    }

    return null;
  };

  return <>{headerElements.map(renderElement)}</>;
} 