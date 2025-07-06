import { useMemo } from "react";

import { useAvatar } from "@/providers/AvatarProvider";

import AvatarInputBar from "../components/AvatarInputBar";
import AvatarStatus from "../components/AvatarStatus";
import AvatarVideo from "../components/AvatarVideo";
import { AvatarState } from "../enums";

const AvatarPage = () => {
  // const { avatarState } = useAvatar();

  // const showAvatar =
  //   avatarState !== AvatarState.IDLE &&
  //   avatarState !== AvatarState.INITIALIZING;

  // if (avatarState === AvatarState.INITIALIZING) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <p className="text-lg text-gray-500">Initializing avatar...</p>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full h-screen flex relative">
      {/* <AvatarVideo /> */}
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        avatar will be here
      </div>

      <div className="absolute flex flex-col gap-[24px] justify-center items-center bottom-[20px] w-full">
        <AvatarStatus />
        <AvatarInputBar />
      </div>
    </div>
  );

  // if (showAvatar) {
  //   return (
  //     <div className="w-full h-screen flex relative">
  //       {/* <AvatarVideo /> */}
  //       <div className="flex-1 flex items-center justify-center bg-gray-900">
  //         avatar will be here
  //       </div>

  //       <div className="absolute flex justify-center items-center bottom-[20px] w-full">
  //         <AvatarInputBar />
  //       </div>
  //     </div>
  //   );
  // }
};

export default AvatarPage;
