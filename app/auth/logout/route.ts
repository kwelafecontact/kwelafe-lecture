import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { fermerSession } from "@/lib/session";

export async function GET() {
  await fermerSession();
  return NextResponse.redirect(`${config.appUrl}/bienvenue`);
}
