import { useQuery, useQueryClient } from "@tanstack/react-query";

// Definir el tipo para el estado del modal
interface CreateProjectModalState {
  isOpen: boolean;
  initialData?: any; // Puedes tipear esto según tus necesidades
}

// Clave para el estado en el query cache
const CREATE_PROJECT_MODAL_KEY = ["createProjectModal"];

// Estado inicial
const initialState: CreateProjectModalState = { isOpen: false };

// Hook personalizado para manejar el estado global del modal
export function useCreateProjectModal() {
  const queryClient = useQueryClient();

  // Usar useQuery para hacer el estado reactivo
  const { data: modalState = initialState } = useQuery<CreateProjectModalState>({
    queryKey: CREATE_PROJECT_MODAL_KEY,
    queryFn: () => {
      // Obtener el estado actual del cache, o devolver el estado inicial
      const cachedState = queryClient.getQueryData<CreateProjectModalState>(CREATE_PROJECT_MODAL_KEY);
      return cachedState || initialState;
    },
    staleTime: Infinity, // Los datos nunca se consideran obsoletos
    gcTime: Infinity, // Los datos nunca se eliminan del cache
  });

  // Abrir el modal
  const openModal = (initialData?: any) => {
    const newState: CreateProjectModalState = {
      isOpen: true,
      initialData,
    };
    queryClient.setQueryData(CREATE_PROJECT_MODAL_KEY, newState);
  };

  // Cerrar el modal
  const closeModal = () => {
    const newState: CreateProjectModalState = {
      isOpen: false,
      initialData: undefined,
    };
    queryClient.setQueryData(CREATE_PROJECT_MODAL_KEY, newState);
  };

  // Toggle del modal
  const toggleModal = () => {
    if (modalState.isOpen) {
      closeModal();
    } else {
      openModal();
    }
  };

  return {
    isOpen: modalState.isOpen,
    initialData: modalState.initialData,
    openModal,
    closeModal,
    toggleModal,
  };
}
