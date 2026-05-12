import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/hooks/useProject";
import type { ProjectFormData } from "@/services/projectService";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useCreateProjectModal } from "@/hooks/useCreateOrEditProjectModal";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { CreateProjectProps } from "@/types/project";
import { useFileManagement } from "@/hooks/useFileManagement";
import { useEmail } from "@/hooks/useEmail";
import {
  getDefaultValues,
  createFormData,
  normalizeEmails,
} from "@/hooks/formHelpers";
import { ProjectBasicInfo } from "./project-basic-info";
import { ProjectFileUploads } from "./project-file-upload";
import { ProjectEmailFields } from "./project-email-field";

export function CreateOrEditProjectForm({
  onCreated,
  open,
  onOpenChange,
}: CreateProjectProps) {
  const { initialData, isCreateOrEdit } = useCreateProjectModal();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Hooks personalizados
  const { fileState, fileHandlers } = useFileManagement(initialData);
  const { emailHandlers } = useEmail();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: getDefaultValues(initialData),
  });

  const { createProject, updateProject, isCreating, isUpdating } = useProject(
    initialData?.id
  );

  const handleSubmitProject = async (data: ProjectFormData) => {
    const formData = createFormData(data, fileState, initialData?.id);

    try {
      if (initialData?.id) {
        await updateProject({ projectId: initialData.id, data: formData });
      } else {
        await createProject(formData);
      }

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(t("projects.projectSave"));

      // Resetear formulario
      reset();
      onOpenChange(false);
      onCreated?.();
      navigate("/projects");
    } catch (err) {
      // Manejo de errores
    }
  };

  // En CreateOrEditProjectForm.tsx
  useEffect(() => {
    if (initialData) {
      reset(getDefaultValues(initialData));
      fileHandlers.setBimFiles(initialData.existingBlueprints || []);
      fileHandlers.setRenders(initialData.existingRenders || []);
      fileHandlers.setReports(initialData.existingReports || []);
    }
  }, [initialData, reset]); // Removí fileHandlers de las dependencias

  useEffect(() => {
    if (open && !initialData) {
      reset();
      fileHandlers.setBimFiles([]);
      fileHandlers.setRenders([]);
      fileHandlers.setReports([]);
    }
  }, [open, initialData, reset]);
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timeout = setTimeout(() => {
        clearErrors();
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [errors, clearErrors]);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (val && initialData) {
          reset(getDefaultValues(initialData));
          fileHandlers.setBimFiles(initialData.existingBlueprints || []);
          fileHandlers.setRenders(initialData.existingRenders || []);
          fileHandlers.setReports(initialData.existingReports || []);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreateOrEdit === "edit"
              ? t("projects.editProject")
              : t("projects.createANew")}
          </DialogTitle>
          <DialogDescription>
            {t("projects.completedBasicInfo")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleSubmitProject)}
          className="space-y-6"
        >
          <ProjectBasicInfo control={control} errors={errors} t={t} />

          <ProjectFileUploads
            errors={errors}
            t={t}
            fileState={fileState}
            fileHandlers={fileHandlers}
            setError={setError}
            clearErrors={clearErrors}
          />

          <ProjectEmailFields
            control={control}
            errors={errors}
            t={t}
            emailHandlers={emailHandlers}
          />

          <DialogFooter className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isCreating || isUpdating}
            >
              {t("common.back")}
            </Button>

            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating
                ? t("common.saving")
                : initialData
                ? t("common.saveChanges")
                : t("projects.createProject")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
