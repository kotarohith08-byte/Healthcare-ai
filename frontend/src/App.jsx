import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import ThreeDMedicalCanvas from './components/ThreeDMedicalCanvas';

import ChatbotModule from './components/ChatbotModule';
import SymptomModule from './components/SymptomModule';
import DiseaseExplorerModule from './components/DiseaseExplorerModule';
import MedicalKnowledgeModule from './components/MedicalKnowledgeModule';
import DatasetExplorerModule from './components/DatasetExplorerModule';
import MLPredictionModule from './components/MLPredictionModule';
import HealthEducationModule from './components/HealthEducationModule';
import UserProfileModule from './components/UserProfileModule';
import ConversationHistoryModule from './components/ConversationHistoryModule';
import AdminModule from './components/AdminModule';

export default function App() {
  const [activeTab, setActiveTab] = useState('chatbot');
  const [theme, setTheme] = useState('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [show3DCanvas, setShow3DCanvas] = useState(true);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#060c1a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          theme={theme}
          setTheme={setTheme}
          isCollapsed={isSidebarCollapsed}
          showDisclaimer={showDisclaimer}
          setShowDisclaimer={setShowDisclaimer}
        />

        {/* Global Medical Safety Disclaimer Banner */}
        <DisclaimerBanner
          isOpen={showDisclaimer}
          onClose={() => setShowDisclaimer(false)}
        />

        {/* Main Dashboard Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Optional Interactive 3D Medical Genomic Environment */}
          {show3DCanvas && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold text-cyan-400">Holographic 3D Genomic Visualizer:</span>
                <button
                  onClick={() => setShow3DCanvas(false)}
                  className="hover:text-slate-200 text-[11px] underline"
                >
                  Collapse 3D Canvas
                </button>
              </div>
              <ThreeDMedicalCanvas height="180px" />
            </div>
          )}

          {!show3DCanvas && (
            <div className="flex justify-end">
              <button
                onClick={() => setShow3DCanvas(true)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg"
              >
                + Expand 3D Genomic Canvas
              </button>
            </div>
          )}

          {/* Module Views Router */}
          {activeTab === 'chatbot' && <ChatbotModule />}
          {activeTab === 'symptoms' && <SymptomModule />}
          {activeTab === 'predictions' && <MLPredictionModule />}
          {activeTab === 'diseases' && <DiseaseExplorerModule />}
          {activeTab === 'knowledge' && <MedicalKnowledgeModule />}
          {activeTab === 'datasets' && <DatasetExplorerModule />}
          {activeTab === 'education' && <HealthEducationModule />}
          {activeTab === 'profile' && <UserProfileModule />}
          {activeTab === 'history' && (
            <ConversationHistoryModule
              onResumeSession={(sessionId) => setActiveTab('chatbot')}
            />
          )}
          {activeTab === 'admin' && <AdminModule />}
        </main>
      </div>
    </div>
  );
}
