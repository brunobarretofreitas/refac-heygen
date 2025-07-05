import OpenAI from "openai";

import { OPENAI_API_KEY, OPENAI_ASSISTANT_ID } from "@/utils/constants";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { threadId, message } = await request.json();

    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // Cria e aguarda a execução da thread
    const run = await openai.beta.threads.runs.createAndPoll(
      threadId,
      {
        assistant_id: OPENAI_ASSISTANT_ID || "",
      },
      {
        pollIntervalMs: 500, // Poll every 500ms instead of default (usually 1000ms)
      },
    );

    let assistantReply = "";
    if (run.status === "completed") {
      const msgList = await openai.beta.threads.messages.list(threadId);
      const lastMsg = msgList.data.find((m) => m.role === "assistant");
      if (lastMsg?.content[0]?.type === "text") {
        assistantReply = lastMsg.content[0].text.value;
      }
    }

    if (!assistantReply) {
      assistantReply = "Desculpe, não consegui processar sua solicitação.";
    }

    return new Response(JSON.stringify({ reply: assistantReply }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in OpenAI sendMessage route:", error);
    return new Response(JSON.stringify({ error: "Erro ao enviar mensagem" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
