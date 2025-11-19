import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Users } from "lucide-react";
import { useState } from "react";
import DiffViewer from "react-diff-viewer-continued";

const users = [];
const isOwner = true;

export const DiffPage = () => {
  // const [room, setRoom] = useState();


  const [leftText, setLeftText] = useState(
    '{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}'
  );
  const [rightText, setRightText] = useState(
    '{\n  "name": "John Doe",\n  "age": 31,\n  "city": "New York",\n  "country": "USA"\n}'
  );
  const [splitView, setSplitView] = useState(true);
  const [showDiffOnly, setShowDiffOnly] = useState(false);



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
                {users.length} participantes
              </Badge>
              {isOwner && (
                <Button title="Cerrar Sala" variant="ghost" onClick={() => {}}>
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
                  value={leftText}
                  onChange={(e) => setLeftText(e.target.value)}
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
                  value={rightText}
                  onChange={(e) => setRightText(e.target.value)}
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
                oldValue={leftText}
                newValue={rightText}
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
