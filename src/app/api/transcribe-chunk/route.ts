import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Transcribe audio chunk using Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
            language: "ja",
        });

        return NextResponse.json({
            transcription: transcription.text,
        });
    } catch (error) {
        console.error("Error transcribing chunk:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
