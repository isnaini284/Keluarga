import { useState, useEffect, type FormEvent } from 'react';
import { Pencil, RotateCcw, Check, BookHeart, Award, Smile, Utensils, Sparkles } from 'lucide-react';
import {
  DEFAULT_DEV_PROFILE,
  GENERATED_IMAGES,
  type DeveloperProfile,
} from '../data/gameData';
import { playPickup, playSuccess } from '../utils/sound';

interface DeveloperProfileViewProps {
  onGoToGame: () => void;
}

const PROFILE_STORAGE_KEY = 'amanah_keluarga_dev_profile_v2';

export function DeveloperProfileView({ onGoToGame }: DeveloperProfileViewProps) {
  const [profile, setProfile] = useState<DeveloperProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      return saved ? { ...DEFAULT_DEV_PROFILE, ...JSON.parse(saved) } : DEFAULT_DEV_PROFILE;
    } catch {
      return DEFAULT_DEV_PROFILE;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<DeveloperProfile>(profile);
  const [imgError, setImgError] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage errors
    }
  }, [profile]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    playSuccess();
    setProfile(draft);
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleReset = () => {
    playPickup();
    setProfile(DEFAULT_DEV_PROFILE);
    setDraft(DEFAULT_DEV_PROFILE);
    setIsEditing(false);
  };

  const learningPillars = [
    {
      num: '01',
      title: 'Mengenal Silsilah & Peran Keluarga',
      desc: 'Siswa Kelas 3 memahami kasih sayang dan peran Ayah, Ibu, Kakak, Adik, Kakek, serta Nenek.',
    },
    {
      num: '02',
      title: 'Berbakti kepada Orang Tua (Birrul Walidain)',
      desc: 'Membiasakan ucapan salam, suara lembut, dan sikap ringan tangan membantu pekerjaan rumah.',
    },
    {
      num: '03',
      title: 'Hafal & Mengamalkan Doa Orang Tua',
      desc: 'Melafalkan doa untuk kedua orang tua beserta artinya sebagai tanda syukur setiap hari.',
    },
    {
      num: '04',
      title: 'Jujur & Amanah dalam Kehidupan Nyata',
      desc: 'Berlatih amanah menjaga titipan dan jujur mengembalikan sisa uang belanja keluarga.',
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Header & Edit Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-sm font-medium text-emerald-700">
            Profil Pengembang Media Pembelajaran · SD Kelas 3
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-balance">
            Kenalan dengan Pembuat Game Amanah Keluarga
          </h1>
          <p className="text-slate-600 text-base">
            Halaman perkenalan ramah anak untuk siswa kelas 3 SD sekaligus ruang personalisasi bagi Bapak/Ibu Guru PAI.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <Check className="w-4 h-4" />
              Profil tersimpan
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setDraft(profile);
              setIsEditing((prev) => !prev);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            <span>{isEditing ? 'Tutup Editor' : 'Ubah Profil Guru'}</span>
          </button>
        </div>
      </div>

      {/* Optional Teacher Profile Editor */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Sesuaikan Identitas Guru / Pengembang
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan Awal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold text-slate-700">Nama Lengkap & Gelar</span>
              <input
                type="text"
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
              />
            </label>
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold text-slate-700">Peran / Jabatan</span>
              <input
                type="text"
                required
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
              />
            </label>
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold text-slate-700">Sekolah & Kelas</span>
              <input
                type="text"
                required
                value={draft.school}
                onChange={(e) => setDraft({ ...draft, school: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
              />
            </label>
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold text-slate-700">Email Belajar.id / Kontak</span>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
              />
            </label>
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold text-slate-700">Hobi Pengembang</span>
              <input
                type="text"
                value={draft.hobbies}
                onChange={(e) => setDraft({ ...draft, hobbies: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
              />
            </label>
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold text-slate-700">Makanan Kesukaan</span>
              <input
                type="text"
                value={draft.favoriteFood}
                onChange={(e) => setDraft({ ...draft, favoriteFood: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
              />
            </label>
          </div>

          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-slate-700">Sapaan & Cerita untuk Siswa Kelas 3</span>
            <textarea
              rows={2}
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </label>

          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-slate-700">Pesan Semangat Anak Sholeh</span>
            <textarea
              rows={2}
              value={draft.classMessage}
              onChange={(e) => setDraft({ ...draft, classMessage: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      )}

      {/* Kid-Friendly Developer Storybook Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Portrait Column */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between gap-6">
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-emerald-50 border border-emerald-100">
            {!imgError ? (
              <img
                src={profile.avatarUrl || GENERATED_IMAGES.teacherProfile}
                alt={`Ilustrasi ${profile.name}`}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-emerald-50 to-amber-50">
                <BookHeart className="w-14 h-14 text-emerald-700 mb-3" />
                <p className="font-display font-bold text-lg text-slate-900">{profile.name}</p>
                <p className="text-sm text-slate-600">{profile.school}</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <h2 className="font-display text-2xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-sm font-medium text-emerald-800">{profile.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
              <span>{profile.school}</span>
              {profile.email && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{profile.email}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Friendly Bio + Fun Facts for Grade 3 Kids */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-xl p-5 space-y-2">
              <p className="font-display text-lg font-bold text-emerald-950">{profile.greeting}</p>
              <p className="text-slate-700 text-base leading-relaxed">{profile.bio}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <Smile className="w-4 h-4" />
                  <span>Hobi Seru</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{profile.hobbies}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                  <Utensils className="w-4 h-4" />
                  <span>Makanan Favorit</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{profile.favoriteFood}</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <Sparkles className="w-4 h-4" />
                <span>Pesan Khusus untuk Siswa Kelas 3</span>
              </div>
              <p className="text-base font-medium text-slate-900 leading-relaxed">
                “{profile.classMessage}”
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500">
              Terinspirasi dari mekanik permainan edukatif Nusantara · Diadaptasi untuk PAI Kelas 3
            </p>
            <button
              type="button"
              onClick={onGoToGame}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Ayo Main Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Pedagogical Learning Map for SD Kelas 3 */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-emerald-700" />
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Peta Belajar Materi Keluarga (SD Kelas 3)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {learningPillars.map((pillar) => (
            <div
              key={pillar.num}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5"
            >
              <span className="font-mono-num text-xs font-semibold text-emerald-700">
                {pillar.num}
              </span>
              <h3 className="font-display text-base font-bold text-slate-900">{pillar.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
