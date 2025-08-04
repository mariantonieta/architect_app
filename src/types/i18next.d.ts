// This file contains TypeScript declarations for i18next to provide
// better type safety and autocompletion for translation keys

import 'react-i18next';
import type enTranslation from '../locales/en.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof enTranslation;
    };
  }
}
