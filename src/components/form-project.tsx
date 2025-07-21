import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useForm, Controller } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { FileDropzone, type ExistingFile } from "./file-dropzone"
import { useProject } from "@/hooks/useProject"
import type { ProjectFormData } from "@/services/projectService"
import { useQueryClient } from "@tanstack/react-query"



type ProjectFormInput = Omit<
  ProjectFormData,
  'filesBimModels' | 'filesRenders' | 'filesReports'
> & {
  id?: string
  existingBlueprints?: ExistingFile[]
  existingRenders?: ExistingFile[]
  existingReports?: ExistingFile[]
}

interface CreateProjectProps {
  children?: React.ReactNode
  onCreated?: () => void
  initialData?: ProjectFormInput
  open: boolean
  onOpenChange: (open: boolean) => void
}
export function CreateProject({
  children,
  onCreated,
  initialData,
  open,
  onOpenChange,
}: CreateProjectProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = React.useState<1 | 2>(1)

  const [existingBim, setExistingBim] = React.useState<ExistingFile[]>(initialData?.existingBlueprints || [])
  const [newBim, setNewBim] = React.useState<File[]>([])
  const [existingRenders, setExistingRenders] = React.useState<ExistingFile[]>(initialData?.existingRenders || [])
  const [newRenders, setNewRenders] = React.useState<File[]>([])
  const [existingReports, setExistingReports] = React.useState<ExistingFile[]>(initialData?.existingReports || [])
  const [newReports, setNewReports] = React.useState<File[]>([])

  const bimFiles = [...existingBim, ...newBim]
  const renders = [...existingRenders, ...newRenders]
  const reports = [...existingReports, ...newReports]

  const setBimFiles = (files: (File | ExistingFile)[]) => {
    setExistingBim(files.filter((f): f is ExistingFile => "id" in f))
    setNewBim(files.filter((f): f is File => f instanceof File))
  }

  const setRenders = (files: (File | ExistingFile)[]) => {
    setExistingRenders(files.filter((f): f is ExistingFile => "id" in f))
    setNewRenders(files.filter((f): f is File => f instanceof File))
  }

  const setReports = (files: (File | ExistingFile)[]) => {
    setExistingReports(files.filter((f): f is ExistingFile => "id" in f))
    setNewReports(files.filter((f): f is File => f instanceof File))
  }

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: initialData?.name || "",
      customerEmail: initialData?.customerEmail || "",
      project_type: initialData?.project_type || "",
      currency: initialData?.currency || "ars",
      budget: initialData?.budget,
      location: initialData?.location || "",
      status: initialData?.status || "idea",
      additionalUsersEmails: initialData?.additionalUsersEmails || [],
      description: initialData?.description || "",
    },
  })

  const {
    createProject,
    updateProject,
    isCreating,
    isUpdating,
    isError,
    error,
  } = useProject(initialData?.id)

  const additionalUsersString = (watch("additionalUsersEmails") || []).join(", ")
