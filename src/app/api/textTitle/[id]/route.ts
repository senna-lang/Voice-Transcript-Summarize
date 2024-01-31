import { getTextMeta } from "@/common/lib/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const userId = params.id;

  try {
    if (userId) {
      const textTitle = await getTextMeta(userId);
      return NextResponse.json(textTitle);
    }
  } catch (err) {
    return NextResponse.json(err);
  }
}
