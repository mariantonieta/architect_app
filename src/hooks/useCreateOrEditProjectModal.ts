import { useQuery, useQueryClient } from "@tanstack/react-query";

// Definir el tipo para el estado del modal
interface CreateProjectModalState {
  isOpen: boolean;
  initialData?: any; // Puedes tipear esto según tus necesidades
  isCreateOrEdit?: "create" | "edit"; // Indica si es para crear o editar
}

// Clave para el estado en el query cache
const CREATE_PROJECT_MODAL_KEY = ["createProjectModal"];

// Estado inicial
const initialState: CreateProjectModalState = { isOpen: false };

// Hook personalizado para manejar el estado global del modal
export function useCreateProjectModal() {
  const queryClient = useQueryClient();

  // Usar useQuery para hacer el estado reactivo
  const { data: modalState = initialState } = useQuery<CreateProjectModalState>(
    {
      queryKey: CREATE_PROJECT_MODAL_KEY,
      queryFn: () => {
        // Obtener el estado actual del cache, o devolver el estado inicial
        const cachedState = queryClient.getQueryData<CreateProjectModalState>(
          CREATE_PROJECT_MODAL_KEY
        );
        return cachedState || initialState;
      },
      staleTime: Infinity, // Los datos nunca se consideran obsoletos
      gcTime: Infinity, // Los datos nunca se eliminan del cache
    }
  );
  function normalizeProjectData(data: any) {
    console.log("🔥 Normalizing project data", data);

    const toArray = (value: any) => {
      if (Array.isArray(value)) return value.filter(Boolean);
      if (typeof value === "string" && value.trim()) return [value.trim()];
      return [];

    };

    return {
      ...data,
      customerEmail: toArray(data.customerEmail),
      supplierEmail: toArray(data.supplierEmail),
      architectEmail: toArray(data.architectEmail),
      existingBlueprints: data.existingBlueprints || [],
      existingRenders: data.existingRenders || [],
      existingReports: data.existingReports || [],
    };
  }

  // Toggle del modal con parámetros opcionales
  const toggleModal = (
    isOpen: boolean,
    initialData?: any,
    isCreateOrEdit: "create" | "edit" = "create"
  ) => {

    const newState: CreateProjectModalState = {
      isOpen,
      initialData: isCreateOrEdit !== 'create' ? normalizeProjectData(initialData) : undefined,

      isCreateOrEdit, // Guardar el tipo de operación (crear o editar)
    };

    queryClient.setQueryData(CREATE_PROJECT_MODAL_KEY, newState);
  };

  return {
    isOpen: modalState.isOpen,
    initialData: modalState.initialData,
    toggleModal,
    isCreateOrEdit: modalState.isCreateOrEdit,
  };
}
