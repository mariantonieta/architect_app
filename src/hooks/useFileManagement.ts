// hooks/useFileManagement.ts
import { useState, useCallback } from "react";
import type { ExistingFile } from "@/components/file-dropzone";
import type { FileState, FileHandlers } from "@/types/project";

export const useFileManagement = (initialData?: any) => {
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

    const setBimFiles = useCallback((files: (File | ExistingFile)[]) => {
        setExistingBim(files.filter((f): f is ExistingFile => "id" in f));
        setNewBim(files.filter((f): f is File => f instanceof File));
    }, []);

    const setRenders = useCallback((files: (File | ExistingFile)[]) => {
        setExistingRenders(files.filter((f): f is ExistingFile => "id" in f));
        setNewRenders(files.filter((f): f is File => f instanceof File));
    }, []);

    const setReports = useCallback((files: (File | ExistingFile)[]) => {
        setExistingReports(files.filter((f): f is ExistingFile => "id" in f));
        setNewReports(files.filter((f): f is File => f instanceof File));
    }, []);

    const fileState: FileState = {
        existingBim,
        newBim,
        existingRenders,
        newRenders,
        existingReports,
        newReports,
    };

    const fileHandlers: FileHandlers = {
        setBimFiles,
        setRenders,
        setReports,
    };

    return { fileState, fileHandlers };
};