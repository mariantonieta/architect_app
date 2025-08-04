import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'button' | 'select';
  size?: 'sm' | 'default' | 'lg';
}

export function LanguageSelector({ variant = 'button', size = 'default' }: LanguageSelectorProps) {
  const { t } = useTranslation();
  const { changeLanguage, currentLanguage, availableLanguages } = useLanguage();

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  if (variant === 'select') {
    return (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <select
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-transparent border-none text-sm focus:outline-none"
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLang?.flag} {currentLang?.name}
          </span>
          <span className="sm:hidden">
            {currentLang?.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
            {currentLanguage === lang.code && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
