import { NextResponse } from "next/server";
import { getGeneralSettings } from "@/server/settings";

export async function GET() {
  try {
    const settings = await getGeneralSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      {
        siteName: "SKYNOVA",
        companyEmail: "",
        companyPhone: "",
        siteCurrency: "USD",
        usdToTryRate: 0,
      },
      { status: 500 }
    );
  }
}
