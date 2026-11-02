import { useState, useEffect } from 'react';
import { BackgroundCanvas } from './components/3d/BackgroundCanvas';
import { CyberCursor } from './components/cursor/CyberCursor';
import { Navbar } from './components/navigation/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { SkillsSection } from './components/sections/SkillsSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { TimelineSection } from './components/sections/TimelineSection';
import { ContactSection } from './components/sections/ContactSection';
import { Footer } from './components/navigation/Footer';
import { CVDownloadModal } from './components/modals/CVDownloadModal';

export function App() {
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);

  useEffect(() => {
    // Force browser to always start at the top on every visit/reload
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const handleNavigate = (sectionId: string) => {
    const targetId = sectionId === 'contact' ? 'connect' : sectionId;
    const el = document.getElementById(targetId) || document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05060A] text-slate-100 selection:bg-[#00F5FF]/30 selection:text-[#00F5FF]">
      {/* Interactive Custom Cyber Cursor */}
      <CyberCursor />

      {/* Dynamic GPU-Accelerated Fluid WebGL Canvas Background */}
      <BackgroundCanvas />

      {/* Floating Glassmorphism Navigation Pill */}
      <Navbar
        onOpenCVModal={() => setIsCVModalOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Main Content Sections */}
      <main className="relative z-10 flex flex-col">
        {/* 01. Hero Centerpiece & Interactive 3D Holographic Monolith */}
        <HeroSection
          onOpenCVModal={() => setIsCVModalOpen(true)}
          onNavigate={handleNavigate}
        />

        {/* 02. About & Core Identity (Cyber-Grid Architecture) */}
        <AboutSection />

        {/* 03. Holographic Skill Matrix & 3D Constellation */}
        <SkillsSection />

        {/* 04. Project Matrix & 3D Spatial Gallery */}
        <ProjectsSection />

        {/* 05. Journey & Milestones (Interactive Timeline Wireframe) */}
        <TimelineSection />

        {/* 06. Command Footer & Terminal Contact Hub */}
        <ContactSection onOpenCVModal={() => setIsCVModalOpen(true)} />
      </main>

      {/* System Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Terminal CV Download Modal */}
      <CVDownloadModal
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
      />
    </div>
  );
}

export default App;
