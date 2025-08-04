import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const locales = {
  en: enUS,
  es: es,
};

export const useFormatting = () => {
  const { i18n } = useTranslation();
  const currentLocale = locales[i18n.language as keyof typeof locales] || enUS;

  const formatDate = (date: Date | string, formatString: string = 'PPP') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatString, { locale: currentLocale });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return {
    formatDate,
    formatCurrency,
    formatNumber,
    formatPercentage,
    currentLocale,
  };
};
