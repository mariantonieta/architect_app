import { type ExistingFile } from "@/components/file-dropzone";
import { type ProjectFormData } from "@/services/projectService";

export interface ProjectFormInput extends Omit<
    ProjectFormData,
    "filesBimModels" | "filesRenders" | "filesReports"
> {
    id?: string;
    existingBlueprints?: ExistingFile[];
    existingRenders?: ExistingFile[];
    existingReports?: ExistingFile[];
}

export interface CreateProjectProps {
    onCreated?: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface FileState {
    existingBim: ExistingFile[];
    newBim: File[];
    existingRenders: ExistingFile[];
    newRenders: File[];
    existingReports: ExistingFile[];
    newReports: File[];
}

export interface FileHandlers {
    setBimFiles: (files: (File | ExistingFile)[]) => void;
    setRenders: (files: (File | ExistingFile)[]) => void;
    setReports: (files: (File | ExistingFile)[]) => void;
}

export interface EmailHandlers {
    handleArchitectAdd: (email: string) => Promise<boolean>;
    searchArchitect: (query: string) => Promise<string[]>;
    handleCustomerAdd: (email: string) => Promise<boolean>;
    searchCustomer: (query: string) => Promise<string[]>;
    handleSupplierAdd: (email: string) => Promise<boolean>;
    searchSupplier: (query: string) => Promise<string[]>;
}