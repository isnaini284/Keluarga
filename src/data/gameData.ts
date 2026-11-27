export interface AmanahItem {
  id: string;
  name: string;
  recipient: string;
  price: number;
  icon: string;
  paiNote: string;
}

export interface FamilyQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GameLevel {
  id: number;
  title: string;
  subtitle: string;
  difficultyLabel: string;
  memorizeSeconds: number;
  journeyTimeSeconds: number;
  gridCols: number;
  gridRows: number;
  ibuMoney: number;
  requiredItemIds: string[];
  distractorItemIds: string[];
  obstacleCount: {
    teman: number;
    kucing: number;
    genangan: number;
  };
  starCount: number;
  deliveryQuestion: FamilyQuestion;
  hikmahSummary: string;
}

export interface FamilyMemberInfo {
  id: string;
  role: string;
  arabicTerm: string;
  shortDesc: string;
  duties: string[];
  adabAnak: string;
  exampleSentence: string;
  icon: string;
}

export interface DeveloperProfile {
  name: string;
  title: string;
  school: string;
  email: string;
  greeting: string;
  bio: string;
  hobbies: string;
  favoriteFood: string;
  classMessage: string;
  avatarUrl: string;
}

export const GENERATED_IMAGES = {
  heroFamily: '/src/assets/images/hero_keluarga_bahagia_1795765495754.jpg',
  boyAvatar: '/src/assets/images/avatar_anak_sholeh_1795765496083.jpg',
  girlAvatar: '/src/assets/images/avatar_anak_sholehah_1795765496947.jpg',
  teacherProfile: '/src/assets/images/profil_pengembang_guru_1795765496997.jpg',
} as const;

export const AMANAH_ITEMS: AmanahItem[] = [
  {
    id: 'susu-adik',
    name: 'Susu Kotak',
    recipient: 'Untuk Adik',
    price: 4000,
    icon: '🥛',
    paiNote: 'Menyayangi adik adalah wujud kasih sayang dalam keluarga.',
  },
  {
    id: 'roti-ayah',
    name: 'Roti Tawar',
    recipient: 'Untuk Ayah',
    price: 5000,
    icon: '🍞',
    paiNote: 'Membantu kebutuhan Ayah sebelum berangkat bekerja.',
  },
  {
    id: 'gula-ibu',
    name: 'Gula Pasir',
    recipient: 'Untuk Ibu',
    price: 6000,
    icon: '🧂',
    paiNote: 'Ringan tangan membantu Ibu menyiapkan hidangan keluarga.',
  },
  {
    id: 'kurma-kakek',
    name: 'Kurma Manis',
    recipient: 'Untuk Kakek',
    price: 8000,
    icon: '🌴',
    paiNote: 'Membawa buah tangan saat silaturahmi kepada Kakek.',
  },
  {
    id: 'teh-nenek',
    name: 'Teh Melati',
    recipient: 'Untuk Nenek',
    price: 4000,
    icon: '🍵',
    paiNote: 'Menghormati dan membahagiakan Nenek dengan ucapan lembut.',
  },
  {
    id: 'buku-kakak',
    name: 'Buku Tulis',
    recipient: 'Untuk Kakak',
    price: 3000,
    icon: '📓',
    paiNote: 'Saling mendukung belajar bersama kakak di rumah.',
  },
  {
    id: 'buah-jeruk',
    name: 'Jeruk Segar',
    recipient: 'Untuk Keluarga',
    price: 7000,
    icon: '🍊',
    paiNote: 'Berbagi makanan sehat dan halal untuk seisi rumah.',
  },
  {
    id: 'sabun-mandi',
    name: 'Sabun Wangi',
    recipient: 'Untuk Rumah',
    price: 4000,
    icon: '🧼',
    paiNote: 'Kebersihan adalah sebagian dari iman di lingkungan keluarga.',
  },
  {
    id: 'minyak-goreng',
    name: 'Minyak Goreng',
    recipient: 'Untuk Ibu',
    price: 9000,
    icon: '🫗',
    paiNote: 'Menjalankan amanah belanja Ibu dengan penuh tanggung jawab.',
  },
  {
    id: 'permen-pengecoh',
    name: 'Permen Warna',
    recipient: 'Bukan Titipan',
    price: 2000,
    icon: '🍬',
    paiNote: 'Jangan membeli jajanan pribadi memakai uang amanah tanpa izin!',
  },
  {
    id: 'mainan-pengecoh',
    name: 'Kelereng',
    recipient: 'Bukan Titipan',
    price: 3000,
    icon: '🔮',
    paiNote: 'Amanah berarti hanya membeli barang yang dipesan orang tua.',
  },
  {
    id: 'kerupuk-pengecoh',
    name: 'Kerupuk Pedas',
    recipient: 'Bukan Titipan',
    price: 2000,
    icon: '🍘',
    paiNote: 'Fokus menunaikan pesan keluarga terlebih dahulu.',
  },
];

