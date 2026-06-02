"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Input, Badge } from "@/components/ui";

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export function FocusTimer({ initialTask }: { initialTask: string }) {
  const [task, setTask] = useState(initialTask);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_SECONDS);
  const [cycleCount, setCycleCount] = useState(0);
  const [status, setStatus] = useState("Ready to build momentum.");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft > 0) return;

    const completeCycle = async () => {
      if (mode === "work") {
        setCycleCount((count) => count + 1);
        setStatus("Work block completed. Logging the win.");

        await fetch("/api/focus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            task,
            minutes: 25,
            cycleType: "work"
          })
        });

        setMode("break");
        setSecondsLeft(BREAK_SECONDS);
        setStatus("Take a five-minute reset.");
      } else {
        setMode("work");
        setSecondsLeft(WORK_SECONDS);
        setStatus("Back to the mission.");
      }
    };

    void completeCycle();
  }, [mode, secondsLeft, task]);

  const timeLabel = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [secondsLeft]);

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      return;
    }

    await document.exitFullscreen();
    setIsFullscreen(false);
  }

  function start() {
    setIsRunning(true);
    setStatus(mode === "work" ? "Deep work started." : "Break time started.");
  }

  function pause() {
    setIsRunning(false);
    setStatus("Paused.");
  }

  function reset() {
    setIsRunning(false);
    setMode("work");
    setSecondsLeft(WORK_SECONDS);
    setCycleCount(0);
    setStatus("Reset and ready.");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.16),_transparent_45%),linear-gradient(180deg,#020617_0%,#020617_100%)] px-4 py-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col justify-center">
        <div className="mb-4 flex items-center justify-between gap-3 text-sm text-slate-400">
          <span className="uppercase tracking-[0.35em] text-cyan-300/70">Focus Mode</span>
          <button
            onClick={toggleFullscreen}
            className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400/50"
          >
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">One task only</p>
              <h1 className="mt-2 text-3xl font-semibold">{task || "Define your task"}</h1>
            </div>
            <Badge tone={mode === "work" ? "success" : "warning"}>
              {mode === "work" ? "Work" : "Break"}
            </Badge>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{mode === "work" ? "Work block" : "Break block"}</p>
              <p className="mt-4 text-7xl font-semibold tracking-tight text-white">{timeLabel}</p>
              <p className="mt-4 text-sm text-slate-400">{status}</p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button onClick={start}>Start</Button>
                <Button onClick={pause} variant="secondary">
                  Pause
                </Button>
                <Button onClick={reset} variant="ghost">
                  Reset
                </Button>
              </div>
            </div>

            <Card className="border-slate-800 bg-slate-900/60 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Session Settings</p>
              <label className="mt-4 block text-sm text-slate-300">
                Mission task
                <Input
                  value={task}
                  onChange={(event) => setTask(event.target.value)}
                  className="mt-2"
                  placeholder="Write the task that matters most"
                />
              </label>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Cycles completed</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{cycleCount}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Automatic rhythm</p>
                  <p className="mt-2 text-sm text-slate-300">25 minutes work, 5 minutes break, looping until you stop.</p>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </main>
  );
}
