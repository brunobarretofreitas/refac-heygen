import { Button } from "antd";
import { Mic, MicOff } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface RecognitionAudioButtonProps {
  /** Desabilita a escuta quando true */
  disabled?: boolean;
  waitingForAvatarResult?: boolean;
  /** Callback disparado ao fim da fala (2s de silêncio) */
  onResult: (text: string) => void;
}

const RecognitionAudioButton: React.FC<RecognitionAudioButtonProps> = ({
  disabled = false,
  waitingForAvatarResult,
  onResult,
}) => {
  const [isDisabled, setIsDisabled] = useState(disabled);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);

  // Guarda se a parada foi manual (botão) ou automática (onend)
  const manualStopRef = useRef(false);
  // Previne chamadas duplicadas de start()
  const isStartingRef = useRef(false);

  // Sincroniza prop disabled com estado interno
  useEffect(() => {
    setIsDisabled(disabled);
  }, [disabled]);

  const startRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || listening || isStartingRef.current || isDisabled) return;
    manualStopRef.current = false;
    try {
      isStartingRef.current = true;
      rec.start();
    } catch (err) {
      isStartingRef.current = false;
    }
  }, [listening, isDisabled]);

  const stopRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || !listening) return;
    manualStopRef.current = true;
    rec.stop();
  }, [listening]);

  // Inicializa SpeechRecognition ao montar
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("Reconhecimento de fala não suportado neste navegador.");
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "pt-BR";

    rec.onstart = () => {
      setListening(true);
      setError(null);
      isStartingRef.current = false;
    };

    rec.onend = () => {
      setListening(false);
      isStartingRef.current = false;
      // Só reinicia se não veio de um stop manual e não estiver disabled
      if (!manualStopRef.current && !isDisabled) {
        setTimeout(startRecognition, 100);
      }
    };

    rec.onerror = (evt: any) => {
      isStartingRef.current = false;
      if (evt.error === "not-allowed" || evt.error === "permission-denied") {
        setError("Permissão de microfone negada.");
      } else {
        setError(`Erro no reconhecimento de fala: ${evt.error}`);
      }
    };

    rec.onresult = (evt: any) => {
      let interim = "";
      for (let i = evt.resultIndex; i < evt.results.length; i++) {
        interim += evt.results[i][0].transcript;
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      silenceTimeoutRef.current = window.setTimeout(() => {
        const text = interim.trim();
        if (text) onResult(text);
        setListening(false);
      }, 2000);
    };

    recognitionRef.current = rec;
    // auto-start se não estiver disabled
    if (!isDisabled) startRecognition();

    return () => {
      rec.stop();
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
  }, [isDisabled, onResult, startRecognition]);

  // Ao clicar: alterna start/stop manualmente
  const handleClick = () => {
    if (listening) {
      stopRecognition();
    } else {
      startRecognition();
    }
    setIsDisabled((prev) => !prev);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={handleClick} disabled={!!error}>
        {listening && !isDisabled ? (
          <Mic className="text-green-500" />
        ) : (
          <MicOff className="text-gray-500" />
        )}
        {listening
          ? "Ouvindo"
          : waitingForAvatarResult
            ? "Aguardando resposta do avatar"
            : "Pressionar para falar"}
      </Button>
      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
};

export default RecognitionAudioButton;
