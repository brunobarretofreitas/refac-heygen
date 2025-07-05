import OpenAI from "openai";

import { OPENAI_API_KEY } from "@/utils/constants";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST() {
  const thread = await openai.beta.threads.create();

  return new Response(JSON.stringify({ threadId: thread.id }), {
    headers: { "Content-Type": "application/json" },
  });
}
