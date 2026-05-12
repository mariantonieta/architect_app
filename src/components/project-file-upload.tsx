import type {
  FieldErrors,
  UseFormSetError,
  UseFormClearErrors,
} from "react-hook-form";
import type { ProjectFormData } from "@/services/projectService";
import { FormField } from "./form-field";
import { FileDropzone } from "./file-dropzone";
import type { FileState, FileHandlers } from "@/types/project";
import type { TFunction } from "i18next";

interface ProjectFileUploadsProps {
  errors: FieldErrors<ProjectFormData>;
  t: TFunction;
  fileState: FileState;
  fileHandlers: FileHandlers;
  setError: UseFormSetError<ProjectFormData>;
  clearErrors: UseFormClearErrors<ProjectFormData>;
}

export function ProjectFileUploads({
  errors,
  t,
  fileState,
  fileHandlers,
  setError,
  clearErrors,
}: ProjectFileUploadsProps) {
  return (
    <>
      <FormField
        label={t("projects.bimModels")}
        id="filesBimModels"
        error={errors.filesBimModels?.message}
      >
        <FileDropzone
          files={[...fileState.existingBim, ...fileState.newBim]}
          accept={[".ifc", ".rvt"]}
          onFilesAdded={(newFiles) => {
            fileHandlers.setBimFiles([
              ...fileState.existingBim,
              ...fileState.newBim,
              ...newFiles,
            ]);
            clearErrors("filesBimModels");
          }}
          onFileRemove={(fileToRemove) => {
            if ("id" in fileToRemove) {
              fileHandlers.setBimFiles(
                [...fileState.existingBim, ...fileState.newBim].filter(
                  (f) => !("id" in f) || f.id !== fileToRemove.id
                )
              );
            } else {
              fileHandlers.setBimFiles(
                [...fileState.existingBim, ...fileState.newBim].filter(
                  (f) => !(f instanceof File) || f !== fileToRemove
                )
              );
            }
          }}
          onInvalidFiles={(invalid) => {
            setError("filesBimModels", {
              type: "manual",
              message: `${t("projects.invalidBimModels")} ${invalid
                .map((f) => f.name)
                .join(", ")}. Allowed: IFC, RVT`,
            });
          }}
        />
      </FormField>

      <FormField
        label={t("projects.plans")}
        id="filesRenders"
        error={errors.filesRenders?.message}
      >
        <FileDropzone
          files={[...fileState.existingRenders, ...fileState.newRenders]}
          accept={[".jpg", ".jpeg", ".png", ".pdf"]}
          onFilesAdded={(newFiles) => {
            fileHandlers.setRenders([
              ...fileState.existingRenders,
              ...fileState.newRenders,
              ...newFiles,
            ]);
            clearErrors("filesRenders");
          }}
          onFileRemove={(fileToRemove) => {
            if ("id" in fileToRemove) {
              fileHandlers.setRenders(
                [...fileState.existingRenders, ...fileState.newRenders].filter(
                  (f) => !("id" in f) || f.id !== fileToRemove.id
                )
              );
            } else {
              fileHandlers.setRenders(
                [...fileState.existingRenders, ...fileState.newRenders].filter(
                  (f) => !(f instanceof File) || f !== fileToRemove
                )
              );
            }
          }}
          onInvalidFiles={(invalid) => {
            setError("filesRenders", {
              type: "manual",
              message: `Invalid render file(s): ${invalid
                .map((f) => f.name)
                .join(", ")}. Allowed: JPG, PNG, PDF`,
            });
          }}
        />
      </FormField>

      <FormField
        label={t("projects.renderFiles")}
        id="filesReports"
        error={errors.filesReports?.message}
      >
        <FileDropzone
          files={[...fileState.existingReports, ...fileState.newReports]}
          accept={[".pdf", ".jpg", ".jpeg"]}
          onFilesAdded={(newFiles) => {
            fileHandlers.setReports([
              ...fileState.existingReports,
              ...fileState.newReports,
              ...newFiles,
            ]);
            clearErrors("filesReports");
          }}
          onFileRemove={(fileToRemove) => {
            if ("id" in fileToRemove) {
              fileHandlers.setReports(
                [...fileState.existingReports, ...fileState.newReports].filter(
                  (f) => !("id" in f) || f.id !== fileToRemove.id
                )
              );
            } else {
              fileHandlers.setReports(
                [...fileState.existingReports, ...fileState.newReports].filter(
                  (f) => !(f instanceof File) || f !== fileToRemove
                )
              );
            }
          }}
          onInvalidFiles={(invalid) => {
            setError("filesReports", {
              type: "manual",
              message: `Invalid report file(s): ${invalid
                .map((f) => f.name)
                .join(", ")}. Allowed: PDF, JPG`,
            });
          }}
        />
      </FormField>
    </>
  );
}
