import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { userAgent } from "next/server";

export async function GET() {
  const requestHeaders = await headers();
  const { device } = userAgent({
    headers: requestHeaders,
  });

  let deviceType = "unknown";
  if (device.type === "mobile") {
    deviceType = "mobile";
  } else {
    deviceType = "desktop";
  }

  return NextResponse.json({ deviceType });
}
