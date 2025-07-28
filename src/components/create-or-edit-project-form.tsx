import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FileDropzone, type ExistingFile } from "./file-dropzone";
import { useProject } from "@/hooks/useProject";
import type { ProjectFormData } from "@/services/projectService";
import { useQueryClient } from "@tanstack/react-query";
import { EmailSelector } from "./email-selector";
import { useEffect, useState, type ReactNode } from "react";
import { useCreateProjectModal } from "@/hooks/useCreateOrEditProjectModal";
import { inviteService, type RoleType } from "@/services/inviteServices";
import { useInviteUser } from "@/hooks/useInvite";
import { FormField } from "./form-field";

type ProjectFormInput = Omit<
  ProjectFormData,
  "filesBimModels" | "filesRenders" | "filesReports"
> & {
  id?: string;
  existingBlueprints?: ExistingFile[];
  existingRenders?: ExistingFile[];
  existingReports?: ExistingFile[];
};

interface CreateProjectProps {
  onCreated?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function CreateOrEditProjectForm({
  onCreated,
  open,
  onOpenChange,
}: CreateProjectProps) {
  const { initialData, isCreateOrEdit } = useCreateProjectModal();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);

  const [existingBim, setExistingBim] = useState<ExistingFile[]>(
    initialData?.existingBlueprints || []
  );
  const [newBim, setNewBim] = useState<File[]>([]);
  const [existingRenders, setExistingRenders] = useState<ExistingFile[]>(
    initialData?.existingRenders || []
  );
  const [newRenders, setNewRenders] = useState<File[]>([]);
  const [existingReports, setExistingReports] = useState<ExistingFile[]>(
    initialData?.existingReports || []
  );
  const [newReports, setNewReports] = useState<File[]>([]);

  const setBimFiles = (files: (File | ExistingFile)[]) => {
    setExistingBim(files.filter((f): f is ExistingFile => "id" in f));
    setNewBim(files.filter((f): f is File => f instanceof File));
  };

  const setRenders = (files: (File | ExistingFile)[]) => {
    setExistingRenders(files.filter((f): f is ExistingFile => "id" in f));
    setNewRenders(files.filter((f): f is File => f instanceof File));
  };

