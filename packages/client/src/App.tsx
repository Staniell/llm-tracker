import { useState, useEffect, useCallback } from "react";
import type { ChatMessage, Task } from "./types.js";
import { sendMessage, getTasks, resetAll } from "./api/client.js";
import Header from "./components/Header.js";
import ChatPanel from "./components/ChatPanel.js";
import TaskPanel from "./components/TaskPanel.js";

let tempIdCounter = -1;

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
              }
            }
            return next;
          });
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
        />
      </div>
    </div>
  );
}
