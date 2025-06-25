'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ToolBlockProps {
  title: string;
  description: string;
  href: string;
  example?: string;
}

export function ToolBlock({ title, description, href, example }: ToolBlockProps) {
  return (
    <Link
      href={href}
      className="block p-4 sm:p-6 rounded-lg border bg-card hover:bg-accent/10 transition-colors"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base sm:text-lg font-semibold line-clamp-2">{title}</h3>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        {example && (
          <div className="mt-4 p-3 rounded bg-muted/50 text-sm overflow-x-auto whitespace-pre-wrap">
            <code>{example}</code>
          </div>
        )}
      </div>
    </Link>
  );
} 