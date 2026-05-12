import type { Control, FieldErrors } from "react-hook-form";
import { type ProjectFormData } from "@/services/projectService";
import { FormField } from "./form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import type { TFunction } from "i18next";

interface ProjectBasicInfoProps {
  control: Control<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  t: TFunction;
}

export function ProjectBasicInfo({
  control,
  errors,
  t,
}: ProjectBasicInfoProps) {
  return (
    <>
      <FormField
        label={t("projects.name")}
        id="name"
        error={errors.name?.message}
        required
      >
        <Controller
          control={control}
          name="name"
          rules={{ required: t("projects.nameRequired") }}
          render={({ field }) => (
            <Input
              {...field}
              id="name"
              autoFocus
              placeholder={t("projects.nameExample")}
            />
          )}
        />
      </FormField>

      <FormField
        label={t("projects.type")}
        id="project_type"
        error={errors.project_type?.message}
        required
      >
        <Controller
          control={control}
          name="project_type"
          rules={{ required: t("projects.typeRequired") }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="project_type" className="w-full">
                <SelectValue placeholder={t("projects.selectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_family_home">
                  {t("projects.singleFamily")}
                </SelectItem>
                <SelectItem value="residential_building">
                  {t("projects.residentialBuilding")}
                </SelectItem>
                <SelectItem value="commercial_building">
                  {t("projects.commercialBuilding")}
                </SelectItem>
                <SelectItem value="industrial">
                  {t("projects.industrial")}
                </SelectItem>
                <SelectItem value="renovation">
                  {t("projects.renovation")}
                </SelectItem>
                <SelectItem value="recreational">
                  {t("projects.recreational")}
                </SelectItem>
                <SelectItem value="other">{t("projects.other")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField label="Status" id="status" required className="w-full">
        <Controller
          control={control}
          name="status"
          rules={{ required: t("projects.statusRequired") }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status" className="w-full" size="default">
                <SelectValue placeholder={t("projects.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">{t("projects.idea")}</SelectItem>
                <SelectItem value="budgeting">
                  {t("projects.budgeting")}
                </SelectItem>
                <SelectItem value="in_progress">
                  {t("projects.inProgress")}
                </SelectItem>
                <SelectItem value="finished">
                  {t("projects.finished")}
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <div className="flex space-x-4">
        <FormField
          label={t("projects.budget")}
          id="estimated_budget"
          className="flex-1"
        >
          <Controller
            control={control}
            name="estimated_budget"
            render={({ field }) => (
              <Input
                {...field}
                placeholder="0"
                id="estimated_budget"
                type="text"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === ""
                      ? undefined
                      : parseFloat(e.target.value)
                  )
                }
              />
            )}
          />
        </FormField>

        <FormField
          label={t("projects.currency")}
          id="currency"
          className="w-32"
        >
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="currency" className="w-full" size="default">
                  <SelectValue placeholder={t("projects.selectCurrency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ars">ARS</SelectItem>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <FormField
        label={t("projects.location")}
        id="location"
        error={errors.location?.message}
        required
      >
        <Controller
          control={control}
          name="location"
          rules={{ required: t("projects.locationRequired") }}
          render={({ field }) => (
            <Input
              {...field}
              id="location"
              autoFocus
              placeholder={t("projectExample")}
            />
          )}
        />
      </FormField>

      <FormField label={t("projects.additionalDescription")} id="description">
        <Controller
          control={control}
          name="description"
          render={({ field }) => <Input {...field} id="description" />}
        />
      </FormField>
    </>
  );
}
