import { NextResponse } from "next/server";
import { getPublishedPages } from "@/server/pages";

export async function GET() {
  try {
    const pages = await getPublishedPages();
    return NextResponse.json(pages);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
