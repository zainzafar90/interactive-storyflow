import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, storyId } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text parameter is required" },
        { status: 400 }
      );
    }

    if (!storyId) {
      return NextResponse.json(
        { error: "storyId parameter is required" },
        { status: 400 }
      );
    }

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY || "");
    const response = await deepgram.speak.request(
      { text },
      {
        model: "aura-2-cora-en",
        encoding: "mp3",
      }
    );

    const stream = await response.getStream();

    if (!stream) {
      return NextResponse.json(
        { error: "Failed to generate audio" },
        { status: 500 }
      );
    }

    const reader = stream.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const audioData = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      audioData.set(chunk, offset);
      offset += chunk.length;
    }

    const filename = `${storyId}-${Date.now()}.mp3`;

    if (process.env.NODE_ENV === "production") {
      const { url } = await put(`audio/${filename}`, Buffer.from(audioData), {
        access: "public",
      });
      return NextResponse.json({ audioUrl: url });
    } else {
      const audioDir = path.join(process.cwd(), "public", "audio");
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      const filePath = path.join(audioDir, filename);
      fs.writeFileSync(filePath, Buffer.from(audioData));
      const publicAudioUrl = `/audio/${filename}`;
      return NextResponse.json({ audioUrl: publicAudioUrl });
    }
  } catch (error) {
    console.error("Error in text-to-speech:", error);
    return NextResponse.json(
      { error: "Failed to process text-to-speech request" },
      { status: 500 }
    );
  }
}
