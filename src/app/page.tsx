"use client";

import Welcome from "@/components/Welcome";
import AvatarInputBar from "@/features/avatar/components/AvatarInputBar";
import { AvatarState } from "@/features/avatar/enums";
import AvatarPage from "@/features/avatar/pages/AvatarPage";
import { AvatarProvider, useAvatar } from "@/providers/AvatarProvider";

const MainComponent = () => {
  const { avatarState } = useAvatar();

  // return avatarState === AvatarState.IDLE ? <Welcome /> : <AvatarPage />;
  return <AvatarPage />;
};

export default function Home() {
  return (
    <AvatarProvider>
      <MainComponent />
    </AvatarProvider>
  );
}