export const ROAD_QUESTIONS: FamilyQuestion[] = [
  {
    id: 'q1',
    question: 'Sebelum keluar rumah menjalankan pesan Ibu, apa yang sebaiknya kita ucapkan?',
    options: [
      'Mengucapkan salam dan mencium tangan orang tua',
      'Langsung lari keluar tanpa pamit',
      'Berteriak dari depan pagar saja',
    ],
    correctIndex: 0,
    explanation: 'Pamit dengan salam dan mencium tangan orang tua menunjukkan adab sopan santun anak sholeh.',
  },
  {
    id: 'q2',
    question: 'Kakek dan Nenek dalam silsilah keluarga adalah...',
    options: [
      'Tetangga sebelah rumah kita',
      'Orang tua dari Ayah atau Ibu kita',
      'Adik laki-laki dari ayah kita',
    ],
    correctIndex: 1,
    explanation: 'Kakek dan Nenek adalah orang tua dari Ayah atau Ibu yang wajib kita hormati.',
  },
  {
    id: 'q3',
    question: 'Bagaimana sikap yang benar ketika berbicara kepada Ayah dan Ibu?',
    options: [
      'Dengan suara keras agar terdengar jauh',
      'Dengan suara lembut, sopan, dan tidak membentak',
      'Sambil membelakangi dan bermain gim',
    ],
    correctIndex: 1,
    explanation: 'Allah memerintahkan kita berkata mulia dan lembut kepada kedua orang tua (QS. Al-Isra: 23).',
  },
  {
    id: 'q4',
    question: 'Ketika melihat Ibu kerepotan membereskan rumah, sikap anak sholeh adalah...',
    options: [
      'Pura-pura tidur di kamar',
      'Segera membantu dengan ikhlas sesuai kemampuan',
      'Membiarkannya karena itu tugas orang dewasa',
    ],
    correctIndex: 1,
    explanation: 'Tolong-menolong dalam kebaikan di rumah mempererat kasih sayang keluarga.',
  },
  {
    id: 'q5',
    question: 'Arti potongan doa "Waliwalidayya warhamhuma kama rabbayani shaghira" adalah...',
    options: [
      'Ampunilah kedua orang tuaku dan sayangilah mereka sebagaimana mereka menyayangiku di waktu kecil',
      'Berilah aku mainan baru setiap hari bersama teman-teman',
      'Mudahkanlah aku berlari cepat menuju warung',
    ],
    correctIndex: 0,
    explanation: 'Mendoakan kedua orang tua setiap hari adalah tanda bakti anak sholeh (Birrul Walidain).',
  },
  {
    id: 'q6',
    question: 'Jika ada uang sisa kembalian belanja titipan Ibu, apa yang harus dilakukan?',
    options: [
      'Disimpan diam-diam untuk membeli jajanan sendiri',
      'Dikembalikan seluruhnya dengan jujur kepada Ibu',
      'Diberikan kepada teman di jalan tanpa izin',
    ],
    correctIndex: 1,
    explanation: 'Mengembalikan uang kembalian dengan jujur adalah wujud sifat Shiddiq dan Amanah.',
  },
  {
    id: 'q7',
    question: 'Terhadap adik yang masih kecil dan belum bisa membaca, sikap kakak yang baik adalah...',
    options: [
      'Membimbing dan menyayanginya dengan sabar',
      'Mengejeknya karena belum lancar membaca',
      'Merebut mainannya saat Ibu tidak melihat',
    ],
    correctIndex: 0,
    explanation: 'Kakak harus menyayangi dan menjadi teladan yang baik bagi adik.',
  },
  {
    id: 'q8',
    question: 'Salah satu cara menjaga silaturahmi dengan keluarga besar (Paman, Bibi, Kakek, Nenek) adalah...',
    options: [
      'Berkunjung, menyapa ramah, dan mendoakan mereka',
      'Tidak mau menyapa saat bertemu di hari raya',
      'Mengunci pintu saat kerabat datang berkunjung',
    ],
    correctIndex: 0,
    explanation: 'Silaturahmi memperpanjang keberkahan rezeki dan menjaga kerukunan keluarga.',
  },
];

