import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PokerForm } from "./poker-planning/poker-form";

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [planningPokerMode, setPlanningPokerMode] = useState<string>("");

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Team Manager</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Bienvenido, {user.name}!</h2>
          <p className="text-muted-foreground">
            Has iniciado sesión correctamente con tu cuenta de GitLab.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-6 rounded-lg shadow mt-2">
            <h2 className="text-lg font-semibold mb-4">Planning Poker</h2>
            <Button variant="default" size="lg" className="mr-2" onClick={() => setPlanningPokerMode("create")}>
              Crear sala
            </Button>
            <Button variant="outline" size="lg" className="gap-2" onClick={() => setPlanningPokerMode("join")}>
              Unirse a sala
            </Button>
          </div>

          <div className="bg-slate-100 p-6 rounded-lg shadow mt-2">
            <h2 className="text-lg font-semibold mb-4">Diff</h2>
            <Button variant="default" size="lg" className="mr-2">
              Crear diff
            </Button>
            <Button variant="outline" size="lg" className="mr-2">
              Unirse diff
            </Button>
          </div>

        </div>
      </main>

      <PokerForm 
        isOpen={planningPokerMode !== ""}
        onClose={() => setPlanningPokerMode("")}
        mode={planningPokerMode}
      />
    </div>
  );
};
