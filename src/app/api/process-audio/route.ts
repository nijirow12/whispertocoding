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

        // 1. Transcribe audio using Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
            language: "ja", // Default to Japanese as per user request context
        });

        const transcribedText = transcription.text;

        // 2. Process text using ChatGPT to generate a prompt
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Use a high-quality model for prompt generation
            messages: [
                {
                    role: "system",
                    content: `
あなたは優秀なプロンプトエンジニアです。
ユーザーの音声入力（文字起こし）を受け取り、それをLLM（大規模言語モデル）への入力として最適な「プロンプト」に変換してください。

# 指示
- ユーザーの意図を汲み取り、明確で具体的な指示に書き換えてください。
- 必要であれば、背景情報や制約条件を補完して、より良い結果が得られるようにしてください。
- 出力は「変換後のプロンプト」のみを行ってください。余計な説明は不要です。
          `.trim(),
                },
                {
                    role: "user",
                    content: transcribedText,
                },
            ],
        });

        const processedOutput = completion.choices[0].message.content;

        return NextResponse.json({
            transcription: transcribedText,
            processedOutput: processedOutput,
        });
    } catch (error) {
        console.error("Error processing audio:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
