"use client";

import { useState, useEffect } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

export default function Home() {
  const { isRecording, recordingTime, audioBlob, startRecording, stopRecording } =
    useAudioRecorder();

  const [transcription, setTranscription] = useState("");
  const [processedOutput, setProcessedOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle audio blob when recording stops
  useEffect(() => {
    if (audioBlob) {
      handleProcessAudio(audioBlob);
    }
  }, [audioBlob]);

  const handleProcessAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setTranscription("文字起こし中...");
    setProcessedOutput("処理中...");

    try {
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");

      const response = await fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      setTranscription(data.transcription);
      setProcessedOutput(data.processedOutput);
    } catch (error) {
      console.error("Error processing audio:", error);
      setTranscription("エラーが発生しました。");
      setProcessedOutput("処理に失敗しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="w-full p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <h1 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">
          Whisper to Coding
        </h1>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Transcription */}
        <div className="flex-1 p-6 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            文字起こし (Transcript)
          </h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm min-h-[300px] whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {transcription || "ここに文字起こし結果が表示されます..."}
          </div>
        </div>

        {/* Right Panel: Processed Output */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
            生成プロンプト (Processed Output)
          </h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm min-h-[300px] whitespace-pre-wrap text-gray-800 dark:text-gray-200 border border-indigo-100 dark:border-indigo-900/30">
            {processedOutput || "ここに生成されたプロンプトが表示されます..."}
          </div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="p-6 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-4">
        <div className="text-sm font-mono text-gray-500 dark:text-gray-400">
          {isRecording ? formatTime(recordingTime) : "Ready"}
        </div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg
            ${isRecording
              ? "bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-200 dark:ring-red-900"
              : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
            }
            ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {isRecording ? (
            // Stop Icon
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            // Mic Icon
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          )}
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isRecording ? "タップして停止" : isProcessing ? "処理中..." : "タップして録音開始"}
        </p>
      </div>
    </main>
  );
}
