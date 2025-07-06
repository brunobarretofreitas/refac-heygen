import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
} from "@heygen/streaming-avatar";
import { createContext, useContext, useEffect, useState } from "react";

import { FetchHeygenTokenApiResponse } from "@/app/api/heygen/token/route";
import { AvatarState } from "@/features/avatar/enums";
import { HEYGEN_AVATAR_ID, INITIAL_AVATAR_TEXT } from "@/utils/constants";

const fetchHeygenToken = async (): Promise<FetchHeygenTokenApiResponse> => {
  const response = await fetch("/api/heygen/token", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Heygen token");
  }

  const data = (await response.json()) as FetchHeygenTokenApiResponse;
  return data;
};

type AvatarContextType = {
  avatar: StreamingAvatar | null;
  avatarState: AvatarState;
  setAvatarState: (state: AvatarState) => void;
  deviceType: "desktop" | "mobile";
  lastMessage: string;
  setLastMessage: (message: string) => void;

  actions: {
    initializeAvatar: () => Promise<void>;
    speak: (text: string) => Promise<void>;
    stopSpeaking: () => Promise<void>;
  };
};

const initialAvatarContext: AvatarContextType = {
  avatar: null,
  avatarState: AvatarState.IDLE,
  deviceType: "desktop",
  lastMessage: "",
  setLastMessage: () => {},
  setAvatarState: () => {},
  actions: {
    initializeAvatar: async () => {},
    speak: async () => {},
    stopSpeaking: async () => {},
  },
};

export const AvatarContext =
  createContext<AvatarContextType>(initialAvatarContext);

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [avatar, setAvatar] = useState<StreamingAvatar | null>(null);
  const [avatarState, setAvatarState] = useState<AvatarState>(AvatarState.IDLE);
  const [deviceType, setDeviceType] = useState<"desktop" | "mobile">("desktop");
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const fetchDevideType = async () => {
      const response = await fetch("/api/deviceType");
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setDeviceType(data.deviceType);
    };

    fetchDevideType();
  }, []);

  const initializeAvatar = async () => {
    if (
      avatarState === AvatarState.READY ||
      avatarState === AvatarState.INITIALIZING
    ) {
      return;
    }

    setAvatarState(AvatarState.INITIALIZING);

    try {
      const { token } = await await fetchHeygenToken();
      const streamingAvatar = new StreamingAvatar({
        token,
      });

      streamingAvatar.on(StreamingEvents.STREAM_READY, () => {
        setAvatarState(AvatarState.READY);
        streamingAvatar.speak({
          text: INITIAL_AVATAR_TEXT,
          taskType: TaskType.REPEAT,
        });
      });

      streamingAvatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        setAvatarState(AvatarState.SPEAKING);
      });

      streamingAvatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        setAvatarState(AvatarState.READY);
      });

      streamingAvatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        setAvatarState(AvatarState.DISCONNECTED);
      });

      await streamingAvatar.createStartAvatar({
        avatarName: HEYGEN_AVATAR_ID,
        quality: AvatarQuality.Medium,
        language: "pt",
      });

      setAvatar(streamingAvatar);
    } catch (error) {
      setAvatarState(AvatarState.ERROR);
    }
  };

  const speak = async (text: string) => {
    if (avatar && avatarState === AvatarState.READY) {
      try {
        await avatar.speak({
          text,
          taskType: TaskType.REPEAT,
        });
        setAvatarState(AvatarState.SPEAKING);
      } catch (error) {
        console.error("Error speaking:", error);
        setAvatarState(AvatarState.READY);
      }
    }
  };

  const stopSpeaking = async () => {
    if (avatar && avatarState === AvatarState.SPEAKING) {
      try {
        await avatar.interrupt();
        setAvatarState(AvatarState.READY);
      } catch (error) {
        console.error("Error stopping speaking:", error);
        setAvatarState(AvatarState.READY);
      }
    }
  };

  return (
    <AvatarContext.Provider
      value={{
        avatar,
        avatarState,
        setAvatarState,
        deviceType,
        lastMessage,
        setLastMessage,
        actions: {
          initializeAvatar,
          speak,
          stopSpeaking,
        },
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error("useAvatar must be used within an AvatarProvider");
  }
  return context;
};
