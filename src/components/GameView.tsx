import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Heart,
  Clock,
  Star,
  Volume2,
  VolumeX,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ShoppingBasket,
  Eye,
  CheckCircle2,
  AlertCircle,
  Trophy,
} from 'lucide-react';
import {
  AMANAH_ITEMS,
  GAME_LEVELS,
  ROAD_QUESTIONS,
  GENERATED_IMAGES,
  formatRupiah,
  type GameLevel,
  type FamilyQuestion,
  type AmanahItem,
} from '../data/gameData';
import {
  playStep,
  playPickup,
  playBump,
  playSuccess,
  playError,
  setSoundMuted,
  speakIndonesian,
} from '../utils/sound';

type GameState =
  | 'TITLE_MENU'
  | 'MEMORIZE_MISSION'
  | 'WALKING_JOURNEY'
  | 'CHECKOUT_DELIVERY'
  | 'ROUND_SUMMARY'
  | 'GAME_OVER';

type CharacterChoice = 'rafi' | 'aisyah';

interface ObstacleEntity {
  id: string;
  type: 'teman' | 'kucing' | 'genangan';
  row: number;
  col: number;
  dir: 1 | -1;
}

interface StarEntity {
  id: string;
  row: number;
  col: number;
  collected: boolean;
}

interface LevelProgress {
  stars: number;
  bestScore: number;
}

type CheckoutStep = 'PICK_ITEMS' | 'CHANGE_MONEY' | 'FAMILY_ADAB';

const PROGRESS_STORAGE_KEY = 'amanah_keluarga_progress_v1';

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildChangeOptions(correctChange: number): number[] {
  const candidates = new Set<number>([correctChange]);
  const offsets = [1000, -1000, 2000, -2000, 3000, 4000, 5000];
  for (const offset of offsets) {
    if (candidates.size >= 4) break;
    const val = correctChange + offset;
    if (val >= 0) {
      candidates.add(val);
    }
  }
  while (candidates.size < 4) {
    candidates.add(correctChange + candidates.size * 1000);
  }
  return shuffleArray(Array.from(candidates));
}

