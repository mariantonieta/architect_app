import { type ExistingFile } from "@/components/file-dropzone";
import { type ProjectFormData } from "@/services/projectService";
import { type FileState } from "@/types/project";

export const normalizeEmails = (emails: unknown): string[] => {
    if (Array.isArray(emails)) return emails.filter(Boolean);
    if (typeof emails === "string" && emails.trim()) return [emails.trim()];
    return [];
};

export const getDefaultValues = (initialData?: any): ProjectFormData => ({
    name: initialData?.name || "",
    customerEmail: normalizeEmails(initialData?.customerEmail),
    supplierEmail: normalizeEmails(initialData?.supplierEmail),
    architectEmail: normalizeEmails(initialData?.architectEmail),
    project_type: initialData?.project_type || "",
    currency: initialData?.currency || "ars",
    estimated_budget: initialData?.estimated_budget,
    location: initialData?.location || "",
    status: initialData?.status || "idea",
    description: initialData?.description || "",
});

export const createFormData = (
    data: ProjectFormData,
    fileState: FileState,
    projectId?: string
): FormData => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("project_type", data.project_type);
    if (data.currency) formData.append("currency", data.currency);
    if (data.estimated_budget != null)
        formData.append("estimated_budget", data.estimated_budget.toString());
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

    if (projectId) {
        formData.append("keep_bim_ids", fileState.existingBim.map((f) => f.id).join(","));
        formData.append(
            "keep_render_ids",
            fileState.existingRenders.map((f) => f.id).join(",")
        );
        formData.append(
            "keep_report_ids",
            fileState.existingReports.map((f) => f.id).join(",")
        );
    }

    fileState.newBim.forEach((file) => formData.append("filesBimModels", file));
    fileState.newRenders.forEach((file) => formData.append("filesRenders", file));
    fileState.newReports.forEach((file) => formData.append("filesReports", file));

    return formData;
};

export const resetFormWithInitialData = (
    initialData: any,
    reset: Function,
    fileHandlers: any,
    emailHandlers: any
) => {
    reset({
        name: initialData.name || "",
        customerEmail: normalizeEmails(initialData.customerEmail),
        supplierEmail: normalizeEmails(initialData.supplierEmail),
        architectEmail: normalizeEmails(initialData.architectEmail),
        project_type: initialData.project_type || "",
        currency: initialData.currency || "ars",
        estimated_budget: initialData.estimated_budget,
        location: initialData.location || "",
        status: initialData.status || "",
        description: initialData.description || "",
    });

    fileHandlers.setBimFiles(initialData.existingBlueprints || []);
    fileHandlers.setRenders(initialData.existingRenders || []);
    fileHandlers.setReports(initialData.existingReports || []);
};

export const resetForm = (reset: Function, fileHandlers: any, emailHandlers: any) => {
    reset();
    fileHandlers.setBimFiles([]);
    fileHandlers.setRenders([]);
    fileHandlers.setReports([]);
};