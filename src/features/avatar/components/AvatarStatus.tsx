import { useAvatar } from "@/providers/AvatarProvider";

import { AvatarState } from "../enums";

const AvatarStatus = () => {
  const { avatarState } = useAvatar();

  const statusMessages: Partial<Record<AvatarState, string>> = {
    [AvatarState.SPEAKING]: "Falando...",
    [AvatarState.GENERATING_RESPONSE]: "Aguardando resposta...",
  };

  const statusBackgroundColors: Partial<Record<AvatarState, string>> = {
    [AvatarState.SPEAKING]: "bg-blue-500",
    [AvatarState.GENERATING_RESPONSE]: "bg-purple-500",
  };

  return (
    <div
      className={`flex items-center justify-center p-3 rounded-4xl text-white ${statusBackgroundColors[avatarState]}`}
    >
      <span className="text-sm">{statusMessages[avatarState]}</span>
    </div>
  );
};

export default AvatarStatus;