export const GAME_LEVELS: GameLevel[] = [
  {
    id: 1,
    title: 'Pagi Berkah di Rumah',
    subtitle: 'Belanja titipan untuk Ayah dan Adik',
    difficultyLabel: 'Level 1 · Pemula',
    memorizeSeconds: 18,
    journeyTimeSeconds: 50,
    gridCols: 9,
    gridRows: 5,
    ibuMoney: 10000,
    requiredItemIds: ['susu-adik', 'roti-ayah'],
    distractorItemIds: ['permen-pengecoh', 'teh-nenek', 'buku-kakak'],
    obstacleCount: { teman: 1, kucing: 0, genangan: 2 },
    starCount: 2,
    deliveryQuestion: {
      id: 'd1',
      question: 'Saat menyerahkan Roti dan Susu di rumah, ucapan terbaik anak sholeh adalah...',
      options: [
        'Mengucapkan salam, menyerahkan dengan tangan kanan, dan tersenyum',
        'Meletakkan belanjaan di teras lalu langsung main',
        'Meminta hadiah uang tambahan terlebih dahulu',
      ],
      correctIndex: 0,
      explanation: 'Menyerahkan barang dengan tangan kanan disertai salam dan senyum adalah adab mulia di keluarga.',
    },
    hikmahSummary: 'Membantu Ayah dan menyayangi Adik membuat suasana rumah penuh keberkahan.',
  },
  {
    id: 2,
    title: 'Titipan Masak Ibu',
    subtitle: 'Menjalankan amanah untuk Ibu, Kakak, dan Adik',
    difficultyLabel: 'Level 2 · Lancar',
    memorizeSeconds: 20,
    journeyTimeSeconds: 55,
    gridCols: 10,
    gridRows: 5,
    ibuMoney: 15000,
    requiredItemIds: ['gula-ibu', 'buku-kakak', 'susu-adik'],
    distractorItemIds: ['mainan-pengecoh', 'kurma-kakek', 'kerupuk-pengecoh'],
    obstacleCount: { teman: 2, kucing: 1, genangan: 2 },
    starCount: 3,
    deliveryQuestion: {
      id: 'd2',
      question: 'Mengapa kita harus segera pulang setelah membeli titipan Ibu?',
      options: [
        'Agar Ibu tidak menunggu lama dan amanah cepat tertunaikan',
        'Supaya bisa menonton televisi seharian',
        'Karena warungnya akan tutup selamanya',
      ],
      correctIndex: 0,
      explanation: 'Menepati waktu saat menjalankan pesan orang tua menunjukkan sikap disiplin dan berbakti.',
    },
    hikmahSummary: 'Anak yang cepat tanggap membantu Ibu dan Kakak disayang oleh Allah Swt.',
  },
  {
    id: 3,
    title: 'Silaturahmi Kakek & Nenek',
    subtitle: 'Membawa buah tangan untuk keluarga besar',
    difficultyLabel: 'Level 3 · Teliti',
    memorizeSeconds: 22,
    journeyTimeSeconds: 60,
    gridCols: 11,
    gridRows: 5,
    ibuMoney: 25000,
    requiredItemIds: ['kurma-kakek', 'teh-nenek', 'roti-ayah', 'sabun-mandi'],
    distractorItemIds: ['permen-pengecoh', 'mainan-pengecoh', 'gula-ibu', 'kerupuk-pengecoh'],
    obstacleCount: { teman: 2, kucing: 2, genangan: 3 },
    starCount: 3,
    deliveryQuestion: {
      id: 'd3',
      question: 'Ketika bertemu Kakek dan Nenek, sikap hormat yang kita lakukan adalah...',
      options: [
        'Mencium tangan beliau dengan lembut dan menyapa dengan ramah',
        'Langsung duduk di kursi tanpa menyapa',
        'Berbicara dengan nada tinggi sambil berlari',
      ],
      correctIndex: 0,
      explanation: 'Menghormati Kakek dan Nenek sama mulianya dengan menghormati Ayah dan Ibu.',
    },
    hikmahSummary: 'Silaturahmi dan membawa kebahagiaan bagi Kakek-Nenek mendatangkan pahala besar.',
  },
  {
    id: 4,
    title: 'Doa & Bakti Orang Tua',
    subtitle: 'Menjaga amanah di tengah godaan bermain',
    difficultyLabel: 'Level 4 · Tangguh',
    memorizeSeconds: 22,
    journeyTimeSeconds: 65,
    gridCols: 12,
    gridRows: 5,
    ibuMoney: 30000,
    requiredItemIds: ['minyak-goreng', 'buah-jeruk', 'teh-nenek', 'susu-adik'],
    distractorItemIds: ['permen-pengecoh', 'mainan-pengecoh', 'roti-ayah', 'buku-kakak'],
    obstacleCount: { teman: 3, kucing: 2, genangan: 3 },
    starCount: 4,
    deliveryQuestion: {
      id: 'd4',
      question: 'Kapan waktu terbaik anak sholeh mendoakan kedua orang tua?',
      options: [
        'Setiap selesai salat lima waktu dan setiap mengingat mereka',
        'Hanya setahun sekali saat ulang tahun',
        'Hanya ketika ingin dibelikan sepatu baru',
      ],
      correctIndex: 0,
      explanation: 'Doa anak sholeh yang tulus setiap selesai salat adalah amal jariyah bagi orang tua.',
    },
    hikmahSummary: 'Kejujuran menghitung amanah dan doa tulus untuk orang tua adalah mahkota anak sholeh.',
  },
  {
    id: 5,
    title: 'Mode Anak Sholeh Hebat',
    subtitle: 'Ujian hafalan 5 amanah keluarga & kejujuran penuh',
    difficultyLabel: 'Level 5 · Tantangan',
    memorizeSeconds: 25,
    journeyTimeSeconds: 70,
    gridCols: 13,
    gridRows: 5,
    ibuMoney: 50000,
    requiredItemIds: ['minyak-goreng', 'kurma-kakek', 'buah-jeruk', 'gula-ibu', 'buku-kakak'],
    distractorItemIds: ['permen-pengecoh', 'mainan-pengecoh', 'kerupuk-pengecoh', 'sabun-mandi'],
    obstacleCount: { teman: 3, kucing: 3, genangan: 4 },
    starCount: 4,
    deliveryQuestion: {
      id: 'd5',
      question: 'Jika terjadi perbedaan pendapat dengan Kakak atau Adik di rumah, solusi terbaiknya adalah...',
      options: [
        'Bermusyawarah dengan tenang dan saling memaafkan',
        'Marah dan tidak mau berbicara selama seminggu',
        'Mengadu dengan kata-kata kasar',
      ],
      correctIndex: 0,
      explanation: 'Keluarga sakinah dibangun dengan kasih sayang, musyawarah, dan sikap saling memaafkan.',
    },
    hikmahSummary: 'Masya Allah! Kamu berhasil menjaga amanah, berhitung jujur, dan berbakti kepada seluruh keluarga.',
  },
];

