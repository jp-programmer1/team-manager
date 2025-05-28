import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { api, socket } from "../services/api";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Users, Eye, EyeOff, RotateCcw, Coffee, Clock, CheckCircle, Circle } from "lucide-react"
import type { User } from "@/types/user.type";

const fibonacciCards = ["0", "1", "2", "3", "5", "8", "13"]
const votesRevealed = false

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Array<User>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [selectedCard, setSelectedCard] = useState();

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }
    if (!username) onOpen();
    
    socket.emit("joinRoom", { roomId });
  }, [roomId, username, onOpen, navigate]);

  useEffect(() => {
    socket.on("userJoined", (userList) => {
      setUsers(userList.map((user: User) => ({...user, avatar: "/placeholder.svg?height=40&width=40" })));
    });

    return () => {
      socket.off("userJoined");
    };
  }, [roomId, navigate, username, onOpen]);

  const onFinished = useCallback(async (newUsername: string) => {
    if (roomId && newUsername){
      localStorage.setItem('username', newUsername);
      setUsername(newUsername);
      await api.joinRoom(roomId, newUsername);
      onClose();
    }
  }, [roomId, onClose]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sala de Planning Poker</h1>
              <p className="text-gray-600">Sprint 24 - Estimación de historias</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {users.length} participantes
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                15:30 min
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Historia actual */}
          <div className="lg:col-span-3">
            {/* Cartas de votación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-4 h-[20px]">
                  Selecciona tu estimación
                  {selectedCard && (
                    <Badge variant="secondary">
                      Seleccionada: {selectedCard === "120" ? "Pasar Turno" : selectedCard}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-3">
                  {fibonacciCards.map((card) => (
                    <Button
                      key={card}
                      variant={selectedCard === card ? "default" : "outline"}
                      // className={`aspect-[3/4] text-lg font-bold`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedCard(card);
                      }}
                    >
                      {card}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Coffee className="w-4 h-4" />
                    Necesito un break
                  </Button>
                  <Button variant={selectedCard === '120' ? 'default' : 'outline'} onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedCard("120");
                  }}>Pasar turno</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Participantes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.username} />
                        <AvatarFallback>
                          {participant.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{participant.username}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {participant.voted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Controles de la sesión */}
            <Card>
              <CardHeader>
                <CardTitle>Controles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full flex items-center gap-2" variant={votesRevealed ? "secondary" : "default"}>
                  {votesRevealed ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Ocultar votos
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Revelar votos
                    </>
                  )}
                </Button>

                <Button variant="outline" className="w-full flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Nueva ronda
                </Button>

                <Separator />

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Progreso de votación</p>
                  <div className="text-2xl font-bold text-blue-600">
                    {users.filter((p) => p.voted).length}/{users.length}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resultados (cuando se revelan) */}
            {votesRevealed && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Promedio:</span>
                      <Badge variant="default">6.5</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Consenso:</span>
                      <Badge variant="secondary">No</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Votos: 5, 8, 5, 8</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <DialogNewUser isOpen={isOpen} onClose={onClose} onFinished={onFinished} />
    </div>
  )
};

interface DialogNewUserProps {
  isOpen: boolean;
  onClose: () => void;
  onFinished: (username: string) => void;
}

export const DialogNewUser = ({ isOpen, onClose, onFinished }: DialogNewUserProps) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(
    localStorage.getItem("username") || ""
  );

  const onCloseModal = () => {
    navigate("/");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tu nombre 👀</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          onFinished(userName);
        }}>
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
