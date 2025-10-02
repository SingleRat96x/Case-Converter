'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { X } from 'lucide-react';

interface ClearConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  contentType?: 'text' | 'images' | 'files';
}

export function ClearConfirmDialog({ open, onOpenChange, onConfirm, contentType = 'text' }: ClearConfirmDialogProps) {
  const { tSync } = useCommonTranslations();

  // Get content-specific translations
  const getTitle = () => {
    switch (contentType) {
      case 'images':
        return tSync('dialog.clearConfirm.titleImages');
      case 'files':
        return tSync('dialog.clearConfirm.titleFiles');
      default:
        return tSync('dialog.clearConfirm.title');
    }
  };

  const getDescription = () => {
    switch (contentType) {
      case 'images':
        return tSync('dialog.clearConfirm.descriptionImages');
      case 'files':
        return tSync('dialog.clearConfirm.descriptionFiles');
      default:
        return tSync('dialog.clearConfirm.description');
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{
            backdropFilter: 'blur(10px) saturate(180%)',
            WebkitBackdropFilter: 'blur(10px) saturate(180%)',
            animation: open ? 'overlayShow 300ms cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
          }}
        />
        <Dialog.Content 
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border/50 bg-background/95 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-90 data-[state=open]:zoom-in-90 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg mx-4"
          style={{
            animation: open ? 'dialogShow 300ms cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              {getTitle()}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {getDescription()}
            </Dialog.Description>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mt-2 sm:mt-0"
            >
              {tSync('dialog.clearConfirm.cancel')}
            </Button>
            <Button
              variant="default"
              onClick={handleConfirm}
            >
              {tSync('dialog.clearConfirm.confirm')}
            </Button>
          </div>
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}