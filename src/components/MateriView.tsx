import { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, Circle, ArrowRight, HeartHandshake, BookOpen } from 'lucide-react';
import {
  FAMILY_MEMBERS,
  DOA_ORANG_TUA,
  DAILY_FAMILY_HABITS,
  type FamilyMemberInfo,
} from '../data/gameData';
import { speakIndonesian, playPickup } from '../utils/sound';

interface MateriViewProps {
  onGoToGame: () => void;
}

const HABITS_STORAGE_KEY = 'amanah_keluarga_habits_v1';

export function MateriView({ onGoToGame }: MateriViewProps) {
  const [selectedMember, setSelectedMember] = useState<FamilyMemberInfo>(FAMILY_MEMBERS[0]);
  const [completedHabits, setCompletedHabits] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(HABITS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(completedHabits));
    } catch {
      // Ignore storage errors
    }
  }, [completedHabits]);

  const toggleHabit = (id: string) => {
    playPickup();
    setCompletedHabits((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-sm font-medium text-emerald-700">
            Pendidikan Agama Islam · SD Kelas 3 · Bab Kasih Sayang Keluarga
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-balance">
            Buku Saku Keluarga Anak Sholeh
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Pelajari peran anggota keluarga, cara bersikap santun di rumah, dan doa untuk kedua orang tua sebelum kamu memulai misi berbelanja amanah.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToGame}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto"
        >
          <span>Latihan Lewat Game</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Family Members Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-display text-xl font-bold">
            <HeartHandshake className="w-5 h-5 text-emerald-700" />
            <h2>01. Mengenal Anggota Keluarga</h2>
          </div>
          <p className="text-sm text-slate-600">
            Klik setiap anggota keluarga di bawah ini untuk melihat tugas dan adab baik kita kepada mereka.
          </p>

          <div className="space-y-2 pt-2">
            {FAMILY_MEMBERS.map((member) => {
              const isSelected = selectedMember.id === member.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    playPickup();
                    setSelectedMember(member);
                  }}
                  className={`w-full flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0" aria-hidden="true">
                      {member.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-base text-slate-900 truncate">
                        {member.role}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{member.arabicTerm}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium shrink-0 ${
                      isSelected ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {isSelected ? 'Sedang Dibuka' : 'Lihat'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl shrink-0">
                {selectedMember.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-700">{selectedMember.arabicTerm}</p>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  {selectedMember.role}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                speakIndonesian(
                  `${selectedMember.role}. ${selectedMember.shortDesc} Adab anak sholeh: ${selectedMember.adabAnak}`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Bacakan</span>
            </button>
          </div>

          <p className="text-slate-700 text-base leading-relaxed">{selectedMember.shortDesc}</p>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900">Peran dan Kebaikan di Rumah</h4>
            <ul className="space-y-2">
              {selectedMember.duties.map((duty, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="font-mono-num text-xs font-semibold text-emerald-700 mt-0.5 shrink-0">
                    0{idx + 1}.
                  </span>
                  <span>{duty}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-amber-900">Adab Anak Sholeh</p>
            <p className="text-sm text-slate-800 leading-relaxed">{selectedMember.adabAnak}</p>
            <p className="text-sm italic text-emerald-900 pt-1">
              Contoh ucapan: {selectedMember.exampleSentence}
            </p>
          </div>
        </div>
      </div>

      {/* Doa Kedua Orang Tua + Daily Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-300" />
              <h2 className="font-display text-xl font-bold">{DOA_ORANG_TUA.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => speakIndonesian(DOA_ORANG_TUA.audioText)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Dengarkan Bacaan</span>
            </button>
          </div>

          <p
            dir="rtl"
            className="text-2xl sm:text-3xl leading-loose text-right font-serif text-amber-100 py-2"
          >
            {DOA_ORANG_TUA.arabic}
          </p>

          <div className="space-y-2 border-t border-white/15 pt-4">
            <p className="text-sm font-semibold text-emerald-200">{DOA_ORANG_TUA.latin}</p>
            <p className="text-sm text-emerald-50/90 leading-relaxed">{DOA_ORANG_TUA.meaning}</p>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                02. Tantangan Harian di Rumah
              </h2>
              <p className="text-sm text-slate-600">
                Tandai kebiasaan baik yang sudah kamu lakukan hari ini!
              </p>
            </div>
            <span className="font-mono-num text-sm font-semibold text-emerald-800 shrink-0">
              {completedHabits.length}/{DAILY_FAMILY_HABITS.length} Selesai
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {DAILY_FAMILY_HABITS.map((habit) => {
              const checked = completedHabits.includes(habit.id);
              return (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    checked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {checked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-sm ${checked ? 'line-through text-emerald-800' : ''}`}>
                      {habit.title}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
                    {habit.points}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
