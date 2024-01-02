import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const openAi = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
  const { prompt } = await req.json();
  const gptRes = await openAi.chat.completions.create({
    messages: [{ role: 'user', content: prompt ,}],
    model: 'gpt-3.5-turbo-1106',
    temperature:0,
  });
  const response = NextResponse.json(gptRes);
  return response;
}
