"use client"

import { useState } from "react"
import AnalyzeHeader from "./AnalyzeHeader"
import AnalyzeUploadPanel from "./AnalyzeUploadPanel"
import AnalyzeOptionsPanel from "./AnalyzeOptionsPanel"
import AnalyzeStatusPanel from "./AnalyzeStatusPanel"
import AnalyzeResultsPanel from "./AnalyzeResultsPanel"
import type { AnalysisResult } from "../types"

export default function AnalyzeShell() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-450 flex-col gap-6 px-4 py-6 sm:px-5 lg:px-6 2xl:px-8">
        <AnalyzeHeader />

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <AnalyzeUploadPanel
              onAnalysisStart={() => {
                setIsLoading(true)
                setAnalysisResult(null)
              }}
              onAnalysisComplete={(result) => {
                setAnalysisResult(result)
                setIsLoading(false)
              }}
            />

            <AnalyzeStatusPanel />
            <AnalyzeOptionsPanel />
          </div>

          <AnalyzeResultsPanel
            result={analysisResult}
            isLoading={isLoading}
          />
        </div>
      </div>
    </main>
  )
}