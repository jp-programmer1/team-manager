import { Button } from "@/components/ui/button";
import { Gitlab } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const LoginPage = () => {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Planning Poker</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Plataforma para votar en Planning Poker
        </p>

        <div>
          <Button onClick={login} size="lg" className="gap-2">
            <Gitlab className="h-5 w-5" />
            <span>Iniciar sesión con GitLab</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
