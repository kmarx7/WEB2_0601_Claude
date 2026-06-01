import { NextRequest, NextResponse } from "next/server";
import { getLeads } from "@/lib/googleSheets";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || token !== adminSecret) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const leads = await getLeads();
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error("[/api/admin/leads] Error:", error);
    return NextResponse.json({ success: false, message: "데이터를 불러오지 못했습니다." }, { status: 500 });
  }
}
