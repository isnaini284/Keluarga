/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Navbar, type AppSection } from './components/Navbar';
import { HeroHomeView } from './components/HeroHomeView';
import { GameView } from './components/GameView';
import { MateriView } from './components/MateriView';
import { DeveloperProfileView } from './components/DeveloperProfileView';

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('beranda');

  const handleNavigate = (section: AppSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F7] text-[#16261F]">
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onStartMission={() => handleNavigate('game')}
      />

      <main className="flex-1">
        {activeSection === 'beranda' && (
          <HeroHomeView onNavigate={handleNavigate} />
        )}
        {activeSection === 'game' && <GameView />}
        {activeSection === 'materi' && (
          <MateriView onGoToGame={() => handleNavigate('game')} />
        )}
        {activeSection === 'profil' && (
          <DeveloperProfileView onGoToGame={() => handleNavigate('game')} />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>Amanah Keluarga · Media Belajar Pendidikan Agama Islam SD Kelas 3</p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => handleNavigate('game')}
              className="hover:text-emerald-800 cursor-pointer"
            >
              Main Game
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('materi')}
              className="hover:text-emerald-800 cursor-pointer"
            >
              Materi Keluarga
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('profil')}
              className="hover:text-emerald-800 cursor-pointer"
            >
              Profil Pengembang
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
