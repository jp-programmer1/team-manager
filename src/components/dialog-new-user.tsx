import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


interface DialogNewUserProps {
  isOpen: boolean;
  onClose: () => void;
  onFinished: (username: string) => void;
}


export const DialogNewUser = ({
  isOpen,
  onClose,
  onFinished,
}: DialogNewUserProps) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(
    localStorage.getItem("username") || ""
  );

  const onCloseModal = () => {
    navigate("/");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCloseModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tu nombre 👀</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onFinished(userName);
          }}
        >
          <div className="mt-4 mb-2">
            <Input
              placeholder="Ingresa tu nombre"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button type="submit">Aceptar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
