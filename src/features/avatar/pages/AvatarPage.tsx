import { useMemo } from "react";

import { useAvatar } from "@/providers/AvatarProvider";

import AvatarVideo from "../components/AvatarVideo";
import { AvatarState } from "../enums";

const AvatarPage = () => {
  const { avatarState } = useAvatar();

  const showAvatar =
    avatarState !== AvatarState.IDLE &&
    avatarState !== AvatarState.INITIALIZING;

  if (avatarState === AvatarState.INITIALIZING) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500">Initializing avatar...</p>
      </div>
    );
  }

  if (showAvatar) {
    return (
      <div className="w-full h-screen flex relative">
        <AvatarVideo />
      </div>
    );
  }
};

export default AvatarPage;
