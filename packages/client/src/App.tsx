import { useState, useEffect, useCallback } from "react";
import type { ChatMessage, Task } from "./types.js";
import {
  sendMessage,
  getTasks,
  resetAll,
  updateTaskStatus as apiUpdateTaskStatus,
} from "./api/client.js";
import type { TaskStatus } from "./types.js";
import Header from "./components/Header.js";
import ChatPanel from "./components/ChatPanel.js";
import TaskPanel from "./components/TaskPanel.js";

let tempIdCounter = -1;

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailVersion, setDetailVersion] = useState(0);

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch(() => {
        /* server may not be running yet */
      });
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: tempIdCounter--,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await sendMessage(content);

        setMessages((prev) => [...prev, response.message]);

        if (response.sideEffects?.length) {
          setTasks((prev) => {
            let next = [...prev];
            for (const effect of response.sideEffects) {
              switch (effect.type) {
                case "created":
                  next.push(effect.task);
                  break;
                case "updated":
                  next = next.map((t) =>
                    t.id === effect.task.id ? effect.task : t
                  );
                  break;
                case "deleted":
                  next = next.filter((t) => t.id !== effect.task.id);
                  break;
                case "detail_added":
                  // Task list doesn't change, but bump detail version for re-fetch
                  break;
              }
            }
            return next;
          });

          // If any detail was added, bump version so TaskDetail re-fetches
          if (response.sideEffects.some((e) => e.type === "detail_added")) {
            setDetailVersion((v) => v + 1);
          }
        }
      } catch (err) {
        const errorMessage: ChatMessage = {
          id: tempIdCounter--,
          role: "assistant",
          content:
            err instanceof Error
              ? `Sorry, something went wrong: ${err.message}`
              : "Sorry, an unexpected error occurred.",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleUpdateTaskStatus = useCallback(
    async (id: number, status: TaskStatus) => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
      try {
        const updated = await apiUpdateTaskStatus(id, status);
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
      } catch {
        // Revert on error — re-fetch full list
        const fresh = await getTasks().catch(() => []);
        if (fresh.length) setTasks(fresh);
      }
    },
    []
  );

  const handleReset = useCallback(async () => {
    try {
      await resetAll();
      setMessages([]);
      setTasks([]);
      setSelectedTaskId(null);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header onReset={handleReset} />
      <div className="flex-1 flex overflow-hidden">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
        <TaskPanel
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          detailVersion={detailVersion}
        />
      </div>
    </div>
  );
}
