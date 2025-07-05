export const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || "") as string;
export const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || "";
export const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || "";
export const HEYGEN_AVATAR_ID =
  process.env.HEYGEN_AVATAR_ID || "e987378a2f214a50b80dabeedfece6e7";

export const INITIAL_AVATAR_TEXT =
  process.env.INITIAL_AVATAR_TEXT ||
  "Olá, tudo bem ? Como posso te ajudar hoje ?";
