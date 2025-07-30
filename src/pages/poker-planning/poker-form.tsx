import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
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
type PokerFormProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: string;
};

export const PokerForm = ({ isOpen, onClose, mode }: PokerFormProps) => {
  const { user } = useAuth();

  const [roomName, setRoomName] = React.useState("");
  const [roomId, setRoomId] = React.useState("");
  const navigate = useNavigate();

  const onJoinRoom = useCallback(() => {}, [roomId]);

  const onCreateRoom = useCallback(async () => {
    if (!user) {
      toast.error("No se pudo crear la sala :c");
      return;
    }

    const res = await api.createRoom(roomName, {
      name: user?.name,
      id: user?.id,
    });
    if (!res.id) {
      toast.error("No se pudo crear la sala :c");
      return;
    }

    navigate(`/room/${res.id}`, {
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
          <div className="mt-4 mb-2">
            <Input
              placeholder={
                mode === "create"
                  ? "Ingresa el nombre de la sala"
                  : "Ingresa el ID de la sala"
              }
              value={roomName}
              onChange={(e) => {
                if (mode === "create") {
                  setRoomName(e.target.value);
                } else {
                  setRoomId(e.target.value);
                }
              }}
              required
              className="mt-2"
            />
          </div>

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
