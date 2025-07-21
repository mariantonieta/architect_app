import * as React from "react"
import { useLocation, useParams } from "react-router-dom"
import { useProject } from "./useProject"
import type { Project } from "@/services/projectService"

type ExistingFile = { id: string; url: string; original_name: string }

interface ProjectModalContextType {
  open: boolean
  openModal: () => void
  closeModal: () => void
  initialData?: Omit<Project, 'files'> & {
    existingBlueprints?: ExistingFile[]
    existingRenders?: ExistingFile[]
    existingReports?: ExistingFile[]
  }
  isEditing: boolean
}

const ProjectModalContext = React.createContext<ProjectModalContextType | undefined>(undefined)

export function ProjectModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const isEditing = location.pathname.includes("/projects/") && !!id

  // Load project only when editing and modal open
  const { project } = useProject(isEditing && open && id ? id : undefined)

  // Build initialData with existing files segregated by type
  const initialData = React.useMemo(() => {
    if (!isEditing || !project) return undefined
    const existingBlueprints = project.files?.filter(f => f.file_type === 'bim_model')
    const existingRenders = project.files?.filter(f => f.file_type === 'renders')
    const existingReports = project.files?.filter(f => f.file_type === 'reports')
    return {
      ...project,
      existingBlueprints,
      existingRenders,
      existingReports,
    }
  }, [isEditing, project])

  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <ProjectModalContext.Provider value={{ open, openModal, closeModal, isEditing, initialData }}>
      {children}
    </ProjectModalContext.Provider>
  )
}

export function useProjectModal() {
  const context = React.useContext(ProjectModalContext)
  if (!context) throw new Error("useProjectModal must be used within a ProjectModalProvider")
  return context
}