  const setReports = (files: (File | ExistingFile)[]) => {
    setExistingReports(files.filter((f): f is ExistingFile => "id" in f));
    setNewReports(files.filter((f): f is File => f instanceof File));
  };

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: initialData?.name || "",
      customerEmail: initialData?.customerEmail || [],
      supplierEmail: initialData?.supplierEmail || [],
      architectEmail: initialData?.architectEmail || [],
      project_type: initialData?.project_type || "",
      currency: initialData?.currency || "ars",
      budget: initialData?.budget,
      location: initialData?.location || "",
      status: initialData?.status || "idea",
      description: initialData?.description || "",
    },
  });

  console.log("errors: ", errors);

  const { createProject, updateProject, isCreating, isUpdating } = useProject(
    initialData?.id
  );
  function useRoleInvitationHandlers(role: RoleType) {
  const inviteUser = useInviteUser(role);

  const handleEmailAdd = (() => {
  let processing = false;

  return async (email: string) => {
    if (processing) return false;
    processing = true;

    try {
      const res = await inviteService.searchInvitationByEmailAndRole(email, role);
      const alreadyExists = res.some(
        (existingEmail) => existingEmail.toLowerCase() === email.toLowerCase()
      );
      if (alreadyExists) {
        return true;
      }
      await inviteUser.mutateAsync({ email });
      return true;
    } catch (error) {
      console.error("Error agregando email:", error);
      return false;
    } finally {
      processing = false;
    }
  };
})();


  const handleSearch = async (query: string) => {
    try {
      const res = await inviteService.searchInvitationByEmailAndRole(query, role);
      return res;
    } catch (error) {
      console.error("Error buscando emails:", error);
      return [];
    }
  };

  return { handleEmailAdd, handleSearch };
}

  const { handleEmailAdd: handleArchitectAdd, handleSearch: searchArchitect } =
    useRoleInvitationHandlers("architect");
  const { handleEmailAdd: handleCustomerAdd, handleSearch: searchCustomer } =
    useRoleInvitationHandlers("customer");
  const { handleEmailAdd: handleSupplierAdd, handleSearch: searchSupplier } =
    useRoleInvitationHandlers("supplier");

  const handleSubmitProject = async (data: ProjectFormData) => {
    const formData = new FormData();
    console.log("Datos enviados0", data)
    formData.append("name", data.name);
    formData.append("project_type", data.project_type);
    if (data.currency) formData.append("currency", data.currency);
    if (data.budget != null) formData.append("budget", data.budget.toString());
    if (data.location) formData.append("location", data.location);
    formData.append("status", data.status || "idea");
    if (data.description) formData.append("description", data.description);
    (data.customerEmail || []).forEach((email) =>
      formData.append("customer_email", email)
    );
    (data.supplierEmail || []).forEach((email) =>
      formData.append("supplier_email", email)
    );
    (data.architectEmail || []).forEach((email) =>
      formData.append("architect_email", email)
    );

    if (initialData?.id) {
      formData.append("keep_bim_ids", existingBim.map((f) => f.id).join(","));
      formData.append(
        "keep_render_ids",
        existingRenders.map((f) => f.id).join(",")
      );
      formData.append(
        "keep_report_ids",
        existingReports.map((f) => f.id).join(",")
      );
    }

    newBim.forEach((file) => formData.append("filesBimModels", file));
    newRenders.forEach((file) => formData.append("filesRenders", file));
    newReports.forEach((file) => formData.append("filesReports", file));

    try {
      if (initialData?.id) {
        await updateProject({ projectId: initialData.id, data: formData });
      } else {
        await createProject(formData);
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      reset();
      setStep(1);
      onOpenChange(false);
      onCreated?.();
      navigate("/");
    } catch (err) {
      console.error("Error saving project", err);
    }
  };

useEffect(() => {
  if (initialData) {
    console.log("initialData", initialData);

    reset({
      name: initialData.name || "",
      customerEmail: Array.isArray(initialData.customerEmail)
        ? initialData.customerEmail
        : initialData.customerEmail
        ? [initialData.customerEmail]
        : [],
      supplierEmail: Array.isArray(initialData.supplierEmail)
        ? initialData.supplierEmail
        : initialData.supplierEmail
        ? [initialData.supplierEmail]
        : [],
      architectEmail: Array.isArray(initialData.architectEmail)
        ? initialData.architectEmail
        : initialData.architectEmail
        ? [initialData.architectEmail]
        : [],
      project_type: initialData.project_type || "",
      currency: initialData.currency || "ars",
      budget: initialData.budget,
      location: initialData.location || "",
      status: initialData.status || "idea",
      description: initialData.description || "",
    });

    setExistingBim(initialData.existingBlueprints || []);
    setExistingRenders(initialData.existingRenders || []);
    setExistingReports(initialData.existingReports || []);
    setNewBim([]);
    setNewRenders([]);
    setNewReports([]);
    setStep(1);
  }
}, [initialData, reset]);


  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        console.log("Initial data on open:", initialData);
        onOpenChange(val);
        if (!val) setStep(1);
        if (val && initialData) {
          reset(initialData);
          setBimFiles(initialData.existingBlueprints || []);
          setRenders(initialData.existingRenders || []);
          setReports(initialData.existingReports || []);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* {step === 1 ? (
          <> */}
        <DialogHeader>
          <DialogTitle>
            {isCreateOrEdit === "edit"
              ? "Edit Project"
              : "Create a New Project"}
          </DialogTitle>
          <DialogDescription>
            Complete the basic project information.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleSubmitProject)}
          className="space-y-6"
        >
          <FormField
            label="Name"
            id="name"
            error={errors.name?.message}
            required
          >
            <Controller
              control={control}
              name="name"
              rules={{ required: "Project name is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  autoFocus
                  placeholder="Example: The Oaks Family House"
                />
              )}
            />
          </FormField>

          <FormField
            label="Type"
            id="project_type"
            error={errors.project_type?.message}
            required
          >
            <Controller
              control={control}
              name="project_type"
              rules={{ required: "Project type is required" }}
              render={({ field }) => (
                <select
                  {...field}
                  id="project_type"
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="" disabled>
                    Select project type
                  </option>
                  <option value="single_family_home">Single Family Home</option>
                  <option value="residential_building">
                    Residential Building
                  </option>
                  <option value="commercial_building">
                    Commercial Building
                  </option>
                  <option value="industrial">Industrial</option>
                  <option value="renovation">Renovation</option>
                  <option value="recreational">Recreational</option>
                  <option value="other">Other</option>
                </select>
              )}
            />
          </FormField>

          <FormField label="Status" id="status" required>
            <Controller
              control={control}
              name="status"
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <select
                  {...field}
                  id="status"
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="idea">Idea</option>
                  <option value="budgeting">Budgeting</option>
                  <option value="in_progress">In Progress</option>
                  <option value="finished">Finished</option>
                </select>
              )}
            />
          </FormField>

          <div className="flex space-x-4">
            <FormField label="Budget" id="budget" className="flex-1">
              <Controller
                control={control}
                name="budget"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="0"
                    id="budget"
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

            <FormField label="Currency" id="currency" className="w-32">
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <select
                    {...field}
                    id="currency"
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="ars">ARS</option>
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                  </select>
                )}
              />
            </FormField>
          </div>

          <FormField
            label="Location"
            id="location"
            error={errors.location?.message}
            required
          >
            <Controller
              control={control}
              name="location"
              rules={{ required: "Location is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="location"
                  autoFocus
                  placeholder="Example: Argentina"
                />
              )}
            />
          </FormField>

          <FormField label="Additional Description" id="description">
            <Controller
              control={control}
              name="description"
              render={({ field }) => <Input {...field} id="description" />}
            />
          </FormField>
          {/* 
              <DialogFooter className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  Continue
                </Button>
              </DialogFooter> */}

          <FormField
            label="BIM Models (IFC, RVT)"
            id="filesBimModels"
            error={errors.filesBimModels?.message}
          >
            <FileDropzone
              files={[...existingBim, ...newBim]}
              accept={[".ifc", ".rvt"]}
              onFilesAdded={(newFiles) => {
                setNewBim([...newBim, ...newFiles]);
                clearErrors("filesBimModels");
              }}
              onFileRemove={(fileToRemove) => {
                if ("id" in fileToRemove) {
                  setExistingBim((prev) =>
                    prev.filter((f) => f.id !== fileToRemove.id)
                  );
                } else {
                  setNewBim((prev) => prev.filter((f) => f !== fileToRemove));
                }
              }}
            />
          </FormField>

          <FormField
            label="Plans (PDF, JPG)"
            id="filesRenders"
            error={errors.filesRenders?.message}
          >
            <FileDropzone
              files={[...existingRenders, ...newRenders]}
              accept={[".jpg", ".jpeg", ".png", ".pdf"]}
              onFilesAdded={(newFiles) => {
                setNewRenders([...newRenders, ...newFiles]);
                clearErrors("filesRenders");
              }}
              onFileRemove={(fileToRemove) => {
                if ("id" in fileToRemove) {
                  setExistingRenders((prev) =>
                    prev.filter((f) => f.id !== fileToRemove.id)
                  );
                } else {
                  setNewRenders((prev) =>
                    prev.filter((f) => f !== fileToRemove)
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
            label="Render Files (JPG, PNG, PDF)"
            id="filesReports"
            error={errors.filesReports?.message}
          >
            <FileDropzone
              files={[...existingReports, ...newReports]}
              accept={[".pdf", ".jpg", ".jpeg"]}
              onFilesAdded={(newFiles) => {
                setNewReports([...newReports, ...newFiles]);
                clearErrors("filesReports");
              }}
              onFileRemove={(fileToRemove) => {
                if ("id" in fileToRemove) {
                  setExistingReports((prev) =>
                    prev.filter((f) => f.id !== fileToRemove.id)
                  );
                } else {
                  setNewReports((prev) =>
                    prev.filter((f) => f !== fileToRemove)
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
          <FormField
            label="Architect Email"
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
                  placeholder="Enter email and press Enter"
                  role="architect"
                  onSearch={searchArchitect}
                  onEmailAdd={handleArchitectAdd}
                />
              )}
            />
          </FormField>

          <FormField
            label="Customer Email"
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
                  placeholder="Enter customer email and press Enter"
                  role="customer"
                  onSearch={searchCustomer}
                  onEmailAdd={handleCustomerAdd}
                />
              )}
            />
          </FormField>
          <FormField
            label="Supplier Email"
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
                  placeholder="Enter supplier email and press Enter"
                  role="supplier"
                  onSearch={searchSupplier}
                  onEmailAdd={handleSupplierAdd}
                />
              )}
            />
          </FormField>

          <DialogFooter className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                navigate(-1);
              }}
              disabled={isCreating || isUpdating}
            >
              Back
            </Button>

            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating
                ? "Saving..."
                : initialData
                ? "Save Changes"
                : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
