import OpenAI from "openai";

import { NextRequest } from "next/server";

import { OPENAI_API_KEY } from "@/utils/constants";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "No audio file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate file type (optional but recommended)
    const allowedTypes = [
      "audio/wav",
      "audio/mpeg",
      "audio/mp4",
      "audio/webm",
      "audio/webm;codecs=opus",
      "audio/m4a",
      "audio/ogg",
    ];
    if (!allowedTypes.includes(audioFile.type)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid file type. Supported formats: WAV, MP3, MP4, WebM, M4A, OGG",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check file size (OpenAI has a 25MB limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return new Response(
        JSON.stringify({
          error: "File too large. Maximum size is 25MB",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Transcribe the audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "pt", // Portuguese language as expected by the original component
      response_format: "text",
    });

    return new Response(
      JSON.stringify({
        text: transcription,
        success: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Transcription error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to transcribe audio",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
