import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with Russian hrefs and descriptions
const randomGeneratorTools = [
  {
    id: 'random-number',
    title: 'Генератор Случайных Чисел',
    description: 'Генерируйте случайные целые числа, десятичные и числа в пользовательских диапазонах',
    icon: '🔢',
    href: '/ru/tools/random-number'
  },
  {
    id: 'random-letter',
    title: 'Генератор Случайных Букв', 
    description: 'Генерируйте случайные буквы, алфавиты и последовательности символов',
    icon: '🔤',
    href: '/ru/tools/random-letter'
  },
  {
    id: 'random-date',
    title: 'Генератор Случайных Дат',
    description: 'Генерируйте случайные даты в указанных диапазонах и форматах',
    icon: '📅',
    href: '/ru/tools/random-date'
  },
  {
    id: 'random-month',
    title: 'Генератор Случайных Месяцев',
    description: 'Генерируйте случайные месяцы с полными названиями, аббревиатурами и номерами',
    icon: '📆',
    href: '/ru/tools/random-month'
  },
  {
    id: 'random-ip',
    title: 'Генератор Случайных IP',
    description: 'Генерируйте случайные IPv4 и IPv6 адреса для тестирования сети',
    icon: '🌐',
    href: '/ru/tools/random-ip'
  },
  {
    id: 'random-choice',
    title: 'Выбор Случайного Варианта',
    description: 'Выбирайте случайные варианты из пользовательских списков для принятия решений',
    icon: '🎲',
    href: '/ru/tools/random-choice'
  },
  {
    id: 'password-generator',
    title: 'Генератор Безопасных Паролей',
    description: 'Генерируйте криптографически безопасные пароли с пользовательскими требованиями',
    icon: '🔐',
    href: '/ru/tools/password-generator'
  },
  {
    id: 'uuid-generator',
    title: 'Генератор UUID',
    description: 'Генерируйте уникальные идентификаторы v1 и v4 для приложений и баз данных',
    icon: '🔑',
    href: '/ru/tools/uuid-generator'
  }
];

// Generate metadata using the modular system for Russian locale
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('random-generators', {
    locale: 'ru',
    pathname: '/ru/category/random-generators'
  });
}

export default function RandomGeneratorsCategory() {
  return (
    <CategoryPage
      categorySlug="random-generators"
      tools={randomGeneratorTools}
      breadcrumbs={[
        { label: 'Главная', href: '/ru' },
        { label: 'Все Инструменты', href: '/ru/tools' },
        { label: 'Генераторы Случайных Данных' }
      ]}
    />
  );
}