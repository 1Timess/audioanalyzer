"use client"

import HeroSection from "./components/sections/HeroSection"
import AudienceSection from "./components/sections/DiscoveryDemoSection"
import WorkflowSection from "./components/sections/WorkflowSection"

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <HeroSection />
      <AudienceSection />
      
      <WorkflowSection />
    </div>
  )
}