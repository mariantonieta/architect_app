import type { Control, FieldErrors } from "react-hook-form";
import type { ProjectFormData } from "@/services/projectService";
import { FormField } from "./form-field";
import { Controller } from "react-hook-form";
import { EmailSelector } from "./email-selector";
import type { EmailHandlers } from "@/types/project";
import type { TFunction } from "i18next";

interface ProjectEmailFieldsProps {
  control: Control<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  t: TFunction;
  emailHandlers: EmailHandlers;
}

export function ProjectEmailFields({
  control,
  errors,
  t,
  emailHandlers,
}: ProjectEmailFieldsProps) {
  return (
    <>
      <FormField
        label={t("projects.architectEmail")}
        id="architectEmail"
        error={errors.architectEmail?.message}
      >
        <Controller
          control={control}
          name="architectEmail"
          rules={{
            validate: (emails: string[]) => {
              if (!Array.isArray(emails) || emails.length === 0) return true;
              const invalids = emails.filter(
                (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
              );
              return (
                invalids.length === 0 ||
                `Invalid emails: ${invalids.join(", ")}`
              );
            },
          }}
          render={({ field }) => (
            <EmailSelector
              value={field.value || []}
              onChange={field.onChange}
              placeholder={t("projects.enterEmail")}
              role="architect"
              onSearch={emailHandlers.searchArchitect}
              onEmailAdd={emailHandlers.handleArchitectAdd}
              showInput={!!(field.value && field.value.length > 0)}
            />
          )}
        />
      </FormField>

      <FormField
        label={t("projects.customerEmail")}
        id="customerEmail"
        error={errors.customerEmail?.message}
      >
        <Controller
          control={control}
          name="customerEmail"
          rules={{
            validate: (emails: string[]) => {
              if (!Array.isArray(emails) || emails.length === 0) return true;
              const invalids = emails.filter(
                (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
              );
              return (
                invalids.length === 0 ||
                `Invalid emails: ${invalids.join(", ")}`
              );
            },
          }}
          render={({ field }) => (
            <EmailSelector
              value={field.value || []}
              onChange={field.onChange}
              placeholder={t("projects.enterEmail")}
              role="customer"
              onSearch={emailHandlers.searchCustomer}
              onEmailAdd={emailHandlers.handleCustomerAdd}
              showInput={!!(field.value && field.value.length > 0)}
            />
          )}
        />
      </FormField>

      <FormField
        label={t("projects.supplierEmail")}
        id="supplierEmail"
        error={errors.customerEmail?.message}
      >
        <Controller
          control={control}
          name="supplierEmail"
          rules={{
            validate: (emails: string[]) => {
              if (!Array.isArray(emails) || emails.length === 0) return true;
              const invalids = emails.filter(
                (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
              );
              return (
                invalids.length === 0 ||
                `Invalid emails: ${invalids.join(", ")}`
              );
            },
          }}
          render={({ field }) => (
            <EmailSelector
              value={field.value || []}
              onChange={field.onChange}
              placeholder={t("projects.enterEmail")}
              role="supplier"
              onSearch={emailHandlers.searchSupplier}
              onEmailAdd={emailHandlers.handleSupplierAdd}
              showInput={!!(field.value && field.value.length > 0)}
            />
          )}
        />
      </FormField>
    </>
  );
}
