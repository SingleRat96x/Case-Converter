'use client';

import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface FeedbackMessageProps {
  feedback: { type: 'success' | 'error'; message: string } | null;
}

export function FeedbackMessage({ feedback }: FeedbackMessageProps) {
  if (!feedback) return null;

  return (
    <div className={`flex items-center justify-center p-4 rounded-lg ${
      feedback.type === 'success' 
        ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800' 
        : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
    }`}>
      {feedback.type === 'success' ? (
        <CheckCircle className="h-5 w-5 mr-2" />
      ) : (
        <AlertCircle className="h-5 w-5 mr-2" />
      )}
      {feedback.message}
    </div>
  );
}