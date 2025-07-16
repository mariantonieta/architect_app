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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { projectService, type ProjectFormData } from "@/services/projectService"
import { FileDropzone } from "./file-dropzone"

interface CreateProjectProps {
  children: React.ReactNode
  onCreated?: () => void
}

export function CreateProject({ children, onCreated }: CreateProjectProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<1 | 2>(1)

  const [blueprints, setBlueprints] = React.useState<File[]>([])
  const [renders, setRenders] = React.useState<File[]>([])
  const [reports, setReports] = React.useState<File[]>([])

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: "",
      clientEmail: "",
      project_type: "other",
      currency: "ars",
      budget: undefined,
      location: "",
      status: "idea",
      additionalUsersEmails: [],
      filesBlueprints: [],
      filesRenders: [],
      filesReports: [],
      description: "",
    },
  })

const mutation = useMutation({
  mutationFn: async (data: ProjectFormData) => {
    const formData = new FormData()
    formData.append("name", data.name)
    if (data.clientEmail) formData.append("client_email", data.clientEmail)
    formData.append("project_type", data.project_type)
    if (data.currency) formData.append("currency", data.currency)
    if (data.budget != null) formData.append("budget", data.budget.toString())
    if (data.location) formData.append("location", data.location)
    formData.append("status", data.status || "idea")
    if (data.description) formData.append("description", data.description)
    if (data.additionalUsersEmails?.length) {
      formData.append("additional_users_emails", data.additionalUsersEmails.join(","))
    }

    blueprints?.forEach((file) => {
       console.log("Adding file:", file.name) 
      formData.append("filesBlueprints", file)
    })

    renders?.forEach((file) => {
             console.log("Adding file:", file.name) 
      formData.append("filesRenders", file)
    })

    reports?.forEach((file) => {
             console.log("Adding file:", file.name) 
      formData.append("filesReports", file)
    })

    for (const pair of formData.entries()) {
      console.log(pair[0] + ": ", pair[1])
    }

    return projectService.createProject(formData)
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] })
    reset()
    setStep(1)
    setOpen(false)
    onCreated?.()
    navigate("/")
  },
  onError: (error: any) => {
    console.error("Error creating project:", error)
  },
})

  //const isLoading = mutation.
  const isError = mutation.status === "error"
  const error = mutation.error as Error | null

  function onNextStep(data: ProjectFormData) {
    setStep(2)
  }

  function onSubmit(data: ProjectFormData) {
    mutation.mutate(data)
  }

  const additionalUsersString = watch("additionalUsersEmails").join(", ")

  const handleSaveWithoutFiles = async () => {
    setValue("filesBlueprints", [])
    setValue("filesRenders", [])
    setValue("filesReports", [])
    await new Promise((resolve) => setTimeout(resolve, 0))
    handleSubmit(onSubmit)()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val)
        if (!val) setStep(1)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>Create a New Project</DialogTitle>
              <DialogDescription>Complete the basic information of the project.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onNextStep)} className="space-y-6">
              <FormField label="Project Name" id="name" error={errors.name?.message} required>
                <Controller
                  control={control}
                  name="name"
                  rules={{ required: "Project name is required" }}
                  render={({ field }) => <Input {...field} id="name" autoFocus />}
                />
              </FormField>

              <FormField label="Client Email" id="clientEmail" error={errors.clientEmail?.message}>
                <Controller
                  control={control}
                  name="clientEmail"
                  rules={{
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  }}
                  render={({ field }) => <Input {...field} id="clientEmail" type="email" />}
                />
              </FormField>

              <FormField label="Project Type" id="project_type" error={errors.project_type?.message} required>
                <Controller
                  control={control}
                  name="project_type"
                  rules={{ required: "Project type is required" }}
                  render={({ field }) => (
                    <select {...field} id="project_type" className="w-full border rounded px-2 py-1">
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

              <div className="flex space-x-4">
                <FormField label="Budget" id="budget" className="flex-1">
                  <Controller
                    control={control}
                    name="budget"
                    render={({ field }) => (
                      <Input
                        {...field}
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
                  render={({ field }) => <Input {...field} id="location" />}
                />
              </FormField>

              <DialogFooter className="flex space-x-3">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={mutation.isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormField label="Blueprint Files" id="filesBlueprints">
                <FileDropzone
                  files={blueprints}
                  onFilesAdded={(newFiles) => {
                    setBlueprints(newFiles)
                    setValue("filesBlueprints", newFiles)
                  }}
                />
              </FormField>

              <FormField label="Render Files" id="filesRenders">
                <FileDropzone
                  files={renders}
                  onFilesAdded={(newFiles) => {
                    setRenders(newFiles)
                    setValue("filesRenders", newFiles)
                  }}
                />
              </FormField>
              <FormField label="Report Files" id="filesReports">
                <FileDropzone
                  files={reports}
                  onFilesAdded={(newFiles) => {
                    setReports(newFiles)
                    setValue("filesReports", newFiles)
                  }}
                />
              </FormField>

              <FormField label="Assign Users (emails separated by commas)" id="additionalUsersEmails">
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
                />
              </FormField>

              <FormField label="Initial Project Status" id="status" required>
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

              <FormField label="Additional Description" id="description">
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => <Input {...field} id="description" />}
                />
              </FormField>

              <DialogFooter className="flex space-x-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={mutation.isPending}>
                  Back
                </Button>
                <Button type="button" variant="outline" onClick={handleSaveWithoutFiles} disabled={mutation.isPending}>
                  Save Without Files
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
              {isError && (
                <p className="text-red-600 text-sm mt-2">Error: {error?.message || "Failed to create project"}</p>
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