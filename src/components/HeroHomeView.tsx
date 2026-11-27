import { useState } from 'react';
import { ArrowRight, BookOpen, Gamepad2, UserCheck, Compass } from 'lucide-react';
import { GENERATED_IMAGES, DEFAULT_DEV_PROFILE, type DeveloperProfile } from '../data/gameData';
import type { AppSection } from './Navbar';

interface HeroHomeViewProps {
  onNavigate: (section: AppSection) => void;
}

const PROFILE_STORAGE_KEY = 'amanah_keluarga_dev_profile_v2';

export function HeroHomeView({ onNavigate }: HeroHomeViewProps) {
  const [heroImgError, setHeroImgError] = useState(false);
  const [devProfile] = useState<DeveloperProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      return saved ? { ...DEFAULT_DEV_PROFILE, ...JSON.parse(saved) } : DEFAULT_DEV_PROFILE;
    } catch {
      return DEFAULT_DEV_PROFILE;
    }
  });

  const quickHighlights: {
    id: string;
    num: string;
    title: string;
    desc: string;
    target: AppSection;
    icon: typeof Gamepad2;
  }[] = [
    {
      id: 'h1',
      num: '01',
      title: '5 Level Petualangan',
      desc: 'Dari mengantar titipan pagi hingga mode anak sholeh hebat.',
      target: 'game',
      icon: Gamepad2,
    },
    {
      id: 'h2',
      num: '02',
      title: 'Latih Ingatan & Jujur',
      desc: 'Hafalkan pesan Ibu, pilih barang amanah, dan hitung kembalian.',
      target: 'game',
      icon: Compass,
    },
    {
      id: 'h3',
      num: '03',
      title: 'Buku Saku Keluarga',
      desc: 'Kenali peran Ayah, Ibu, Kakak, Adik, Kakek, Nenek, serta doa harian.',
      target: 'materi',
      icon: BookOpen,
    },
    {
      id: 'h4',
      num: '04',
      title: 'Profil Pengembang',
      desc: 'Kenalan dengan Ibu/Bapak guru pembuat game untuk siswa Kelas 3 SD.',
      target: 'profil',
      icon: UserCheck,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* 2-Column Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6 py-2">
          <div className="space-y-3">
            <p className="text-sm font-medium text-emerald-700">
              Pendidikan Agama Islam · SD Kelas 3 · Materi Keluarga
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12] text-balance">
              Belajar Berbakti kepada Keluarga Sambil Berpetualang
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Bantu Rafi dan Aisyah menjalankan amanah Ibu ke Warung Berkah. Hafalkan titipan untuk keluarga, hadapi rintangan di jalan kampung, dan kembalikan uang sisa dengan jujur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('game')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-base font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              <span>Mulai Bermain</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('materi')}
              className="px-5 py-3 text-base font-semibold text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Baca Materi Keluarga
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-2">
            <span>Untuk Siswa SD Kelas 3</span>
            <span aria-hidden="true">·</span>
            <span>Birrul Walidain & Silaturahmi</span>
            <span aria-hidden="true">·</span>
            <span>Terintegrasi Profil Guru</span>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="lg:col-span-6">
          <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
            {!heroImgError ? (
              <img
                src={GENERATED_IMAGES.heroFamily}
                alt="Ilustrasi keluarga muslim Indonesia yang harmonis di depan rumah"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgError(true)}
                className="w-full h-full lg:h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-emerald-50 to-amber-50">
                <BookOpen className="w-12 h-12 text-emerald-700 mb-3" />
                <p className="font-display text-xl font-bold text-slate-900">
                  Keluarga Sakinah Penuh Kasih Sayang
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Media Belajar PAI SD Kelas 3
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4-Column Summary Strip below Hero */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {quickHighlights.map((item) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.target)}
              className="bg-white border border-slate-200 hover:border-emerald-400 rounded-xl p-5 text-left flex flex-col justify-between gap-4 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-num text-xs font-semibold text-emerald-700">
                  {item.num}
                </span>
                <IconComp className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {item.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </section>

      {/* Compact Developer Spotlight Row */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={devProfile.avatarUrl || GENERATED_IMAGES.teacherProfile}
            alt={devProfile.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div className="space-y-1">
            <p className="text-xs font-medium text-emerald-700">
              Profil Pengembang Media Pembelajaran
            </p>
            <h2 className="font-display text-xl font-bold text-slate-900">
              {devProfile.name}
            </h2>
            <p className="text-sm text-slate-600">
              {devProfile.school} · Dirancang khusus untuk pembelajaran PAI Kelas 3 SD.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('profil')}
          className="px-5 py-2.5 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Buka Profil Pengembang
        </button>
      </section>
    </div>
  );
}
