import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with Russian hrefs and descriptions
const socialMediaTextGenerators = [
  {
    id: 'instagram-fonts',
    title: 'Генератор Instagram Шрифтов',
    description: 'Создавайте потрясающие стилизованные шрифты, идеальные для Instagram постов, историй, биографий и подписей с функцией копирования',
    icon: '📷',
    href: '/ru/tools/instagram-fonts'
  },
  {
    id: 'facebook-font',
    title: 'Генератор Facebook Шрифтов',
    description: 'Генерируйте привлекательные текстовые стили для Facebook постов, комментариев и описаний профилей с мгновенным копированием',
    icon: '📘',
    href: '/ru/tools/facebook-font'
  },
  {
    id: 'discord-font',
    title: 'Генератор Discord Шрифтов',
    description: 'Создавайте уникальное форматирование текста для Discord сообщений, имен пользователей и контента серверов со специальными символами',
    icon: '🎮',
    href: '/ru/tools/discord-font'
  }
];

// Generate metadata using the modular system for Russian locale
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('social-media-text-generators', {
    locale: 'ru',
    pathname: '/ru/category/social-media-text-generators'
  });
}

export default function SocialMediaTextGeneratorsCategory() {
  return (
    <CategoryPage
      categorySlug="social-media-text-generators"
      tools={socialMediaTextGenerators}
      breadcrumbs={[
        { label: 'Главная', href: '/ru' },
        { label: 'Все Инструменты', href: '/ru/tools' },
        { label: 'Генераторы Текста для Социальных Сетей' }
      ]}
    />
  );
}