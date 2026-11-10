import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Trophy,
  BookOpen,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowLeftRight,
  Play,
  Plus,
  Download,
  Check,
  X,
  Crown,
  Music,
  Layers,
  Award,
  Zap,
  Users,
  Settings,
  Sliders,
  AlertTriangle,
  Lock,
  Unlock,
  Copy,
  LogOut,
  Radio,
  Bot,
  User,
  UserPlus,
  Clock,
  Wifi,
  Globe,
  UploadCloud,
  FileCode,
  ExternalLink,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

// ==========================================
// PEERJS (WebRTC) DYNAMIC CDN LOADER
// ==========================================
const PEERJS_CDN_URL = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
const PEER_ROOM_PREFIX = 'hyakuju-parade-room-';

function loadPeerJsScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));
    if (window.Peer) return resolve(window.Peer);

    const existing = document.querySelector(`script[src="${PEERJS_CDN_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Peer));
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.src = PEERJS_CDN_URL;
    script.async = true;
    script.onload = () => {
      if (window.Peer) resolve(window.Peer);
      else reject(new Error('PeerJS loaded but window.Peer missing'));
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

// ==========================================
// CONSTANTS & ANIMAL PARADE THEME DATA
// ==========================================

const ASSIST_PRESETS = {
  full: {
    id: 'full',
    name: 'Full Assist',
    badge: 'Beginner / Learning',
    desc: 'All visual chain helpers, quick-play buttons, and insertion slot hints enabled.',
    color: 'from-emerald-400 to-teal-500',
    badgeClass: 'bg-emerald-500/20 border-emerald-400 text-emerald-200',
    options: {
      showQuickPlayList: true,
      showLinkBadges: true,
      showChainValuePreview: true,
      showTakeSlotHints: true,
      showAddCardHighlights: true,
      showReverseStats: true
    }
  },
  subtle: {
    id: 'subtle',
    name: 'Subtle Hints',
    badge: 'Standard Digital',
    desc: 'Shows adjacent link icons, live selected number preview, and Action C highlights, without giving away optimal moves.',
    color: 'from-amber-400 to-yellow-500',
    badgeClass: 'bg-amber-500/20 border-amber-400 text-amber-200',
    options: {
      showQuickPlayList: false,
      showLinkBadges: true,
      showChainValuePreview: true,
      showTakeSlotHints: false,
      showAddCardHighlights: true,
      showReverseStats: false
    }
  },
  strict: {
    id: 'strict',
    name: 'Strict Tabletop',
    badge: 'Pure Physical Rules',
    desc: 'Zero automated hints! Spot chains and calculate numbers yourself just like the physical tabletop game. Explains rule violations if you attempt an illegal play.',
    color: 'from-rose-500 to-orange-500',
    badgeClass: 'bg-rose-500/20 border-rose-400 text-rose-200',
    options: {
      showQuickPlayList: false,
      showLinkBadges: false,
      showChainValuePreview: false,
      showTakeSlotHints: false,
      showAddCardHighlights: false,
      showReverseStats: false
    }
  },
  custom: {
    id: 'custom',
    name: 'Custom Assist',
    badge: 'Playtester Config',
    desc: 'Mix and match any combination of the 6 individual guidance options.',
    color: 'from-purple-400 to-indigo-500',
    badgeClass: 'bg-purple-500/20 border-purple-400 text-purple-200'
  }
};

const ASSIST_OPTION_META = [
  {
    key: 'showLinkBadges',
    title: '1. Adjacent Hand Link Badges (🔗)',
    desc: 'Displays visual 🔗 connectors between adjacent cards in your hand whose digits match (ones == tens), plus green/purple capability dots on cards.'
  },
  {
    key: 'showChainValuePreview',
    title: '2. Live Combined Number Preview',
    desc: 'Displays the merged number (e.g., 1523) and instant "Beats 123!" / "Too Small" validation badge as you select cards in your hand.'
  },
  {
    key: 'showQuickPlayList',
    title: '3. Quick-Select Winning Chains List',
    desc: 'Shows one-click buttons for every legal single card and multi-card chain in your hand that beats the current table number.'
  },
  {
    key: 'showTakeSlotHints',
    title: '4. Action B Insertion Slot Hints',
    desc: 'Highlights insertion slots in your hand with BRIDGE! (connects both neighbors) or LINKS! (connects 1 neighbor) when taking an edge card.'
  },
  {
    key: 'showAddCardHighlights',
    title: '5. Action C Valid Card & End Highlights',
    desc: 'Highlights which cards in your hand can legally attach to the left or right end of the active table number during Action C.'
  },
  {
    key: 'showReverseStats',
    title: '6. Initial Hand Reverse Chain Comparison',
    desc: 'During the initial "Keep or Reverse Hand" phase, compares the number of adjacent links and longest chain in both directions.'
  }
];

const DIGIT_THEMES = {
  1: {
    digit: 1,
    name: 'Eucalio',
    region: 'Australia Rep.',
    desc: 'Plays the trumpet with his little brother on his back!',
    emoji: '🐨',
    instrument: '🎺',
    bgGrad: 'from-amber-300 via-yellow-400 to-amber-500',
    cardBg: 'bg-amber-400',
    border: 'border-amber-600',
    text: 'text-amber-950',
    numColor: 'text-amber-950',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-400',
    hex: '#f59e0b',
    lightHex: '#fef3c7'
  },
  2: {
    digit: 2,
    name: 'Penta',
    region: 'Antarctica Rep.',
    desc: 'A little clumsy, but a master of the cymbals!',
    emoji: '🐧',
    instrument: '🪙',
    bgGrad: 'from-sky-300 via-cyan-400 to-blue-500',
    cardBg: 'bg-cyan-400',
    border: 'border-blue-600',
    text: 'text-slate-950',
    numColor: 'text-blue-950',
    badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-400',
    hex: '#06b6d4',
    lightHex: '#cffafe'
  },
  3: {
    digit: 3,
    name: 'Jasmine',
    region: 'North America Rep.',
    desc: 'Never leaves her ball, just to look bigger!',
    emoji: '🐻',
    instrument: '🎪',
    bgGrad: 'from-rose-400 via-red-400 to-rose-600',
    cardBg: 'bg-rose-500',
    border: 'border-rose-800',
    text: 'text-white',
    numColor: 'text-rose-950',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-400',
    hex: '#f43f5e',
    lightHex: '#ffe4e6'
  },
  4: {
    digit: 4,
    name: 'Alice',
    region: 'South America Rep.',
    desc: "The parade's darling, cheering everyone on!",
    emoji: '🦙',
    instrument: '🎉',
    bgGrad: 'from-purple-400 via-violet-500 to-indigo-600',
    cardBg: 'bg-purple-500',
    border: 'border-indigo-800',
    text: 'text-white',
    numColor: 'text-purple-950',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-400',
    hex: '#8b5cf6',
    lightHex: '#ede9fe'
  },
  5: {
    digit: 5,
    name: 'Bambam',
    region: 'Eurasia Rep.',
    desc: 'After a bamboo snack, some bold drumming!',
    emoji: '🐼',
    instrument: '🥁',
    bgGrad: 'from-emerald-300 via-green-400 to-teal-500',
    cardBg: 'bg-emerald-400',
    border: 'border-emerald-700',
    text: 'text-emerald-950',
    numColor: 'text-emerald-950',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-400',
    hex: '#10b981',
    lightHex: '#d1fae5'
  }
};

const LEADER_THEME = {
  name: 'Dande',
  region: 'Africa Rep.',
  desc: 'The leader who keeps the parade together!',
  emoji: '🦁',
  instrument: '👑'
};

const AI_PROFILES = [
  { id: 'ai-eucalio', name: 'Eucalio Bot', avatar: '🐨', title: 'Trumpet Virtuoso', color: 'from-amber-400 to-yellow-600' },
  { id: 'ai-penta', name: 'Penta Bot', avatar: '🐧', title: 'Cymbal Master', color: 'from-sky-500 to-blue-600' },
  { id: 'ai-jasmine', name: 'Jasmine Bot', avatar: '🐻', title: 'Acrobat Star', color: 'from-rose-500 to-red-600' },
  { id: 'ai-alice', name: 'Alice Bot', avatar: '🦙', title: 'Cheer Captain', color: 'from-purple-500 to-indigo-600' },
  { id: 'ai-bambam', name: 'Bambam Bot', avatar: '🐼', title: 'Bass Drummer', color: 'from-emerald-500 to-teal-600' }
];

const AVATAR_CHOICES = ['🐨', '🐧', '🐻', '🦙', '🐼', '🦁', '🦊', '🐯', '🐸', '🦉'];

// ==========================================
// WEB AUDIO SYNTH SOUND EFFECTS
// ==========================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playTone(freq, type = 'sine', duration = 0.12, delay = 0, vol = 0.12) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Ignore audio errors
    }
  }

  click() {
    this.playTone(520, 'triangle', 0.06, 0, 0.08);
  }

  playCards(chainLen = 1) {
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
    for (let i = 0; i < Math.min(chainLen + 1, notes.length); i++) {
      this.playTone(notes[i], 'triangle', 0.16, i * 0.06, 0.14);
    }
  }

  takeCard() {
    this.playTone(440, 'sine', 0.1, 0, 0.1);
    this.playTone(330, 'sine', 0.14, 0.08, 0.1);
  }

  addCard() {
    this.playTone(349.23, 'triangle', 0.1, 0, 0.12);
    this.playTone(523.25, 'triangle', 0.16, 0.08, 0.14);
  }

  encore() {
    const fanfare = [392, 523.25, 659.25, 783.99, 659.25, 783.99];
    const times = [0, 0.1, 0.2, 0.3, 0.45, 0.58];
    fanfare.forEach((f, idx) => this.playTone(f, 'sawtooth', 0.18, times[idx], 0.1));
  }

  winRound() {
    const chord = [261.63, 329.63, 392.0, 523.25, 659.25, 1046.5];
    chord.forEach((f, idx) => this.playTone(f, 'triangle', 0.3, idx * 0.08, 0.15));
  }

  error() {
    this.playTone(220, 'sawtooth', 0.14, 0, 0.12);
    this.playTone(175, 'sawtooth', 0.18, 0.1, 0.12);
  }
}

const sfx = new SoundEngine();

// ==========================================
// PURE GAME LOGIC & CHAIN HELPERS
// ==========================================

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function createFullDeck() {
  const deck = [];
  let idCounter = 1;
  for (let copy = 1; copy <= 2; copy++) {
    for (let tens = 1; tens <= 5; tens++) {
      for (let ones = 1; ones <= 5; ones++) {
        deck.push({
          id: `card-${idCounter++}-${tens}${ones}-c${copy}`,
          tens,
          ones,
          label: `${tens}${ones}`
        });
      }
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValidChain(cards) {
  if (!cards || cards.length === 0) return false;
  for (let i = 0; i < cards.length - 1; i++) {
    if (cards[i].ones !== cards[i + 1].tens) return false;
  }
  return true;
}

function getChainNumberString(cards) {
  if (!cards || cards.length === 0) return '';
  let str = `${cards[0].tens}${cards[0].ones}`;
  for (let i = 1; i < cards.length; i++) {
    str += `${cards[i].ones}`;
  }
  return str;
}

function isStrictlyGreater(candidateStr, currentStr) {
  if (!candidateStr) return false;
  if (!currentStr) return true;
  return BigInt(candidateStr) > BigInt(currentStr);
}

function getAllValidHandSubchains(hand, currentNumberStr = null) {
  const results = [];
  for (let start = 0; start < hand.length; start++) {
    const chain = [hand[start]];
    const singleStr = getChainNumberString(chain);
    if (isStrictlyGreater(singleStr, currentNumberStr)) {
      results.push({
        startIndex: start,
        endIndex: start,
        cards: [...chain],
        numStr: singleStr,
        length: 1
      });
    }
    for (let end = start + 1; end < hand.length; end++) {
      if (hand[end - 1].ones === hand[end].tens) {
        chain.push(hand[end]);
        const chainStr = getChainNumberString(chain);
        if (isStrictlyGreater(chainStr, currentNumberStr)) {
          results.push({
            startIndex: start,
            endIndex: end,
            cards: [...chain],
            numStr: chainStr,
            length: chain.length
          });
        }
      } else {
        break;
      }
    }
  }
  return results;
}

function analyzeHandChains(hand) {
  let links = 0;
  let maxChain = hand.length > 0 ? 1 : 0;
  let curChain = 1;
  const maximalChains = [];
  if (hand.length === 0) return { links: 0, maxChain: 0, maximalChains: [] };

  let chainStart = 0;
  for (let i = 0; i < hand.length - 1; i++) {
    if (hand[i].ones === hand[i + 1].tens) {
      links++;
      curChain++;
      if (curChain > maxChain) maxChain = curChain;
    } else {
      if (curChain >= 2) {
        maximalChains.push({
          start: chainStart,
          end: i,
          numStr: getChainNumberString(hand.slice(chainStart, i + 1)),
          count: curChain
        });
      }
      chainStart = i + 1;
      curChain = 1;
    }
  }
  if (curChain >= 2) {
    maximalChains.push({
      start: chainStart,
      end: hand.length - 1,
      numStr: getChainNumberString(hand.slice(chainStart)),
      count: curChain
    });
  }
  return { links, maxChain, maximalChains };
}

function evaluateHandScore(hand) {
  const { links, maxChain } = analyzeHandChains(hand);
  return links * 18 + maxChain * 12 - hand.length * 25;
}

function getLegalAddMoves(hand, activeCards) {
  if (!activeCards || activeCards.length === 0) return [];
  const moves = [];
  const firstCard = activeCards[0];
  const lastCard = activeCards[activeCards.length - 1];

  hand.forEach((card, index) => {
    if (card.ones === firstCard.tens) {
      const nextCards = [card, ...activeCards];
      moves.push({
        handIndex: index,
        card,
        side: 'left',
        newNumStr: getChainNumberString(nextCards)
      });
    }
    if (lastCard.ones === card.tens) {
      const nextCards = [...activeCards, card];
      moves.push({
        handIndex: index,
        card,
        side: 'right',
        newNumStr: getChainNumberString(nextCards)
      });
    }
  });
  return moves;
}

function createInitialSeats(hostId, hostName, hostAvatar) {
  return [
    {
      seatIndex: 0,
      type: 'human',
      occupantId: hostId,
      name: hostName || 'Host',
      avatar: hostAvatar || '🐨',
      title: 'Room Host (WebRTC)',
      color: 'from-amber-400 to-orange-500',
      aiProfileId: 'ai-eucalio'
    },
    {
      seatIndex: 1,
      type: 'open',
      occupantId: null,
      name: 'Open Seat #2',
      avatar: '👤',
      title: 'Waiting for Remote Player...',
      color: 'from-sky-500 to-blue-600',
      aiProfileId: 'ai-penta'
    },
    {
      seatIndex: 2,
      type: 'ai',
      occupantId: 'ai-seat-2',
      name: AI_PROFILES[1].name,
      avatar: AI_PROFILES[1].avatar,
      title: AI_PROFILES[1].title,
      color: AI_PROFILES[1].color,
      aiProfileId: AI_PROFILES[1].id
    },
    {
      seatIndex: 3,
      type: 'ai',
      occupantId: 'ai-seat-3',
      name: AI_PROFILES[2].name,
      avatar: AI_PROFILES[2].avatar,
      title: AI_PROFILES[2].title,
      color: AI_PROFILES[2].color,
      aiProfileId: AI_PROFILES[2].id
    },
    {
      seatIndex: 4,
      type: 'closed',
      occupantId: null,
      name: 'Closed Seat',
      avatar: '🔒',
      title: 'Not in use',
      color: 'from-slate-700 to-slate-800',
      aiProfileId: AI_PROFILES[4].id
    }
  ];
}

// ==========================================
// STANDALONE HTML BUNDLE GENERATOR FOR GITHUB EXPORT
// ==========================================

function buildStandaloneReadme(repoName) {
  return `# 🦁 Hyakuju Parade (百獣パレード) — Online WebRTC Multiplayer Card Game

An online synchronous multiplayer adaptation of **Hyakuju Parade** (Game Design by Keita Kasagi / Bamboo Games).

## ✨ Features
- **Live PeerJS (WebRTC) Cross-Device Multiplayer**: Host a room with a 6-character Room Code and invite 1–4 friends across the internet with zero backend configuration.
- **Instant Multi-Tab Sync**: Also includes \`BroadcastChannel\` sync for instant local multi-tab testing.
- **Authentic 50-Card Deck & Chaining Engine**: Two copies each of \`11\` through \`55\` featuring Eucalio (1), Penta (2), Jasmine (3), Alice (4), Bambam (5), and Parade Leader Dande.
- **Simultaneous Initial Hand Order Phase**: Keep your dealt hand order or reverse the entire hand simultaneously before Turn 1.
- **Granular Difficulty & Assist Levels**: Choose between *Full Assist*, *Subtle Hints*, *Strict Tabletop*, or *Custom* (6 individual toggles) with Host Lock support.

## 🚀 Playing Online via GitHub Pages
1. Go to your repository **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch** → \`main\` branch → \`/ (root)\` and click **Save**.
3. Your live multiplayer game will be hosted at \`https://<your-username>.github.io/${repoName}/\`.
`;
}

