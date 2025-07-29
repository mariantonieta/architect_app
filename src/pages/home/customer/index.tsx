import { useProjects } from "@/hooks/useProject"; 
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function HomeCustomer() {
  const { user } = useCurrentUser();
  const { data: projects, isLoading, isError, error } = useProjects();
  console.log("Proyectos:", projects);
console.log(user)
  if (isLoading) return <div>Cargando proyectos...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  const customerProjects = projects?.filter(project =>
    project.customerEmail?.includes(user.email)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Dashboard del Cliente</h1>

      {!customerProjects || customerProjects.length === 0 ? (
        <p>No tenés proyectos asignados.</p>
      ) : (
        <ul>
          {customerProjects.map((project) => (
            <li key={project.id} className="border p-2 my-2 rounded">
              <h2>{project.name}</h2>
              <p>Tipo: {project.project_type}</p>
              <p>Estado: {project.status}</p>
          
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
