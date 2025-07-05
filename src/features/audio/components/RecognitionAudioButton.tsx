import { Button } from "antd";
import { Mic, MicOff } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface RecognitionAudioButtonProps {
  /** Desabilita a escuta quando true */
  disabled?: boolean;
  /** Callback disparado ao fim da fala (2s de silêncio) */
  onResult: (text: string) => void;
}

const RecognitionAudioButton: React.FC<RecognitionAudioButtonProps> = ({
  disabled = false,
  onResult,
}) => {
  const [isDisabled, setIsDisabled] = useState(disabled);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const disabledRef = useRef(isDisabled);

  // Sincroniza prop disabled com estado interno
  useEffect(() => {
    setIsDisabled(disabled);
  }, [disabled]);

  // Atualiza ref disabled
  useEffect(() => {
    disabledRef.current = isDisabled;
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isDisabled) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }, [isDisabled]);

  // Inicializa SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Reconhecimento de fala não suportado neste navegador.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "pt-BR";

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setListening(false);
      if (!disabledRef.current) recognition.start();
    };

    recognition.onerror = (event: any) => {
      console.error("SpeechRecognition error", event.error);
      if (
        event.error === "not-allowed" ||
        event.error === "permission-denied"
      ) {
        setError("Permissão de microfone negada.");
      } else {
        setError(`Erro no reconhecimento de fala: ${event.error}`);
      }
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interim += event.results[i][0].transcript;
      }
      setTranscript(interim);

      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

      silenceTimeoutRef.current = window.setTimeout(() => {
        const text = interim.trim();
        if (text) onResult(text);
        setTranscript("");
      }, 2000);
    };

    recognitionRef.current = recognition;
    if (!isDisabled) recognition.start();

    return () => {
      recognition.stop();
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={() => setIsDisabled((prev) => !prev)}>
        {listening && !isDisabled ? (
          <Mic className="text-green-500" />
        ) : (
          <MicOff className="text-gray-500" />
        )}
      </Button>

      <div className="flex-1">
        {error ? (
          <span className="text-red-600 text-sm">{error}</span>
        ) : (
          <span className="text-gray-800">{transcript || "..."}</span>
        )}
      </div>
    </div>
  );
};

export default RecognitionAudioButton;
