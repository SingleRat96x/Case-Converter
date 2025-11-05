import type { Metadata } from 'next';
import { ChangelogContent } from '@/components/pages/ChangelogContent';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'История Изменений - Конвертер Регистра Текста',
  description: 'Будьте в курсе последних изменений, новых инструментов и улучшений платформы. Отслеживайте новые функции, исправления и улучшения.',
  openGraph: {
    title: 'История Изменений - Конвертер Регистра Текста',
    description: 'Будьте в курсе последних изменений, новых инструментов и улучшений платформы.',
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'История Изменений - Конвертер Регистра Текста',
    description: 'Будьте в курсе последних изменений, новых инструментов и улучшений.',
  },
};

export default function ChangelogPageRu() {
  return <ChangelogContent />;
}
