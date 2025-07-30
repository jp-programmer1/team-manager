import { useParams, useNavigate } from "react-router-dom";
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  type FormEvent,
} from "react";
import { api, socket } from "../../services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle,
  Circle,
} from "lucide-react";
import type { User } from "@/types/user.type";
import { useAuth } from "@/context/auth-context";
import { ModalGitlabIterations } from "./modal-gitlab-iterations";
import type { Gitlab, GitlabIssues, GitlabIteration } from "@/types/gitlab.type";

const fibonacciCards = ["1", "2", "3", "5", "8", "13"];

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string; roomName: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Array<User>>([]);
  const [iteration, setIteration] = useState<Gitlab | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>("");
  const [votes, setVotes] = useState<
    { data: string[]; sum: number } | undefined
  >();
  const [ownerId, setOwnerId] = useState();
  const [roomName, setRoomName] = useState();  
  const { user } = useAuth();
  const userId = user?.id;
  const username = user?.name;

  const onSelectedCard = useCallback(
    (value: string) => {
      setSelectedCard(value);
      socket.emit("vote", { roomId, userId, vote: value });
    },
    [userId, roomId]
  );

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    const getRoom = async () => {
      const response = await api.getRoom(roomId);
      console.log(response);
      
      if (response?.error) {
        navigate("/");
        return;
      }
      const findUser = response.users.find(
        (user: { id: number }) => user.id === userId
      );
      if (findUser && findUser.vote) {
        setSelectedCard(findUser.vote);
      }
      setRoomName(response.name);
      setOwnerId(response.ownerId);
    };
    getRoom();
    socket.emit("joinRoom", { roomId });
  }, [roomId, username, navigate, userId]);

  useEffect(() => {
    socket.on("userJoined", (userList) => {
      setUsers(
        userList.map((user: User) => ({
          ...user,
          avatar: "/placeholder.svg?height=40&width=40",
        }))
      );
    });

    socket.on("userVoted", (vote) => {
      console.log(vote);
      
      setUsers((current) => {
        return current.map((c) => {
          if (c.id === vote.userId) {
            c.voted = vote.hasVoted;
          }
          return c;
        });
      });
    });

    socket.on("votesRevealed", (res) => {
      const data = res.users
        .filter((r: { vote: string }) => r.vote !== "120")
        ?.map((r: { vote: unknown }) => r.vote);
      const sum = data.reduce(
        (acc: number, vote: string) => acc + Number(vote),
        0
      );
      setVotes({
        data,
        sum: Number.isNaN(sum / data.length)
          ? 0
          : Number((sum / data.length).toFixed(2)),
      });
    });

    socket.on("votesReset", () => {
      setSelectedCard(null);
      setVotes(undefined);
      setUsers((current) => {
        return current.map((c) => {
          c.voted = false;
          return c;
        });
      });
    });

    socket.on("updateInformGitlab", (res) => {
      console.log(res);
      

    })

    return () => {
      socket.off("userJoined");
      socket.off("userVoted");
      socket.off("votesRevealed");
      socket.off("votesReset");
    };
  }, [roomId, navigate, username]);

  const isOwner = useMemo(() => {
    return userId === ownerId;
  }, [ownerId, userId]);

  const onRevealed = useCallback(() => {
    if (votes) {
      setVotes(undefined);
      return;
    }
    socket.emit("revealVotes", { roomId });
  }, [votes, roomId]);

  const onResetVotes = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      socket.emit("resetVotes", { roomId });
    },
    [roomId]
  );

  const onFinishedConnectGitlab = useCallback((iteration: GitlabIteration, issues: GitlabIssues[]) => {
    socket.emit("informGitlab", { 
      roomId, 
      iteration, 
      issues: issues.map(({created_at, description, iid, title, updated_at, web_url, weight}) => ({
        created_at,
        description,
        iid,
        title,
        updated_at,
        web_url,
        weight,
      }))
    });
  }, [roomId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sala de Planning Poker
              </h1>
              <p className="text-gray-600">
                {roomName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {users.length} participantes
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
                      Seleccionada:{" "}
                      {selectedCard === "120" ? "Pasar Turno" : selectedCard}
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
                      disabled={Boolean(votes)}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectedCard(card);
                      }}
                    >
                      {card}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant={selectedCard === "120" ? "default" : "outline"}
                    disabled={Boolean(votes)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectedCard("120");
                    }}
                  >
                    Pasar turno
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Resultados (cuando se revelan) */}
            {votes && (
              <Card className="mt-5">
                <CardHeader>
                  <CardTitle>Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Promedio:</span>
                      <Badge variant="default">{votes.sum}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Consenso:</span>
                      <Badge variant="secondary">
                        {votes.data.every((v) => v === votes.data[0])
                          ? "Sí"
                          : "No"}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Votos: {votes.data.join(", ")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
                    <div
                      key={participant.id}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={participant.avatar || "/placeholder.svg"}
                          alt={participant.username}
                        />
                        <AvatarFallback>
                          {participant.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {participant.username}
                        </p>
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
                <Button
                  disabled={!isOwner}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    onRevealed();
                  }}
                  className="w-full flex items-center gap-2"
                  variant={votes ? "secondary" : "default"}
                >
                  {votes ? (
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

                <Button
                  disabled={!isOwner}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={onResetVotes}
                >
                  <RotateCcw className="w-4 h-4" />
                  Nueva ronda
                </Button>

                <Separator />

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Progreso de votación
                  </p>
                  <div className="text-2xl font-bold text-blue-600">
                    {users.filter((p) => p.voted).length}/{users.length}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ModalGitlabIterations 
        isOpen={!iteration && isOwner}
        onClose={() => {
          setIteration({
            iteration: {
              id: "",
              iid: 0,
              title: "",
              description: "",
              start_date: "",
              due_date: "",
              state: 0,
              web_url: "",
              group_id: 0,
              created_at: "",
              updated_at: "",
            },
            issues: [],
          });
        }}
        onFinished={onFinishedConnectGitlab}
      />
    </div>
  );
};
