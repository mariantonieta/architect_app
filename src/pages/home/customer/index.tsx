import { useCurrentUser } from "@/hooks/useCurrentUser";

export function HomeCustomer() {
  const { user } = useCurrentUser();

  return (
    <div className="container mx-auto px-4 py-8">
    
          Dashboard del Cliente
     
    </div>
  );
}
