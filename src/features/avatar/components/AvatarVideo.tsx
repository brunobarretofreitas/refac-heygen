import { useEffect, useRef } from "react";

import { useAvatar } from "@/providers/AvatarProvider";

import { AvatarState } from "../enums";

const AvatarVideo = () => {
  const { avatar, avatarState } = useAvatar();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (avatar && avatarState === AvatarState.READY) {
      const mediaStream = avatar.mediaStream;
      if (mediaStream && videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current!.play();
        };
      }
    }
  }, [avatar, avatarState]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
      }}
    />
  );
};

export default AvatarVideo;
