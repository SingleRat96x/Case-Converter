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
      className="block p-6 rounded-lg border bg-card hover:bg-accent/10 transition-colors"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        {example && (
          <div className="mt-4 p-3 rounded bg-muted/50 text-sm">
            <code>{example}</code>
          </div>
        )}
      </div>
    </Link>
  );
} 