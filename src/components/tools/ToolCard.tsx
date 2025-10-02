import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ToolCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  isPopular?: boolean;
  isViewAll?: boolean;
}

export function ToolCard({ title, description, icon, href, isPopular, isViewAll }: ToolCardProps) {
  const cardClasses = isViewAll 
    ? "h-full cursor-pointer border-2 border-dashed border-primary/50 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all duration-200"
    : "h-full cursor-pointer border-border/50 hover:border-border transition-colors";

  return (
    <Link href={href} className="block transition-transform hover:scale-105">
      <Card className={cardClasses}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{icon}</div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {title}
                </CardTitle>
              </div>
            </div>
            {isPopular && (
              <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Popular
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className={`leading-relaxed ${isViewAll ? 'text-foreground' : 'text-muted-foreground'}`}>
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
