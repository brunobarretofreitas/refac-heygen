import RecognitionAudioButton from "@/features/audio/components/RecognitionAudioButton";
import TextInput from "@/features/text/components/TextInput";
import { useAvatar } from "@/providers/AvatarProvider";

import PushToTalkButton from "../../audio/components/PushToTalkButton";

const AvatarInputBar = () => {
  const { deviceType } = useAvatar();

  return (
    <div className="flex flex-col items-center md:flex-row p-4 gap-4 rounded-2xl bg-slate-700 w-full max-w-[900px]">
      {deviceType === "desktop" ? (
        <RecognitionAudioButton onResult={(text) => alert(text)} />
      ) : (
        <PushToTalkButton onTranscription={(text) => alert(text)} />
      )}

      <TextInput
        buttonText="Enviar"
        placeholder="Digite sua mensagem"
        onButtonClick={(value) => alert(value)}
      />
    </div>
  );
};

export default AvatarInputBar;