const onNextStep = () => setStep(2)

  const handleSubmitProject = async (data: ProjectFormData) => {
    const formData = new FormData()
    formData.append("name", data.name)
    if (data.customerEmail) formData.append("customer_email", data.customerEmail)
    formData.append("project_type", data.project_type)
    if (data.currency) formData.append("currency", data.currency)
    if (data.budget != null) formData.append("budget", data.budget.toString())
    if (data.location) formData.append("location", data.location)
    formData.append("status", data.status || "idea")
    if (data.description) formData.append("description", data.description)
    if (data.additionalUsersEmails?.length) {
      formData.append("additional_users_emails", data.additionalUsersEmails.join(","))
    }

    if (initialData?.id) {
      formData.append("keep_bim_ids", existingBim.map(f => f.id).join(","))
      formData.append("keep_render_ids", existingRenders.map(f => f.id).join(","))
      formData.append("keep_report_ids", existingReports.map(f => f.id).join(","))
    }

    newBim.forEach(file => formData.append("filesBimModels", file))
    newRenders.forEach(file => formData.append("filesRenders", file))
    newReports.forEach(file => formData.append("filesReports", file))

    try {
      if (initialData?.id) {
        await updateProject({ projectId: initialData.id, data: formData })
      } else {
        await createProject(formData)
      }
    queryClient.invalidateQueries({ queryKey: ["projects"] })

      reset()
      setStep(1)
      onOpenChange(false)
      onCreated?.()
      navigate("/")
    } catch (err) {
      console.error("Error saving project", err)
    }
  }



  React.useEffect(() => {
    if (initialData) {
      reset(initialData)
      setExistingBim(initialData.existingBlueprints || [])
      setExistingRenders(initialData.existingRenders || [])
      setExistingReports(initialData.existingReports || [])
      setNewBim([])
      setNewRenders([])
      setNewReports([])
      setStep(1)
    }
  }, [initialData, reset])

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        console.log("Initial data on open:", initialData)
        onOpenChange(val)
        if (!val) setStep(1)
        if (val && initialData) {
          reset(initialData)
          setBimFiles(initialData.existingBlueprints || [])
          setRenders(initialData.existingRenders || [])
          setReports(initialData.existingReports || [])
        }
      }}
    >      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>{initialData ? "Edit Project" : "Create a New Project"}</DialogTitle>
              <DialogDescription>Complete the basic project information.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onNextStep)} className="space-y-6">
              <FormField label="Name" id="name" error={errors.name?.message} required>
                <Controller
                  control={control}
                  name="name"
                  rules={{ required: "Project name is required" }}
                  render={({ field }) => (
                    <Input {...field} id="name" autoFocus placeholder="Example: The Oaks Family House" />
                  )}
                />
              </FormField>

              <FormField label="Type" id="project_type" error={errors.project_type?.message} required>
                <Controller
                  control={control}
                  name="project_type"
                  rules={{ required: "Project type is required" }}
                  render={({ field }) => (
                    <select {...field} id="project_type" className="w-full border rounded px-2 py-1">
                      <option value="" disabled>Select project type</option>
                      <option value="single_family_home">Single Family Home</option>
                      <option value="residential_building">Residential Building</option>
                      <option value="commercial_building">Commercial Building</option>
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
                    <select {...field} id="status" className="w-full border rounded px-2 py-1">
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
                          field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))
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
                      <select {...field} id="currency" className="w-full border rounded px-2 py-1">
                        <option value="ars">ARS</option>
                        <option value="usd">USD</option>
                        <option value="eur">EUR</option>
                      </select>
                    )}
                  />
                </FormField>
              </div>

              <FormField label="Location" id="location" error={errors.location?.message} required>
                <Controller
                  control={control}
                  name="location"
                  rules={{ required: "Location is required" }}
                  render={({ field }) => (
                    <Input {...field} id="location" placeholder="Address or location" />
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

              <DialogFooter className="flex space-x-3">
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isCreating || isUpdating} >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  Continue
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add More Information</DialogTitle>
              <DialogDescription>You can upload files and assign additional users.</DialogDescription>
            </DialogHeader>

           <form onSubmit={handleSubmit(handleSubmitProject)} className="space-y-6">
      <FormField label="BIM Models (IFC, RVT)" id="filesBimModels" error={errors.filesBimModels?.message}>
        <FileDropzone
          files={[...existingBim, ...newBim]}
          accept={[".ifc", ".rvt"]}
          onFilesAdded={(newFiles) => {
            setNewBim([...newBim, ...newFiles])
            clearErrors("filesBimModels")
          }}
          onFileRemove={(fileToRemove) => {
            if ("id" in fileToRemove) {
              setExistingBim((prev) => prev.filter((f) => f.id !== fileToRemove.id))
            } else {
              setNewBim((prev) => prev.filter((f) => f !== fileToRemove))
            }
          }}
        />
      </FormField>

      <FormField label="Plans (PDF, JPG)" id="filesRenders" error={errors.filesRenders?.message}>
        <FileDropzone
          files={[...existingRenders, ...newRenders]}
          accept={[".jpg", ".jpeg", ".png", ".pdf"]}
          onFilesAdded={(newFiles) => {
            setNewRenders([...newRenders, ...newFiles])
            clearErrors("filesRenders")
          }}
          onFileRemove={(fileToRemove) => {
            if ("id" in fileToRemove) {
              setExistingRenders((prev) => prev.filter((f) => f.id !== fileToRemove.id))
            } else {
              setNewRenders((prev) => prev.filter((f) => f !== fileToRemove))
            }
          }}
          onInvalidFiles={(invalid) => {
            setError("filesRenders", {
              type: "manual",
              message: `Invalid render file(s): ${invalid.map((f) => f.name).join(", ")}. Allowed: JPG, PNG, PDF`,
            })
          }}
        />
      </FormField>

      <FormField label="Render Files (JPG, PNG, PDF)" id="filesReports" error={errors.filesReports?.message}>
        <FileDropzone
          files={[...existingReports, ...newReports]}
          accept={[".pdf", ".jpg", ".jpeg"]}
          onFilesAdded={(newFiles) => {
            setNewReports([...newReports, ...newFiles])
            clearErrors("filesReports")
          }}
          onFileRemove={(fileToRemove) => {
            if ("id" in fileToRemove) {
              setExistingReports((prev) => prev.filter((f) => f.id !== fileToRemove.id))
            } else {
              setNewReports((prev) => prev.filter((f) => f !== fileToRemove))
            }
          }}
          onInvalidFiles={(invalid) => {
            setError("filesReports", {
              type: "manual",
              message: `Invalid report file(s): ${invalid.map((f) => f.name).join(", ")}. Allowed: PDF, JPG`,
            })
          }}
        />
      </FormField>


           
              <FormField label="Architect's Users" id="additionalUsersEmails">
                <Input
                  id="additionalUsersEmails"
                  value={additionalUsersString}
                  onChange={(e) =>
                    setValue(
                      "additionalUsersEmails",
                      e.target.value
                        .split(",")
                        .map((email) => email.trim())
                        .filter((email) => email)
                    )
                  }
                  placeholder="Architect's Users"
                />
              </FormField>
              <FormField label="Customer Email" id="customerEmail" error={errors.customerEmail?.message}>
                <Controller
                  control={control}
                  name="customerEmail"
                  rules={{
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  }}
                  render={({ field }) => (
                    <Input {...field} id="customerEmail" type="email" placeholder="Customer's email" />
                  )}
                />
              </FormField>
   <FormField label="Supplier Email" id="supplierEmail" error={errors.customerEmail?.message}>
                <Controller
                  control={control}
                  name="supplierEmail"
                  rules={{
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  }}
                  render={({ field }) => (
                    <Input {...field} id="supplierEmail" type="email" placeholder="Supplier's email" />
                  )}
                />
              </FormField>
            

              

              
              <DialogFooter className="flex space-x-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={isCreating || isUpdating}>
                  Back
                </Button>
              
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) ? "Saving..." : initialData ? "Save Changes" : "Create Project"}
                </Button>
              </DialogFooter>

              {isError && (
                <p className="text-red-600 text-sm mt-2">
                  Error: {error?.message || "Failed to save project"}
                </p>
              )}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function FormField({
  label,
  id,
  error,
  children,
  required,
  className = "",
}: {
  label: string
  id: string
  error?: string
  children: React.ReactNode
  required?: boolean
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
