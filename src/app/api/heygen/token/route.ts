import { HEYGEN_API_KEY } from "@/utils/constants";

export type FetchHeygenTokenApiResponse = {
  token: string;
};

export async function POST() {
  const response = await fetch(
    "https://api.heygen.com/v1/streaming.create_token",
    {
      method: "POST",
      headers: { "x-api-key": HEYGEN_API_KEY },
    },
  );

  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch Heygen token" }),
      {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const data = await response.json();
  return new Response(JSON.stringify({ token: data.data.token }), {
    headers: { "Content-Type": "application/json" },
  });
}