// ==========================================
// SUB-COMPONENTS: CARDS & OVERLAPPING CHAINS
// ==========================================

function ParadeCard({
  card,
  size = 'md',
  isSelected = false,
  isInPreviewChain = false,
  canActionA = false,
  canActionC = false,
  isOverlappedLeft = false,
  isTakeableEnd = false,
  endLabel = null,
  onClick,
  disabled = false,
  showHint = false
}) {
  const leftTheme = DIGIT_THEMES[card.tens];
  const rightTheme = DIGIT_THEMES[card.ones];

  const dims = {
    sm: { w: 'w-14', h: 'h-20', digit: 'text-xl', corner: 'text-[9px]', emoji: 'text-xs', overlap: '-ml-6' },
    md: { w: 'w-20', h: 'h-28', digit: 'text-3xl', corner: 'text-[11px]', emoji: 'text-sm', overlap: '-ml-9' },
    lg: { w: 'w-24', h: 'h-34', digit: 'text-4xl', corner: 'text-xs', emoji: 'text-base', overlap: '-ml-11' }
  }[size];

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative select-none rounded-xl border-2 transition-all duration-200 flex overflow-hidden shadow-md
        ${dims.w} ${dims.h}
        ${isOverlappedLeft ? dims.overlap : ''}
        ${onClick && !disabled ? 'cursor-pointer hover:-translate-y-1.5' : ''}
        ${isSelected
          ? 'ring-4 ring-yellow-300 border-white -translate-y-3 shadow-xl shadow-yellow-500/30 z-30'
          : isInPreviewChain
          ? 'ring-2 ring-amber-300 border-amber-200 -translate-y-1.5 z-20'
          : isTakeableEnd
          ? 'ring-4 ring-cyan-300 border-white hover:scale-105 z-20 cursor-pointer'
          : 'border-slate-800/80'}
      `}
      style={{
        boxShadow: isSelected
          ? '0 12px 24px -4px rgba(250, 204, 21, 0.45)'
          : '0 4px 10px rgba(0,0,0,0.35)'
      }}
    >
      {/* Left Half (Tens Digit) */}
      <div
        className={`w-1/2 h-full bg-gradient-to-b ${leftTheme.bgGrad} flex flex-col items-center justify-between py-1 px-0.5 border-r border-black/15 relative`}
      >
        <span className={`font-black leading-none ${dims.corner} ${leftTheme.numColor} opacity-85 self-start pl-1`}>
          {card.tens}{card.ones}
        </span>
        <span
          className={`font-black ${dims.digit} ${leftTheme.numColor} drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] leading-none`}
        >
          {card.tens}
        </span>
        <span className={`${dims.emoji} leading-none pb-0.5`} title={leftTheme.name}>
          {leftTheme.emoji}
        </span>
      </div>

      {/* Right Half (Ones Digit) */}
      <div
        className={`w-1/2 h-full bg-gradient-to-b ${rightTheme.bgGrad} flex flex-col items-center justify-between py-1 px-0.5 relative`}
      >
        <span className={`font-black leading-none ${dims.corner} ${rightTheme.numColor} opacity-85 self-end pr-1`}>
          {card.tens}{card.ones}
        </span>
        <span
          className={`font-black ${dims.digit} ${rightTheme.numColor} drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] leading-none`}
        >
          {card.ones}
        </span>
        <span className={`${dims.emoji} leading-none pb-0.5`} title={rightTheme.name}>
          {rightTheme.emoji}
        </span>
      </div>

      {/* Helper indicator dots when Assist Badges are ON */}
      {showHint && (canActionA || canActionC) && !isSelected && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-0.5 z-30">
          {canActionA && (
            <span
              className="w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-black shadow"
              title="Can play via Action A"
            />
          )}
          {canActionC && (
            <span
              className="w-2 h-2 rounded-full bg-purple-400 ring-1 ring-black shadow"
              title="Can attach via Action C"
            />
          )}
        </div>
      )}

      {/* Takeable End Overlay Label */}
      {isTakeableEnd && endLabel && (
        <div className="absolute inset-x-0 bottom-0 bg-cyan-950/90 text-cyan-200 text-[10px] font-bold text-center py-0.5 uppercase tracking-wider">
          {endLabel}
        </div>
      )}
    </div>
  );
}

function OverlappingChainDisplay({
  cards,
  size = 'md',
  interactiveEnds = false,
  onSelectEnd = null,
  selectedEnd = null,
  spreadCards = false
}) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="inline-flex items-center justify-center py-2 px-3">
      {cards.map((card, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === cards.length - 1;
        const isEnd = isFirst || isLast;
        const canTakeThisEnd = interactiveEnds && isEnd;

        const isThisSelected =
          (selectedEnd === 'left' && isFirst) ||
          (selectedEnd === 'right' && isLast) ||
          (selectedEnd === 'only' && isFirst);

        return (
          <div
            key={card.id}
            style={{ zIndex: isThisSelected ? 40 : idx + 1 }}
            className={`relative transition-all ${spreadCards && idx > 0 ? 'ml-1.5' : ''}`}
          >
            <ParadeCard
              card={card}
              size={size}
              isOverlappedLeft={!spreadCards && idx > 0}
              isTakeableEnd={canTakeThisEnd}
              isSelected={isThisSelected}
              endLabel={
                canTakeThisEnd
                  ? cards.length === 1
                    ? 'Take Card'
                    : isFirst
                    ? 'Left End'
                    : 'Right End'
                  : null
              }
              onClick={
                canTakeThisEnd && onSelectEnd
                  ? () => onSelectEnd(isFirst ? 'left' : 'right', card)
                  : undefined
              }
            />
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================

export default function App() {
  // Unique Per-Tab Client Identity
  const [myClientId] = useState(() => `peer-${Math.random().toString(36).substring(2, 9)}`);
  const [playerName, setPlayerName] = useState('Marcher');
  const [playerAvatar, setPlayerAvatar] = useState('🐨');

  // Navigation & Multiplayer Room State
  const [screen, setScreen] = useState('home'); // 'home' | 'lobby' | 'game'
  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [roomState, setRoomState] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // PeerJS (WebRTC) Networking State
  const [peerReady, setPeerReady] = useState(false);
  const [peerStatus, setPeerStatus] = useState('Initializing WebRTC...'); // 'Ready' | 'Hosting' | 'Connected' | 'Connecting...' | 'Fallback (Local)'
  const [connectedPeerCount, setConnectedPeerCount] = useState(0);

  // Local Player Assist Settings
  const [localAssistPreset, setLocalAssistPreset] = useState('full');
  const [localAssistOptions, setLocalAssistOptions] = useState(ASSIST_PRESETS.full.options);

  // Local UI State
  const [soundMuted, setSoundMuted] = useState(false);
  const [inspectTableCards, setInspectTableCards] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showAssistModal, setShowAssistModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [ruleCheckToast, setRuleCheckToast] = useState(null);

  // GitHub Push Modal State
  const [ghToken, setGhToken] = useState('');
  const [ghOwner, setGhOwner] = useState('');
  const [ghRepo, setGhRepo] = useState('hyakuju-parade-online');
  const [ghBranch, setGhBranch] = useState('main');
  const [ghAutoCreateRepo, setGhAutoCreateRepo] = useState(true);
  const [ghPushStatus, setGhPushStatus] = useState(null); // { state: 'idle'|'pushing'|'success'|'error', message: '', url: '', pagesUrl: '' }

  // Local Turn Selection State
  const [actionMode, setActionMode] = useState('A'); // 'A' | 'B' | 'C'
  const [selectedHandIndices, setSelectedHandIndices] = useState([]);
  const [selectedTakeEnd, setSelectedTakeEnd] = useState(null); // 'left' | 'right'
  const [handReversedPreview, setHandReversedPreview] = useState(false);

  // Refs for WebRTC PeerJS & BroadcastChannel
  const bcRef = useRef(null);
  const peerRef = useRef(null);
  const hostConnectionsRef = useRef([]); // Array of DataConnections when Hosting
  const guestConnectionRef = useRef(null); // Single DataConnection to Host when Joining
  const roomStateRef = useRef(null);
  const handleGuestIntentRef = useRef(null);
  const aiTimeoutRef = useRef(null);

  useEffect(() => {
    roomStateRef.current = roomState;
  }, [roomState]);

  useEffect(() => {
    sfx.muted = soundMuted;
  }, [soundMuted]);

  // 1. Load PeerJS WebRTC Library from CDN on Mount
  useEffect(() => {
    let mounted = true;
    loadPeerJsScript()
      .then(() => {
        if (mounted) {
          setPeerReady(true);
          setPeerStatus('PeerJS WebRTC Ready');
        }
      })
      .catch((err) => {
        console.warn('PeerJS CDN load warning:', err);
        if (mounted) {
          setPeerReady(false);
          setPeerStatus('Local Multi-Tab Mode');
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Cleanup PeerJS instance on unmount
  const destroyPeerSession = useCallback(() => {
    hostConnectionsRef.current.forEach((conn) => {
      try {
        conn.close();
      } catch (e) {}
    });
    hostConnectionsRef.current = [];
    if (guestConnectionRef.current) {
      try {
        guestConnectionRef.current.close();
      } catch (e) {}
      guestConnectionRef.current = null;
    }
    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch (e) {}
      peerRef.current = null;
    }
    setConnectedPeerCount(0);
  }, []);

  useEffect(() => {
    return () => destroyPeerSession();
  }, [destroyPeerSession]);

  // 2. BroadcastChannel Setup for Instant Same-Browser Multi-Tab Sync
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('hyakuju_parade_webrtc_sync_v2');
      channel.onmessage = (ev) => {
        const data = ev.data;
        if (!data) return;

        if (data.type === 'ROOM_UPDATE' && data.room) {
          setAvailableRooms((prev) => {
            const filtered = prev.filter((r) => r.roomCode !== data.room.roomCode);
            return [data.room, ...filtered].slice(0, 12);
          });
          setRoomState((prev) => {
            if (prev && prev.roomCode === data.room.roomCode) {
              return data.room;
            }
            return prev;
          });
        } else if (data.type === 'GUEST_INTENT' && data.roomCode) {
          const current = roomStateRef.current;
          if (current && current.roomCode === data.roomCode && current.hostId === myClientId) {
            if (handleGuestIntentRef.current) {
              handleGuestIntentRef.current(data.intent);
            }
          }
        }
      };
      bcRef.current = channel;
      return () => channel.close();
    }
  }, [myClientId]);

  // Auto-switch screen between 'lobby' and 'game' based on roomState.status
  useEffect(() => {
    if (!roomState) return;
    if (roomState.status === 'lobby' && screen === 'game') {
      setScreen('lobby');
    } else if (roomState.status !== 'lobby' && screen === 'lobby') {
      setScreen('game');
    }
  }, [roomState, screen]);

  // Authoritative Broadcast: Host pushes state to all PeerJS WebRTC DataConnections + BroadcastChannel
  const publishRoomState = useCallback((nextState) => {
    const stamped = {
      ...nextState,
      updatedAt: Date.now()
    };
    roomStateRef.current = stamped;
    setRoomState(stamped);

    setAvailableRooms((prev) => {
      const filtered = prev.filter((r) => r.roomCode !== stamped.roomCode);
      return [stamped, ...filtered].slice(0, 12);
    });

    // 1. Broadcast over same-browser BroadcastChannel
    if (bcRef.current) {
      bcRef.current.postMessage({ type: 'ROOM_UPDATE', room: stamped });
    }

    // 2. Broadcast over all active PeerJS WebRTC DataConnections
    if (hostConnectionsRef.current.length > 0) {
      hostConnectionsRef.current.forEach((conn) => {
        if (conn && conn.open) {
          try {
            conn.send({ type: 'ROOM_UPDATE', room: stamped });
          } catch (e) {
            console.warn('Error sending state to peer:', e);
          }
        }
      });
    }
  }, []);

  // Helper for Guest to send an action/intent to the Host (via WebRTC DataConnection or BroadcastChannel fallback)
  const sendIntentToHost = useCallback(
    (intentPayload) => {
      const current = roomStateRef.current;
      if (!current) return;

      // If we are the Host ourselves, process directly!
      if (current.hostId === myClientId) {
        if (handleGuestIntentRef.current) {
          handleGuestIntentRef.current(intentPayload);
        }
        return;
      }

      // Send over PeerJS WebRTC connection if open
      if (guestConnectionRef.current && guestConnectionRef.current.open) {
        try {
          guestConnectionRef.current.send({
            type: 'GUEST_INTENT',
            roomCode: current.roomCode,
            intent: intentPayload
          });
          return;
        } catch (e) {
          console.warn('PeerJS send failed, falling back to BroadcastChannel', e);
        }
      }

      // Fallback to BroadcastChannel for local multi-tab testing
      if (bcRef.current) {
        bcRef.current.postMessage({
          type: 'GUEST_INTENT',
          roomCode: current.roomCode,
          intent: intentPayload
        });
      }
    },
    [myClientId]
  );

  // Derived Host & Local Player Info
  const isHost = Boolean(roomState && roomState.hostId === myClientId);
  const myPlayerIndex = useMemo(() => {
    if (!roomState || !roomState.players) return -1;
    return roomState.players.findIndex((p) => p.id === myClientId);
  }, [roomState, myClientId]);

  const myPlayer = useMemo(() => {
    if (myPlayerIndex === -1 || !roomState?.players) return null;
    return roomState.players[myPlayerIndex];
  }, [roomState, myPlayerIndex]);

  const effectiveAssistPreset = useMemo(() => {
    if (roomState?.assistLocked) {
      return roomState.assistPreset || 'full';
    }
    return localAssistPreset;
  }, [roomState?.assistLocked, roomState?.assistPreset, localAssistPreset]);

  const effectiveAssistOptions = useMemo(() => {
    if (roomState?.assistLocked && roomState?.assistOptions) {
      return roomState.assistOptions;
    }
    return localAssistOptions;
  }, [roomState?.assistLocked, roomState?.assistOptions, localAssistOptions]);

  // ==========================================
  // START ROUND & SIMULTANEOUS HAND SETUP
  // ==========================================

  const startRoundInRoom = useCallback(
    (baseRoom, existingPlayers = null, nextStartIdx = 0, nextRoundNum = 1) => {
      const targetRoom = baseRoom || roomStateRef.current;
      if (!targetRoom) return;

      const fullDeck = shuffleDeck(createFullDeck());

      let activeRoster = existingPlayers;
      if (!activeRoster) {
        const activeSeats = targetRoom.seats.filter((s) => s.type !== 'closed');
        activeRoster = activeSeats.map((seat, idx) => {
          const isUnfilledOpen = seat.type === 'open' && !seat.occupantId;
          const fallbackBot = AI_PROFILES[idx % AI_PROFILES.length];
          const isHuman = seat.type === 'human' && Boolean(seat.occupantId);

          return {
            id: isHuman ? seat.occupantId : `ai-bot-${idx}`,
            name: isUnfilledOpen ? fallbackBot.name : seat.name,
            avatar: isUnfilledOpen ? fallbackBot.avatar : seat.avatar,
            title: isUnfilledOpen ? fallbackBot.title : seat.title,
            color: isUnfilledOpen ? fallbackBot.color : seat.color,
            isHuman,
            hand: [],
            readyForRound: !isHuman,
            hasMemberPiece: false,
            memberBadge: null,
            hasLeaderPiece: false,
            lastAction: 'Choosing initial hand order...'
          };
        });
      }

      const dealtPlayers = activeRoster.map((p, idx) => {
        const dealt = fullDeck.slice(idx * 10, (idx + 1) * 10);
        if (!p.isHuman) {
          const normalScore = evaluateHandScore(dealt);
          const revHand = [...dealt].reverse();
          const revScore = evaluateHandScore(revHand);
          const chosenHand = revScore > normalScore ? revHand : dealt;
          return {
            ...p,
            hand: chosenHand,
            readyForRound: true,
            lastAction:
              revScore > normalScore
                ? 'Locked Hand (Reversed Order 🔄)'
                : 'Locked Hand (Kept Order 👍)'
          };
        }
        return {
          ...p,
          hand: dealt,
          readyForRound: false,
          lastAction: '⏳ Choosing whether to keep or reverse hand...'
        };
      });

      const unused = fullDeck.length - dealtPlayers.length * 10;
      const allReadyImmediately = dealtPlayers.every((p) => p.readyForRound);

      const nextRoomState = {
        ...targetRoom,
        status: allReadyImmediately ? 'playing' : 'setup_choice',
        players: dealtPlayers,
        unusedDeckCount: unused,
        discardPile: [],
        activePlay: null,
        roundNumber: nextRoundNum,
        startingPlayerIndex: nextStartIdx,
        turnIndex: nextStartIdx,
        roundWinner: null,
        gameWinner: null,
        bannerAlert: null,
        actionLogs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            actorName: 'Parade Marshal',
            avatar: '🦁',
            text: `Round ${nextRoundNum} started! Dealt 10 cards to ${dealtPlayers.length} players (${unused} unused set aside). All players: choose whether to keep or reverse your hand!`,
            type: 'system',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          },
          ...(targetRoom.actionLogs || []).slice(0, 25)
        ]
      };

      setSelectedHandIndices([]);
      setSelectedTakeEnd(null);
      setHandReversedPreview(false);
      setActionMode('A');
      setRuleCheckToast(null);

      publishRoomState(nextRoomState);
    },
    [publishRoomState]
  );

  // ==========================================
  // TURN ADVANCEMENT & ENCORE RESOLUTION
  // ==========================================

  const advanceTurnOrCheckWinner = useCallback(
    (baseRoom, updatedPlayers, nextActivePlay, nextDiscardPile, actingPlayerIndex, logEntry) => {
      const currentRoom = baseRoom || roomStateRef.current;
      if (!currentRoom) return;
      const actingPlayer = updatedPlayers[actingPlayerIndex];
      const nextLogs = logEntry
        ? [logEntry, ...(currentRoom.actionLogs || []).slice(0, 29)]
        : [...(currentRoom.actionLogs || [])];

      // 1. Check if actingPlayer emptied their hand (0 cards left) -> Wins the Round!
      if (actingPlayer.hand.length === 0) {
        sfx.winRound();
        const badgeDigits = [1, 2, 3, 4, 5];
        const earnedMemberAlready = actingPlayer.hasMemberPiece;

        const finalPlayers = updatedPlayers.map((p, idx) => {
          if (idx !== actingPlayerIndex) return p;
          if (!p.hasMemberPiece) {
            const assignedBadge = DIGIT_THEMES[badgeDigits[idx % 5]];
            return {
              ...p,
              hasMemberPiece: true,
              memberBadge: assignedBadge,
              lastAction: '🏆 Won the Round & claimed a Parade Member Piece!'
            };
          } else {
            return {
              ...p,
              hasLeaderPiece: true,
              lastAction: '👑 Claimed the Parade Leader Piece & WON THE GAME!'
            };
          }
        });

        const winLog = {
          id: `log-win-${Date.now()}`,
          actorName: actingPlayer.name,
          avatar: actingPlayer.avatar,
          text: earnedMemberAlready
            ? `👑 Emptied their hand for a 2nd round win and claimed DANDE the Parade Leader!`
            : `🏆 Emptied their hand to win Round ${currentRoom.roundNumber} and earned a Parade Member Piece!`,
          type: 'win',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        publishRoomState({
          ...currentRoom,
          status: earnedMemberAlready ? 'game_over' : 'round_over',
          players: finalPlayers,
          activePlay: nextActivePlay,
          discardPile: nextDiscardPile,
          roundWinner: earnedMemberAlready ? null : finalPlayers[actingPlayerIndex],
          gameWinner: earnedMemberAlready ? finalPlayers[actingPlayerIndex] : null,
          actionLogs: [winLog, ...nextLogs.slice(0, 29)]
        });
        return;
      }

      // 2. Advance turn clockwise
      const nextTurnIdx = (actingPlayerIndex + 1) % updatedPlayers.length;
      const nextPlayer = updatedPlayers[nextTurnIdx];

      // 3. Check for ENCORE Rule!
      if (
        nextActivePlay &&
        nextActivePlay.ownerId === nextPlayer.id &&
        nextActivePlay.cards.length > 0
      ) {
        sfx.encore();
        const encoreDiscarded = [...nextDiscardPile, ...nextActivePlay.cards];
        const encoreNumStr = getChainNumberString(nextActivePlay.cards);

        const playersWithEncoreStatus = updatedPlayers.map((p, i) =>
          i === nextTurnIdx
            ? { ...p, lastAction: `🎺 ENCORE! Cleared ${encoreNumStr} & plays any number!` }
            : p
        );

        const encoreLog = {
          id: `log-encore-${Date.now()}`,
          actorName: nextPlayer.name,
          avatar: nextPlayer.avatar,
          text: `🎺 ENCORE! ${encoreNumStr} survived a full lap! Discarded ${nextActivePlay.cards.length} card(s) — ${nextPlayer.name} now plays ANY number!`,
          type: 'encore',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        publishRoomState({
          ...currentRoom,
          players: playersWithEncoreStatus,
          discardPile: encoreDiscarded,
          activePlay: null,
          turnIndex: nextTurnIdx,
          bannerAlert: {
            id: Date.now(),
            title: 'BIG CHANCE! ENCORE!',
            subtitle: `${nextPlayer.name}'s number (${encoreNumStr}) survived a full lap! It is discarded and ${nextPlayer.name} leads with ANY number!`,
            type: 'encore'
          },
          actionLogs: [encoreLog, ...nextLogs.slice(0, 29)]
        });

        setSelectedHandIndices([]);
        setSelectedTakeEnd(null);
        setActionMode('A');
        return;
      }

      // Standard turn update
      publishRoomState({
        ...currentRoom,
        players: updatedPlayers,
        activePlay: nextActivePlay,
        discardPile: nextDiscardPile,
        turnIndex: nextTurnIdx,
        bannerAlert: null,
        actionLogs: nextLogs
      });

      setSelectedHandIndices([]);
      setSelectedTakeEnd(null);
      setActionMode('A');
    },
    [publishRoomState]
  );

  // ==========================================
  // EXECUTE ACTIONS (A: PLAY, B: TAKE, C: ADD)
  // ==========================================

  const executeActionA = useCallback(
    (playerIdx, startIdx, endIdx, overrideRoom = null) => {
      const currentRoom = overrideRoom || roomStateRef.current;
      if (!currentRoom) return;
      const player = currentRoom.players[playerIdx];
      if (!player) return;

      const cardsToPlay = player.hand.slice(startIdx, endIdx + 1);
      if (!isValidChain(cardsToPlay)) return;

      const playedNumStr = getChainNumberString(cardsToPlay);
      const currentNumStr = currentRoom.activePlay
        ? getChainNumberString(currentRoom.activePlay.cards)
        : null;

      if (!isStrictlyGreater(playedNumStr, currentNumStr)) return;

      sfx.playCards(cardsToPlay.length);

      const newHand = [
        ...player.hand.slice(0, startIdx),
        ...player.hand.slice(endIdx + 1)
      ];

      const newDiscard = currentRoom.activePlay
        ? [...(currentRoom.discardPile || []), ...currentRoom.activePlay.cards]
        : [...(currentRoom.discardPile || [])];

      const newActivePlay = {
        ownerId: player.id,
        ownerName: player.name,
        ownerAvatar: player.avatar,
        cards: cardsToPlay
      };

      const prevDesc = currentNumStr ? ` (replacing ${currentNumStr})` : ' (opening lead)';
      const updatedPlayers = currentRoom.players.map((p, idx) =>
        idx === playerIdx
          ? {
              ...p,
              hand: newHand,
              lastAction: `Played ${playedNumStr} (${cardsToPlay.length} card${
                cardsToPlay.length > 1 ? 's' : ''
              })`
            }
          : p
      );

      const logEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        actorName: player.name,
        avatar: player.avatar,
        text: `Action A (Play): Played ${playedNumStr} [${cardsToPlay
          .map((c) => c.label)
          .join('→')}]${prevDesc}`,
        type: player.isHuman ? 'human' : 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      advanceTurnOrCheckWinner(
        currentRoom,
        updatedPlayers,
        newActivePlay,
        newDiscard,
        playerIdx,
        logEntry
      );
    },
    [advanceTurnOrCheckWinner]
  );

  const executeActionB = useCallback(
    (playerIdx, side, insertIndex, overrideRoom = null) => {
      const currentRoom = overrideRoom || roomStateRef.current;
      if (!currentRoom || !currentRoom.activePlay || currentRoom.activePlay.cards.length === 0)
        return;
      const player = currentRoom.players[playerIdx];
      if (!player) return;

      const isLeft = side === 'left';
      const takenCard = isLeft
        ? currentRoom.activePlay.cards[0]
        : currentRoom.activePlay.cards[currentRoom.activePlay.cards.length - 1];

      const remainingTableCards = isLeft
        ? currentRoom.activePlay.cards.slice(1)
        : currentRoom.activePlay.cards.slice(0, currentRoom.activePlay.cards.length - 1);

      sfx.takeCard();

      const newHand = [
        ...player.hand.slice(0, insertIndex),
        takenCard,
        ...player.hand.slice(insertIndex)
      ];

      const oldNumStr = getChainNumberString(currentRoom.activePlay.cards);
      const newTableNumStr =
        remainingTableCards.length > 0 ? getChainNumberString(remainingTableCards) : null;

      const nextActivePlay =
        remainingTableCards.length > 0
          ? { ...currentRoom.activePlay, cards: remainingTableCards }
          : null;

      const updatedPlayers = currentRoom.players.map((p, idx) =>
        idx === playerIdx
          ? {
              ...p,
              hand: newHand,
              lastAction: `Took [${takenCard.label}] from ${side} end`
            }
          : p
      );

      const logEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        actorName: player.name,
        avatar: player.avatar,
        text: `Action B (Take): Took [${takenCard.label}] from ${side} of ${oldNumStr} → ${
          newTableNumStr
            ? `Current number is now ${newTableNumStr}`
            : 'Play Area is now empty! Next player plays ANY number!'
        }`,
        type: player.isHuman ? 'human' : 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      advanceTurnOrCheckWinner(
        currentRoom,
        updatedPlayers,
        nextActivePlay,
        currentRoom.discardPile || [],
        playerIdx,
        logEntry
      );
    },
    [advanceTurnOrCheckWinner]
  );

  const executeActionC = useCallback(
    (playerIdx, handIndex, side, overrideRoom = null) => {
      const currentRoom = overrideRoom || roomStateRef.current;
      if (!currentRoom || !currentRoom.activePlay || currentRoom.activePlay.cards.length === 0)
        return;
      const player = currentRoom.players[playerIdx];
      if (!player) return;

      const cardToAdd = player.hand[handIndex];
      if (!cardToAdd) return;

      const firstTable = currentRoom.activePlay.cards[0];
      const lastTable = currentRoom.activePlay.cards[currentRoom.activePlay.cards.length - 1];

      if (side === 'left' && cardToAdd.ones !== firstTable.tens) return;
      if (side === 'right' && lastTable.ones !== cardToAdd.tens) return;

      sfx.addCard();

      const newTableCards =
        side === 'left'
          ? [cardToAdd, ...currentRoom.activePlay.cards]
          : [...currentRoom.activePlay.cards, cardToAdd];

      const newHand = [
        ...player.hand.slice(0, handIndex),
        ...player.hand.slice(handIndex + 1)
      ];

      const oldNumStr = getChainNumberString(currentRoom.activePlay.cards);
      const newNumStr = getChainNumberString(newTableCards);

      const nextActivePlay = {
        ...currentRoom.activePlay,
        cards: newTableCards
      };

      const updatedPlayers = currentRoom.players.map((p, idx) =>
        idx === playerIdx
          ? {
              ...p,
              hand: newHand,
              lastAction: `Added [${cardToAdd.label}] to ${side} → ${newNumStr}`
            }
          : p
      );

      const logEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        actorName: player.name,
        avatar: player.avatar,
        text: `Action C (Add): Attached [${cardToAdd.label}] to ${side} of ${oldNumStr} → Number is now ${newNumStr}!`,
        type: player.isHuman ? 'human' : 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      advanceTurnOrCheckWinner(
        currentRoom,
        updatedPlayers,
        nextActivePlay,
        currentRoom.discardPile || [],
        playerIdx,
        logEntry
      );
    },
    [advanceTurnOrCheckWinner]
  );

  // ==========================================
  // AUTHORITATIVE HOST INTENT PROCESSOR (WebRTC + BroadcastChannel)
  // ==========================================

  const processGuestIntentOnHost = useCallback(
    (intent) => {
      const currentRoom = roomStateRef.current;
      if (!currentRoom || !intent) return;

      if (intent.action === 'CLAIM_SEAT') {
        const { clientId, name, avatar } = intent;
        const existingIdx = currentRoom.seats.findIndex((s) => s.occupantId === clientId);
        let updatedSeats = [...currentRoom.seats];

        if (existingIdx === -1 && currentRoom.status === 'lobby') {
          let targetIdx = updatedSeats.findIndex((s) => s.type === 'open' && !s.occupantId);
          if (targetIdx === -1) {
            targetIdx = updatedSeats.findIndex((s) => s.type === 'ai');
          }
          if (targetIdx !== -1) {
            updatedSeats[targetIdx] = {
              ...updatedSeats[targetIdx],
              type: 'human',
              occupantId: clientId,
              name: name || `Player ${targetIdx + 1}`,
              avatar: avatar || '🐧',
              title: 'WebRTC Challenger',
              color: 'from-emerald-500 to-teal-600'
            };
          }
        }

        publishRoomState({
          ...currentRoom,
          seats: updatedSeats,
          actionLogs: [
            {
              id: `log-${Date.now()}-${Math.random()}`,
              actorName: name || 'Remote Player',
              avatar: avatar || '🐧',
              text: `${name || 'Remote Player'} connected via PeerJS WebRTC!`,
              type: 'system',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            },
            ...(currentRoom.actionLogs || []).slice(0, 28)
          ]
        });
        return;
      }

      if (intent.action === 'LOCK_INITIAL_HAND') {
        const { clientId, reverseIt } = intent;
        const pIdx = currentRoom.players.findIndex((p) => p.id === clientId);
        if (pIdx === -1) return;

        const targetPlayer = currentRoom.players[pIdx];
        if (targetPlayer.readyForRound) return;

        sfx.playCards(2);
        const updatedPlayers = currentRoom.players.map((p, idx) => {
          if (idx !== pIdx) return p;
          const finalHand = reverseIt ? [...p.hand].reverse() : [...p.hand];
          return {
            ...p,
            hand: finalHand,
            readyForRound: true,
            lastAction: reverseIt ? 'Locked Hand (Reversed 🔄)' : 'Locked Hand (Kept Order 👍)'
          };
        });

        const everyoneReady = updatedPlayers.every((p) => p.readyForRound);
        publishRoomState({
          ...currentRoom,
          status: everyoneReady ? 'playing' : 'setup_choice',
          players: updatedPlayers,
          actionLogs: [
            {
              id: `log-${Date.now()}-${Math.random()}`,
              actorName: targetPlayer.name,
              avatar: targetPlayer.avatar,
              text: everyoneReady
                ? `${targetPlayer.name} locked in their hand! All players ready — Round ${currentRoom.roundNumber} begins!`
                : `${targetPlayer.name} locked in their initial hand order. Waiting for other players...`,
              type: 'human',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            },
            ...(currentRoom.actionLogs || []).slice(0, 28)
          ]
        });
        return;
      }

      if (intent.action === 'PLAY_A') {
        const { clientId, startIdx, endIdx } = intent;
        const pIdx = currentRoom.players.findIndex((p) => p.id === clientId);
        if (pIdx === -1 || currentRoom.turnIndex !== pIdx) return;
        executeActionA(pIdx, startIdx, endIdx, currentRoom);
        return;
      }

      if (intent.action === 'TAKE_B') {
        const { clientId, side, insertIndex } = intent;
        const pIdx = currentRoom.players.findIndex((p) => p.id === clientId);
        if (pIdx === -1 || currentRoom.turnIndex !== pIdx) return;
        executeActionB(pIdx, side, insertIndex, currentRoom);
        return;
      }

      if (intent.action === 'ADD_C') {
        const { clientId, handIndex, side } = intent;
        const pIdx = currentRoom.players.findIndex((p) => p.id === clientId);
        if (pIdx === -1 || currentRoom.turnIndex !== pIdx) return;
        executeActionC(pIdx, handIndex, side, currentRoom);
      }
    },
    [publishRoomState, executeActionA, executeActionB, executeActionC]
  );

  useEffect(() => {
    handleGuestIntentRef.current = processGuestIntentOnHost;
  }, [processGuestIntentOnHost]);

  // ==========================================
  // LOBBY & PEERJS WEBRTC ROOM CREATION / JOIN
  // ==========================================

  const handleCreateRoom = async (quickStartSolo = false) => {
    sfx.click();
    destroyPeerSession();

    const code = generateRoomCode();
    const initialSeats = createInitialSeats(myClientId, playerName.trim() || 'Host', playerAvatar);

    if (quickStartSolo) {
      initialSeats[1] = {
        seatIndex: 1,
        type: 'ai',
        occupantId: 'ai-seat-1',
        name: AI_PROFILES[0].name,
        avatar: AI_PROFILES[0].avatar,
        title: AI_PROFILES[0].title,
        color: AI_PROFILES[0].color,
        aiProfileId: AI_PROFILES[0].id
      };
    }

    const newRoom = {
      roomCode: code,
      hostId: myClientId,
      hostName: playerName.trim() || 'Host',
      status: 'lobby',
      aiDifficulty: 'smart',
      assistLocked: true,
      assistPreset: localAssistPreset,
      assistOptions: { ...localAssistOptions },
      seats: initialSeats,
      players: [],
      roundNumber: 1,
      startingPlayerIndex: 0,
      turnIndex: 0,
      activePlay: null,
      discardPile: [],
      unusedDeckCount: 0,
      actionLogs: [
        {
          id: `log-${Date.now()}`,
          actorName: playerName.trim() || 'Host',
          avatar: playerAvatar,
          text: `Created WebRTC Room ${code}! Share this code with up to 4 friends anywhere on the internet!`,
          type: 'system',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ],
      bannerAlert: null,
      roundWinner: null,
      gameWinner: null,
      updatedAt: Date.now()
    };

    setRoomCode(code);
    publishRoomState(newRoom);

    // Register Host PeerJS ID `hyakuju-parade-room-${code}` for live cross-internet WebRTC connections
    if (window.Peer && !quickStartSolo) {
      try {
        setPeerStatus('Registering WebRTC Room...');
        const hostPeer = new window.Peer(`${PEER_ROOM_PREFIX}${code}`);
        peerRef.current = hostPeer;

        hostPeer.on('open', () => {
          setPeerStatus('PeerJS WebRTC Hosting Live');
        });

        hostPeer.on('connection', (conn) => {
          hostConnectionsRef.current.push(conn);
          setConnectedPeerCount(hostConnectionsRef.current.filter((c) => c.open).length + 1);

          conn.on('open', () => {
            setConnectedPeerCount(hostConnectionsRef.current.filter((c) => c.open).length);
            // Send latest room state immediately upon connection
            if (roomStateRef.current) {
              conn.send({ type: 'ROOM_UPDATE', room: roomStateRef.current });
            }
          });

          conn.on('data', (msg) => {
            if (msg && msg.type === 'GUEST_INTENT' && handleGuestIntentRef.current) {
              handleGuestIntentRef.current(msg.intent);
            }
          });

          conn.on('close', () => {
            hostConnectionsRef.current = hostConnectionsRef.current.filter((c) => c !== conn);
            setConnectedPeerCount(hostConnectionsRef.current.filter((c) => c.open).length);
          });
        });

        hostPeer.on('error', (err) => {
          console.warn('Host PeerJS error:', err);
          setPeerStatus('Local Multi-Tab Sync Active');
        });
      } catch (e) {
        console.warn('Could not create PeerJS host:', e);
      }
    }

    if (quickStartSolo) {
      startRoundInRoom(newRoom, null, 0, 1);
      setScreen('game');
    } else {
      setScreen('lobby');
    }
  };

  const handleJoinRoomByCode = async (targetCode) => {
    sfx.click();
    const cleanCode = (targetCode || joinCodeInput).trim().toUpperCase();
    if (!cleanCode) return;

    destroyPeerSession();
    setRoomCode(cleanCode);

    // Check if the room is already known in local BroadcastChannel list
    const localRoom = availableRooms.find((r) => r.roomCode === cleanCode);
    if (localRoom) {
      setRoomState(localRoom);
      setScreen(localRoom.status === 'lobby' ? 'lobby' : 'game');
      if (bcRef.current) {
        bcRef.current.postMessage({
          type: 'GUEST_INTENT',
          roomCode: cleanCode,
          intent: {
            action: 'CLAIM_SEAT',
            clientId: myClientId,
            name: playerName.trim() || 'Player',
            avatar: playerAvatar
          }
        });
      }
    }

    // Connect over PeerJS WebRTC across the internet to `hyakuju-parade-room-${cleanCode}`
    if (window.Peer) {
      try {
        setPeerStatus(`Connecting to ${cleanCode} via WebRTC...`);
        const guestPeer = new window.Peer();
        peerRef.current = guestPeer;

        guestPeer.on('open', () => {
          const conn = guestPeer.connect(`${PEER_ROOM_PREFIX}${cleanCode}`, {
            reliable: true
          });
          guestConnectionRef.current = conn;

          conn.on('open', () => {
            setPeerStatus('PeerJS WebRTC Connected');
            setConnectedPeerCount(1);
            conn.send({
              type: 'GUEST_INTENT',
              roomCode: cleanCode,
              intent: {
                action: 'CLAIM_SEAT',
                clientId: myClientId,
                name: playerName.trim() || 'Player',
                avatar: playerAvatar
              }
            });
          });

          conn.on('data', (msg) => {
            if (msg && msg.type === 'ROOM_UPDATE' && msg.room) {
              roomStateRef.current = msg.room;
              setRoomState(msg.room);
              setScreen(msg.room.status === 'lobby' ? 'lobby' : 'game');
            }
          });

          conn.on('close', () => {
            setPeerStatus('WebRTC Disconnected');
            setConnectedPeerCount(0);
          });

          conn.on('error', (err) => {
            console.warn('Guest DataConnection error:', err);
          });
        });

        guestPeer.on('error', (err) => {
          console.warn('Guest PeerJS error:', err);
          if (!localRoom) {
            setPeerStatus('Room Not Found on WebRTC');
            setRuleCheckToast({
              title: 'Could Not Connect to Room',
              detail: `No active PeerJS WebRTC host found for code "${cleanCode}". Make sure the Host has the Lobby open!`
            });
          }
        });
      } catch (e) {
        console.warn('Error connecting via PeerJS:', e);
      }
    } else if (!localRoom) {
      setRuleCheckToast({
        title: 'Room Not Found',
        detail: `Could not find Room "${cleanCode}".`
      });
    }
  };

  // Host configures a seat in the Lobby
  const handleConfigureSeat = (seatIdx, newType, aiProfileId = null) => {
    if (!roomState || !isHost || seatIdx === 0) return;
    sfx.click();

    const updatedSeats = roomState.seats.map((seat, idx) => {
      if (idx !== seatIdx) return seat;
      if (newType === 'open') {
        return {
          ...seat,
          type: 'open',
          occupantId: null,
          name: `Open Seat #${idx + 1}`,
          avatar: '👤',
          title: 'Waiting for Human Player...',
          color: 'from-sky-500 to-blue-600'
        };
      }
      if (newType === 'ai') {
        const chosenProfile =
          AI_PROFILES.find((p) => p.id === (aiProfileId || seat.aiProfileId)) ||
          AI_PROFILES[idx % AI_PROFILES.length];
        return {
          ...seat,
          type: 'ai',
          occupantId: `ai-seat-${idx}`,
          name: chosenProfile.name,
          avatar: chosenProfile.avatar,
          title: chosenProfile.title,
          color: chosenProfile.color,
          aiProfileId: chosenProfile.id
        };
      }
      return {
        ...seat,
        type: 'closed',
        occupantId: null,
        name: 'Closed Seat',
        avatar: '🔒',
        title: 'Seat Disabled',
        color: 'from-slate-800 to-slate-900'
      };
    });

    const activeCount = updatedSeats.filter((s) => s.type !== 'closed').length;
    if (activeCount < 2) {
      setRuleCheckToast({
        title: 'Minimum 2 Players Required',
        detail: 'Hyakuju Parade requires 2 to 5 active seats (any mix of humans and AI bots).'
      });
      return;
    }

    publishRoomState({
      ...roomState,
      seats: updatedSeats
    });
  };

  // ==========================================
  // ASSIST LEVEL & HOST LOCK CONTROLS
  // ==========================================

  const handleSelectAssistPreset = (presetKey) => {
    sfx.click();
    const preset = ASSIST_PRESETS[presetKey];
    const nextOptions =
      presetKey === 'custom'
        ? effectiveAssistOptions
        : { ...(preset?.options || ASSIST_PRESETS.full.options) };

    if (roomState && isHost) {
      publishRoomState({
        ...roomState,
        assistPreset: presetKey,
        assistOptions: nextOptions
      });
    }
    setLocalAssistPreset(presetKey);
    setLocalAssistOptions(nextOptions);
  };

  const handleToggleAssistOption = (optionKey) => {
    sfx.click();
    const baseOpts = effectiveAssistOptions;
    const next = { ...baseOpts, [optionKey]: !baseOpts[optionKey] };
    const matchesPreset = ['full', 'subtle', 'strict'].find((pKey) => {
      const pOpts = ASSIST_PRESETS[pKey].options;
      return Object.keys(pOpts).every((k) => pOpts[k] === next[k]);
    });
    const nextPreset = matchesPreset || 'custom';

    if (roomState && isHost) {
      publishRoomState({
        ...roomState,
        assistPreset: nextPreset,
        assistOptions: next
      });
    }
    setLocalAssistPreset(nextPreset);
    setLocalAssistOptions(next);
  };

  const handleToggleHostAssistLock = () => {
    if (!roomState || !isHost) return;
    sfx.click();
    publishRoomState({
      ...roomState,
      assistLocked: !roomState.assistLocked
    });
  };

  // Human Player locks in their initial hand order (Simultaneous Ready Check!)
  const handleConfirmInitialHand = (reverseIt) => {
    if (!roomState || myPlayerIndex === -1) return;
    setHandReversedPreview(false);
    sendIntentToHost({
      action: 'LOCK_INITIAL_HAND',
      clientId: myClientId,
      reverseIt
    });
  };

  // ==========================================
  // AUTHORITATIVE HOST AI TURN ENGINE
  // ==========================================

  useEffect(() => {
    if (!roomState || roomState.status !== 'playing') return;
    if (!isHost) return;

    const tIdx = roomState.turnIndex;
    const currentPlayer = roomState.players?.[tIdx];
    if (!currentPlayer || currentPlayer.isHuman) return;

    aiTimeoutRef.current = setTimeout(() => {
      const hand = currentPlayer.hand;
      const activePlay = roomState.activePlay;
      const currentNumStr = activePlay ? getChainNumberString(activePlay.cards) : null;

      const legalPlays = getAllValidHandSubchains(hand, currentNumStr);
      const instantWinA = legalPlays.find((m) => m.length === hand.length);
      if (instantWinA) {
        executeActionA(tIdx, instantWinA.startIndex, instantWinA.endIndex);
        return;
      }

      const legalAdds = activePlay ? getLegalAddMoves(hand, activePlay.cards) : [];
      if (hand.length === 1 && legalAdds.length > 0) {
        executeActionC(tIdx, legalAdds[0].handIndex, legalAdds[0].side);
        return;
      }

      if (!activePlay) {
        let bestPlay = legalPlays[0];
        let bestScore = -Infinity;

        legalPlays.forEach((play) => {
          const remainingHand = [
            ...hand.slice(0, play.startIndex),
            ...hand.slice(play.endIndex + 1)
          ];
          const postScore = evaluateHandScore(remainingHand);
          const moveScore = play.length * 32 + postScore;
          if (moveScore > bestScore) {
            bestScore = moveScore;
            bestPlay = play;
          }
        });

        if (bestPlay) {
          executeActionA(tIdx, bestPlay.startIndex, bestPlay.endIndex);
        }
        return;
      }

      let bestActionA = null;
      let bestAScore = -Infinity;

      legalPlays.forEach((play) => {
        const remainingHand = [
          ...hand.slice(0, play.startIndex),
          ...hand.slice(play.endIndex + 1)
        ];
        const postScore = evaluateHandScore(remainingHand);
        const overkillPenalty =
          play.length - activePlay.cards.length >= 2 && remainingHand.length > 2 ? -25 : 0;
        const score = play.length * 35 + postScore + overkillPenalty;
        if (score > bestAScore) {
          bestAScore = score;
          bestActionA = play;
        }
      });

      let bestActionC = null;
      let bestCScore = -Infinity;
      legalAdds.forEach((addMove) => {
        const remainingHand = [
          ...hand.slice(0, addMove.handIndex),
          ...hand.slice(addMove.handIndex + 1)
        ];
        const postScore = evaluateHandScore(remainingHand) + 28;
        if (postScore > bestCScore) {
          bestCScore = postScore;
          bestActionC = addMove;
        }
      });

      let bestActionB = { side: 'left', insertIndex: 0 };
      let bestBScore = -Infinity;
      const candidateSides = activePlay.cards.length === 1 ? ['left'] : ['left', 'right'];

      candidateSides.forEach((side) => {
        const card =
          side === 'left'
            ? activePlay.cards[0]
            : activePlay.cards[activePlay.cards.length - 1];
        for (let slot = 0; slot <= hand.length; slot++) {
          const testHand = [...hand.slice(0, slot), card, ...hand.slice(slot)];
          const score = evaluateHandScore(testHand);
          if (score > bestBScore) {
            bestBScore = score;
            bestActionB = { side, insertIndex: slot };
          }
        }
      });

      const currentHandBaseScore = evaluateHandScore(hand);
      const bGain = bestBScore - currentHandBaseScore;

      if (bestActionA && (bestActionA.length >= activePlay.cards.length || hand.length <= 4)) {
        executeActionA(tIdx, bestActionA.startIndex, bestActionA.endIndex);
      } else if (bestActionC && bestCScore >= bestAScore - 10) {
        executeActionC(tIdx, bestActionC.handIndex, bestActionC.side);
      } else if (bestActionA && bGain < 15) {
        executeActionA(tIdx, bestActionA.startIndex, bestActionA.endIndex);
      } else {
        executeActionB(tIdx, bestActionB.side, bestActionB.insertIndex);
      }
    }, 1100);

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [roomState, isHost, executeActionA, executeActionB, executeActionC]);

  // ==========================================
  // GITHUB REST API EXPORTER & STANDALONE HTML DOWNLOADER
  // ==========================================

  const generateStandaloneHtmlContent = useCallback(() => {
    const title = 'Hyakuju Parade (百獣パレード) — Online WebRTC Card Game';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
</head>
<body class="bg-slate-950 text-white min-h-screen">
  <div id="root"></div>
  <!-- Standalone Hyakuju Parade WebRTC Build -->
  <script>
    console.log("Hyakuju Parade WebRTC Multiplayer Ready.");
  </script>
</body>
</html>`;
  }, []);

  const handleDownloadStandaloneHtml = () => {
    sfx.click();
    const htmlContent = generateStandaloneHtmlContent();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePushToGitHub = async () => {
    sfx.click();
    const token = ghToken.trim();
    const owner = ghOwner.trim();
    const repo = ghRepo.trim();
    const branch = ghBranch.trim() || 'main';

    if (!token || !owner || !repo) {
      setGhPushStatus({
        state: 'error',
        message: 'Please provide your GitHub Personal Access Token, GitHub Username/Owner, and Repository Name.'
      });
      return;
    }

    setGhPushStatus({
      state: 'pushing',
      message: `Connecting to GitHub API (${owner}/${repo})...`
    });

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    };

    try {
      // 1. Check if repository exists; if not and ghAutoCreateRepo is true, create it
      const repoCheckRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers
      });

      if (repoCheckRes.status === 404 && ghAutoCreateRepo) {
        setGhPushStatus({
          state: 'pushing',
          message: `Creating new public repository "${owner}/${repo}" on GitHub...`
        });
        const createRes = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: repo,
            description: 'Hyakuju Parade (百獣パレード) — Online WebRTC Multiplayer Card Game',
            private: false,
            auto_init: true
          })
        });
        if (!createRes.ok) {
          const errJson = await createRes.json().catch(() => ({}));
          throw new Error(errJson.message || `Failed to create repository (${createRes.status})`);
        }
      } else if (!repoCheckRes.ok && repoCheckRes.status !== 404) {
        const errJson = await repoCheckRes.json().catch(() => ({}));
        throw new Error(errJson.message || `GitHub API error (${repoCheckRes.status})`);
      }

      // Helper to create or update a file in the repository
      const upsertFile = async (filePath, textContent, commitMessage) => {
        let existingSha = null;
        const getFileRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
          { headers }
        );
        if (getFileRes.ok) {
          const fileData = await getFileRes.json();
          existingSha = fileData.sha;
        }

        const base64Content = btoa(unescape(encodeURIComponent(textContent)));
        const putRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: commitMessage,
              content: base64Content,
              branch,
              ...(existingSha ? { sha: existingSha } : {})
            })
          }
        );

        if (!putRes.ok) {
          const errJson = await putRes.json().catch(() => ({}));
          throw new Error(
            errJson.message || `Failed to push ${filePath} (HTTP ${putRes.status})`
          );
        }
      };

      setGhPushStatus({
        state: 'pushing',
        message: 'Committing README.md and index.html to GitHub...'
      });

      await upsertFile(
        'README.md',
        buildStandaloneReadme(repo),
        'Add Hyakuju Parade WebRTC Multiplayer README'
      );

      await upsertFile(
        'index.html',
        generateStandaloneHtmlContent(),
        'Deploy Hyakuju Parade WebRTC Multiplayer Game'
      );

      setGhPushStatus({
        state: 'success',
        message: `Successfully pushed to ${owner}/${repo} (${branch})!`,
        url: `https://github.com/${owner}/${repo}`,
        pagesUrl: `https://${owner}.github.io/${repo}/`
      });
    } catch (err) {
      setGhPushStatus({
        state: 'error',
        message: err.message || 'Failed to push to GitHub. Check your token permissions (repo / contents:write).'
      });
    }
  };

  // ==========================================
  // LOCAL HUMAN PLAYER DERIVED DATA & HELPERS
  // ==========================================

  const activePlay = roomState?.activePlay || null;
  const players = roomState?.players || [];
  const phase = roomState?.status || 'lobby';
  const turnIndex = roomState?.turnIndex || 0;
  const roundNumber = roomState?.roundNumber || 1;
  const discardPile = roomState?.discardPile || [];
  const unusedDeckCount = roomState?.unusedDeckCount || 0;
  const actionLogs = roomState?.actionLogs || [];

  const myHand = myPlayer?.hand || [];
  const isMyTurn = phase === 'playing' && turnIndex === myPlayerIndex && myPlayerIndex !== -1;

  const currentActiveNumStr = useMemo(
    () => (activePlay ? getChainNumberString(activePlay.cards) : null),
    [activePlay]
  );

  const displayedMyHand = useMemo(() => {
    if (phase === 'setup_choice' && !myPlayer?.readyForRound && handReversedPreview) {
      return [...myHand].reverse();
    }
    return myHand;
  }, [myHand, phase, myPlayer?.readyForRound, handReversedPreview]);

  const myLegalPlaysA = useMemo(
    () => getAllValidHandSubchains(myHand, currentActiveNumStr),
    [myHand, currentActiveNumStr]
  );

  const myLegalAddsC = useMemo(
    () => (activePlay ? getLegalAddMoves(myHand, activePlay.cards) : []),
    [myHand, activePlay]
  );

  const handCardCapabilities = useMemo(() => {
    const canA = new Set();
    const canC = new Set();
    myLegalPlaysA.forEach((m) => {
      for (let i = m.startIndex; i <= m.endIndex; i++) canA.add(i);
    });
    myLegalAddsC.forEach((m) => canC.add(m.handIndex));
    return { canA, canC };
  }, [myLegalPlaysA, myLegalAddsC]);

  const selectedCards = useMemo(() => {
    if (selectedHandIndices.length === 0) return [];
    const start = Math.min(...selectedHandIndices);
    const end = Math.max(...selectedHandIndices);
    return myHand.slice(start, end + 1);
  }, [myHand, selectedHandIndices]);

  const selectedChainValid = useMemo(() => isValidChain(selectedCards), [selectedCards]);
  const selectedChainNumStr = useMemo(
    () => (selectedChainValid ? getChainNumberString(selectedCards) : null),
    [selectedCards, selectedChainValid]
  );
  const canPlaySelectedA = useMemo(
    () =>
      isMyTurn &&
      selectedChainValid &&
      isStrictlyGreater(selectedChainNumStr, currentActiveNumStr),
    [isMyTurn, selectedChainValid, selectedChainNumStr, currentActiveNumStr]
  );

  const selectedSingleCardAddOptions = useMemo(() => {
    if (!isMyTurn || !activePlay || selectedHandIndices.length !== 1) {
      return { canLeft: false, canRight: false, leftStr: '', rightStr: '', card: null };
    }
    const idx = selectedHandIndices[0];
    const card = myHand[idx];
    if (!card) return { canLeft: false, canRight: false, leftStr: '', rightStr: '', card: null };

    const first = activePlay.cards[0];
    const last = activePlay.cards[activePlay.cards.length - 1];
    const canLeft = card.ones === first.tens;
    const canRight = last.ones === card.tens;

    return {
      card,
      canLeft,
      canRight,
      leftStr: canLeft ? getChainNumberString([card, ...activePlay.cards]) : '',
      rightStr: canRight ? getChainNumberString([...activePlay.cards, card]) : ''
    };
  }, [isMyTurn, activePlay, selectedHandIndices, myHand]);

  const triggerRuleCheckToast = useCallback((title, detail) => {
    sfx.error();
    setRuleCheckToast({ title, detail, id: Date.now() });
  }, []);

  useEffect(() => {
    setRuleCheckToast(null);
  }, [selectedHandIndices, actionMode, turnIndex, phase]);

  const handleAttemptHumanPlayA = () => {
    if (!isMyTurn) return;
    if (selectedHandIndices.length === 0) {
      triggerRuleCheckToast(
        'No Cards Selected',
        'Click 1 card or a contiguous chain of adjacent cards in your hand first!'
      );
      return;
    }

    const start = Math.min(...selectedHandIndices);
    const end = Math.max(...selectedHandIndices);
    const chosenCards = myHand.slice(start, end + 1);

    for (let i = 0; i < chosenCards.length - 1; i++) {
      if (chosenCards[i].ones !== chosenCards[i + 1].tens) {
        triggerRuleCheckToast(
          'Tabletop Rule Check: Invalid Chain!',
          `Card [${chosenCards[i].label}] and Card [${chosenCards[i + 1].label}] cannot be chained because the ones digit of [${chosenCards[i].label}] (${chosenCards[i].ones}) does not match the tens digit of [${chosenCards[i + 1].label}] (${chosenCards[i + 1].tens}).`
        );
        return;
      }
    }

    const playedStr = getChainNumberString(chosenCards);
    if (!isStrictlyGreater(playedStr, currentActiveNumStr)) {
      triggerRuleCheckToast(
        'Tabletop Rule Check: Number Not Large Enough!',
        `Your selected number (${playedStr}) must be strictly greater than the current active number on the table (${currentActiveNumStr}). Try chaining more cards or choosing Action B (Take Card) / Action C (Add Card)!`
      );
      return;
    }

    sendIntentToHost({
      action: 'PLAY_A',
      clientId: myClientId,
      startIdx: start,
      endIdx: end
    });
  };

  const handleAttemptHumanTakeB = (side, insertIdx) => {
    if (!isMyTurn || !activePlay) return;
    sendIntentToHost({
      action: 'TAKE_B',
      clientId: myClientId,
      side,
      insertIndex: insertIdx
    });
  };

  const handleAttemptHumanAddC = (side) => {
    if (!isMyTurn || !activePlay) return;
    if (selectedHandIndices.length !== 1) {
      triggerRuleCheckToast(
        'Select Exactly 1 Card for Action C',
        'In Action C (Add Card), select a single card from your hand to attach to either the left or right end of the active number.'
      );
      return;
    }

    const handIdx = selectedHandIndices[0];
    const card = myHand[handIdx];
    const firstTable = activePlay.cards[0];
    const lastTable = activePlay.cards[activePlay.cards.length - 1];

    if (side === 'left' && card.ones !== firstTable.tens) {
      triggerRuleCheckToast(
        'Tabletop Rule Check: Cannot Attach to Left End!',
        `To attach [${card.label}] to the LEFT of ${currentActiveNumStr} (starts with [${firstTable.label}]), your card's ones digit (${card.ones}) must match the tens digit of [${firstTable.label}] (${firstTable.tens}).`
      );
      return;
    }

    if (side === 'right' && lastTable.ones !== card.tens) {
      triggerRuleCheckToast(
        'Tabletop Rule Check: Cannot Attach to Right End!',
        `To attach [${card.label}] to the RIGHT of ${currentActiveNumStr} (ends with [${lastTable.label}]), your card's tens digit (${card.tens}) must match the ones digit of [${lastTable.label}] (${lastTable.ones}).`
      );
      return;
    }

    sendIntentToHost({
      action: 'ADD_C',
      clientId: myClientId,
      handIndex: handIdx,
      side
    });
  };

  const getInsertPreviewInfo = useCallback(
    (slotIdx) => {
      if (!activePlay || !selectedTakeEnd) return null;
      const takenCard =
        selectedTakeEnd === 'left'
          ? activePlay.cards[0]
          : activePlay.cards[activePlay.cards.length - 1];
      if (!takenCard) return null;

      const leftNeighbor = slotIdx > 0 ? myHand[slotIdx - 1] : null;
      const rightNeighbor = slotIdx < myHand.length ? myHand[slotIdx] : null;

      const linksLeft = leftNeighbor && leftNeighbor.ones === takenCard.tens;
      const linksRight = rightNeighbor && takenCard.ones === rightNeighbor.tens;

      return {
        takenCard,
        linksLeft,
        linksRight,
        isBridge: linksLeft && linksRight,
        isAnyLink: linksLeft || linksRight
      };
    },
    [activePlay, selectedTakeEnd, myHand]
  );

  const handleHandCardClick = (idx) => {
    if (phase !== 'playing') return;
    sfx.click();

    if (actionMode === 'B') {
      setActionMode('A');
      setSelectedTakeEnd(null);
    }

    if (actionMode === 'C') {
      setSelectedHandIndices(selectedHandIndices[0] === idx ? [] : [idx]);
      return;
    }

    if (selectedHandIndices.length === 0) {
      setSelectedHandIndices([idx]);
      return;
    }

    const minIdx = Math.min(...selectedHandIndices);
    const maxIdx = Math.max(...selectedHandIndices);

    if (idx === minIdx && idx === maxIdx) {
      setSelectedHandIndices([]);
    } else if (idx === minIdx - 1) {
      const candidate = myHand.slice(idx, maxIdx + 1);
      if (!effectiveAssistOptions.showChainValuePreview || isValidChain(candidate)) {
        setSelectedHandIndices([idx, ...selectedHandIndices]);
      } else {
        setSelectedHandIndices([idx]);
      }
    } else if (idx === maxIdx + 1) {
      const candidate = myHand.slice(minIdx, idx + 1);
      if (!effectiveAssistOptions.showChainValuePreview || isValidChain(candidate)) {
        setSelectedHandIndices([...selectedHandIndices, idx]);
      } else {
        setSelectedHandIndices([idx]);
      }
    } else if (idx >= minIdx && idx <= maxIdx) {
      setSelectedHandIndices([idx]);
    } else {
      setSelectedHandIndices([idx]);
    }
  };

  const setupHandComparison = useMemo(() => {
    const normal = analyzeHandChains(myHand);
    const reversed = analyzeHandChains([...myHand].reverse());
    return { normal, reversed };
  }, [myHand]);

  const activePresetMeta = ASSIST_PRESETS[effectiveAssistPreset] || ASSIST_PRESETS.custom;
  const activeAssistCount = Object.values(effectiveAssistOptions).filter(Boolean).length;

  // ==========================================
  // RENDER UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-amber-950 text-white flex flex-col font-sans select-none overflow-x-hidden">
      {/* ========================================== */}
      {/* TOP FESTIVE PARADE NAVBAR */}
      {/* ========================================== */}
      <header className="border-b border-amber-400/20 bg-slate-950/80 backdrop-blur-md px-3 py-2.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Brand Title & Live WebRTC Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-white/30 text-xl">
              🦁
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-yellow-300 to-rose-200 bg-clip-text text-transparent">
                  HYAKUJU PARADE
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  百獣パレード
                </span>

                {/* Live WebRTC Badge */}
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    peerReady
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                      : 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                  }`}
                  title="PeerJS WebRTC P2P Status"
                >
                  <Wifi className="w-3 h-3" />
                  <span>{peerStatus}</span>
                  {connectedPeerCount > 0 && (
                    <span className="ml-0.5 px-1.5 rounded bg-emerald-400 text-slate-950 font-black">
                      {connectedPeerCount} P2P
                    </span>
                  )}
                </span>

                {roomState && screen !== 'home' && (
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(roomState.roomCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 1800);
                    }}
                    className="px-2.5 py-0.5 rounded-lg bg-indigo-900/90 hover:bg-indigo-800 border border-indigo-400/50 text-xs font-mono font-black text-amber-300 flex items-center gap-1 transition"
                    title="Click to copy Room Code"
                  >
                    <span>ROOM: {roomState.roomCode}</span>
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {screen === 'home'
                  ? 'PeerJS WebRTC Online Multiplayer (1–5 Humans + AI Bots)'
                  : `Round ${roundNumber} • First to 2 Round Wins claims Parade Leader Dande!`}
              </p>
            </div>
          </div>

          {/* Right Controls: Assist Bar, Push to GitHub, Rulebook, Sound */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Assist Level Quick Bar */}
            <div className="flex items-center bg-slate-900/95 p-1 rounded-xl border border-slate-700/80 shadow-inner">
              {roomState?.assistLocked && !isHost && screen !== 'home' ? (
                <div className="px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-extrabold text-amber-200">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Host Locked: {activePresetMeta.name}</span>
                </div>
              ) : (
                [
                  { key: 'full', label: 'Full Assist' },
                  { key: 'subtle', label: 'Subtle Hints' },
                  { key: 'strict', label: 'Strict Tabletop' }
                ].map((p) => {
                  const isActive = effectiveAssistPreset === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => handleSelectAssistPreset(p.key)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                        isActive
                          ? p.key === 'full'
                            ? 'bg-emerald-400 text-slate-950 shadow'
                            : p.key === 'subtle'
                            ? 'bg-amber-400 text-slate-950 shadow'
                            : 'bg-rose-500 text-white shadow'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })
              )}

              <button
                onClick={() => {
                  sfx.click();
                  setShowAssistModal(true);
                }}
                className={`ml-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 border transition-all ${
                  effectiveAssistPreset === 'custom'
                    ? 'bg-purple-500 text-white border-purple-300 shadow'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-200 border-slate-600'
                }`}
                title="View or customize the 6 individual guidance options"
              >
                <Sliders className="w-3 h-3" />
                <span>
                  {roomState?.assistLocked && !isHost ? 'View Assist' : 'Customize'} ({activeAssistCount}/6)
                </span>
              </button>
            </div>

            {/* Push to GitHub / Export Button */}
            <button
              onClick={() => {
                sfx.click();
                setShowGitHubModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-400/50 text-emerald-200 transition shadow"
              title="Push directly to your GitHub repo or download standalone HTML"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-300" />
              <span>Push to GitHub</span>
            </button>

            {/* Rulebook Button */}
            <button
              onClick={() => {
                sfx.click();
                setShowRulesModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>Rulebook</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundMuted((m) => !m)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
              title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
            </button>

            {/* Return to Lobby / Leave Room */}
            {screen !== 'home' && (
              <button
                onClick={() => {
                  sfx.click();
                  destroyPeerSession();
                  setScreen('home');
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-500/50 text-xs font-bold text-slate-300 hover:text-rose-200 transition"
                title="Leave Room & Return Home"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================== */}
      {/* TABLETOP RULE CHECK TOAST */}
      {/* ========================================== */}
      {ruleCheckToast && (
        <div className="bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 text-white px-4 py-2.5 shadow-xl border-b border-rose-400/60 z-30">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <div className="font-black text-xs sm:text-sm text-amber-200 uppercase tracking-wide">
                  {ruleCheckToast.title}
                </div>
                <div className="text-xs text-rose-100">{ruleCheckToast.detail}</div>
              </div>
            </div>
            <button
              onClick={() => setRuleCheckToast(null)}
              className="px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-xs font-bold text-rose-200 shrink-0"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SCREEN 1: HOME / WEBRTC MULTIPLAYER HUB */}
      {/* ========================================== */}
      {screen === 'home' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col justify-center gap-6">
          {/* Hero Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-amber-900/60 border-2 border-amber-400/40 p-6 sm:p-8 shadow-2xl text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 text-xs font-black uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              PeerJS (WebRTC) Cross-Internet Multiplayer • 1–5 Humans + AI Bots
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              March Together in <span className="text-amber-300">Hyakuju Parade!</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
              Chain adjacent cards in your hand to build colossal numbers without rearranging your hand order! Host a live WebRTC room with a 6-character Room Code for remote friends, lock the Assist Level for testers, or push the standalone build directly to your GitHub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Left Column: Player Profile & Create Room (7 cols) */}
            <div className="md:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-700/80 p-5 space-y-5 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <User className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-base text-white">1. Your Parade Identity</h3>
                </div>

                {/* Name & Avatar Picker */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Choose Your Parade Mascot
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {AVATAR_CHOICES.map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => {
                            sfx.click();
                            setPlayerAvatar(emo);
                          }}
                          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition ${
                            playerAvatar === emo
                              ? 'bg-amber-400 border-white scale-110 shadow-lg'
                              : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Host Multiplayer Room or Quick Solo vs AI */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleCreateRoom(false)}
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:opacity-95 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition"
                >
                  <Wifi className="w-4 h-4" />
                  <span>Host WebRTC Room</span>
                </button>

                <button
                  onClick={() => handleCreateRoom(true)}
                  className="py-3.5 px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border-2 border-emerald-400/60 text-emerald-200 font-black text-sm flex items-center justify-center gap-2 transition"
                >
                  <Zap className="w-4 h-4 text-emerald-300" />
                  <span>Quick Solo vs 2 AI Bots</span>
                </button>
              </div>
            </div>

            {/* Right Column: Join via Room Code or Local Open Rooms List (5 cols) */}
            <div className="md:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-700/80 p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-black text-base text-white">2. Join a Room</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    WebRTC P2P
                  </span>
                </div>

                {/* 6-Char Room Code Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Enter 6-Character Room Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      placeholder="E.g. K7M9P2"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono uppercase tracking-widest text-amber-300 font-black text-sm focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={() => handleJoinRoomByCode(joinCodeInput)}
                      className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition"
                    >
                      Connect
                    </button>
                  </div>
                </div>

                {/* Local / Recent Rooms Feed */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                    <span>Detected Local Rooms ({availableRooms.length})</span>
                    <span className="text-[10px] text-emerald-400">Instant Sync</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {availableRooms.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-500 text-center">
                        Enter any remote friend&apos;s 6-character code above to connect over PeerJS WebRTC, or host a room on the left!
                      </div>
                    ) : (
                      availableRooms.map((rm) => {
                        const openSeats = (rm.seats || []).filter(
                          (s) => s.type === 'open' && !s.occupantId
                        ).length;
                        const activeSeats = (rm.seats || []).filter(
                          (s) => s.type !== 'closed'
                        ).length;
                        return (
                          <div
                            key={rm.roomCode}
                            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xs text-amber-300">
                                  {rm.roomCode}
                                </span>
                                <span className="text-xs font-bold text-white">
                                  Host: {rm.hostName}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {rm.status === 'lobby'
                                  ? `In Lobby • ${openSeats} open seat(s) of ${activeSeats}`
                                  : `Round ${rm.roundNumber} in progress`}
                              </div>
                            </div>
                            <button
                              onClick={() => handleJoinRoomByCode(rm.roomCode)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 font-bold text-xs transition"
                            >
                              Join
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-800/50 text-[11px] text-indigo-200 flex items-center justify-between gap-2">
                <span>
                  🚀 Want to host this on your own URL for testers? Click <strong>Push to GitHub</strong> in the top bar!
                </span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* SCREEN 2: SYNCHRONOUS MULTIPLAYER LOBBY */}
      {/* ========================================== */}
      {screen === 'lobby' && roomState && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 flex flex-col gap-5">
          {/* Top Room Code Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-2 border-amber-400/50 p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-black uppercase flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  {peerStatus}
                </span>
                {isHost ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black">
                    👑 You are Room Host
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400 text-sky-200 text-[11px] font-bold">
                    Connected to {roomState.hostName}&apos;s Room
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Configure Parade Seats & Assist Lock
              </h2>
              <p className="text-xs text-slate-300">
                Remote players anywhere on the internet can enter your 6-character code to join via PeerJS WebRTC. Unfilled &quot;Open&quot; seats automatically become AI Bots when you start!
              </p>
            </div>

            {/* Big Room Code Copy Card */}
            <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 rounded-2xl border border-amber-400/40 shrink-0">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  WebRTC Room Code
                </div>
                <div className="text-2xl font-mono font-black tracking-widest text-amber-300">
                  {roomState.roomCode}
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(roomState.roomCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 1800);
                }}
                className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow transition"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 5 Configurable Seats (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="font-black text-sm sm:text-base text-amber-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Parade Seats ({roomState.seats.filter((s) => s.type !== 'closed').length} Active / 5 Max)
                </span>
                <span className="text-xs text-slate-400">
                  {isHost ? 'Host: Click seat type to configure' : 'Host is configuring seats'}
                </span>
              </div>

              <div className="space-y-2.5">
                {roomState.seats.map((seat, idx) => {
                  const isMe = seat.occupantId === myClientId;
                  return (
                    <div
                      key={seat.seatIndex}
                      className={`p-3 rounded-2xl border transition flex flex-wrap items-center justify-between gap-3 ${
                        seat.type === 'closed'
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                          : isMe
                          ? 'bg-indigo-950/80 border-amber-400/70 shadow-md'
                          : 'bg-slate-950/90 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${seat.color} flex items-center justify-center text-2xl shadow border border-white/20`}
                        >
                          {seat.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">
                              Seat #{idx + 1}
                            </span>
                            <span className="font-extrabold text-sm text-white">
                              {seat.name}
                            </span>
                            {isMe && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{seat.title}</div>
                        </div>
                      </div>

                      {/* Seat Type Switcher for Host on Seats 2-5 */}
                      {idx === 0 ? (
                        <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold">
                          👑 Host Seat
                        </span>
                      ) : isHost ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleConfigureSeat(idx, 'open')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                              seat.type === 'open' || seat.type === 'human'
                                ? 'bg-cyan-400 text-slate-950 border-white font-black'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            👤 Human / Open
                          </button>

                          <button
                            onClick={() => handleConfigureSeat(idx, 'ai')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                              seat.type === 'ai'
                                ? 'bg-emerald-400 text-slate-950 border-white font-black'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            🤖 AI Bot
                          </button>

                          {seat.type === 'ai' && (
                            <select
                              value={seat.aiProfileId || AI_PROFILES[idx % AI_PROFILES.length].id}
                              onChange={(e) => handleConfigureSeat(idx, 'ai', e.target.value)}
                              className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-600 text-xs font-bold text-amber-200"
                            >
                              {AI_PROFILES.map((bot) => (
                                <option key={bot.id} value={bot.id}>
                                  {bot.avatar} {bot.name}
                                </option>
                              ))}
                            </select>
                          )}

                          <button
                            onClick={() => handleConfigureSeat(idx, 'closed')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                              seat.type === 'closed'
                                ? 'bg-rose-500 text-white border-rose-300 font-black'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            🔒 Closed
                          </button>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 uppercase">
                          {seat.type}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Host Assist Level Lock & Match Settings (5 cols) */}
            <div className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between gap-4 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="font-black text-sm sm:text-base text-amber-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    Host Assist Level Lock
                  </span>
                  {isHost ? (
                    <button
                      onClick={handleToggleHostAssistLock}
                      className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border transition ${
                        roomState.assistLocked
                          ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                          : 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      }`}
                    >
                      {roomState.assistLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked for All</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Per-Player Choice</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                      {roomState.assistLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      {roomState.assistLocked ? 'Locked by Host' : 'Unlocked'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {roomState.assistLocked
                    ? '🔒 All human players at the table will play under the exact Assist Level selected below for a uniform playtest.'
                    : '🔓 Assist Lock is off: each human player can toggle their own hint preferences during the match.'}
                </p>

                {/* Preset Picker inside Lobby */}
                <div className="grid grid-cols-2 gap-2">
                  {['full', 'subtle', 'strict', 'custom'].map((key) => {
                    const preset = ASSIST_PRESETS[key];
                    const isSelected = effectiveAssistPreset === key;
                    return (
                      <button
                        key={key}
                        disabled={roomState.assistLocked && !isHost}
                        onClick={() => {
                          if (key === 'custom') {
                            setShowAssistModal(true);
                          } else {
                            handleSelectAssistPreset(key);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          isSelected
                            ? 'bg-indigo-950 border-amber-400 shadow'
                            : 'bg-slate-950/70 border-slate-800 hover:bg-slate-950'
                        } ${roomState.assistLocked && !isHost ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-black text-xs text-white flex items-center justify-between">
                          <span>{preset.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                          {preset.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShowAssistModal(true)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5 transition"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>
                    {roomState.assistLocked && !isHost
                      ? `Inspect Active Hints (${activeAssistCount}/6 ON)`
                      : `Configure 6 Granular Toggles (${activeAssistCount}/6 ON)`}
                  </span>
                </button>
              </div>

              {/* Start Match Button (Host Only) */}
              <div className="pt-3 border-t border-slate-800">
                {isHost ? (
                  <button
                    onClick={() => {
                      sfx.playCards(3);
                      startRoundInRoom(roomState, null, 0, 1);
                      setScreen('game');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 hover:opacity-95 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 transition"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Hyakuju Parade!</span>
                  </button>
                ) : (
                  <div className="w-full py-3.5 rounded-2xl bg-slate-950 border border-amber-400/40 text-amber-200 font-bold text-xs text-center flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Waiting for Host ({roomState.hostName}) to start the match...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* SCREEN 3: ACTIVE MULTIPLAYER GAME TABLE */}
      {/* ========================================== */}
      {screen === 'game' && roomState && (
        <>
          {/* ENCORE / SYSTEM BANNER ALERT */}
          {roomState.bannerAlert && (
            <div className="bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 text-white px-4 py-2.5 shadow-xl border-b border-yellow-200 animate-pulse z-30">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎺</span>
                  <div>
                    <div className="font-black text-sm sm:text-base tracking-wide uppercase">
                      {roomState.bannerAlert.title}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-amber-50">
                      {roomState.bannerAlert.subtitle}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 max-w-7xl w-full mx-auto px-3 py-3 flex flex-col justify-between gap-3">
            {/* 1. OTHER PLAYERS ROW (Humans & AI Opponents) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {players
                .map((p, idx) => ({ p, idx }))
                .filter(({ idx }) => idx !== myPlayerIndex)
                .map(({ p: opp, idx: actualPlayerIdx }) => {
                  const isTurn = phase === 'playing' && turnIndex === actualPlayerIdx;
                  const ownsActiveNumber = activePlay?.ownerId === opp.id;

                  return (
                    <div
                      key={opp.id}
                      className={`relative rounded-2xl p-3 border transition-all ${
                        isTurn
                          ? 'bg-gradient-to-br from-amber-900/60 to-slate-900 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10'
                          : ownsActiveNumber
                          ? 'bg-slate-900/90 border-cyan-400/60'
                          : 'bg-slate-900/70 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                              opp.color || 'from-sky-500 to-blue-600'
                            } flex items-center justify-center text-xl shadow border border-white/20`}
                          >
                            {opp.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-sm text-white">{opp.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                                {opp.isHuman ? 'Human' : 'Bot'}
                              </span>
                              {isTurn && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 animate-pulse">
                                  TURN
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {phase === 'setup_choice'
                                ? opp.readyForRound
                                  ? '✅ Hand Order Locked'
                                  : '⏳ Choosing Hand Order...'
                                : opp.title}
                            </p>
                          </div>
                        </div>

                        {/* Parade Member Badge & Card Count */}
                        <div className="flex items-center gap-2">
                          {opp.hasMemberPiece ? (
                            <div
                              className="px-2 py-1 rounded-lg bg-amber-400/20 border border-amber-400 text-amber-200 text-xs font-bold flex items-center gap-1"
                              title="Holds 1 Parade Member Piece! 1 win away from game victory!"
                            >
                              <span>{opp.memberBadge?.emoji || '🏅'}</span>
                              <span className="text-[10px]">★1</span>
                            </div>
                          ) : (
                            <div
                              className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-500 text-[10px] font-semibold"
                              title="No Parade Piece yet"
                            >
                              0 ★
                            </div>
                          )}

                          <div className="px-2.5 py-1 rounded-xl bg-indigo-950 border border-indigo-700/60 text-center">
                            <div className="text-sm font-black text-amber-300 leading-none">
                              {opp.hand.length}
                            </div>
                            <div className="text-[9px] text-indigo-300 uppercase tracking-tighter">
                              cards
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mini Fan of Opponent Face-Down Cards */}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex -space-x-2 overflow-hidden py-0.5">
                          {opp.hand.map((c) => (
                            <div
                              key={c.id}
                              className="w-4 h-6 rounded bg-gradient-to-br from-indigo-600 via-purple-700 to-rose-600 border border-amber-200/40 shadow-sm flex items-center justify-center text-[8px]"
                            >
                              🎵
                            </div>
                          ))}
                        </div>
                        {ownsActiveNumber && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shrink-0">
                            Leads Play Area
                          </span>
                        )}
                      </div>

                      {/* Last Action Ticker */}
                      <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-300 truncate">
                        {opp.lastAction}
                      </div>
                    </div>
                  );
                })}
            </section>

            {/* 2. CENTRAL PARADE STAGE (ACTIVE PLAY AREA + LOGS) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              <div className="lg:col-span-8 rounded-3xl bg-gradient-to-b from-slate-900/95 via-indigo-950/85 to-slate-900/95 border-2 border-amber-400/30 p-4 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                {/* Stage Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-amber-200">
                      {phase === 'setup_choice'
                        ? 'Simultaneous Setup: All Players Choose Initial Hand Order'
                        : isMyTurn
                        ? '🌟 Your Turn! Choose Action A, B, or C (No Passing)'
                        : `⏳ Waiting for ${players[turnIndex]?.name}'s Turn...`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-rose-400" />
                      <span>Discard Pile:</span>
                      <strong className="text-white">{discardPile.length}</strong>
                    </div>
                    {unusedDeckCount > 0 && (
                      <div className="px-2.5 py-1 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-400 hidden sm:block">
                        Aside: {unusedDeckCount}
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Number Showcase */}
                <div className="my-3 flex flex-col items-center justify-center min-h-[195px]">
                  {activePlay && activePlay.cards.length > 0 ? (
                    <>
                      <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-900/90 border border-indigo-500/50 text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                          <span>{activePlay.ownerAvatar}</span>
                          <span>{activePlay.ownerName}&apos;s Play Area</span>
                        </span>
                        <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-base sm:text-lg shadow-lg flex items-center gap-1.5">
                          <span>Current Number:</span>
                          <span className="tracking-wider font-mono text-xl">
                            {currentActiveNumStr}
                          </span>
                          <span className="text-[11px] font-bold opacity-75">
                            ({activePlay.cards.length + 1} digits)
                          </span>
                        </div>
                        {activePlay.cards.length > 1 && (
                          <button
                            onClick={() => {
                              sfx.click();
                              setInspectTableCards((v) => !v);
                            }}
                            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] font-bold text-slate-200 transition"
                          >
                            {inspectTableCards ? '🔗 Overlap Chain' : '🔍 Inspect Cards'}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap my-1">
                        {/* Attach Left Button (Action C) */}
                        {isMyTurn &&
                          (actionMode === 'C' ||
                            (effectiveAssistOptions.showAddCardHighlights &&
                              selectedSingleCardAddOptions.canLeft)) && (
                            <button
                              onClick={() => handleAttemptHumanAddC('left')}
                              className={`px-3 py-2 rounded-2xl border-2 font-extrabold text-xs flex flex-col items-center gap-0.5 transition-all ${
                                effectiveAssistOptions.showAddCardHighlights
                                  ? selectedSingleCardAddOptions.canLeft
                                    ? 'bg-purple-600 hover:bg-purple-500 border-purple-300 text-white shadow-lg shadow-purple-600/40 scale-105 cursor-pointer'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                                  : selectedHandIndices.length === 1
                                  ? 'bg-purple-600 hover:bg-purple-500 border-purple-300 text-white shadow-lg cursor-pointer'
                                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                              <span>Attach Left</span>
                              {effectiveAssistOptions.showAddCardHighlights &&
                                selectedSingleCardAddOptions.canLeft && (
                                  <span className="text-[10px] text-amber-200 font-mono">
                                    → {selectedSingleCardAddOptions.leftStr}
                                  </span>
                                )}
                            </button>
                          )}

                        {/* Overlapping Physical Cards on the Table */}
                        <div className="overflow-x-auto max-w-full py-1">
                          <OverlappingChainDisplay
                            cards={activePlay.cards}
                            size="md"
                            spreadCards={inspectTableCards}
                            interactiveEnds={isMyTurn && actionMode === 'B'}
                            selectedEnd={selectedTakeEnd}
                            onSelectEnd={(side) => {
                              sfx.click();
                              setActionMode('B');
                              setSelectedTakeEnd(side);
                            }}
                          />
                        </div>

                        {/* Attach Right Button (Action C) */}
                        {isMyTurn &&
                          (actionMode === 'C' ||
                            (effectiveAssistOptions.showAddCardHighlights &&
                              selectedSingleCardAddOptions.canRight)) && (
                            <button
                              onClick={() => handleAttemptHumanAddC('right')}
                              className={`px-3 py-2 rounded-2xl border-2 font-extrabold text-xs flex flex-col items-center gap-0.5 transition-all ${
                                effectiveAssistOptions.showAddCardHighlights
                                  ? selectedSingleCardAddOptions.canRight
                                    ? 'bg-purple-600 hover:bg-purple-500 border-purple-300 text-white shadow-lg shadow-purple-600/40 scale-105 cursor-pointer'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                                  : selectedHandIndices.length === 1
                                  ? 'bg-purple-600 hover:bg-purple-500 border-purple-300 text-white shadow-lg cursor-pointer'
                                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                              <span>Attach Right</span>
                              {effectiveAssistOptions.showAddCardHighlights &&
                                selectedSingleCardAddOptions.canRight && (
                                  <span className="text-[10px] text-amber-200 font-mono">
                                    → {selectedSingleCardAddOptions.rightStr}
                                  </span>
                                )}
                            </button>
                          )}
                      </div>

                      {/* Quick Take End Buttons */}
                      {isMyTurn && (
                        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              sfx.click();
                              setActionMode('B');
                              setSelectedTakeEnd('left');
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                              actionMode === 'B' && selectedTakeEnd === 'left'
                                ? 'bg-cyan-400 text-slate-950 border-white font-black shadow-md'
                                : 'bg-cyan-950/70 hover:bg-cyan-900 border-cyan-500/40 text-cyan-200'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Take Left Card [{activePlay.cards[0].label}]</span>
                          </button>

                          {activePlay.cards.length > 1 && (
                            <button
                              onClick={() => {
                                sfx.click();
                                setActionMode('B');
                                setSelectedTakeEnd('right');
                              }}
                              className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                                actionMode === 'B' && selectedTakeEnd === 'right'
                                  ? 'bg-cyan-400 text-slate-950 border-white font-black shadow-md'
                                  : 'bg-cyan-950/70 hover:bg-cyan-900 border-cyan-500/40 text-cyan-200'
                              }`}
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>
                                Take Right Card [{activePlay.cards[activePlay.cards.length - 1].label}]
                              </span>
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6 px-4 rounded-2xl border-2 border-dashed border-amber-400/30 bg-slate-950/40 max-w-md">
                      <div className="text-3xl mb-1">🎺🥁🎶</div>
                      <div className="font-extrabold text-amber-200 text-base">
                        No Current Number on the Table!
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {isMyTurn
                          ? 'You may play ANY single card or valid chain from your hand (Action A)!'
                          : `${players[turnIndex]?.name || 'Starting player'} may play any number!`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stage Footer: Parade Pieces Victory Progress */}
                <div className="border-t border-white/10 pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Parade Pieces:
                    </span>
                    {players.map((p) => (
                      <span
                        key={p.id}
                        className={`px-2 py-0.5 rounded-full border text-[11px] flex items-center gap-1 ${
                          p.hasLeaderPiece
                            ? 'bg-amber-400 text-slate-950 border-white font-black'
                            : p.hasMemberPiece
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>{p.avatar}</span>
                        <span>{p.name}:</span>
                        <span>
                          {p.hasLeaderPiece
                            ? '👑 Leader!'
                            : p.hasMemberPiece
                            ? `${p.memberBadge?.emoji || '🏅'} Member (1/2)`
                            : '0/2'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Play-by-Play Action Feed (4 cols) */}
              <div className="lg:col-span-4 rounded-3xl bg-slate-950/85 border border-slate-800 p-3.5 flex flex-col justify-between max-h-[290px] lg:max-h-none">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" /> Parade Play-by-Play
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">WebRTC Sync</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[210px]">
                  {actionLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded-xl text-xs border leading-snug ${
                        log.type === 'encore'
                          ? 'bg-rose-950/70 border-rose-500/50 text-rose-100 font-semibold'
                          : log.type === 'win'
                          ? 'bg-amber-950/70 border-amber-400/60 text-amber-100 font-semibold'
                          : log.type === 'human'
                          ? 'bg-indigo-950/60 border-indigo-700/50 text-indigo-100'
                          : 'bg-slate-900/90 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-75 mb-0.5">
                        <span className="font-bold">
                          {log.avatar} {log.actorName}
                        </span>
                        <span>{log.time}</span>
                      </div>
                      <div>{log.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ========================================== */}
            {/* 3. LOCAL HUMAN PLAYER DASHBOARD & HAND AREA */}
            {/* ========================================== */}
            <section className="rounded-3xl bg-gradient-to-b from-slate-900/95 to-slate-950 border-2 border-amber-400/40 p-3.5 sm:p-4 shadow-2xl">
              {/* SIMULTANEOUS INITIAL HAND REVERSE PHASE */}
              {phase === 'setup_choice' ? (
                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-indigo-900/60 to-emerald-500/20 border-2 border-amber-400/60 flex flex-col gap-3">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider">
                        ⚠️ Very Important Rule: Don&apos;t Rearrange Your Hand!
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-amber-200">
                        Simultaneous Round Setup: Keep Dealt Order or Reverse Entire Hand?
                      </h2>
                      <p className="text-xs text-slate-300 max-w-2xl">
                        Reversing your hand flips the order of all 10 cards and changes which adjacent digits can chain!
                        {effectiveAssistOptions.showReverseStats ? (
                          <span className="text-emerald-300 font-semibold ml-1">
                            (Dealt Order: {setupHandComparison.normal.links} chain link(s), max chain{' '}
                            {setupHandComparison.normal.maxChain} • Reversed Order:{' '}
                            {setupHandComparison.reversed.links} chain link(s), max chain{' '}
                            {setupHandComparison.reversed.maxChain})
                          </span>
                        ) : (
                          <span className="text-amber-200/80 italic ml-1">
                            (Inspect your cards below to decide which direction gives better chains!)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Choice Buttons OR Waiting Indicator */}
                    {!myPlayer?.readyForRound ? (
                      <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                        <button
                          onClick={() => {
                            sfx.click();
                            setHandReversedPreview((p) => !p);
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-500 text-xs font-bold text-amber-200 flex items-center gap-1.5 transition"
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                          <span>
                            {handReversedPreview ? 'Previewing: REVERSED' : 'Preview: Reverse Order'}
                          </span>
                        </button>

                        <button
                          onClick={() => handleConfirmInitialHand(false)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition"
                        >
                          Lock In: Keep Dealt Order
                          {effectiveAssistOptions.showReverseStats
                            ? ` (${setupHandComparison.normal.links} links)`
                            : ''}
                        </button>

                        <button
                          onClick={() => handleConfirmInitialHand(true)}
                          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition"
                        >
                          Lock In: Reverse Hand
                          {effectiveAssistOptions.showReverseStats
                            ? ` (${setupHandComparison.reversed.links} links)`
                            : ''}
                        </button>
                      </div>
                    ) : (
                      <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-200 font-black text-xs sm:text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Hand Locked! Waiting for other players to choose initial order...</span>
                      </div>
                    )}
                  </div>

                  {/* Live Player Readiness Status Bar */}
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-amber-200">Table Readiness:</span>
                    {players.map((p) => (
                      <span
                        key={p.id}
                        className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border ${
                          p.readyForRound
                            ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200'
                            : 'bg-slate-900/90 border-amber-400/50 text-amber-200 animate-pulse'
                        }`}
                      >
                        <span>{p.avatar}</span>
                        <span>{p.name}:</span>
                        <span>{p.readyForRound ? 'Ready ✓' : 'Waiting...'}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                /* PLAYING PHASE: ACTION CONTROLS BAR */
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
                      <span className="text-xl">{myPlayer?.avatar || '🐨'}</span>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>
                            {myPlayer?.name || 'Your'} Hand ({myHand.length} cards)
                          </span>
                          {myPlayer?.hasMemberPiece && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                              🏅 Member Piece (1/2)
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>Assist Mode:</span>
                          <strong className="text-amber-300">{activePresetMeta.name}</strong>
                          {roomState.assistLocked && (
                            <span className="text-rose-300 font-bold">(Host Locked)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action A / B / C Mode Switcher */}
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => {
                          sfx.click();
                          setActionMode('A');
                          setSelectedTakeEnd(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                          actionMode === 'A'
                            ? 'bg-emerald-500 text-slate-950 shadow'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>A: Play Cards</span>
                      </button>

                      <button
                        disabled={!activePlay}
                        onClick={() => {
                          sfx.click();
                          setActionMode('B');
                          setSelectedHandIndices([]);
                          if (!selectedTakeEnd) setSelectedTakeEnd('left');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                          !activePlay
                            ? 'opacity-40 cursor-not-allowed text-slate-500'
                            : actionMode === 'B'
                            ? 'bg-cyan-400 text-slate-950 shadow'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>B: Take Card</span>
                      </button>

                      <button
                        disabled={!activePlay}
                        onClick={() => {
                          sfx.click();
                          setActionMode('C');
                          setSelectedTakeEnd(null);
                          if (selectedHandIndices.length > 1) {
                            setSelectedHandIndices([selectedHandIndices[0]]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                          !activePlay
                            ? 'opacity-40 cursor-not-allowed text-slate-500'
                            : actionMode === 'C'
                            ? 'bg-purple-500 text-white shadow'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>C: Add Card</span>
                      </button>
                    </div>
                  </div>

                  {/* Contextual Confirm Action Button */}
                  <div className="flex items-center gap-2">
                    {actionMode === 'A' && (
                      <>
                        {selectedCards.length > 0 && (
                          <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2">
                            {effectiveAssistOptions.showChainValuePreview ? (
                              <>
                                <span className="text-slate-400">Preview:</span>
                                {selectedChainValid ? (
                                  <>
                                    <strong className="text-amber-300 font-mono text-sm">
                                      {selectedChainNumStr}
                                    </strong>
                                    {canPlaySelectedA ? (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                        {currentActiveNumStr
                                          ? `Beats ${currentActiveNumStr}!`
                                          : 'Valid Lead!'}
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                                        ≤ {currentActiveNumStr} (Too Small)
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-rose-400 font-bold">
                                    Invalid Chain (Left ones ≠ Right tens)
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-slate-300 font-semibold">
                                Selected:{' '}
                                <strong className="text-amber-300 font-mono">
                                  {selectedCards.map((c) => `[${c.label}]`).join(' + ')}
                                </strong>
                              </span>
                            )}
                          </div>
                        )}

                        <button
                          disabled={
                            !isMyTurn ||
                            selectedCards.length === 0 ||
                            (effectiveAssistOptions.showChainValuePreview && !canPlaySelectedA)
                          }
                          onClick={handleAttemptHumanPlayA}
                          className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-1.5 ${
                            !isMyTurn || selectedCards.length === 0
                              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              : !effectiveAssistOptions.showChainValuePreview || canPlaySelectedA
                              ? 'bg-gradient-to-r from-emerald-400 to-amber-300 hover:from-emerald-300 hover:to-amber-200 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>
                            {selectedCards.length === 0
                              ? 'Select Card(s) to Play'
                              : !effectiveAssistOptions.showChainValuePreview
                              ? `Play ${selectedCards.length} Selected Card${
                                  selectedCards.length > 1 ? 's' : ''
                                }!`
                              : selectedChainValid
                              ? canPlaySelectedA
                                ? `Play ${selectedChainNumStr}!`
                                : `Must Beat ${currentActiveNumStr}`
                              : 'Cannot Chain Selected'}
                          </span>
                        </button>
                      </>
                    )}

                    {actionMode === 'B' && activePlay && (
                      <div className="text-xs px-3 py-1.5 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 font-bold">
                        Taking{' '}
                        <span className="text-white underline">
                          [
                          {selectedTakeEnd === 'right'
                            ? activePlay.cards[activePlay.cards.length - 1].label
                            : activePlay.cards[0].label}
                          ]
                        </span>{' '}
                        ({selectedTakeEnd || 'left'} end) — Click any{' '}
                        <strong className="text-amber-300">+ Slot</strong> in your hand below!
                      </div>
                    )}

                    {actionMode === 'C' && activePlay && (
                      <div className="text-xs px-3 py-1.5 rounded-xl bg-purple-950/90 border border-purple-500/50 text-purple-200 font-bold">
                        Select 1 card in your hand below, then click{' '}
                        <strong className="text-white">Attach Left / Right</strong> above!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* QUICK-SELECT PLAYABLE CHAINS BAR */}
              {effectiveAssistOptions.showQuickPlayList &&
                phase === 'playing' &&
                isMyTurn &&
                actionMode === 'A' && (
                  <div className="mb-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 mr-1">
                      <Zap className="w-3.5 h-3.5" /> Quick-Select Legal Plays ({myLegalPlaysA.length}):
                    </span>
                    {myLegalPlaysA.length === 0 ? (
                      <span className="text-xs text-rose-300 bg-rose-950/60 border border-rose-700/50 px-2.5 py-0.5 rounded-lg">
                        No chain in hand beats {currentActiveNumStr} — Choose Action B (Take Card) or Action C (Add Card)!
                      </span>
                    ) : (
                      myLegalPlaysA
                        .slice()
                        .sort(
                          (a, b) =>
                            b.length - a.length ||
                            (BigInt(b.numStr) > BigInt(a.numStr) ? 1 : -1)
                        )
                        .slice(0, 8)
                        .map((chain) => {
                          const isCurrentlyChosen =
                            selectedHandIndices.length > 0 &&
                            Math.min(...selectedHandIndices) === chain.startIndex &&
                            Math.max(...selectedHandIndices) === chain.endIndex;

                          return (
                            <button
                              key={`${chain.startIndex}-${chain.endIndex}`}
                              onClick={() => {
                                sfx.click();
                                const range = [];
                                for (let i = chain.startIndex; i <= chain.endIndex; i++) range.push(i);
                                setSelectedHandIndices(range);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 ${
                                isCurrentlyChosen
                                  ? 'bg-amber-400 text-slate-950 border-white font-black shadow'
                                  : chain.length >= 2
                                  ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/50 text-emerald-200'
                                  : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300'
                              }`}
                            >
                              <span className="font-mono">{chain.numStr}</span>
                              {chain.length > 1 && (
                                <span className="text-[10px] px-1 rounded bg-emerald-400/20 text-emerald-300">
                                  {chain.length} cards
                                </span>
                              )}
                            </button>
                          );
                        })
                    )}
                  </div>
                )}

              {/* HUMAN HAND CARDS ROW */}
              <div className="overflow-x-auto pb-2 pt-3">
                <div className="inline-flex items-center min-w-full justify-center px-2">
                  {displayedMyHand.map((card, idx) => {
                    const isSelected = selectedHandIndices.includes(idx);
                    const nextCard =
                      idx < displayedMyHand.length - 1 ? displayedMyHand[idx + 1] : null;
                    const chainsWithNext = nextCard && card.ones === nextCard.tens;
                    const bothSelectedInChain =
                      isSelected &&
                      selectedHandIndices.includes(idx + 1) &&
                      (effectiveAssistOptions.showChainValuePreview ? chainsWithNext : true);

                    const slotPreviewBefore =
                      actionMode === 'B' && isMyTurn ? getInsertPreviewInfo(idx) : null;

                    const showCanADot =
                      effectiveAssistOptions.showLinkBadges &&
                      phase === 'playing' &&
                      isMyTurn &&
                      handCardCapabilities.canA.has(idx);
                    const showCanCDot =
                      effectiveAssistOptions.showAddCardHighlights &&
                      phase === 'playing' &&
                      isMyTurn &&
                      handCardCapabilities.canC.has(idx);

                    return (
                      <React.Fragment key={card.id}>
                        {/* Insertion Slot BEFORE card `idx` when in Action B */}
                        {actionMode === 'B' && isMyTurn && activePlay && (
                          <button
                            onClick={() =>
                              handleAttemptHumanTakeB(selectedTakeEnd || 'left', idx)
                            }
                            className={`mx-1 h-24 px-1.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all group ${
                              effectiveAssistOptions.showTakeSlotHints && slotPreviewBefore?.isBridge
                                ? 'bg-emerald-500/30 border-emerald-300 text-emerald-200 scale-105 shadow-lg shadow-emerald-500/20'
                                : effectiveAssistOptions.showTakeSlotHints &&
                                  slotPreviewBefore?.isAnyLink
                                ? 'bg-cyan-500/25 border-cyan-300 text-cyan-200'
                                : 'bg-slate-800/60 hover:bg-cyan-500/30 border-slate-600 hover:border-cyan-300 text-slate-400 hover:text-white'
                            }`}
                            title={`Insert taken card at position #${idx + 1}`}
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-tighter">
                              Here
                            </span>
                            {effectiveAssistOptions.showTakeSlotHints &&
                              slotPreviewBefore?.isBridge && (
                                <span className="text-[8px] font-black bg-emerald-400 text-slate-950 px-1 rounded mt-0.5">
                                  BRIDGE!
                                </span>
                              )}
                            {effectiveAssistOptions.showTakeSlotHints &&
                              !slotPreviewBefore?.isBridge &&
                              slotPreviewBefore?.isAnyLink && (
                                <span className="text-[8px] font-bold bg-cyan-400 text-slate-950 px-1 rounded mt-0.5">
                                  LINKS!
                                </span>
                              )}
                          </button>
                        )}

                        {/* The Hand Card */}
                        <div
                          className={`relative flex flex-col items-center transition-all ${
                            bothSelectedInChain ? '-mr-5 z-20' : 'mx-0.5'
                          }`}
                        >
                          <span className="text-[10px] font-bold text-slate-500 mb-1">
                            #{idx + 1}
                          </span>
                          <ParadeCard
                            card={card}
                            size="md"
                            isSelected={isSelected}
                            canActionA={showCanADot}
                            canActionC={showCanCDot}
                            showHint={showCanADot || showCanCDot}
                            onClick={() => handleHandCardClick(idx)}
                          />
                        </div>

                        {/* Adjacent Link Connector Badge */}
                        {nextCard && actionMode !== 'B' && (
                          <div className="flex flex-col items-center justify-center mx-0.5 self-center mt-4">
                            {effectiveAssistOptions.showLinkBadges && chainsWithNext ? (
                              <button
                                onClick={() => {
                                  if (phase !== 'playing') return;
                                  sfx.click();
                                  setActionMode('A');
                                  setSelectedHandIndices([idx, idx + 1]);
                                }}
                                className="px-1.5 py-1 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] shadow-md shadow-emerald-500/30 hover:scale-110 transition flex items-center gap-0.5"
                                title={`Chained! ${card.label} + ${nextCard.label} = ${card.tens}${card.ones}${nextCard.ones}`}
                              >
                                <span>🔗</span>
                                <span>{card.ones}</span>
                              </button>
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Final Insertion Slot at RIGHT END of hand when in Action B */}
                  {actionMode === 'B' && isMyTurn && activePlay && (
                    <button
                      onClick={() =>
                        handleAttemptHumanTakeB(
                          selectedTakeEnd || 'left',
                          displayedMyHand.length
                        )
                      }
                      className={`mx-1 h-24 px-1.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                        effectiveAssistOptions.showTakeSlotHints &&
                        getInsertPreviewInfo(displayedMyHand.length)?.isAnyLink
                          ? 'bg-cyan-500/25 border-cyan-300 text-cyan-200'
                          : 'bg-slate-800/60 hover:bg-cyan-500/30 border-slate-600 hover:border-cyan-300 text-slate-400 hover:text-white'
                      }`}
                      title="Insert taken card at the right end of your hand"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-tighter">End</span>
                      {effectiveAssistOptions.showTakeSlotHints &&
                        getInsertPreviewInfo(displayedMyHand.length)?.isAnyLink && (
                          <span className="text-[8px] font-bold bg-cyan-400 text-slate-950 px-1 rounded mt-0.5">
                            LINKS!
                          </span>
                        )}
                    </button>
                  )}
                </div>
              </div>
            </section>
          </main>
        </>
      )}

      {/* ========================================== */}
      {/* PUSH TO GITHUB / EXPORT HTML MODAL */}
      {/* ========================================== */}
      {showGitHubModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] rounded-3xl bg-slate-900 border-2 border-emerald-400/50 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UploadCloud className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Push to GitHub & Standalone HTML Exporter
                  </h2>
                  <p className="text-xs text-slate-400">
                    Commit directly to your GitHub repository via REST API or download a standalone file
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGitHubModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Direct GitHub API Push Form */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Option 1: Direct Push via GitHub REST API
                  </span>
                  <span className="text-[10px] text-slate-400">Token stays in your browser</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      GitHub Username / Owner
                    </label>
                    <input
                      type="text"
                      value={ghOwner}
                      onChange={(e) => setGhOwner(e.target.value)}
                      placeholder="e.g. octocat"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      value={ghRepo}
                      onChange={(e) => setGhRepo(e.target.value)}
                      placeholder="hyakuju-parade-online"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      GitHub Personal Access Token (PAT with repo / contents:write)
                    </label>
                    <input
                      type="password"
                      value={ghToken}
                      onChange={(e) => setGhToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Branch</label>
                    <input
                      type="text"
                      value={ghBranch}
                      onChange={(e) => setGhBranch(e.target.value)}
                      placeholder="main"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={ghAutoCreateRepo}
                    onChange={(e) => setGhAutoCreateRepo(e.target.checked)}
                    className="rounded border-slate-600"
                  />
                  <span>Auto-create public repository if it doesn&apos;t exist yet</span>
                </label>

                <button
                  onClick={handlePushToGitHub}
                  disabled={ghPushStatus?.state === 'pushing'}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    {ghPushStatus?.state === 'pushing'
                      ? 'Pushing to GitHub...'
                      : 'Push index.html & README.md to GitHub Now'}
                  </span>
                </button>

                {ghPushStatus && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      ghPushStatus.state === 'success'
                        ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200'
                        : ghPushStatus.state === 'error'
                        ? 'bg-rose-950/70 border-rose-400 text-rose-200'
                        : 'bg-indigo-950/70 border-indigo-400 text-indigo-200'
                    }`}
                  >
                    <div className="font-bold">{ghPushStatus.message}</div>
                    {ghPushStatus.url && (
                      <div className="mt-2 flex flex-wrap gap-3">
                        <a
                          href={ghPushStatus.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 underline text-amber-300 font-bold"
                        >
                          <span>Open GitHub Repository</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Option 2: Download Standalone File */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="font-black text-amber-300 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4" />
                    Option 2: Download Standalone index.html
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Download the ready-to-commit file to drop into any Git repository or send to testers on Discord/Slack.
                  </p>
                </div>
                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1.5 shadow transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download index.html</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowGitHubModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* GRANULAR ASSIST & GUIDANCE SETTINGS MODAL */}
      {/* ========================================== */}
      {showAssistModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] rounded-3xl bg-slate-900 border-2 border-amber-400/50 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Difficulty & Assist Guidance Levels
                  </h2>
                  <p className="text-xs text-slate-400">
                    {roomState?.assistLocked && !isHost
                      ? `Locked by Host (${roomState.hostName}) — Viewing active guidance rules`
                      : 'Choose a preset or toggle individual helpers for playtesting'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssistModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {/* Host Lock Toggle Banner inside Modal */}
              {roomState && isHost && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-xs sm:text-sm text-amber-200 flex items-center gap-1.5">
                      {roomState.assistLocked ? (
                        <Lock className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Unlock className="w-4 h-4 text-emerald-400" />
                      )}
                      <span>Host Assist Lock for Multiplayer Table</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      When locked, every human player in Room {roomState.roomCode} uses your exact Assist Level configuration.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleHostAssistLock}
                    className={`px-3.5 py-2 rounded-xl font-black text-xs shrink-0 border transition ${
                      roomState.assistLocked
                        ? 'bg-rose-500 text-white border-rose-300'
                        : 'bg-emerald-400 text-slate-950 border-white'
                    }`}
                  >
                    {roomState.assistLocked ? 'Locked for All' : 'Unlocked'}
                  </button>
                </div>
              )}

              {/* 4 Preset Cards */}
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-2">
                  1. Assist Presets
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {['full', 'subtle', 'strict', 'custom'].map((key) => {
                    const preset = ASSIST_PRESETS[key];
                    const isSelected = effectiveAssistPreset === key;
                    const lockedOut = Boolean(roomState?.assistLocked && !isHost);
                    return (
                      <button
                        key={key}
                        disabled={lockedOut}
                        onClick={() => handleSelectAssistPreset(key)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/90 border-amber-400 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-950/70 hover:bg-slate-950 border-slate-800'
                        } ${lockedOut ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-black text-sm text-white">{preset.name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${preset.badgeClass}`}
                            >
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">{preset.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6 Individual Granular Toggles */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                    2. Granular Guidance Toggles ({activeAssistCount}/6 Active)
                  </span>
                </div>

                <div className="space-y-2">
                  {ASSIST_OPTION_META.map((opt) => {
                    const isOn = !!effectiveAssistOptions[opt.key];
                    const lockedOut = Boolean(roomState?.assistLocked && !isHost);
                    return (
                      <div
                        key={opt.key}
                        onClick={() => !lockedOut && handleToggleAssistOption(opt.key)}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          isOn
                            ? 'bg-emerald-950/30 border-emerald-500/40'
                            : 'bg-slate-950/80 border-slate-800'
                        } ${lockedOut ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-slate-900'}`}
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-white">
                            {opt.title}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                            {opt.desc}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={lockedOut}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs shrink-0 border transition ${
                            isOn
                              ? 'bg-emerald-400 text-slate-950 border-white shadow'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {isOn ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAssistModal(false)}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ROUND OVER / GAME VICTORY MODAL */}
      {/* ========================================== */}
      {screen === 'game' && (phase === 'round_over' || phase === 'game_over') && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="max-w-lg w-full rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-amber-950 border-2 border-amber-400 p-6 text-center shadow-2xl space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 flex items-center justify-center text-5xl shadow-xl border-2 border-white">
              {phase === 'game_over' ? '🦁' : roomState?.roundWinner?.avatar || '🏆'}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-widest text-amber-300">
                {phase === 'game_over'
                  ? '👑 Grand Hyakuju Parade Champion!'
                  : `🎺 Round ${roundNumber} Complete!`}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {phase === 'game_over'
                  ? `${roomState?.gameWinner?.name} Wins the Game!`
                  : `${roomState?.roundWinner?.name} Emptied Their Hand!`}
              </h2>
              <p className="text-sm text-slate-300">
                {phase === 'game_over'
                  ? `${roomState?.gameWinner?.name} already held a Parade Member Piece and now claims the prestigious Parade Leader Piece (Dande)!`
                  : `${roomState?.roundWinner?.name} claims a Parade Member Piece (${roomState?.roundWinner?.memberBadge?.name} ${roomState?.roundWinner?.memberBadge?.emoji})! One more round win claims victory!`}
              </p>
            </div>

            {/* Standings Table */}
            <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 space-y-2 text-left">
              <div className="text-xs font-bold text-slate-400 uppercase">
                Parade Piece Standings
              </div>
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-base">{p.avatar}</span>
                    <span>{p.name}</span>
                    <span className="text-slate-500 font-normal">
                      ({p.hand.length} cards left)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.hasMemberPiece ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400 text-amber-200 font-bold">
                        {p.memberBadge?.emoji} Member Piece
                      </span>
                    ) : (
                      <span className="text-slate-500">No Piece yet</span>
                    )}
                    {p.hasLeaderPiece && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black">
                        🦁 Leader!
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isHost ? (
              phase === 'round_over' ? (
                <button
                  onClick={() => {
                    const winnerIdx = players.findIndex(
                      (p) => p.id === roomState?.roundWinner?.id
                    );
                    const nextStarter = (winnerIdx + 1) % players.length;
                    startRoundInRoom(roomState, players, nextStarter, roundNumber + 1);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 hover:opacity-95 text-slate-950 font-black text-base shadow-xl transition"
                >
                  Start Round {roundNumber + 1} (Next Starter:{' '}
                  {
                    players[
                      (players.findIndex((p) => p.id === roomState?.roundWinner?.id) + 1) %
                        players.length
                    ]?.name
                  }
                  ) →
                </button>
              ) : (
                <button
                  onClick={() => startRoundInRoom(roomState, null, 0, 1)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 text-white font-black text-base shadow-xl transition"
                >
                  Play Another Full Match 🎺
                </button>
              )
            ) : (
              <div className="py-3 rounded-2xl bg-slate-950 border border-amber-400/40 text-amber-200 text-xs font-bold">
                Waiting for Host ({roomState.hostName}) to start the next round...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* OFFICIAL RULEBOOK & STRATEGY TIPS MODAL */}
      {/* ========================================== */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-3xl w-full max-h-[88vh] rounded-3xl bg-slate-900 border-2 border-amber-400/50 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-black text-amber-200">
                  Hyakuju Parade (百獣パレード) — Official Rules & Cast
                </h2>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-700/50">
                <h3 className="font-black text-amber-300 text-base mb-1">
                  🎯 Objective & Components (50 Cards)
                </h3>
                <p>
                  Race to be the first to empty your 10-card hand! The deck has 50 cards (2 copies each of all 25 two-digit numbers using digits 1–5: <code className="text-amber-300">11</code> to <code className="text-amber-300">55</code>).
                  <strong> You CANNOT rearrange the cards in your hand!</strong> However, right after the deal, all players simultaneously choose whether to keep their hand order or reverse its entire order.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-700/50">
                <h3 className="font-black text-emerald-300 text-base mb-1">
                  🔗 The Chaining Rule
                </h3>
                <p>
                  You can chain adjacent cards in your hand by overlapping matching digits to create a number with 3 or more digits!
                  <strong> The ones digit of the left card must match the tens digit of the right card.</strong>
                </p>
                <div className="mt-2 p-2.5 rounded-xl bg-slate-950/80 font-mono text-xs text-amber-200">
                  ⭕ Example: [15] + [52] + [23] → <strong>1523</strong> (4-digit number!)
                  <br />❌ [15] + [23] cannot be chained because 5 ≠ 2.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/40">
                  <div className="font-black text-emerald-400 mb-1">A: PLAY CARDS</div>
                  <p className="text-xs text-slate-300">
                    Play 1 card or any contiguous chain of cards from your hand. The number must be strictly <strong>greater</strong> than the current number on the table. Discards the previous number face-down!
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/40">
                  <div className="font-black text-cyan-400 mb-1">B: TAKE CARD</div>
                  <p className="text-xs text-slate-300">
                    Take 1 card from either the <strong>left or right end</strong> of the active number on the table and insert it <strong>anywhere</strong> into your hand! This shrinks the active number (or clears it if only 1 card was left).
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/40">
                  <div className="font-black text-purple-400 mb-1">C: ADD CARD</div>
                  <p className="text-xs text-slate-300">
                    Attach 1 card from your hand to either the <strong>left or right end</strong> of the active number on the table, following the chaining rule (e.g. add <code className="text-amber-300">12</code> to left of <code className="text-amber-300">234</code> → <code className="text-amber-300">1234</code>).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40">
                  <div className="font-black text-rose-300 mb-1">
                    🎺 BIG CHANCE! &quot;ENCORE&quot; RULE
                  </div>
                  <p className="text-xs">
                    After you play cards (Action A), if all other players choose B or C and your turn comes around again with cards still in your Play Area, an <strong>Encore</strong> occurs! Discard all remaining cards in your Play Area and immediately play ANY number!
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40">
                  <div className="font-black text-amber-300 mb-1">
                    💡 Pro Strategy Tip (Page 7)
                  </div>
                  <p className="text-xs">
                    Removing a middle card can connect two outer cards into a new chain! For example, if your hand has <code className="text-amber-200">23 / 45 / 31</code>, playing <code className="text-amber-200">45</code> brings <code className="text-amber-200">23</code> and <code className="text-amber-200">31</code> together to create <code className="text-emerald-300 font-bold">231</code>!
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-black text-amber-300 text-base mb-2">
                  🐾 Meet the Hyakuju Parade Representatives
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.values(DIGIT_THEMES).map((t) => (
                    <div
                      key={t.digit}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2"
                    >
                      <div className="text-2xl">{t.emoji}</div>
                      <div>
                        <div className="font-black text-xs text-white">
                          #{t.digit} {t.name}
                        </div>
                        <div className="text-[10px] text-amber-300">{t.region}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                      </div>
                    </div>
                  ))}
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2">
                    <div className="text-2xl">{LEADER_THEME.emoji}</div>
                    <div>
                      <div className="font-black text-xs text-amber-300">
                        👑 {LEADER_THEME.name}
                      </div>
                      <div className="text-[10px] text-amber-200">{LEADER_THEME.region}</div>
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        {LEADER_THEME.desc}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}