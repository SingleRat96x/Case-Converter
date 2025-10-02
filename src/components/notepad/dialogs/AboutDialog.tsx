'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Info, FileText, Save, Printer, Eye } from 'lucide-react';
import { useToolTranslations } from '@/lib/i18n/hooks';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const { tool: t } = useToolTranslations('tools/miscellaneous');
  
  const features = [
    { icon: <FileText className="h-4 w-4" />, text: t('onlineNotepad.dialogs.about.features.richText') },
    { icon: <Save className="h-4 w-4" />, text: t('onlineNotepad.dialogs.about.features.autoSave') },
    { icon: <Printer className="h-4 w-4" />, text: t('onlineNotepad.dialogs.about.features.printExport') },
    { icon: <Eye className="h-4 w-4" />, text: t('onlineNotepad.dialogs.about.features.preview') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t('onlineNotepad.dialogs.about.title')}
          </DialogTitle>
          <DialogDescription>
            {t('onlineNotepad.dialogs.about.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{t('onlineNotepad.dialogs.about.appName')}</h3>
            <p className="text-sm text-muted-foreground">{t('onlineNotepad.dialogs.about.version')}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-3">{t('onlineNotepad.dialogs.about.featuresTitle')}</h4>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className="text-primary">{feature.icon}</div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              {t('onlineNotepad.dialogs.about.footer.builtWith')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('onlineNotepad.dialogs.about.footer.copyright')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}