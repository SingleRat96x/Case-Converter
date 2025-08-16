import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  let validLocale = locale;
  if (!validLocale || !routing.locales.includes(validLocale as any)) {
    validLocale = routing.defaultLocale;
  }

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}/common.json`)).default
  };
});