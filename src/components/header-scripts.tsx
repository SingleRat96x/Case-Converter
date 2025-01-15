"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface HeaderScript {
  id: string;
  script: string;
  is_enabled: boolean;
}

export function HeaderScripts() {
  const [scripts, setScripts] = useState<HeaderScript[]>([]);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const { data, error } = await supabase
          .from("header_scripts")
          .select("id, script, is_enabled")
          .eq("is_enabled", true);

        if (error) throw error;
        setScripts(data || []);
      } catch (error) {
        console.error("Error fetching header scripts:", error);
      }
    };

    fetchScripts();
  }, []);

  return (
    <>
      {scripts.map((script) => (
        <div
          key={script.id}
          dangerouslySetInnerHTML={{ __html: script.script }}
        />
      ))}
    </>
  );
} 