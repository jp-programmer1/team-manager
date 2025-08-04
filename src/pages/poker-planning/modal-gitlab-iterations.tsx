import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useAuth } from "@/context/auth-context";
import type { GitlabIssues, GitlabIteration } from "@/types/gitlab.type";


interface ModalGitlabIterationsProps {
  isOpen: boolean;
  onClose: () => void;
  onFinished: (iteration: GitlabIteration, issues: GitlabIssues[]) => void;
}

export const ModalGitlabIterations: React.FC<ModalGitlabIterationsProps> = ({
  isOpen,
  onClose,
  onFinished,
}) => {
  const { user } = useAuth();
  const [groupId, setGroupId] = useState<string | null>(localStorage.getItem("groupId"));
  const [selectedIterationId, setSelectedIterationId] = useState<string | null>(
    null
  );
  const [iterations, setIterations] = useState<GitlabIteration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getIterations = useCallback(async () => {
    if (!groupId) {
      setError("Por favor ingresa el ID del grupo");
      return;
    }

    if (!user?.accessToken) {
      setError("No se encontró el token de autenticación");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getIterations(user.accessToken, groupId);
      setIterations(response);
    } catch (error) {
      console.error("Error al obtener iteraciones:", error);
      setError(
        "No se pudieron cargar las iteraciones. Verifica el ID del grupo y tus permisos."
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.accessToken, groupId]);

  const onAccept = useCallback(async () => {
    if (!selectedIterationId || !groupId) {
      return;
    }
    if (!user?.accessToken) {
      setError("No se encontró el token de autenticación");
      return;
    }
    const issues = await api.getIssues(user.accessToken, groupId, selectedIterationId);
    const selectedIteration = iterations.find(
      (iteration) => iteration.id === selectedIterationId
    );

    if (!selectedIteration) {
      setError("No se encontró la iteración seleccionada");
      return;
    }
    localStorage.setItem("groupId", groupId);
    onFinished(selectedIteration, issues);
    onClose();
  }, [selectedIterationId, user?.accessToken, groupId, iterations, onClose, onFinished]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gitlab Iterations</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div>
            <label
              htmlFor="groupId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ID del Grupo de GitLab
            </label>
            <Input
              id="groupId"
              placeholder="Ej: 12345678"
              value={groupId || ""}
              onChange={(e) => setGroupId(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant={"secondary"}
              size={"sm"}
              onClick={getIterations}
              disabled={isLoading || !groupId}
            >
              {isLoading ? "Cargando..." : "Cargar iteraciones"}
            </Button>
          </div>

          {iterations.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Iteraciones disponibles:
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {iterations.map((iteration) => (
                  <div
                    key={iteration.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedIterationId === iteration.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedIterationId(iteration.id);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {iteration.title || `Iteración #${iteration.iid}`}
                        </h4>
                        {iteration.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {iteration.description}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        #{iteration.iid}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">
                        <span className="font-medium">Inicio:</span>{" "}
                        {new Date(iteration.start_date).toLocaleDateString()}
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Fin:</span>{" "}
                        {new Date(iteration.due_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Creada el{" "}
                      {new Date(iteration.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          {iterations.length > 0 && (
            <div className="flex justify-end space-x-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={onAccept}
                disabled={isLoading || !selectedIterationId}
              >
                {isLoading ? "Cargando..." : "Aceptar"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
