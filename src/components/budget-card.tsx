import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Budget {
  id: string;
  title: string;
  status: string;
  statusColor: string;
  professional: string;
  date: string;
  projectId?: string;
}

interface BudgetCardProps {
  budget: Budget;
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Badge className={budget.statusColor} variant="secondary">
                {budget.status}
              </Badge>
              <h3 className="text-lg font-semibold text-foreground">
                {budget.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("budget.professional")}: {budget.professional}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">
                {t("common.date")}: {budget.date}
              </p>
            </div>

            <Button
              variant="secondary"
              className="bg-gray-600 hover:bg-gray-700 text-white"
              onClick={() =>
                navigate(`/material-list/project/${budget.projectId}`)
              }
            >
              {t("detailsProject.viewMore")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