export const FAMILY_MEMBERS: FamilyMemberInfo[] = [
  {
    id: 'ayah',
    role: 'Ayah',
    arabicTerm: 'Al-Ab (الأب)',
    shortDesc: 'Pemimpin dan pelindung keluarga yang bekerja mencari rezeki halal.',
    duties: [
      'Menafkahi keluarga dengan rezeki yang halal dan berkah',
      'Membimbing keluarga dalam beribadah kepada Allah Swt.',
      'Menjaga keamanan dan ketenteraman rumah',
    ],
    adabAnak: 'Menyambut Ayah pulang dengan senyum, mendengarkan nasihatnya, dan tidak membantah.',
    exampleSentence: '“Assalamu’alaikum Ayah, sini tasnya kubawakan ya.”',
    icon: '👨🏽‍💼',
  },
  {
    id: 'ibu',
    role: 'Ibu',
    arabicTerm: 'Al-Umm (الأم)',
    shortDesc: 'Pilar kasih sayang yang merawat, mendidik, dan mendoakan anak-anaknya.',
    duties: [
      'Mengasuh dan mendidik anak-anak dengan penuh kesabaran',
      'Menyiapkan kebutuhan sehari-hari di rumah',
      'Menanamkan akhlak mulia dan doa sejak dini',
    ],
    adabAnak: 'Berbicara lemah lembut, ringan tangan membantu pekerjaan rumah, dan selalu meminta doa restu Ibu.',
    exampleSentence: '“Baik Ibu, aku siap membantu merapikan meja makan.”',
    icon: '👩🏽‍🏫',
  },
  {
    id: 'kakak',
    role: 'Kakak',
    arabicTerm: 'Al-Akh / Al-Ukht Al-Kabir',
    shortDesc: 'Saudara lebih tua yang menjadi contoh teladan bagi adik-adiknya.',
    duties: [
      'Membimbing adik dalam belajar dan mengaji',
      'Menjaga kerukunan saat orang tua sedang sibuk',
      'Memberikan contoh perkataan dan perbuatan baik',
    ],
    adabAnak: 'Menghormati kakak, tidak mengambil barangnya tanpa izin, dan mau belajar bersama.',
    exampleSentence: '“Kak, boleh ajari aku membaca doa sebelum belajar?”',
    icon: '🧑🏽‍🎓',
  },
  {
    id: 'adik',
    role: 'Adik',
    arabicTerm: 'Al-Akh / Al-Ukht As-Shaghir',
    shortDesc: 'Saudara lebih muda yang harus kita sayangi, bimbing, dan lindungi.',
    duties: [
      'Menghormati kakak dan patuh kepada orang tua',
      'Belajar berbagi mainan dan makanan dengan rukun',
      'Menjaga kebersihan barang milik sendiri',
    ],
    adabAnak: 'Menyayangi adik, tidak membuatnya menangis, dan sabar saat bermain bersamanya.',
    exampleSentence: '“Ayo Dik, kita berbagi roti dan membaca buku bersama.”',
    icon: '🧒🏽',
  },
  {
    id: 'kakek-nenek',
    role: 'Kakek & Nenek',
    arabicTerm: 'Al-Jadd wa Al-Jaddah',
    shortDesc: 'Orang tua dari Ayah atau Ibu kita yang penuh pengalaman hidup dan doa.',
    duties: [
      'Memberikan nasihat bijak kepada anak dan cucu',
      'Menjadi perekat tali silaturahmi keluarga besar',
      'Mendoakan keberkahan untuk generasi penerus',
    ],
    adabAnak: 'Rajin bersilaturahmi, berbicara pelan dan santun, serta membantu saat mereka kesulitan berjalan.',
    exampleSentence: '“Kakek dan Nenek sehat? Ini ada kurma dan teh hangat dari Ibu.”',
    icon: '👴🏽👵🏽',
  },
];

