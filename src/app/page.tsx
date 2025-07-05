"use client";

import Welcome from "@/components/Welcome";
import PushToTalkButton from "@/features/audio/components/PushToTalkButton";
import { AvatarState } from "@/features/avatar/enums";
import AvatarPage from "@/features/avatar/pages/AvatarPage";
import { AvatarProvider, useAvatar } from "@/providers/AvatarProvider";

const HomeComponent = () => {
  const { avatarState } = useAvatar();

  return avatarState === AvatarState.IDLE ? <Welcome /> : <AvatarPage />;
};

export default function Home() {
  return <PushToTalkButton onTranscription={(text) => alert(text)} />;
}
