import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/LanguageSelector';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function ExampleI18nPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('common.welcome')}</h1>
        <LanguageSelector />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Navigation Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('navigation.dashboard')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                {t('navigation.projects')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                {t('navigation.budget')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                {t('navigation.users')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('projects.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full">
                {t('projects.createProject')}
              </Button>
              <div className="text-sm text-muted-foreground">
                {t('projects.noProjects')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('budget.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full">
                {t('budget.createBudget')}
              </Button>
              <div className="text-sm text-muted-foreground">
                {t('budget.noBudgets')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <Button>{t('common.save')}</Button>
        <Button variant="outline">{t('common.cancel')}</Button>
        <Button variant="destructive">{t('common.delete')}</Button>
      </div>
    </div>
  );
}