export const DOA_ORANG_TUA = {
  title: 'Doa untuk Kedua Orang Tua',
  arabic: 'اَللّٰهُمَّ اغْفِرْ لِيْ وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِيْ صَغِيْرَا',
  latin: 'Allahummaghfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.',
  meaning:
    '“Ya Allah, ampunilah dosaku dan dosa kedua orang tuaku, dan sayangilah mereka sebagaimana mereka telah menyayangiku di waktu aku masih kecil.”',
  audioText:
    'Allahummaghfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa. Artinya: Ya Allah, ampunilah dosaku dan dosa kedua orang tuaku, dan sayangilah mereka sebagaimana mereka menyayangiku di waktu kecil.',
};

export const DAILY_FAMILY_HABITS = [
  {
    id: 'habit-1',
    title: 'Membaca doa untuk kedua orang tua setelah salat',
    points: 'Bakti Utama',
  },
  {
    id: 'habit-2',
    title: 'Mengucapkan salam dan mencium tangan saat berangkat sekolah',
    points: 'Adab Santun',
  },
  {
    id: 'habit-3',
    title: 'Membantu merapikan tempat tidur dan mainan sendiri',
    points: 'Mandiri',
  },
  {
    id: 'habit-4',
    title: 'Berbicara lembut tanpa membentak kepada Ayah, Ibu, dan Saudara',
    points: 'Akhlak Mulia',
  },
  {
    id: 'habit-5',
    title: 'Menjalankan titipan atau pesan orang tua dengan jujur dan cepat',
    points: 'Amanah',
  },
];

export const DEFAULT_DEV_PROFILE: DeveloperProfile = {
  name: 'Isnaini',
  title: 'Guru Pendidikan Agama Islam & Budi Pekerti',
  school: 'SD Negeri Harapan Bangsa · Kelas 3',
  email: 'isnaini284@guru.sd.belajar.id',
  greeting: 'Assalamu’alaikum Anak-Anak Hebat Kelas 3!',
  bio: 'Halo! Ibu guru membuat permainan Amanah Keluarga ini supaya kalian bisa belajar tentang kasih sayang keluarga, adab kepada orang tua, dan sifat jujur sambil berpetualang seru seperti mengantar titipan Ibu ke warung.',
  hobbies: 'Membaca kisah teladan Nabi, menggambar ilustrasi cerita anak, dan berkebun di halaman sekolah.',
  favoriteFood: 'Soto ayam hangat dan buah kurma manis',
  classMessage:
    'Ingat selalu pesan Ibu Guru: Anak sholeh bukan hanya pintar di kelas, tetapi juga santun, jujur, dan suka menolong keluarganya di rumah!',
  avatarUrl: GENERATED_IMAGES.teacherProfile,
};

export function formatRupiah(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID');
}
