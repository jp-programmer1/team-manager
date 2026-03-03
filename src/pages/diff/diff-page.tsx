import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { api, socketDiff } from "@/services/api";
import { LogOut, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DiffViewer from "react-diff-viewer-continued";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

type RoomUser = {
  id: number;
  username: string;
};

type RoomDiff = {
  id: string;
  nanoId: string;
  name: string;
  users: RoomUser[];
  textOriginal: string;
  textModified: string;
  ownerId: number;
  createdAt: string;
};

export const DiffPage = () => {
  const { roomId } = useParams<{ roomId: string; roomName: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomDiff | undefined>();
  const [error, setError] = useState<string>();
  
  const [isOwner, setIsOwner] = useState(false);
  const [textOriginal, setTextOriginal] = useState("");
  const [textModified, setTextModified] = useState("");
  const [splitView, setSplitView] = useState(true);
  const [showDiffOnly, setShowDiffOnly] = useState(false);

  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!roomId) return;
    api.getRoom(roomId, true).then((res) => {
      if (res.statusCode === 500) {
        setError('Sala no encontrada');
        return;
      }
      setIsOwner(res.ownerId === userId);
      setRoom(res);
      setTextOriginal(res.textOriginal);
      setTextModified(res.textModified);
    })
    socketDiff.emit("joinDiffRoom", {
      roomId,
      username: user?.username,
      userId,
    });
  }, [roomId]);

  useEffect(() => {
    socketDiff.on("diffUsers", (userList) => {
      setRoom((current) => {
        if (!current) return current;
        return {
          ...current,
          users: userList,
        };
      });
    });
    socketDiff.on("textUpdated", (textUpdated) => {
      if (textUpdated.type === "original") {
        setTextOriginal(textUpdated.textOriginal);
      }
      if (textUpdated.type === "modified") {
        setTextModified(textUpdated.textModified);
      }
    });
    socketDiff.on("roomDeleted", () => {
      toast.info("Sala Eliminada, redirigiendo...")
      setTimeout(() => {
        navigate("/");
      }, 2000)
    });

    return () => {
      socketDiff.off("diffUsers");
      socketDiff.off("textUpdated");
      socketDiff.off("roomDeleted");
    };
  }, []);

  const handleChangeText = useCallback(
    (text: string, type: string) => {
      socketDiff.emit("setText", {
        roomId,
        type,
        text,
      });
    },
    [roomId],
  );

  const roomLogout = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      socketDiff.emit("removeRoom", { roomId });
    },
    [roomId],
  );

  if (error) {
      <div className="h-screen bg-gradient-to-br justify-center items-center flex from-blue-50 to-indigo-100 p-4">
        <p>{error}</p>
      </div>
  }
  if (!room || error) {
    return (
      <div className="h-screen bg-gradient-to-br justify-center items-center flex from-blue-50 to-indigo-100 p-4">
        <p>{error ? error : 'Loading...'}</p>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Herramienta Diff
              </h1>
              <p className="text-gray-600">Diff PAGE</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {room?.users?.length} participantes
              </Badge>
              {isOwner && (
                <Button
                  title="Cerrar Sala"
                  variant="ghost"
                  onClick={roomLogout}
                >
                  <LogOut className="w-4 h-4 text-red-700" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 h-[500px] relative">
              <div className="border-r border-gray-200 p-4 overflow-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Original
                  </span>
                  <span className="text-xs text-gray-500">JSON</span>
                </div>
                <textarea
                  className="w-full  bg-gradient-to-br h-[calc(100%-30px)] p-2 font-mono text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-200"
                  value={textOriginal}
                  onChange={(e) => {
                    handleChangeText(e.target.value, "original");
                  }}
                  spellCheck={false}
                />
              </div>
              <div className="p-4 overflow-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Modified
                  </span>
                  <span className="text-xs text-gray-500">JSON</span>
                </div>
                <textarea
                  className="w-full  bg-gradient-to-br h-[calc(100%-30px)] p-2 font-mono text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-200"
                  value={textModified}
                  onChange={(e) => {
                    handleChangeText(e.target.value, "modified");
                  }}
                  spellCheck={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium">Diff Viewer</h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={splitView}
                    onChange={() => setSplitView(!splitView)}
                  />
                  Split View
                </label>
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={showDiffOnly}
                    onChange={() => setShowDiffOnly(!showDiffOnly)}
                  />
                  Show Differences Only
                </label>
              </div>
            </div>
            <div className="h-[500px] overflow-auto">
              <DiffViewer
                oldValue={textOriginal}
                newValue={textModified}
                splitView={splitView}
                useDarkTheme={false}
                showDiffOnly={showDiffOnly}
                leftTitle="Original"
                rightTitle="Modified"
                styles={{
                  diffContainer: {
                    pre: {
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    },
                  },
                  line: {
                    padding: "0 8px",
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
