import { useParams, useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
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
import type {
  Gitlab,
  GitlabIssues,
  GitlabIteration,
} from "@/types/gitlab.type";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const fibonacciCards = ["1", "2", "3", "5", "8", "13"];

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string; roomName: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Array<User>>([]);
  const [informGitlab, setInformGitlab] = useState<Gitlab | null>(null);
  console.log(informGitlab);
  const [selectedCard, setSelectedCard] = useState<string | null>("");
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [votes, setVotes] = useState<
    { data: string[]; sum: number } | undefined
  >();
  const [ownerId, setOwnerId] = useState();
  const [roomName, setRoomName] = useState();
  const [weight, setWeight] = useState<number | null>(null);
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
      if (response?.error) {
        navigate("/");
        return;
      }
      if (response?.informGitlab) {
        setInformGitlab(response.informGitlab);
      }

      const findUser = response.users.find(
        (user: { id: number }) => user.id === userId
      );

      if (!findUser) {
        navigate("/");
        return;
      }
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
      if (res.informGitlab) {
        setInformGitlab(res.informGitlab);
        toast.success("Lista de issues actualizada");
      }
    });

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

  const onResetVotes = useCallback(() => {
    socket.emit("resetVotes", { roomId });
  }, [roomId]);

  const onFinishedConnectGitlab = useCallback(
    (iteration: GitlabIteration, issues: GitlabIssues[]) => {
      socket.emit("informGitlab", {
        roomId,
        iteration,
        issues: issues.map(
          ({
            created_at,
            description,
            iid,
            title,
            updated_at,
            web_url,
            weight,
            project_id,
          }) => ({
            created_at,
            description,
            iid,
            title,
            updated_at,
            web_url,
            weight,
            project_id,
          })
        ),
      });
    },
    [roomId]
  );

  const onSetWeight = useCallback(
    async (value: number) => {
      if (!selectedIssue || !user || !isOwner) return;
      const project_id = informGitlab?.issues.find(
        (issue) => issue.iid === selectedIssue
      )?.project_id;
      const res = await api.updateWeight(
        user.accessToken,
        project_id!,
        selectedIssue,
        value
      );

      if (res) {
        socket.emit("setWeight", {
          roomId,
          issueIid: selectedIssue,
          weight: value,
        });
        onResetVotes();
      }
    },
    [roomId, selectedIssue, informGitlab?.issues, user, isOwner, onResetVotes]
  );

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
              <p className="text-gray-600">{roomName}</p>
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
          <div className="lg:col-span-3 space-y-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-4 h-[20px]">
                  {`Iteración #${informGitlab?.iteration.iid || ""}`}
                  {selectedCard && (
                    <Badge variant="secondary">
                      Seleccionada:{" "}
                      {selectedCard === "120" ? "Pasar Turno" : selectedCard}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 max-h-80 overflow-y-auto">
                  {informGitlab?.issues
                    ?.filter((issue) => !issue.weight)
                    .map((issue) => (
                      <div
                        key={issue.iid}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (isOwner) setSelectedIssue(issue.iid);
                        }}
                        className={`col-span-12 flex items-center gap-2 p-2 w-[95%] rounded-md cursor-pointer ${
                          selectedIssue === issue.iid
                            ? "bg-slate-500 text-white"
                            : ""
                        }`}
                      >
                        <span className="font-bold">#{issue.iid}</span>
                        <span className="flex-1 truncate" title={issue.title}>
                          {issue.title}
                        </span>
                        <ExternalLink
                          className={`h-4 w-4 cursor-pointer flex-shrink-0 text-muted-foreground hover:text-foreground ${
                            selectedIssue === issue.iid ? "text-white" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              issue.web_url,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

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

                    {isOwner && (
                      <div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={weight || votes?.sum}
                            onChange={(e) => setWeight(Number(e.target.value))}
                          />
                          <Button
                            onClick={() => {
                              onSetWeight(weight || votes?.sum);
                            }}
                          >
                            Asignar Puntaje
                          </Button>
                        </div>
                      </div>
                    )}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onResetVotes();
                  }}
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
        isOpen={!informGitlab && isOwner}
        onClose={() => {
          setInformGitlab({
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
