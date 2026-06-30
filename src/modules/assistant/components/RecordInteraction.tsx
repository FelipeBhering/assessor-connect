import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic, MicOff, Loader2, Sparkles, CheckCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { transcribeAudio } from "@/modules/assistant/functions/transcribe";
import { summarizeInteraction } from "@/modules/assistant/functions/summarize";
import { createInteraction } from "@/modules/crm/functions/interaction";
import { crmKeys } from "@/modules/crm/hooks";
import type { InteractionType } from "@/lib/supabase/types";

interface Props {
  clientId: string;
  clientName: string;
}

type Stage = "idle" | "recording" | "transcribing" | "summarizing" | "done" | "error";

const SUPPORTED_MIME = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg", "audio/mp4"].find(
  (m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m),
) ?? "audio/webm";

export function RecordInteraction({ clientId, clientName }: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [taskCount, setTaskCount] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();

  const processMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      setStage("transcribing");

      // base64 encode
      const buffer = await audioBlob.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      const audioBase64 = btoa(binary);

      const { transcript: text } = await transcribeAudio({
        data: { audioBase64, mimeType: SUPPORTED_MIME, filename: "recording.webm" },
      });
      setTranscript(text);
      setStage("summarizing");

      // Criar interação com a transcrição
      const interaction = await createInteraction({
        data: {
          clientId,
          type: "meeting" as InteractionType,
          summary: text.slice(0, 200),
          occurredAt: new Date().toISOString(),
        },
      });

      const result = await summarizeInteraction({
        data: {
          clientId,
          interactionId: interaction.id,
          transcript: text,
          clientName,
        },
      });

      return result;
    },
    onSuccess: (result) => {
      setSummary(result.summary);
      setTaskCount(result.createdTasks.length);
      setStage("done");
      queryClient.invalidateQueries({ queryKey: crmKeys.client(clientId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.clients });
      toast.success(
        `Reunião processada — ${result.createdTasks.length} tarefa(s) criada(s)`,
      );
    },
    onError: (e) => {
      setStage("error");
      toast.error(e instanceof Error ? e.message : "Erro ao processar reunião");
    },
  });

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: SUPPORTED_MIME });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: SUPPORTED_MIME });
        processMutation.mutate(blob);
      };
      recorder.start(1000);
      mediaRef.current = recorder;
      setStage("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
    } catch {
      toast.error("Permissão de microfone negada ou não disponível.");
    }
  }, [processMutation]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRef.current?.stop();
  }, []);

  const reset = () => {
    setStage("idle");
    setTranscript("");
    setSummary("");
    setTaskCount(0);
    setShowTranscript(false);
    setElapsed(0);
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <Card className="border-dashed border-2 border-accent/40 bg-accent/5">
      <CardContent className="p-4 space-y-3">
        {stage === "idle" && (
          <div className="flex items-center gap-3">
            <Button
              onClick={startRecording}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
            >
              <Mic className="size-4" /> Gravar reunião
            </Button>
            <span className="text-xs text-muted-foreground">
              A IA vai transcrever e criar o resumo + tarefas automaticamente
            </span>
          </div>
        )}

        {stage === "recording" && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-destructive font-medium">
              <span className="size-2 rounded-full bg-destructive animate-pulse" />
              Gravando {fmt(elapsed)}
            </div>
            <Button variant="destructive" onClick={stopRecording} size="sm" className="gap-1.5">
              <MicOff className="size-4" /> Parar e processar
            </Button>
          </div>
        )}

        {(stage === "transcribing" || stage === "summarizing") && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">
              {stage === "transcribing" ? "Transcrevendo áudio com Whisper…" : "Gerando resumo e tarefas com IA…"}
            </span>
          </div>
        )}

        {stage === "done" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="size-4 text-accent" />
              <span className="font-medium">Processado com sucesso</span>
              {taskCount > 0 && (
                <Badge variant="secondary">{taskCount} tarefa(s) criada(s)</Badge>
              )}
            </div>

            {summary && (
              <div className="p-3 rounded-md bg-accent/10 border border-accent/20 text-sm">
                <div className="flex items-center gap-1.5 mb-1.5 font-medium text-accent">
                  <Sparkles className="size-3.5" /> Resumo da IA
                </div>
                <p className="text-foreground/80 leading-relaxed">{summary}</p>
              </div>
            )}

            {transcript && (
              <div>
                <button
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowTranscript((v) => !v)}
                >
                  {showTranscript ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  {showTranscript ? "Ocultar" : "Ver"} transcrição completa
                </button>
                {showTranscript && (
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed bg-muted/40 rounded p-2 max-h-40 overflow-y-auto">
                    {transcript}
                  </p>
                )}
              </div>
            )}

            <Button variant="outline" size="sm" onClick={reset}>
              Nova gravação
            </Button>
          </div>
        )}

        {stage === "error" && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-destructive">Erro ao processar. Tente novamente.</span>
            <Button variant="outline" size="sm" onClick={reset}>
              Tentar de novo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
