import React, { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
type DiffFormProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: string;
};
// https://storage.googleapis.com/front-config/importmaps/prod/importmap.json
export const DiffForm = ({ isOpen, onClose, mode }: DiffFormProps) => {
  const { user } = useAuth();

  const [roomName, setRoomName] = React.useState("");
  const [roomId, setRoomId] = React.useState("");

  const navigate = useNavigate();

  const onJoinRoom = useCallback(async () => {
    if (!user) {
      toast.error("No se pudo unirse a la sala :c");
      return;
    }
    const res = await api.joinRoom(roomId, user?.name, user?.id, true);
    if (!res.id) {
      toast.error("No se pudo unirse a la sala :c");
      return;
    }

    navigate(`/diff/${res.id}`, {
      state: {
        roomName,
        userId: user?.id,
        userName: user?.name,
      },
    });
  }, [roomId, user, roomName, navigate]);

  const onCreateRoom = useCallback(async () => {
    if (!user) {
      toast.error("No se pudo crear la sala :c");
      return;
    }

    const res = await api.createRoom(roomName, {
      name: user?.name,
      id: user?.id,
    }, true);
    if (!res.id) {
      toast.error("No se pudo crear la sala :c");
      return;
    }

    navigate(`/diff/${res.id}`, {
      state: {
        roomName,
        userId: user?.id,
        userName: user?.name,
      },
    });
  }, [roomName, user, navigate]);

  const onCloseForm = useCallback(() => {
    setRoomName("");
    setRoomId("");
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onCloseForm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Crear sala" : "Unirse a sala"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreateRoom();
          }}
        >
          {mode === "create" && (
            <div className="mt-2 mb-2">
              <label className="block mb-2">Nombre de la sala</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
            </div>
          )}
          {mode === "join" && (
            <div className="mt-2 mb-2">
              <label className="block mb-2">ID de la sala</label>
              <Input
                placeholder="Ingresa el ID de la sala"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                className="mt-2"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (mode === "create") {
                  onCreateRoom();
                } else {
                  onJoinRoom();
                }
              }}
            >
              {mode === "create" ? "Crear" : "Unirse"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
