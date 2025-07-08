"use client"

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
import { projectService, type ProjectFormData } from "@/services/projectService"
import { useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"

type ProjectType =
  | "single_family_home"
  | "residential_building"
  | "commercial_building"
  | "industrial"
  | "renovation"
  | "recreational"
  | "other"

type Currency = "ars" | "usd" | "eur"

type ProjectStatus = "idea" | "budgeting" | "in_progress" | "finished"

interface CreateProjectProps {
  children: React.ReactNode
  onCreated?: () => void 
}

export function CreateProject({ children, onCreated }: CreateProjectProps) {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
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
    },
  })

  async function onSubmit(data: ProjectFormData) {
    setLoading(true)
    setError(null)
    try {
      await projectService.createProject(data)
      reset()
      setOpen(false)
      navigate("/")
      if (onCreated) onCreated()
    } catch (err: any) {
      setError(err.message || "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  function onCancel() {
    setOpen(false)
    navigate("/")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a New Project</DialogTitle>
          <DialogDescription>Complete the basic information of the project.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col gap-1">
            <Label htmlFor="name">Project Name</Label>
            <Controller
              control={control}
              name="name"
              rules={{ required: "Project name is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  aria-invalid={errors.name ? "true" : "false"}
                  autoFocus
                />
              )}
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="clientEmail">Client Email</Label>
            <Controller
              control={control}
              name="clientEmail"
              rules={{
                required: "Client email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="clientEmail"
                  type="email"
                  aria-invalid={errors.clientEmail ? "true" : "false"}
                />
              )}
            />
            {errors.clientEmail && (
              <p className="text-red-600 text-sm">{errors.clientEmail.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="project_type">Project Type</Label>
            <Controller
              control={control}
              name="project_type"
              rules={{ required: "Project type is required" }}
              render={({ field }) => (
                <select
                  {...field}
                  id="project_type"
                  className="w-full border rounded px-2 py-1"
                  aria-invalid={errors.project_type ? "true" : "false"}
                >
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
            {errors.project_type && (
              <p className="text-red-600 text-sm">{errors.project_type.message}</p>
            )}
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 flex flex-col gap-1">
              <Label htmlFor="budget">Budget</Label>
              <Controller
                control={control}
                name="budget"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="budget"
                    type="number"
                    min={0}
                    step={0.01}
                    aria-invalid={errors.budget ? "true" : "false"}
                  />
                )}
              />
              {errors.budget && <p className="text-red-600 text-sm">{errors.budget.message}</p>}
            </div>

            <div className="w-32 flex flex-col gap-1">
              <Label htmlFor="currency">Currency</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <select
                    {...field}
                    id="currency"
                    className="w-full border rounded px-2 py-1"
                    aria-invalid={errors.currency ? "true" : "false"}
                  >
                    <option value="ars">ARS</option>
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                  </select>
                )}
              />
              {errors.currency && (
                <p className="text-red-600 text-sm">{errors.currency.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="location">Location</Label>
            <Controller
              control={control}
              name="location"
              rules={{ required: "Location is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="location"
                  aria-invalid={errors.location ? "true" : "false"}
                />
              )}
            />
            {errors.location && <p className="text-red-600 text-sm">{errors.location.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="status">Status</Label>
            <Controller
              control={control}
              name="status"
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <select
                  {...field}
                  id="status"
                  className="w-full border rounded px-2 py-1"
                  aria-invalid={errors.status ? "true" : "false"}
                >
                  <option value="idea">Idea</option>
                  <option value="budgeting">Budgeting</option>
                  <option value="in_progress">In Progress</option>
                  <option value="finished">Finished</option>
                </select>
              )}
            />
            {errors.status && <p className="text-red-600 text-sm">{errors.status.message}</p>}
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <DialogFooter className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