export function GameView() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [character, setCharacter] = useState<CharacterChoice>('rafi');
  const [selectedLevel, setSelectedLevel] = useState<GameLevel>(GAME_LEVELS[0]);
  const [muted, setMuted] = useState(false);

  const [progress, setProgress] = useState<Record<number, LevelProgress>>(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Active gameplay states
  const [memorizeLeft, setMemorizeLeft] = useState(18);
  const [journeyLeft, setJourneyLeft] = useState(50);
  const [hearts, setHearts] = useState(3);
  const [wisdomPoints, setWisdomPoints] = useState(0);
  const [playerPos, setPlayerPos] = useState({ row: 2, col: 0 });
  const [obstacles, setObstacles] = useState<ObstacleEntity[]>([]);
  const [starsOnRoad, setStarsOnRoad] = useState<StarEntity[]>([]);
  const [roadToast, setRoadToast] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<{
    question: FamilyQuestion;
    source: 'teman' | 'bintang';
    obstacleId?: string;
  } | null>(null);
  const [questionFeedback, setQuestionFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);

  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('PICK_ITEMS');
  const [shelfItems, setShelfItems] = useState<AmanahItem[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [peekNoteTimer, setPeekNoteTimer] = useState(0);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [changeOptions, setChangeOptions] = useState<number[]>([]);
  const [gameOverReason, setGameOverReason] = useState('');
  const [roundScore, setRoundScore] = useState({
    base: 0,
    timeBonus: 0,
    wisdomBonus: 0,
    total: 0,
    starsEarned: 3,
  });

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage errors
    }
  }, [progress]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
  };

  const showToast = useCallback((msg: string) => {
    setRoadToast(msg);
  }, []);

  useEffect(() => {
    if (!roadToast) return;
    const t = setTimeout(() => setRoadToast(null), 2600);
    return () => clearTimeout(t);
  }, [roadToast]);

  const requiredItems = useMemo(
    () =>
      selectedLevel.requiredItemIds
        .map((id) => AMANAH_ITEMS.find((item) => item.id === id))
        .filter((item): item is AmanahItem => Boolean(item)),
    [selectedLevel]
  );

  const totalRequiredCost = useMemo(
    () => requiredItems.reduce((sum, item) => sum + item.price, 0),
    [requiredItems]
  );

  // Initialize a level run
  const startLevel = useCallback((level: GameLevel) => {
    playPickup();
    setSelectedLevel(level);
    setMemorizeLeft(level.memorizeSeconds);
    setJourneyLeft(level.journeyTimeSeconds);
    setHearts(3);
    setWisdomPoints(0);
    setPlayerPos({ row: 2, col: 0 });
    setRoadToast(null);
    setActiveQuestion(null);
    setQuestionFeedback(null);
    setCheckoutStep('PICK_ITEMS');
    setCartIds([]);
    setPeekNoteTimer(0);
    setCheckoutError(null);
    setGameOverReason('');

    // Build obstacles cleanly across middle columns (1 .. gridCols - 2)
    const builtObstacles: ObstacleEntity[] = [];
    const usedCoords = new Set<string>(['2,0', `2,${level.gridCols - 1}`]);

    const placeEntity = (
      type: ObstacleEntity['type'],
      count: number,
      preferredRows: number[]
    ) => {
      let placed = 0;
      let attempts = 0;
      while (placed < count && attempts < 100) {
        attempts++;
        const col = 1 + Math.floor(Math.random() * (level.gridCols - 2));
        const row = preferredRows[Math.floor(Math.random() * preferredRows.length)];
        const key = `${row},${col}`;
        // Ensure we don't block col 1 row 2 completely at start
        if (usedCoords.has(key) || (col === 1 && row === 2)) continue;
        // Avoid filling an entire column with static genangan
        if (type === 'genangan') {
          const staticInCol = builtObstacles.filter(
            (o) => o.type === 'genangan' && o.col === col
          ).length;
          if (staticInCol >= 2) continue;
        }
        usedCoords.add(key);
        builtObstacles.push({
          id: `${type}-${placed}-${attempts}`,
          type,
          row,
          col,
          dir: Math.random() > 0.5 ? 1 : -1,
        });
        placed++;
      }
    };

    placeEntity('teman', level.obstacleCount.teman, [1, 2, 3]);
    placeEntity('kucing', level.obstacleCount.kucing, [0, 2, 4]);
    placeEntity('genangan', level.obstacleCount.genangan, [0, 1, 3, 4]);
    setObstacles(builtObstacles);

    // Place Bintang Hikmah collectibles
    const builtStars: StarEntity[] = [];
    let starsPlaced = 0;
    let starAttempts = 0;
    while (starsPlaced < level.starCount && starAttempts < 80) {
      starAttempts++;
      const col = 1 + Math.floor(Math.random() * (level.gridCols - 2));
      const row = Math.floor(Math.random() * level.gridRows);
      const key = `${row},${col}`;
      if (usedCoords.has(key)) continue;
      usedCoords.add(key);
      builtStars.push({
        id: `star-${starsPlaced}`,
        row,
        col,
        collected: false,
      });
      starsPlaced++;
    }
    setStarsOnRoad(builtStars);

    // Prepare shuffled shelf items
    const allShelfIds = [...level.requiredItemIds, ...level.distractorItemIds];
    const items = allShelfIds
      .map((id) => AMANAH_ITEMS.find((i) => i.id === id))
      .filter((i): i is AmanahItem => Boolean(i));
    setShelfItems(shuffleArray(items));

    setGameState('MEMORIZE_MISSION');
  }, []);

  // Phase 1: Memorize timer
  useEffect(() => {
    if (gameState !== 'MEMORIZE_MISSION') return;
    if (memorizeLeft <= 0) {
      playPickup();
      setGameState('WALKING_JOURNEY');
      return;
    }
    const timer = setTimeout(() => setMemorizeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameState, memorizeLeft]);

  // Phase 2: Walking Journey timer
  useEffect(() => {
    if (gameState !== 'WALKING_JOURNEY' || activeQuestion) return;
    if (journeyLeft <= 0) {
      playError();
      setGameOverReason('Waktu perjalanan menuju Warung Berkah habis. Ayo coba lebih sigap lagi!');
      setGameState('GAME_OVER');
      return;
    }
    const timer = setTimeout(() => setJourneyLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameState, journeyLeft, activeQuestion]);

  // Patrol movement for Teman and Kucing
  useEffect(() => {
    if (gameState !== 'WALKING_JOURNEY' || activeQuestion) return;
    const interval = setInterval(() => {
      setObstacles((prev) =>
        prev.map((obs) => {
          if (obs.type === 'genangan') return obs;
          let nextRow = obs.row + obs.dir;
          let nextDir = obs.dir;
          if (nextRow < 0 || nextRow >= selectedLevel.gridRows) {
            nextDir = (obs.dir * -1) as 1 | -1;
            nextRow = obs.row + nextDir;
          }
          return { ...obs, row: nextRow, dir: nextDir };
        })
      );
    }, 1150);
    return () => clearInterval(interval);
  }, [gameState, activeQuestion, selectedLevel.gridRows]);

  // Peek note timer during checkout
  useEffect(() => {
    if (peekNoteTimer <= 0) return;
    const t = setTimeout(() => setPeekNoteTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [peekNoteTimer]);

  const triggerLossHeart = useCallback(
    (reasonIfZero: string) => {
      setHearts((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          playError();
          setGameOverReason(reasonIfZero);
          setGameState('GAME_OVER');
        }
        return next;
      });
    },
    []
  );

  // Move character on 2D grid
  const movePlayer = useCallback(
    (dRow: number, dCol: number) => {
      if (gameState !== 'WALKING_JOURNEY' || activeQuestion) return;

      const targetRow = playerPos.row + dRow;
      const targetCol = playerPos.col + dCol;

      if (
        targetRow < 0 ||
        targetRow >= selectedLevel.gridRows ||
        targetCol < 0 ||
        targetCol >= selectedLevel.gridCols
      ) {
        return;
      }

      // Check obstacle at target cell
      const hitObstacle = obstacles.find(
        (o) => o.row === targetRow && o.col === targetCol
      );

      if (hitObstacle) {
        if (hitObstacle.type === 'genangan') {
          playBump();
          setJourneyLeft((t) => Math.max(1, t - 3));
          showToast('Ada genangan air! Jalan memutar (-3 detik).');
          return;
        }

        if (hitObstacle.type === 'kucing') {
          playBump();
          const pushedCol = Math.max(0, playerPos.col - 2);
          setPlayerPos({ row: playerPos.row, col: pushedCol });
          showToast('Hati-hati ada hewan penjaga! Kamu mundur 2 langkah.');
          triggerLossHeart('Kesabaranmu habis karena menabrak rintangan di jalan. Yuk ulangi!');
          return;
        }

        if (hitObstacle.type === 'teman') {
          playBump();
          const randomQ =
            ROAD_QUESTIONS[Math.floor(Math.random() * ROAD_QUESTIONS.length)];
          setQuestionFeedback(null);
          setActiveQuestion({
            question: randomQ,
            source: 'teman',
            obstacleId: hitObstacle.id,
          });
          setPlayerPos({ row: targetRow, col: targetCol });
          return;
        }
      }

      playStep();
      setPlayerPos({ row: targetRow, col: targetCol });

      // Check star pickup
      const hitStar = starsOnRoad.find(
        (s) => !s.collected && s.row === targetRow && s.col === targetCol
      );
      if (hitStar) {
        playPickup();
        setStarsOnRoad((prev) =>
          prev.map((s) => (s.id === hitStar.id ? { ...s, collected: true } : s))
        );
        setWisdomPoints((w) => w + 10);
        const randomQ =
          ROAD_QUESTIONS[Math.floor(Math.random() * ROAD_QUESTIONS.length)];
        setQuestionFeedback(null);
        setActiveQuestion({
          question: randomQ,
          source: 'bintang',
        });
        return;
      }

      // Check Goal reached: Warung Berkah at (row: 2, col: gridCols - 1)
      if (targetRow === 2 && targetCol === selectedLevel.gridCols - 1) {
        playSuccess();
        setGameState('CHECKOUT_DELIVERY');
      }
    },
    [
      gameState,
      activeQuestion,
      playerPos,
      selectedLevel.gridRows,
      selectedLevel.gridCols,
      obstacles,
      starsOnRoad,
      showToast,
      triggerLossHeart,
    ]
  );

  // Keyboard listener for Arrow Keys and WASD
  useEffect(() => {
    if (gameState !== 'WALKING_JOURNEY' || activeQuestion) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer(-1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer(1, 0);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer(0, -1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer(0, 1);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, activeQuestion, movePlayer]);

  // Handle answering road question
  const handleAnswerRoadQuestion = (optionIndex: number) => {
    if (!activeQuestion || questionFeedback) return;
    const isCorrect = optionIndex === activeQuestion.question.correctIndex;

    if (isCorrect) {
      playSuccess();
      setWisdomPoints((w) => w + 15);
      setQuestionFeedback({
        isCorrect: true,
        message: `Benar sekali! ${activeQuestion.question.explanation}`,
      });
      if (activeQuestion.source === 'teman' && activeQuestion.obstacleId) {
        setObstacles((prev) =>
          prev.filter((o) => o.id !== activeQuestion.obstacleId)
        );
      }
    } else {
      playError();
      setQuestionFeedback({
        isCorrect: false,
        message: `Kurang tepat. ${activeQuestion.question.explanation}`,
      });
      if (activeQuestion.source === 'teman') {
        setPlayerPos((p) => ({ ...p, col: Math.max(0, p.col - 1) }));
        triggerLossHeart('Kamu tergoda bermain di jalan dan lupa pesan Ibu.');
      }
    }
  };

  const closeQuestionModal = () => {
    setActiveQuestion(null);
    setQuestionFeedback(null);
    // If player happened to land on goal after answering
    if (playerPos.row === 2 && playerPos.col === selectedLevel.gridCols - 1) {
      playSuccess();
      setGameState('CHECKOUT_DELIVERY');
    }
  };

  // Checkout handlers
  const toggleCartItem = (itemId: string) => {
    playStep();
    setCheckoutError(null);
    setCartIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleConfirmCart = () => {
    const requiredSet = new Set(selectedLevel.requiredItemIds);
    const pickedSet = new Set(cartIds);

    const hasAllRequired = selectedLevel.requiredItemIds.every((id) =>
      pickedSet.has(id)
    );
    const hasExtra = cartIds.some((id) => !requiredSet.has(id));

    if (!hasAllRequired || hasExtra) {
      playError();
      if (hasExtra) {
        setCheckoutError(
          'Ada barang di keranjang yang bukan titipan Ibu! Ingat amanah keluarga, ya.'
        );
      } else {
        setCheckoutError(
          `Masih ada titipan Ibu yang belum masuk keranjang (${cartIds.length}/${selectedLevel.requiredItemIds.length} barang).`
        );
      }
      triggerLossHeart(
        'Barang belanjaan tidak sesuai pesan Ibu. Ayo latih ingatan dan coba lagi!'
      );
      return;
    }

    playSuccess();
    setCheckoutError(null);
    const correctChange = selectedLevel.ibuMoney - totalRequiredCost;
    setChangeOptions(buildChangeOptions(correctChange));
    setCheckoutStep('CHANGE_MONEY');
  };

  const handleUsePeekHint = () => {
    if (wisdomPoints < 10 || peekNoteTimer > 0) return;
    playPickup();
    setWisdomPoints((w) => w - 10);
    setPeekNoteTimer(5);
  };

  const handleSelectChange = (chosenAmount: number) => {
    const correctChange = selectedLevel.ibuMoney - totalRequiredCost;
    if (chosenAmount === correctChange) {
      playSuccess();
      setCheckoutError(null);
      setCheckoutStep('FAMILY_ADAB');
    } else {
      playError();
      setCheckoutError(
        `Hitungan kembalian belum tepat. Coba hitung lagi: ${formatRupiah(
          selectedLevel.ibuMoney
        )} dikurangi ${formatRupiah(totalRequiredCost)}.`
      );
      triggerLossHeart('Salah menghitung uang kembalian amanah Ibu!');
    }
  };

  const handleAnswerDeliveryAdab = (optionIndex: number) => {
    if (optionIndex === selectedLevel.deliveryQuestion.correctIndex) {
      playSuccess();
      const base = selectedLevel.requiredItemIds.length * 100;
      const timeBonus = journeyLeft * 4;
      const wisdomBonus = wisdomPoints * 3;
      const total = base + timeBonus + wisdomBonus;
      const starsEarned = hearts >= 3 ? 3 : hearts === 2 ? 2 : 1;

      setRoundScore({
        base,
        timeBonus,
        wisdomBonus,
        total,
        starsEarned,
      });

      setProgress((prev) => {
        const current = prev[selectedLevel.id];
        return {
          ...prev,
          [selectedLevel.id]: {
            stars: Math.max(current?.stars ?? 0, starsEarned),
            bestScore: Math.max(current?.bestScore ?? 0, total),
          },
        };
      });

      setGameState('ROUND_SUMMARY');
    } else {
      playError();
      setCheckoutError(
        `Kurang tepat. ${selectedLevel.deliveryQuestion.explanation}`
      );
      triggerLossHeart('Adab saat menyerahkan barang di rumah masih perlu diperbaiki.');
    }
  };

  const activePortrait =
    character === 'rafi' ? GENERATED_IMAGES.boyAvatar : GENERATED_IMAGES.girlAvatar;
  const activeName = character === 'rafi' ? 'Rafi' : 'Aisyah';

  const totalStarsCollected = Object.values(progress).reduce(
    (sum, p) => sum + p.stars,
    0
  );

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* STATE 1: TITLE_MENU */}
      {gameState === 'TITLE_MENU' && (
        <div className="space-y-10">
          {/* Header & Character Pick */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-emerald-700">
                  Game Edukasi PAI SD Kelas 3 · Terinspirasi dari Emak Ke Warung
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-balance">
                  Petualangan Amanah Keluarga
                </h1>
                <p className="text-slate-600 text-base leading-relaxed">
                  Hafalkan titipan Ibu untuk Ayah, Kakek, Nenek, Kakak, dan Adik. Susuri jalan kampung, hindari godaan bermain, belanja dengan jujur, dan hitung kembaliannya!
                </p>
              </div>

              {/* Cara Bermain 4 Langkah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { n: '01', t: 'Hafalkan Amanah', d: 'Catat dalam ingatan barang titipan & uang dari Ibu.' },
                  { n: '02', t: 'Susuri Jalan Kampung', d: 'Gunakan panah atau tombol arah. Kumpulkan Bintang Hikmah.' },
                  { n: '03', t: 'Belanja Jujur', d: 'Pilih hanya titipan keluarga di rak Warung Berkah.' },
                  { n: '04', t: 'Hitung & Berbakti', d: 'Kembalikan uang sisa dengan jujur dan jawab adab keluarga.' },
                ].map((step) => (
                  <div
                    key={step.n}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                  >
                    <p className="font-mono-num text-xs font-semibold text-emerald-700">
                      {step.n}. {step.t}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Character Selector */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Pilih Tokoh Anak Sholeh
                </h2>
                <span className="font-mono-num text-xs font-semibold text-amber-700">
                  Total Bintang: {totalStarsCollected}/15
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    id: 'rafi' as CharacterChoice,
                    name: 'Rafi',
                    role: 'Anak Sholeh',
                    img: GENERATED_IMAGES.boyAvatar,
                  },
                  {
                    id: 'aisyah' as CharacterChoice,
                    name: 'Aisyah',
                    role: 'Anak Sholehah',
                    img: GENERATED_IMAGES.girlAvatar,
                  },
                ].map((c) => {
                  const active = character === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        playPickup();
                        setCharacter(c.id);
                      }}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                          : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-white mb-2.5">
                        <img
                          src={c.img}
                          alt={c.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-display font-bold text-base text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-600">{c.role}</p>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => startLevel(selectedLevel)}
                className="w-full py-3 px-5 bg-emerald-700 hover:bg-emerald-800 text-white text-base font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Mulai Level {selectedLevel.id}: {selectedLevel.title}
              </button>
            </div>
          </div>

          {/* Level Selection Grid */}
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Pilih Level Petualangan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {GAME_LEVELS.map((lvl) => {
                const isSelected = selectedLevel.id === lvl.id;
                const lvlProgress = progress[lvl.id];
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      playStep();
                      setSelectedLevel(lvl);
                    }}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-emerald-700">{lvl.difficultyLabel}</p>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        {lvl.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{lvl.subtitle}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-0.5" aria-label={`Bintang ${lvlProgress?.stars ?? 0} dari 3`}>
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              (lvlProgress?.stars ?? 0) >= s
                                ? 'text-amber-500 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-mono-num text-xs text-slate-500">
                        {lvl.requiredItemIds.length} Amanah
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: MEMORIZE_MISSION */}
      {gameState === 'MEMORIZE_MISSION' && (
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <img
                src={activePortrait}
                alt={activeName}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <p className="text-xs font-medium text-emerald-700">{selectedLevel.difficultyLabel}</p>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  Pesan Ibu untuk {activeName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <Clock className="w-4 h-4 text-amber-700" />
              <span className="font-mono-num text-sm font-bold text-amber-900">
                Hafalkan: {memorizeLeft} detik
              </span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
              “Nak {activeName}, tolong belikan titipan keluarga di Warung Berkah ya. Jangan lupa hafalkan daftarnya dan kembalikan uang sisanya dengan jujur!”
            </p>
            <button
              type="button"
              onClick={() =>
                speakIndonesian(
                  `Nak ${activeName}, tolong belikan ${requiredItems
                    .map((i) => `${i.name} ${i.recipient}`)
                    .join(', ')}. Ibu beri uang ${formatRupiah(selectedLevel.ibuMoney)}.`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg shrink-0 cursor-pointer hover:bg-emerald-50"
            >
              <Volume2 className="w-4 h-4" />
              <span>Dengar</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Daftar Amanah Keluarga ({requiredItems.length} Barang)
              </h3>
              <span className="font-mono-num text-sm font-bold text-emerald-800">
                Uang dari Ibu: {formatRupiah(selectedLevel.ibuMoney)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {requiredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      {item.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{item.name}</p>
                      <p className="text-xs text-emerald-700 font-medium">{item.recipient}</p>
                    </div>
                  </div>
                  <span className="font-mono-num text-sm font-semibold text-slate-700">
                    {formatRupiah(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setGameState('TITLE_MENU')}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Kembali ke Menu
            </button>
            <button
              type="button"
              onClick={() => {
                playPickup();
                setGameState('WALKING_JOURNEY');
              }}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Aku Sudah Hafal! Berangkat
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: WALKING_JOURNEY */}
      {gameState === 'WALKING_JOURNEY' && (
        <div className="space-y-5">
          {/* Unobtrusive Top HUD */}
          <div className="bg-white border border-slate-200 rounded-2xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-5 text-sm">
              <span className="font-display font-bold text-slate-900">
                Level {selectedLevel.id} · {selectedLevel.title}
              </span>

              <div className="flex items-center gap-1.5" aria-label={`Kesabaran ${hearts} dari 3`}>
                {[1, 2, 3].map((h) => (
                  <Heart
                    key={h}
                    className={`w-4 h-4 ${
                      hearts >= h ? 'text-rose-600 fill-rose-500' : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="font-mono-num text-xs font-semibold text-slate-700 ml-1">
                  Nyawa: {hearts}/3
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                <span
                  className={`font-mono-num text-xs font-semibold ${
                    journeyLeft <= 12 ? 'text-rose-700' : 'text-slate-800'
                  }`}
                >
                  Waktu: {journeyLeft}d
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span className="font-mono-num text-xs font-semibold text-slate-800">
                  Poin Hikmah: {wisdomPoints}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => startLevel(selectedLevel)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulangi</span>
              </button>
            </div>
          </div>

          {/* Feedback Toast */}
          {roadToast && (
            <div
              role="status"
              className="bg-amber-50 border border-amber-300 text-amber-950 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{roadToast}</span>
            </div>
          )}

          {/* 2D Village Path Grid Stage */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <span>
                Ketuk petak di sebelah {activeName} atau pakai tombol panah untuk menuju Warung Berkah.
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <span>🧒 Teman (tanya adab)</span>
                <span>🐕 Hewan penjaga (mundur)</span>
                <span>💧 Genangan (-3 detik)</span>
                <span>⭐ Bintang Hikmah (+poin)</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div
                className="grid gap-1.5 mx-auto min-w-[540px]"
                style={{
                  gridTemplateColumns: `repeat(${selectedLevel.gridCols}, minmax(46px, 1fr))`,
                }}
              >
                {Array.from({ length: selectedLevel.gridRows }).map((_, rIdx) =>
                  Array.from({ length: selectedLevel.gridCols }).map((__, cIdx) => {
                    const isStart = rIdx === 2 && cIdx === 0;
                    const isGoal = rIdx === 2 && cIdx === selectedLevel.gridCols - 1;
                    const isPlayer = playerPos.row === rIdx && playerPos.col === cIdx;
                    const obstacle = obstacles.find(
                      (o) => o.row === rIdx && o.col === cIdx
                    );
                    const star = starsOnRoad.find(
                      (s) => !s.collected && s.row === rIdx && s.col === cIdx
                    );

                    const isAdjacent =
                      Math.abs(playerPos.row - rIdx) + Math.abs(playerPos.col - cIdx) === 1;

                    return (
                      <button
                        key={`${rIdx}-${cIdx}`}
                        type="button"
                        disabled={!isAdjacent}
                        onClick={() => {
                          if (isAdjacent) {
                            movePlayer(rIdx - playerPos.row, cIdx - playerPos.col);
                          }
                        }}
                        aria-label={`Petak baris ${rIdx + 1} kolom ${cIdx + 1}`}
                        className={`h-14 sm:h-16 rounded-xl border flex flex-col items-center justify-center relative transition-transform duration-150 ${
                          isPlayer
                            ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm scale-[1.03]'
                            : isGoal
                            ? 'bg-amber-100 border-amber-400 text-amber-950'
                            : isStart
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : isAdjacent
                            ? 'bg-emerald-50/40 border-emerald-300 hover:bg-emerald-50 cursor-pointer'
                            : 'bg-slate-50/80 border-slate-200/80'
                        }`}
                      >
                        {isPlayer ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={activePortrait}
                              alt={activeName}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover border border-white"
                            />
                            <span className="text-[10px] font-bold leading-tight mt-0.5">
                              {activeName}
                            </span>
                          </div>
                        ) : obstacle ? (
                          <span className="text-2xl" aria-hidden="true">
                            {obstacle.type === 'teman'
                              ? '🧒'
                              : obstacle.type === 'kucing'
                              ? '🐕'
                              : '💧'}
                          </span>
                        ) : star ? (
                          <span className="text-2xl" aria-hidden="true">
                            ⭐
                          </span>
                        ) : isGoal ? (
                          <div className="flex flex-col items-center">
                            <span className="text-lg" aria-hidden="true">
                              🏪
                            </span>
                            <span className="text-[10px] font-bold leading-tight">
                              Warung
                            </span>
                          </div>
                        ) : isStart ? (
                          <div className="flex flex-col items-center">
                            <span className="text-lg" aria-hidden="true">
                              🏠
                            </span>
                            <span className="text-[10px] font-bold leading-tight">
                              Rumah
                            </span>
                          </div>
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Touch D-Pad Controls (>=48px) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-600">
                Posisi saat ini: Kolom {playerPos.col + 1} dari {selectedLevel.gridCols}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => movePlayer(0, -1)}
                  className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-800 flex items-center justify-center border border-slate-300 cursor-pointer"
                  aria-label="Jalan ke kiri"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => movePlayer(-1, 0)}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-800 flex items-center justify-center border border-slate-300 cursor-pointer"
                    aria-label="Jalan ke atas"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePlayer(1, 0)}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-800 flex items-center justify-center border border-slate-300 cursor-pointer"
                    aria-label="Jalan ke bawah"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => movePlayer(0, 1)}
                  className="w-12 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center border border-emerald-800 cursor-pointer"
                  aria-label="Jalan ke kanan"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Road Question Modal (Teman Mengajak Main / Bintang Hikmah) */}
          {activeQuestion && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-lg">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-emerald-700">
                    {activeQuestion.source === 'teman'
                      ? 'Teman Mengajak Main! Jawab pertanyaan ini untuk tetap fokus:'
                      : 'Bintang Hikmah Keluarga! (+15 Poin jika benar)'}
                  </p>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {activeQuestion.question.question}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {activeQuestion.question.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={Boolean(questionFeedback)}
                      onClick={() => handleAnswerRoadQuestion(idx)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                        questionFeedback
                          ? idx === activeQuestion.question.correctIndex
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                          : 'bg-white border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {questionFeedback && (
                  <div
                    className={`p-4 rounded-xl border text-sm space-y-3 ${
                      questionFeedback.isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {questionFeedback.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                      )}
                      <p>{questionFeedback.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={closeQuestionModal}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg cursor-pointer"
                    >
                      Lanjutkan Perjalanan
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATE 4: CHECKOUT_DELIVERY */}
      {gameState === 'CHECKOUT_DELIVERY' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status bar */}
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-emerald-700">
                Warung Berkah Keluarga · Level {selectedLevel.id}
              </p>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                {checkoutStep === 'PICK_ITEMS'
                  ? 'Pilih Barang Titipan Ibu'
                  : checkoutStep === 'CHANGE_MONEY'
                  ? 'Hitung Uang Kembalian dengan Jujur'
                  : 'Serahkan Amanah di Rumah'}
              </h2>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="font-mono-num font-semibold text-rose-700">
                Nyawa: {hearts}/3
              </span>
              <span className="font-mono-num font-semibold text-amber-800">
                Poin Hikmah: {wisdomPoints}
              </span>
            </div>
          </div>

          {checkoutError && (
            <div className="bg-rose-50 border border-rose-300 text-rose-950 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          {/* Sub-step 1: Pick Items from Shelf */}
          {checkoutStep === 'PICK_ITEMS' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  Klik barang di rak yang dipesan oleh Ibu tadi. Hati-hati barang pengecoh!
                </p>
                <button
                  type="button"
                  disabled={wisdomPoints < 10 || peekNoteTimer > 0}
                  onClick={handleUsePeekHint}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    wisdomPoints >= 10 && peekNoteTimer === 0
                      ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 cursor-pointer'
                      : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>
                    {peekNoteTimer > 0
                      ? `Catatan Terbuka (${peekNoteTimer}d)`
                      : 'Intip Catatan Ibu (-10 Poin)'}
                  </span>
                </button>
              </div>

              {peekNoteTimer > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <p className="text-xs font-bold text-amber-900">Catatan Pesanan Ibu:</p>
                  <p className="text-sm text-slate-800">
                    {requiredItems.map((i) => `${i.name} (${i.recipient})`).join(' · ')}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {shelfItems.map((item) => {
                  const inCart = cartIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCartItem(item.id)}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                        inCart
                          ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                          : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-3xl" aria-hidden="true">
                          {item.icon}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            inCart ? 'text-emerald-800' : 'text-slate-400'
                          }`}
                        >
                          {inCart ? 'Dipilih' : 'Pilih'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{item.name}</p>
                        <p className="font-mono-num text-xs text-slate-600 mt-0.5">
                          {formatRupiah(item.price)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <ShoppingBasket className="w-5 h-5 text-emerald-700" />
                  <span>
                    Keranjang: <strong className="font-mono-num">{cartIds.length}</strong> barang
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playStep();
                      setCartIds([]);
                      setCheckoutError(null);
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Kosongkan
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCart}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer"
                  >
                    Bayar di Kasir
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-step 2: Honest Change Calculation */}
          {checkoutStep === 'CHANGE_MONEY' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-medium text-emerald-800">Uang Amanah dari Ibu</p>
                  <p className="font-mono-num text-2xl font-bold text-emerald-950 mt-1">
                    {formatRupiah(selectedLevel.ibuMoney)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-medium text-slate-600">Total Harga Titipan Keluarga</p>
                  <p className="font-mono-num text-2xl font-bold text-slate-900 mt-1">
                    {formatRupiah(totalRequiredCost)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Sebagai anak yang jujur dan amanah, berapa uang kembalian yang harus dikembalikan kepada Ibu?
                </h3>
                <div className="grid grid-cols-2 gap-3.5">
                  {changeOptions.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleSelectChange(amount)}
                      className="p-4 rounded-xl border border-slate-300 bg-white hover:bg-emerald-50 hover:border-emerald-600 font-mono-num text-lg font-bold text-slate-900 transition-colors cursor-pointer"
                    >
                      {formatRupiah(amount)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-step 3: Family Adab Delivery Question */}
          {checkoutStep === 'FAMILY_ADAB' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-emerald-700">
                  Langkah Terakhir · Sampai di Rumah
                </p>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {selectedLevel.deliveryQuestion.question}
                </h3>
              </div>

              <div className="space-y-3">
                {selectedLevel.deliveryQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAnswerDeliveryAdab(idx)}
                    className="w-full text-left p-4 rounded-xl border border-slate-300 bg-white hover:bg-emerald-50 hover:border-emerald-600 text-sm sm:text-base font-medium text-slate-800 transition-colors cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATE 5: ROUND_SUMMARY (VICTORY) */}
      {gameState === 'ROUND_SUMMARY' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-amber-600" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-emerald-700">
              Misi Level {selectedLevel.id} Berhasil!
            </p>
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Masya Allah, {activeName} Anak Sholeh!
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto">
              {selectedLevel.hikmahSummary}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-9 h-9 ${
                  roundScore.starsEarned >= s
                    ? 'text-amber-500 fill-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
            <div>
              <p className="text-xs text-slate-500">Skor Amanah</p>
              <p className="font-mono-num text-lg font-bold text-slate-900">
                {roundScore.base}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Bonus Waktu & Hikmah</p>
              <p className="font-mono-num text-lg font-bold text-emerald-700">
                +{roundScore.timeBonus + roundScore.wisdomBonus}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Skor</p>
              <p className="font-mono-num text-lg font-bold text-amber-700">
                {roundScore.total}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setGameState('TITLE_MENU')}
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              Pilih Level
            </button>
            <button
              type="button"
              onClick={() => startLevel(selectedLevel)}
              className="px-5 py-2.5 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl cursor-pointer"
            >
              Main Lagi
            </button>
            {selectedLevel.id < GAME_LEVELS.length && (
              <button
                type="button"
                onClick={() => {
                  const nextLvl = GAME_LEVELS.find(
                    (l) => l.id === selectedLevel.id + 1
                  );
                  if (nextLvl) startLevel(nextLvl);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer"
              >
                Lanjut Level {selectedLevel.id + 1}
              </button>
            )}
          </div>
        </div>
      )}

      {/* STATE 6: GAME_OVER */}
      {gameState === 'GAME_OVER' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-rose-700">Misi Belum Selesai</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Tetap Semangat, {activeName}!
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">{gameOverReason}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setGameState('TITLE_MENU')}
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              Kembali ke Menu
            </button>
            <button
              type="button"
              onClick={() => startLevel(selectedLevel)}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
