import { getTextDetail } from '@/app/lib/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const textId = params.id;

  try {
    if (textId) {
      const detailText = await getTextDetail(textId);
      return NextResponse.json(detailText);
    }
  } catch (err) {
    return NextResponse.json(err);
  }
}
