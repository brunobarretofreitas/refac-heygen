import { Button, message } from "antd";
import { Mic, MicOff } from "lucide-react";
import React, { useRef, useState } from "react";

interface PushToTalkButtonProps {
  /** Callback invoked with the transcribed text */
  onTranscription: (text: string) => void;
  /** Optional MIME type for recording (e.g., 'audio/webm;codecs=opus') */
  mimeType?: string;
}

const PushToTalkButton: React.FC<PushToTalkButtonProps> = ({
  onTranscription,
  mimeType,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  /**
   * Whitelisted MIME types supported by Whisper API
   */
  const allowedMimeTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/wav",
    "audio/mp4",
    "audio/mpeg",
    "audio/mp3",
    "audio/x-m4a",
    "audio/oga",
    "audio/flac",
  ];

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsRecording(false);
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    setIsLoading(true);
    try {
      const response = await fetch("/api/openai/transcribeAudio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: { text: string } = await response.json();
      onTranscription(data.text);
    } catch (error) {
      console.error("Error transcribing audio", error);
      message.error("Erro ao transcrever o áudio.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    if (isLoading) return;

    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        debugger;

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "audio/mp4",
        });

        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: audioChunksRef.current[0]?.type || "audio/webm",
          });

          if (audioBlob.size > 0) {
            transcribeAudio(audioBlob);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone", error);
        message.error("Não foi possível acessar o microfone.");
      }
    } else {
      mediaRecorderRef.current?.stop();
    }
  };

  return (
    <Button
      type="primary"
      icon={isRecording ? <MicOff size={16} /> : <Mic size={16} />}
      onClick={handleClick}
      loading={isLoading}
      style={{
        display: "flex",
        width: "fit-content",
        alignItems: "center",
        backgroundColor: isRecording ? "#f5222d" : "#29ad5b",
        color: "#fff",
      }}
    >
      {isRecording ? "Parar Gravação" : "Pressionar para Falar"}
    </Button>
  );
};

export default PushToTalkButton;
