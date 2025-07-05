import { Button, Input, Typography, message } from "antd";
import { Mic, MicOff, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const { Text } = Typography;

interface AudioInputProps {
  onTranscription: (text: string, type: "transcribed" | "typed") => void;
}

const AudioInput: React.FC<AudioInputProps> = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isMonitoringRef = useRef(false);
  const hasDetectedSpeechRef = useRef(false);
  const shouldRestartRef = useRef(true);

  useEffect(() => {
    console.log("AudioInput component mounted");
    startRecording();
    return () => cleanup();
  }, []);

  const cleanup = () => {
    setIsRecording(false);
    isMonitoringRef.current = false;
    hasDetectedSpeechRef.current = false;
    shouldRestartRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      shouldRestartRef.current = true;

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          autoGainControl: true,
        },
      });
      console.log("Media stream obtained:", stream);
      streamRef.current = stream;

      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        console.warn("audio/webm;codecs=opus not supported, trying audio/webm");
      }

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      console.log("MediaRecorder created with mime type:", mimeType);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      hasDetectedSpeechRef.current = false;

      mediaRecorder.ondataavailable = (e) => {
        console.log("Data available:", e.data.size, "bytes");
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log(
          "Recording stopped. Blob size:",
          blob.size,
          "bytes, Speech detected:",
          hasDetectedSpeechRef.current,
        );
        if (blob.size > 1000 && hasDetectedSpeechRef.current) {
          await transcribeAudio(blob);
        } else if (shouldRestartRef.current) {
          console.log("Restarting recording in 500ms...");
          setTimeout(startRecording, 500);
        }
        audioChunksRef.current = [];
        hasDetectedSpeechRef.current = false;
      };

      mediaRecorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
        message.error("Erro no gravador de mídia.");
      };

      console.log("Starting MediaRecorder...");
      mediaRecorder.start(100);
      setIsRecording(true);
      setupSilenceDetection(stream);
    } catch (err) {
      console.error("Error starting recording:", err);
      message.error(
        `Erro ao iniciar gravação: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      );
    }
  };

  const setupSilenceDetection = (stream: MediaStream) => {
    try {
      console.log("Setting up silence detection...");
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      const mic = ctx.createMediaStreamSource(stream);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      mic.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      isMonitoringRef.current = true;
      console.log("Silence detection setup complete, starting monitoring...");

      const check = () => {
        if (!isMonitoringRef.current || !analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buffer);
        const avg = buffer.reduce((sum, v) => sum + v, 0) / buffer.length;

        if (avg > 25) {
          if (!hasDetectedSpeechRef.current) {
            console.log("Speech detected! Average volume:", avg);
          }
          hasDetectedSpeechRef.current = true;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (hasDetectedSpeechRef.current && !silenceTimerRef.current) {
          console.log("Silence detected, starting 2s timer...");
          silenceTimerRef.current = setTimeout(() => stopRecording(), 2000);
        }
        if (isMonitoringRef.current) requestAnimationFrame(check);
      };

      check();
    } catch (error) {
      console.error("Error setting up silence detection:", error);
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording...");
    shouldRestartRef.current = false;
    isMonitoringRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    setIsRecording(false);
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsProcessing(true);
    const form = new FormData();
    form.append("audio", blob, "audio.webm");

    try {
      const res = await fetch("/api/openai/transcribeAudio", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Transcription failed");
      }

      const data = await res.json();
      const text = data.text?.trim();
      if (text) {
        onTranscription(text, "transcribed");
        message.success("Transcrição concluída com sucesso!");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      message.error("Erro ao transcrever áudio. Verifique sua conexão.");
    } finally {
      setIsProcessing(false);
      if (shouldRestartRef.current) setTimeout(startRecording, 500);
    }
  };

  const handleSubmit = () => {
    if (textInput.trim()) {
      onTranscription(textInput.trim(), "typed");
      setTextInput("");
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex items-start gap-3">
        <Button
          type={isRecording ? "primary" : "default"}
          shape="circle"
          size="large"
          icon={isRecording ? <Mic /> : <MicOff />}
          loading={isProcessing}
          onClick={() => (isRecording ? stopRecording() : startRecording())}
        />

        <Input
          placeholder="Digite sua mensagem ou grave áudio..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onPressEnter={handleSubmit}
          disabled={isProcessing}
          className="flex-1"
        />

        <Button
          type="primary"
          icon={<Send />}
          disabled={!textInput.trim() || isProcessing}
          onClick={handleSubmit}
        />
      </div>

      <Text type="secondary">
        {isRecording
          ? "Gravando... fale algo para iniciar detecção."
          : isProcessing
            ? "Transcrevendo áudio..."
            : "Clique no microfone para iniciar gravação."}
      </Text>
    </div>
  );
};

export default AudioInput;
