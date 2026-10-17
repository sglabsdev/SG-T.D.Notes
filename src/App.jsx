import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, 
  Gauge, 
  PlusCircle, 
  BookOpen, 
  BarChart2, 
  ShieldAlert, 
  Sliders, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Flame, 
  GitCommit, 
  Compass, 
  FileSignature, 
  Save, 
  Download, 
  Trash2, 
  Search, 
  TrendingUp, 
  PieChart, 
  Lightbulb, 
  X, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle, 
  AlertOctagon, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Layers,
  Settings,
  NotebookPen,
  Palette,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Highlighter,
  FilePlus2,
  Check,
  Tag,
  Pin,
  Clock3,
  AlignLeft,
  Eraser
} from 'lucide-react';

const STORAGE_KEY_TRADES = 'NIFTY_LTP_TRADES_V2';
const STORAGE_KEY_CALC = 'NIFTY_LTP_CALC_V2';
const STORAGE_KEY_NOTES = 'COA_SMART_NOTES_V1';

const DEFAULT_SCENARIO_NOTES = [
  { id: 'scenario-1', scenario: '1', title: 'Range Bound — Strong / Strong', category: 'Scenario', color: 'cyan', pinned: true, tags: ['range-bound', 'EOS', 'EOR'], updatedAt: new Date().toISOString(), content: '<h2>Market Context</h2><p>Support aur Resistance dono settled hain. Market EOS aur EOR ke beech oscillate kar sakta hai.</p><h2>Trade Plan</h2><ul><li>EOS touch par CE setup evaluate karo.</li><li>EOR touch par PE setup evaluate karo.</li><li>Mid-range mein entry avoid karo.</li></ul><h2>Risk Rules</h2><ul><li>Entry se pehle stop-loss define karo.</li><li>Position size risk limit ke hisaab se rakho.</li></ul><p><strong>Reminder:</strong> Setup ko live market context se verify karo; yeh note guaranteed signal nahi hai.</p>' },
  { id: 'scenario-2', scenario: '2', title: 'Resistance Weak Towards Top (WTT)', category: 'Scenario', color: 'green', pinned: false, tags: ['WTT', 'bullish', 'resistance'], updatedAt: new Date().toISOString(), content: '<h2>Market Context</h2><p>Resistance ke weak hote hue upar shift hone ka scenario.</p><h2>Trade Plan</h2><ul><li>Shifted resistance / EOR-plus boundary ko track karo.</li><li>Pullback par CE setup tabhi evaluate karo jab confirmation mile.</li><li>Weakening resistance par normal EOR se PE lene se pehle extra confirmation chahiye.</li></ul><h2>Invalidation</h2><p>Price action aur updated levels setup ko support na karein to trade skip karo.</p>' },
  { id: 'scenario-3', scenario: '3', title: 'Resistance Weak Towards Bottom (WTB)', category: 'Scenario', color: 'amber', pinned: false, tags: ['WTB', 'bearish', 'resistance'], updatedAt: new Date().toISOString(), content: '<h2>Market Context</h2><p>Resistance lower shift ho rahi hai; market ko upper levels tak pahunchne mein difficulty ho sakti hai.</p><h2>Trade Plan</h2><ul><li>Lower resistance / rejection behaviour observe karo.</li><li>PE entry ke liye price confirmation aur defined risk zaroori hai.</li><li>Sirf scenario label dekhkar trade mat lo.</li></ul><h2>Review</h2><p>Trade ke baad entry reason, exit reason aur rule-following note karo.</p>' },
  { id: 'scenario-4', scenario: '4', title: 'Support Weak Towards Top (WTT)', category: 'Scenario', color: 'green', pinned: false, tags: ['WTT', 'bullish', 'support'], updatedAt: new Date().toISOString(), content: '<h2>Market Context</h2><p>Support floor upar build ho raha hai; dips par support behaviour observe karo.</p><h2>Trade Plan</h2><ul><li>Support / US diversion ke aas-paas confirmation wait karo.</li><li>CE setup ko defined stop-loss ke saath evaluate karo.</li><li>Support fail ho to bias ko dobara assess karo.</li></ul>' },
  { id: 'scenario-5', scenario: '5', title: 'Support Weak Towards Bottom (WTB)', category: 'Scenario', color: 'red', pinned: true, tags: ['WTB', 'bearish', 'support'], updatedAt: new Date().toISOString(), content: '<h2>Market Context</h2><p>Support lower shift ho raha hai. Standard EOS par support fail hone ka risk ho sakta hai.</p><h2>Trade Plan</h2><ul><li>Shifted support / EOS-minus boundary ko monitor karo.</li><li>Support crack hone par CE avoid karne ka rule apne setup ke mutabik verify karo.</li><li>PE setup ke liye breakdown confirmation aur risk-defined entry wait karo.</li></ul><h2>Risk & Invalidation</h2><ul><li>Stop-loss pehle decide karo.</li><li>False breakdown ya level reclaim ho to trade plan re-evaluate karo.</li></ul><p><strong>Note:</strong> Scenario context hai, guaranteed prediction nahi.</p>' },
  { id: 'scenario-6', scenario: '6', title: 'Rocket Move — Both WTT', category: 'Scenario', color: 'green', pinned: false, tags: ['momentum', 'WTT', 'bullish'], updatedAt: new Date().toISOString(), content: '<h2>Market Context</h2><p>Support aur resistance dono upward shift kar rahe hain; momentum expansion possible hai.</p><h2>Trade Plan</h2><ul><li>Trend confirmation ke bina chase mat karo.</li><li>Pullback / continuation setup aur invalidation level define karo.</li><li>Position ko apne risk rules ke mutabik manage karo.</li></ul><h2>Risk</h2><p>Fast moves mein slippage aur sudden reversal ka risk hota hai.</p>' },
  { id: 'scenario-7', scenario: '7', title: 'Freefall — Both WTB', category: 'Scenario', color: 'red', pinned: false, tags: ['momentum', 'WTB', 'bearish'], updatedAt: new Date().toISOString(), content: '<h2>Market Context</h2><p>Support aur resistance dono downward shift kar rahe hain; bearish momentum possible hai.</p><h2>Trade Plan</h2><ul><li>Rally rejection / continuation confirmation wait karo.</li><li>Price already extended ho to late entry se bacho.</li><li>Invalidation aur stop-loss pehle define karo.</li></ul><h2>Discipline</h2><p>Volatility high ho to size reduce karna ya trade skip karna bhi valid decision hai.</p>' },
  { id: 'scenario-8', scenario: '8', title: 'State of Confusion (SOC)', category: 'Scenario', color: 'amber', pinned: true, tags: ['SOC', 'no-trade', 'risk'], updatedAt: new Date().toISOString(), content: '<h2>Market Context</h2><p>Signals conflicting ya unclear hain. Directional edge confirm nahi hai.</p><h2>Primary Rule</h2><ul><li>Clarity na ho to no-trade is a valid position.</li><li>Extreme levels par bhi confirmation aur risk rules follow karo.</li><li>Market ko force karke trade mat banao.</li></ul><h2>Review Prompt</h2><p>Kya mere paas clear setup, entry trigger, stop-loss aur exit plan hai? Agar nahi, wait.</p>' }
];

const NOTE_COLORS = {
  cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  blue: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  red: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  purple: 'border-violet-500/40 bg-violet-500/10 text-violet-300'
};

const INITIAL_TRADES = [
  {
    id: 'tr-101',
    date: '2026-10-05',
    time: '09:48',
    instrument: 'NIFTY',
    type: 'CE',
    strike: 24200,
    lotSize: 25,
    lots: 1,
    qty: 25,
    buyPrice: 108.50,
    sellPrice: 139.00,
    stoploss: 93.50,
    pnl: 762.50,
    pts: 30.50,
    location: 'EOS',
    condition: 'Strong / Strong',
    discipline: 10,
    tag: 'Followed Rules (Line-to-Line)',
    notes: 'Bought exactly when Spot touched EOS 24,168. Exited at first diversion with zero hesitation.'
  },
  {
    id: 'tr-102',
    date: '2026-10-06',
    time: '10:15',
    instrument: 'NIFTY',
    type: 'PE',
    strike: 24500,
    lotSize: 25,
    lots: 1,
    qty: 25,
    buyPrice: 95.00,
    sellPrice: 75.00,
    stoploss: 75.00,
    pnl: -500.00,
    pts: -20.00,
    location: 'Mid-Air',
    condition: 'Resistance WTT',
    discipline: 3,
    tag: 'FOMO Entry (Mid-Air)',
    notes: 'Greed trade! Spot was hovering in the middle and Resistance was WTT. Cut SL cleanly when ceiling broke.'
  },
  {
    id: 'tr-103',
    date: '2026-10-07',
    time: '11:05',
    instrument: 'NIFTY',
    type: 'CE',
    strike: 24250,
    lotSize: 25,
    lots: 1,
    qty: 25,
    buyPrice: 112.00,
    sellPrice: 154.00,
    stoploss: 97.00,
    pnl: 1050.00,
    pts: 42.00,
    location: 'US_Diversion',
    condition: 'Support WTT',
    discipline: 9,
    tag: 'Followed Rules (Line-to-Line)',
    notes: 'Support showed heavy shifting upward (WTT). Entered on retest of 24,250 US diversion.'
  },
  {
    id: 'tr-104',
    date: '2026-10-08',
    time: '10:40',
    instrument: 'NIFTY',
    type: 'PE',
    strike: 24450,
    lotSize: 25,
    lots: 1,
    qty: 25,
    buyPrice: 86.00,
    sellPrice: 74.00,
    stoploss: 74.00,
    pnl: -300.00,
    pts: -12.00,
    location: 'EOR',
    condition: 'State of Confusion',
    discipline: 7,
    tag: 'Cut Loser Quickly',
    notes: 'Volume and OI were at 99% duel. Exited early with a tiny 12-point loss.'
  },
  {
    id: 'tr-105',
    date: '2026-10-09',
    time: '13:10',
    instrument: 'NIFTY',
    type: 'PE',
    strike: 24500,
    lotSize: 25,
    lots: 1,
    qty: 25,
    buyPrice: 94.00,
    sellPrice: 146.00,
    stoploss: 80.00,
    pnl: 1300.00,
    pts: 52.00,
    location: 'EOR',
    condition: 'Resistance WTB',
    discipline: 10,
    tag: 'Followed Rules (Line-to-Line)',
    notes: 'Textbook reversal from EOR with WTB pressure on Call side. Held patiently to target.'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('notes'); // Notes is the only visible workspace
  // Trading Notes state — stored separately so existing trade/calculator data remains untouched.
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      return saved ? JSON.parse(saved) : DEFAULT_SCENARIO_NOTES;
    } catch (e) {
      return DEFAULT_SCENARIO_NOTES;
    }
  });
  const [noteSearch, setNoteSearch] = useState('');
  const [activeNoteId, setActiveNoteId] = useState('scenario-5');
  const [noteFilter, setNoteFilter] = useState('ALL');
  const [noteTitleDraft, setNoteTitleDraft] = useState('');
  const [noteTagsDraft, setNoteTagsDraft] = useState('');
  const [noteColorDraft, setNoteColorDraft] = useState('cyan');
  const [noteCategoryDraft, setNoteCategoryDraft] = useState('Trading');
  const [notesEditorReady, setNotesEditorReady] = useState(false);
  const [showNoteEditingTools, setShowNoteEditingTools] = useState(false);
  const noteEditorRef = useRef(null);
  const [trades, setTrades] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRADES);
      return saved ? JSON.parse(saved) : INITIAL_TRADES;
    } catch (e) {
      return INITIAL_TRADES;
    }
  });

  // Calculator State
  const [calcData, setCalcData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CALC);
      return saved ? JSON.parse(saved) : {
        cmp: 24310,
        supportStrike: 24200,
        putLtp: 32.50,
        resistanceStrike: 24500,
        callLtp: 38.00,
        scenario: 'strong_strong',
        shiftUpStrike: 24600,
        shiftDownStrike: 24100,
        customTargetStrike: 24350,
        customTargetLtp: 24.00
      };
    } catch (e) {
      return {
        cmp: 24310,
        supportStrike: 24200,
        putLtp: 32.50,
        resistanceStrike: 24500,
        callLtp: 38.00,
        scenario: 'strong_strong',
        shiftUpStrike: 24600,
        shiftDownStrike: 24100,
        customTargetStrike: 24350,
        customTargetLtp: 24.00
      };
    }
  });

  // Logger Form State
  const [tradeForm, setTradeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    instrument: 'NIFTY',
    type: 'CE',
    strike: 24300,
    lotSize: 25,
    lots: 1,
    buyPrice: '',
    sellPrice: '',
    stoploss: '',
    location: 'EOS',
    condition: 'Strong / Strong',
    discipline: 9,
    tag: 'Followed Rules (Line-to-Line)',
    notes: ''
  });

  // Journal Filters
  const [filterType, setFilterType] = useState('ALL');
  const [filterOutcome, setFilterOutcome] = useState('ALL');
  const [filterLocation, setFilterLocation] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Rules modal (read-only trading rules; no checklist)
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(trades));
    } catch (e) {
      console.error(e);
    }
  }, [trades]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CALC, JSON.stringify(calcData));
    } catch (e) {
      console.error(e);
    }
  }, [calcData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error('Unable to save trading notes:', e);
      showToast('Notes save nahi ho paaye. Browser storage check karein.', 'error');
    }
  }, [notes]);

  const activeNote = notes.find((note) => note.id === activeNoteId) || null;

  useEffect(() => {
    if (!activeNote) return;
    setNoteTitleDraft(activeNote.title || '');
    setNoteTagsDraft(Array.isArray(activeNote.tags) ? activeNote.tags.join(', ') : '');
    setNoteColorDraft(activeNote.color || 'cyan');
    setNoteCategoryDraft(activeNote.category || 'Trading');
    setNotesEditorReady(false);
  }, [activeNoteId]);

  useEffect(() => {
    if (!showNoteEditingTools || !activeNote || !noteEditorRef.current || notesEditorReady) return;
    noteEditorRef.current.innerHTML = activeNote.content || '';
    setNotesEditorReady(true);
  }, [activeNote, notesEditorReady, showNoteEditingTools]);

  const filteredNotes = useMemo(() => {
    const query = noteSearch.trim().toLowerCase();
    const scenarioIds = query.match(/\d+/g) || [];
    const uniqueScenarioIds = [...new Set(scenarioIds)];

    return notes
      .filter((note) => {
        const matchesFilter =
          noteFilter === 'ALL' || note.category === noteFilter;

        if (!matchesFilter) return false;
        if (!query) return true;

        const searchable = `
          ${note.scenario || ''}
          ${note.title || ''}
          ${note.category || ''}
          ${(Array.isArray(note.tags) ? note.tags : []).join(' ')}
          ${String(note.content || '').replace(/<[^>]*>/g, ' ')}
        `.toLowerCase();

        const matchesScenarioSequence =
          uniqueScenarioIds.length > 0 &&
          uniqueScenarioIds.includes(String(note.scenario || ''));

        return matchesScenarioSequence || searchable.includes(query);
      })
      .sort(
        (a, b) =>
          Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
          String(a.title || '').localeCompare(String(b.title || ''))
      );
  }, [notes, noteSearch, noteFilter]);

  // Automatically open the first matching note during search.
  // This effect must stay AFTER filteredNotes is initialized.
  useEffect(() => {
    if (!noteSearch.trim() || filteredNotes.length === 0) return;

    const currentNoteMatches = filteredNotes.some(
      (note) => note.id === activeNoteId
    );

    if (!currentNoteMatches) {
      setNotesEditorReady(false);
      setActiveNoteId(filteredNotes[0].id);
    }
  }, [noteSearch, filteredNotes, activeNoteId]);

  const updateActiveNote = (updates) => {
    if (!activeNote) return;
    setNotes((current) => current.map((note) => note.id === activeNote.id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note));
  };

  const createTradingNote = () => {
    const id = `note-${Date.now()}`;
    const newNote = { id, scenario: '', title: 'New Trading Note', category: 'Trading', color: 'cyan', pinned: false, tags: [], updatedAt: new Date().toISOString(), content: '<h2>Setup / Context</h2><p>Yahan apna trading note likho...</p><h2>Entry Conditions</h2><ul><li></li></ul><h2>Risk & Exit</h2><p></p><h2>Post-Trade Review</h2><p></p>' };
    setNotes((current) => [newNote, ...current]);
    setActiveNoteId(id);
    setNoteSearch('');
    setNoteFilter('ALL');
    setActiveTab('notes');
    showToast('New note created. Auto-save enabled.', 'success');
  };

  const deleteActiveNote = () => {
    if (!activeNote) return;
    if (!window.confirm(`Delete “${activeNote.title}”? This cannot be undone.`)) return;
    const remaining = notes.filter((note) => note.id !== activeNote.id);
    setNotes(remaining);
    setActiveNoteId(remaining[0]?.id || '');
    setNotesEditorReady(false);
    showToast('Note deleted.', 'success');
  };

  const runNoteCommand = (command, value = null) => {
    noteEditorRef.current?.focus();
    document.execCommand(command, false, value);
    if (noteEditorRef.current) updateActiveNote({ content: noteEditorRef.current.innerHTML });
  };

  const exportTradingNotes = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), notes }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `coa-trading-notes-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Notes backup downloaded.', 'success');
  };

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const chauhaddiCalculations = useMemo(() => {
    const supStrike = Number(calcData.supportStrike) || 24200;
    const putLtp = Number(calcData.putLtp) || 30;
    const resStrike = Number(calcData.resistanceStrike) || 24500;
    const callLtp = Number(calcData.callLtp) || 35;
    const cmp = Number(calcData.cmp) || 24300;
    const shiftUp = Number(calcData.shiftUpStrike) || (resStrike + 100);
    const shiftDown = Number(calcData.shiftDownStrike) || (supStrike - 100);

    // Primary Breakevens
    const eos = supStrike - putLtp;
    const eor = resStrike + callLtp;

    // Shift boundaries (Ext-plus-one / Ext-minus-one)
    const eorPlus1 = shiftUp + callLtp;
    const eosMinus1 = shiftDown - putLtp;

    // Diversions for custom strike
    const customStrike = Number(calcData.customTargetStrike) || 24350;
    const customLtp = Number(calcData.customTargetLtp) || 25;
    const customUR = customStrike + customLtp;
    const customUS = customStrike - customLtp;

    const spread = eor - eos;
    const midpoint = (eos + eor) / 2;
    
    // Relative position clamp (3% to 97%)
    let relativePercent = spread > 0 ? ((cmp - eos) / spread) * 100 : 50;
    if (relativePercent < 3) relativePercent = 3;
    if (relativePercent > 97) relativePercent = 97;

    return {
      eos,
      eor,
      eorPlus1,
      eosMinus1,
      customUR,
      customUS,
      spread,
      midpoint,
      relativePercent
    };
  }, [calcData]);

  const scenarioDetails = useMemo(() => {
    switch (calcData.scenario) {
      case 'strong_strong':
        return {
          title: 'Range Bound (Strong / Strong)',
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          advice: 'Support and Resistance are both settled. Pure oscillation day between EOS and EOR. Buy CE on EOS touch; Buy PE on EOR touch. Avoid all trades mid-way.',
          bias: 'Neutral / Mean-Reverting',
          allowCE: true,
          allowPE: true
        };
      case 'res_wtt':
        return {
          title: 'Resistance Weak Towards Top (WTT)',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          advice: `Call writers are fleeing higher towards strike ${calcData.shiftUpStrike}. Do NOT buy PE at normal EOR (${chauhaddiCalculations.eor.toFixed(0)}) as resistance will break! Look for CE on dips. Ceiling expands to ${chauhaddiCalculations.eorPlus1.toFixed(0)}.`,
          bias: 'Bullish Breakout',
          allowCE: true,
          allowPE: false
        };
      case 'res_wtb':
        return {
          title: 'Resistance Weak Towards Bottom (WTB)',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          advice: 'Sellers are pushing ceiling lower. Market struggles to reach standard EOR and will drop early. Look for Put (PE) on dips and upper diversions.',
          bias: 'Mild Bearish',
          allowCE: false,
          allowPE: true
        };
      case 'sup_wtt':
        return {
          title: 'Support Weak Towards Top (WTT)',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          advice: 'Put writers are building higher support floors. Market is heavily supported. Every downward dip into support/US diversion is a high-probability Call (CE) opportunity.',
          bias: 'Strong Bullish',
          allowCE: true,
          allowPE: false
        };
      case 'sup_wtb':
        return {
          title: 'Support Weak Towards Bottom (WTB)',
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          advice: `Bloodbath Warning! Support is cracking downwards towards ${calcData.shiftDownStrike}. Do NOT buy CE at standard EOS (${chauhaddiCalculations.eos.toFixed(0)}), floor is expected to sink towards ${chauhaddiCalculations.eosMinus1.toFixed(0)}.`,
          bias: 'Severe Bearish',
          allowCE: false,
          allowPE: true
        };
      case 'both_wtt':
        return {
          title: 'Rocket Move (Both WTT)',
          badgeColor: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50',
          advice: 'Both engines accelerating upwards! Explosive momentum day. Zero PE purchases under any circumstances. Trail CE positions aggressively.',
          bias: 'Super Bullish Blast',
          allowCE: true,
          allowPE: false
        };
      case 'both_wtb':
        return {
          title: 'Freefall / Bloodbath (Both WTB)',
          badgeColor: 'bg-rose-600/20 text-rose-300 border-rose-500/50',
          advice: 'Both support and resistance collapsing downwards. Institutional liquidations in effect. Zero CE trades. Only sell on rallies or buy PE on every bounce.',
          bias: 'Super Bearish Freefall',
          allowCE: false,
          allowPE: true
        };
      case 'soc':
        return {
          title: 'State of Confusion (SOC)',
          badgeColor: 'bg-amber-600/20 text-amber-300 border-amber-500/50',
          advice: 'Strict Warning: Open Interest and Volume are deadlocked at 99% vs 100%. Calculations will jitter. Close your screen or wait strictly for extreme boundaries with tight 5-pt SL.',
          bias: 'No Trade / High Danger',
          allowCE: false,
          allowPE: false
        };
      default:
        return {
          title: 'Standard Market',
          badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          advice: 'Follow basic line-to-line boundaries.',
          bias: 'Neutral',
          allowCE: true,
          allowPE: true
        };
    }
  }, [calcData.scenario, calcData.shiftUpStrike, calcData.shiftDownStrike, chauhaddiCalculations]);

  const liveFormPreview = useMemo(() => {
    const buy = parseFloat(tradeForm.buyPrice) || 0;
    const sell = parseFloat(tradeForm.sellPrice) || 0;
    const sl = parseFloat(tradeForm.stoploss) || 0;
    const lots = parseInt(tradeForm.lots) || 1;
    const lotSize = parseInt(tradeForm.lotSize) || 25;
    const qty = lots * lotSize;

    const points = sell - buy;
    const pnl = points * qty;
    
    // Risk to Reward calculation
    const riskPerShare = (buy > 0 && sl > 0) ? Math.abs(buy - sl) : 0;
    const rewardPerShare = (sell > 0 && buy > 0) ? (sell - buy) : 0;
    const rrRatio = (riskPerShare > 0 && rewardPerShare > 0) ? (rewardPerShare / riskPerShare).toFixed(2) : null;

    return {
      points,
      pnl,
      qty,
      rrRatio
    };
  }, [tradeForm]);

  const handleTradeSubmit = (e) => {
    e.preventDefault();
    if (!tradeForm.buyPrice || !tradeForm.sellPrice) {
      showToast('Please enter both Buy and Sell prices', 'error');
      return;
    }

    const buy = parseFloat(tradeForm.buyPrice);
    const sell = parseFloat(tradeForm.sellPrice);
    const sl = tradeForm.stoploss ? parseFloat(tradeForm.stoploss) : 0;
    const lots = parseInt(tradeForm.lots) || 1;
    const lotSize = parseInt(tradeForm.lotSize) || 25;
    const qty = lots * lotSize;
    const pts = sell - buy;
    const pnl = pts * qty;

    const newTrade = {
      id: 'tr-' + Date.now(),
      date: tradeForm.date,
      time: tradeForm.time,
      instrument: tradeForm.instrument,
      type: tradeForm.type,
      strike: parseFloat(tradeForm.strike),
      lotSize,
      lots,
      qty,
      buyPrice: buy,
      sellPrice: sell,
      stoploss: sl,
      pnl,
      pts,
      location: tradeForm.location,
      condition: tradeForm.condition,
      discipline: parseInt(tradeForm.discipline),
      tag: tradeForm.tag,
      notes: tradeForm.notes.trim()
    };

    setTrades([newTrade, ...trades]);
    showToast('Trade recorded in Journal!', 'success');
    
    // Reset Form
    setTradeForm({
      ...tradeForm,
      buyPrice: '',
      sellPrice: '',
      stoploss: '',
      notes: ''
    });

    setActiveTab('journal');
  };

  const deleteTrade = (id) => {
    setTrades(trades.filter(t => t.id !== id));
    showToast('Trade entry deleted', 'info');
  };

  const clearAllTrades = () => {
    if (window.confirm("Are you sure you want to clear all trade journal entries? This cannot be undone.")) {
      setTrades([]);
      showToast('All journal history wiped', 'info');
    }
  };

  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      if (filterType !== 'ALL' && t.type !== filterType) return false;
      if (filterOutcome === 'WIN' && t.pnl <= 0) return false;
      if (filterOutcome === 'LOSS' && t.pnl >= 0) return false;
      if (filterLocation !== 'ALL' && t.location !== filterLocation) return false;
      
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesStrike = t.strike.toString().includes(q);
        const matchesNotes = t.notes.toLowerCase().includes(q);
        const matchesTag = t.tag.toLowerCase().includes(q);
        const matchesCondition = t.condition.toLowerCase().includes(q);
        if (!matchesStrike && !matchesNotes && !matchesTag && !matchesCondition) return false;
      }
      return true;
    });
  }, [trades, filterType, filterOutcome, filterLocation, searchQuery]);

  const exportCSV = () => {
    if (trades.length === 0) {
      showToast('No trades to export', 'error');
      return;
    }
    const headers = ['Date', 'Time', 'Instrument', 'Type', 'Strike', 'Lots', 'Qty', 'BuyPrice', 'SellPrice', 'Stoploss', 'NetPnL', 'Points', 'Location', 'Condition', 'DisciplineScore', 'Tag', 'Notes'];
    const rows = trades.map(t => [
      t.date,
      t.time || '',
      t.instrument,
      t.type,
      t.strike,
      t.lots,
      t.qty,
      t.buyPrice,
      t.sellPrice,
      t.stoploss || '',
      t.pnl,
      t.pts,
      t.location,
      `"${(t.condition || '').replace(/"/g, '""')}"`,
      t.discipline,
      `"${(t.tag || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NIFTY_LTP_Journal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV successfully', 'success');
  };

  const analyticsData = useMemo(() => {
    const totalTrades = trades.length;
    if (totalTrades === 0) {
      return {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalPnl: 0,
        profitFactor: 0,
        avgDiscipline: 0,
        avgWin: 0,
        avgLoss: 0,
        lineToLineWinRate: 0,
        midAirWinRate: 0,
        mistakeCounts: {}
      };
    }

    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
    const grossProfit = wins.reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
    
    const winRate = (wins.length / totalTrades) * 100;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? 99.0 : 0);
    const avgDiscipline = trades.reduce((acc, t) => acc + t.discipline, 0) / totalTrades;
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;

    // Line-to-Line vs Mid-Air stats
    const lineTrades = trades.filter(t => t.location === 'EOS' || t.location === 'EOR' || t.location.includes('Diversion'));
    const lineWins = lineTrades.filter(t => t.pnl > 0).length;
    const lineToLineWinRate = lineTrades.length > 0 ? ((lineWins / lineTrades.length) * 100) : 0;

    const midAirTrades = trades.filter(t => t.location === 'Mid-Air');
    const midAirWins = midAirTrades.filter(t => t.pnl > 0).length;
    const midAirWinRate = midAirTrades.length > 0 ? ((midAirWins / midAirTrades.length) * 100) : 0;

    // Tags count
    const mistakeCounts = {};
    trades.forEach(t => {
      mistakeCounts[t.tag] = (mistakeCounts[t.tag] || 0) + 1;
    });

    return {
      totalTrades,
      wins: wins.length,
      losses: losses.length,
      winRate,
      totalPnl,
      profitFactor,
      avgDiscipline,
      avgWin,
      avgLoss,
      lineToLineWinRate,
      midAirWinRate,
      lineTradeCount: lineTrades.length,
      midAirTradeCount: midAirTrades.length,
      mistakeCounts
    };
  }, [trades]);

  const EquityCurveCanvas = ({ tradesList }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.parentElement.clientWidth;
      const height = canvas.parentElement.clientHeight;
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      if (tradesList.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('No completed trades to plot equity curve', width / 2, height / 2);
        return;
      }

      // Calculate cumulative P&L series (oldest to newest)
      const chronTrades = [...tradesList].reverse();
      let currentVal = 0;
      const series = [0];
      chronTrades.forEach(t => {
        currentVal += t.pnl;
        series.push(currentVal);
      });

      const minVal = Math.min(0, ...series);
      const maxVal = Math.max(100, ...series);
      const range = maxVal - minVal || 1;

      const paddingLeft = 60;
      const paddingRight = 25;
      const paddingTop = 25;
      const paddingBottom = 35;

      const plotW = width - paddingLeft - paddingRight;
      const plotH = height - paddingTop - paddingBottom;

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = paddingTop + (plotH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();

        const gridVal = maxVal - (range / 4) * i;
        ctx.fillStyle = '#64748b';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillText(`₹${Math.round(gridVal)}`, paddingLeft - 8, y + 3);
      }

      // Zero Baseline
      const zeroY = paddingTop + plotH - ((0 - minVal) / range) * plotH;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(paddingLeft, zeroY);
      ctx.lineTo(width - paddingRight, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Plot line and fill gradient
      const getX = (idx) => paddingLeft + (plotW / (series.length - 1)) * idx;
      const getY = (val) => paddingTop + plotH - ((val - minVal) / range) * plotH;

      const gradient = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + plotH);
      const isOverallProfitable = series[series.length - 1] >= 0;
      gradient.addColorStop(0, isOverallProfitable ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

      // Area fill
      ctx.beginPath();
      ctx.moveTo(getX(0), getY(series[0]));
      series.forEach((val, i) => {
        ctx.lineTo(getX(i), getY(val));
      });
      ctx.lineTo(getX(series.length - 1), zeroY);
      ctx.lineTo(getX(0), zeroY);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke Line
      ctx.beginPath();
      series.forEach((val, i) => {
        const x = getX(i);
        const y = getY(val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = isOverallProfitable ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Render dots
      series.forEach((val, i) => {
        const x = getX(i);
        const y = getY(val);
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = val >= 0 ? '#10b981' : '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#070a11';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

    }, [tradesList]);

    return <canvas ref={canvasRef} className="w-full h-full block" />;
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-xl border bg-dark-900 shadow-2xl backdrop-blur-md animate-fade-in border-slate-700">
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertOctagon className="w-4 h-4 text-rose-400" />}
          {toast.type === 'info' && <Activity className="w-4 h-4 text-cyan-400" />}
          <span className="text-xs font-semibold text-slate-200">{toast.message}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#0b0f19]/90 border-b border-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="h-5 w-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wide bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  COA SMART NOTES
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  PRO TERMINAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">COA 1.0 • Trading Engine & Discipline Journal</p>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center space-x-1 bg-[#101626] p-1 rounded-xl border border-slate-800">
            {/* <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                activeTab === 'calculator' ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gauge className="w-3.5 h-5" />
              <span>Engine</span>
            </button> */}
            {/* <button
              onClick={() => setActiveTab('logger')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                activeTab === 'logger' ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Trade</span>
            </button> */}
            {/* <button
              onClick={() => setActiveTab('journal')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                activeTab === 'journal' ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Journal</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full font-mono text-cyan-400 ml-1">
                {trades.length}
              </span>
            </button> */}
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                activeTab === 'notes' ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <NotebookPen className="w-3.5 h-3.5" />
              <span>Notes</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full font-mono text-cyan-400 ml-1">{notes.length}</span>
            </button>
            {/* <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                activeTab === 'analytics' ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button> */}
          </nav>

          {/* Quick Actions: Pre-trade Checklist & Deploy Guide */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRulesOpen(true)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Pre-Trade</span> <span>Rules</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ============================================================== */}
        {/* TAB 1: CHAUHADDI ENGINE & DAY RANGE CALCULATOR                */}
        {/* ============================================================== */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            
            {/* Top Strategy Preset Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#101626] to-[#161e33] border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <h2 className="text-base font-bold text-white tracking-wide">LTP Market Chauhaddi & Boundary Calculator</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  EOS (Day Low) = Support Strike - Put LTP | EOR (Day High) = Resistance Strike + Call LTP
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setCalcData({
                      cmp: 24390,
                      supportStrike: 24300,
                      putLtp: 28.00,
                      resistanceStrike: 24500,
                      callLtp: 46.00,
                      scenario: 'res_wtt',
                      shiftUpStrike: 24600,
                      shiftDownStrike: 24200,
                      customTargetStrike: 24400,
                      customTargetLtp: 26.00
                    });
                    showToast('Applied Bullish WTT Preset', 'info');
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-colors"
                >
                  Preset: Bullish WTT
                </button>
                <button
                  onClick={() => {
                    setCalcData({
                      cmp: 24240,
                      supportStrike: 24200,
                      putLtp: 34.00,
                      resistanceStrike: 24400,
                      callLtp: 32.00,
                      scenario: 'strong_strong',
                      shiftUpStrike: 24500,
                      shiftDownStrike: 24100,
                      customTargetStrike: 24300,
                      customTargetLtp: 22.00
                    });
                    showToast('Applied Stable Range Preset', 'info');
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800 hover:bg-blue-900 transition-colors"
                >
                  Preset: Strong-Strong
                </button>
                <button
                  onClick={() => {
                    setCalcData({
                      cmp: 24310,
                      supportStrike: 24200,
                      putLtp: 32.50,
                      resistanceStrike: 24500,
                      callLtp: 38.00,
                      scenario: 'strong_strong',
                      shiftUpStrike: 24600,
                      shiftDownStrike: 24100,
                      customTargetStrike: 24350,
                      customTargetLtp: 24.00
                    });
                    showToast('Reset to Defaults', 'info');
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Inputs Column (5 Cols) */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0f1524] border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>Option Chain Live Inputs</span>
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    Nifty Weekly
                  </span>
                </div>

                {/* CMP Spot */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    NIFTY Current Spot Price (CMP)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={calcData.cmp}
                      onChange={(e) => setCalcData({ ...calcData, cmp: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#161f36] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm font-mono text-cyan-300 outline-none transition-all"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">SPOT</span>
                  </div>
                </div>

                {/* Support & Resistance Side-by-Side */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Put / Support */}
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                    <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>Support (Put Side)</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Strike Price</label>
                      <input
                        type="number"
                        step="50"
                        value={calcData.supportStrike}
                        onChange={(e) => setCalcData({ ...calcData, supportStrike: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#101728] border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Put LTP (₹)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={calcData.putLtp}
                        onChange={(e) => setCalcData({ ...calcData, putLtp: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#101728] border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-emerald-300 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Call / Resistance */}
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                    <div className="flex items-center space-x-1 text-rose-400 text-xs font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Resistance (Call Side)</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Strike Price</label>
                      <input
                        type="number"
                        step="50"
                        value={calcData.resistanceStrike}
                        onChange={(e) => setCalcData({ ...calcData, resistanceStrike: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#101728] border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Call LTP (₹)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={calcData.callLtp}
                        onChange={(e) => setCalcData({ ...calcData, callLtp: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#101728] border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-rose-300 outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>

                {/* COA 1.0 Scenario Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Chart of Accuracy (COA 1.0) Shifting Dynamics
                  </label>
                  <select
                    value={calcData.scenario}
                    onChange={(e) => setCalcData({ ...calcData, scenario: e.target.value })}
                    className="w-full bg-[#161f36] border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-cyan-400"
                  >
                    <option value="strong_strong">1. Support Strong & Resistance Strong (Standard Range)</option>
                    <option value="res_wtt">2. Resistance Weak Towards Top (WTT - Ceiling Shatter)</option>
                    <option value="res_wtb">3. Resistance Weak Towards Bottom (WTB - Falling Ceiling)</option>
                    <option value="sup_wtt">4. Support Weak Towards Top (WTT - Rising Floor)</option>
                    <option value="sup_wtb">5. Support Weak Towards Bottom (WTB - Bloodbath Sinking)</option>
                    <option value="both_wtt">6. Both Support & Res WTT (Rocket Move / Extreme Rally)</option>
                    <option value="both_wtb">7. Both Support & Res WTB (Freefall / Panic Dumping)</option>
                    <option value="soc">8. State of Confusion (SOC - 99%/100% Duel, Sit on Hands)</option>
                  </select>
                </div>

                {/* Shifting Steps */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400">Shift Strike Upper (WTT)</label>
                    <input
                      type="number"
                      step="50"
                      value={calcData.shiftUpStrike}
                      onChange={(e) => setCalcData({ ...calcData, shiftUpStrike: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#161f36] border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Shift Strike Lower (WTB)</label>
                    <input
                      type="number"
                      step="50"
                      value={calcData.shiftDownStrike}
                      onChange={(e) => setCalcData({ ...calcData, shiftDownStrike: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#161f36] border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-300 outline-none"
                    />
                  </div>
                </div>

                {/* Intermediate Diversion Sub-Calculator */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Check Any Strike's Diversion (UR / US)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <input
                        type="number"
                        placeholder="Strike (e.g. 24350)"
                        value={calcData.customTargetStrike}
                        onChange={(e) => setCalcData({ ...calcData, customTargetStrike: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#161f36] border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-300"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Option LTP"
                        value={calcData.customTargetLtp}
                        onChange={(e) => setCalcData({ ...calcData, customTargetLtp: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#161f36] border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-300"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono bg-[#101728] p-2 rounded-lg border border-slate-800">
                    <span className="text-emerald-400">US: {chauhaddiCalculations.customUS.toFixed(2)}</span>
                    <span className="text-rose-400">UR: {chauhaddiCalculations.customUR.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Outputs & Gauges Column (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Boundary Cards: EOS & EOR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* EOS Card */}
                  <div className="p-4 rounded-2xl bg-emerald-950/15 border border-emerald-500/30 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>EOS (Day Low Floor)</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        PUT REVERSAL
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                      <span className="text-3xl font-black font-mono tracking-tight text-white">
                        {chauhaddiCalculations.eos.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400">pts</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      {calcData.supportStrike} - {Number(calcData.putLtp).toFixed(2)} = {chauhaddiCalculations.eos.toFixed(2)}
                    </p>
                    <div className="mt-2.5 text-[11px] text-emerald-300/90 bg-emerald-900/30 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                      {scenarioDetails.allowCE ? '✓ Valid CE Buying Zone (If confirmed by COA 2.0)' : '⚠️ Warning: Support is vulnerable today!'}
                    </div>
                  </div>

                  {/* EOR Card */}
                  <div className="p-4 rounded-2xl bg-rose-950/15 border border-rose-500/30 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-rose-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>EOR (Day High Ceiling)</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        CALL REVERSAL
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                      <span className="text-3xl font-black font-mono tracking-tight text-white">
                        {chauhaddiCalculations.eor.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400">pts</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      {calcData.resistanceStrike} + {Number(calcData.callLtp).toFixed(2)} = {chauhaddiCalculations.eor.toFixed(2)}
                    </p>
                    <div className="mt-2.5 text-[11px] text-rose-300/90 bg-rose-900/30 px-2.5 py-1 rounded-lg border border-rose-800/40">
                      {scenarioDetails.allowPE ? '✓ Valid PE Buying Zone (If Resistance holds)' : '⚠️ Warning: Resistance is breaking upwards!'}
                    </div>
                  </div>
                </div>

                {/* Visual Chauhaddi Depth Gauge */}
                <div className="p-5 rounded-2xl bg-[#0f1524] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                      <GitCommit className="w-4 h-4 text-cyan-400" />
                      <span>Live Range Depth (Chauhaddi Span)</span>
                    </span>
                    <span className="font-mono text-cyan-300 text-xs">
                      Total Span: {chauhaddiCalculations.spread.toFixed(2)} pts
                    </span>
                  </div>

                  <div className="relative pt-6 pb-2">
                    {/* Visual Depth Bar */}
                    <div className="h-3 w-full bg-[#0a0e18] rounded-full overflow-hidden flex border border-slate-800">
                      <div className="w-1/4 bg-emerald-500/25 border-r border-emerald-500/40" title="EOS Support Zone"></div>
                      <div className="w-2/4 bg-slate-900/50" title="Mid-Zone (Danger / No-Trade)"></div>
                      <div className="w-1/4 bg-rose-500/25 border-l border-rose-500/40" title="EOR Resistance Zone"></div>
                    </div>

                    {/* Animated Pin Indicator */}
                    <div
                      className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                      style={{ left: `${chauhaddiCalculations.relativePercent}%` }}
                    >
                      <span className="bg-cyan-400 text-black font-black text-[10px] px-2 py-0.5 rounded shadow-lg font-mono">
                        CMP: {calcData.cmp}
                      </span>
                      <div className="w-0.5 h-6 bg-cyan-400"></div>
                    </div>

                    {/* Scale Labels */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-3">
                      <div className="text-left">
                        <div className="text-emerald-400 font-bold">EOS (Min Floor)</div>
                        <div>{chauhaddiCalculations.eos.toFixed(2)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400">Midpoint (Center)</div>
                        <div>{chauhaddiCalculations.midpoint.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-rose-400 font-bold">EOR (Max Ceiling)</div>
                        <div>{chauhaddiCalculations.eor.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Advisory Box */}
                <div className="p-4 rounded-2xl bg-[#0f1524] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center space-x-1.5">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span>COA 1.0 Tactical Directive</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${scenarioDetails.badgeColor}`}>
                      {scenarioDetails.title}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-[#141b2d] p-3 rounded-xl border border-slate-800">
                    {scenarioDetails.advice}
                  </p>

                  <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
                    <div className="bg-[#141b2d] p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Upper Shift Ceiling (EOR+1):</span>
                      <span className="text-rose-300 font-bold">{chauhaddiCalculations.eorPlus1.toFixed(2)}</span>
                    </div>
                    <div className="bg-[#141b2d] p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Lower Shift Floor (EOS-1):</span>
                      <span className="text-emerald-300 font-bold">{chauhaddiCalculations.eosMinus1.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: TRADE LOGGER (LINE-TO-LINE RECORDING)                  */}
        {/* ============================================================== */}
        {activeTab === 'logger' && (
          <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-[#0f1524] border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileSignature className="w-5 h-5 text-cyan-400" />
                  <span>Log Discipline Trade</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record trades strictly executed on calculated lines. Enforce rules and psychology tracking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRulesOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 self-start"
              >
                Open 4-Rule Checklist
              </button>
            </div>

            <form onSubmit={handleTradeSubmit} className="space-y-5">
              {/* Row 1: Date, Time & Instrument */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={tradeForm.date}
                    onChange={(e) => setTradeForm({ ...tradeForm, date: e.target.value })}
                    className="w-full bg-[#161f36] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Entry Time</label>
                  <input
                    type="time"
                    required
                    value={tradeForm.time}
                    onChange={(e) => setTradeForm({ ...tradeForm, time: e.target.value })}
                    className="w-full bg-[#161f36] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTradeForm({ ...tradeForm, type: 'CE' })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        tradeForm.type === 'CE'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-[#161f36] border-slate-700 text-slate-400'
                      }`}
                    >
                      CALL (CE)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeForm({ ...tradeForm, type: 'PE' })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        tradeForm.type === 'PE'
                          ? 'bg-rose-950 border-rose-500 text-rose-300'
                          : 'bg-[#161f36] border-slate-700 text-slate-400'
                      }`}
                    >
                      PUT (PE)
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Strike Price</label>
                  <input
                    type="number"
                    step="50"
                    required
                    placeholder="24300"
                    value={tradeForm.strike}
                    onChange={(e) => setTradeForm({ ...tradeForm, strike: e.target.value })}
                    className="w-full bg-[#161f36] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Row 2: Quantities & Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Lots (25 qty)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={tradeForm.lots}
                    onChange={(e) => setTradeForm({ ...tradeForm, lots: e.target.value })}
                    className="w-full bg-[#161f36] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Buy Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    placeholder="110.50"
                    value={tradeForm.buyPrice}
                    onChange={(e) => setTradeForm({ ...tradeForm, buyPrice: e.target.value })}
                    className="w-full bg-[#161f36] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Sell Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    placeholder="138.00"
                    value={tradeForm.sellPrice}
                    onChange={(e) => setTradeForm({ ...tradeForm, sellPrice: e.target.value })}
                    className="w-full bg-[#161f36] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-rose-300 outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Stoploss Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder="95.00"
                    value={tradeForm.stoploss}
                    onChange={(e) => setTradeForm({ ...tradeForm, stoploss: e.target.value })}
                    className="w-full bg-[#161f36] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* Dynamic P&L Preview Banner */}
              <div className="bg-[#141b2d] border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2">
                <span className="text-slate-400">Contract Size: {liveFormPreview.qty} Qty</span>
                <div className="flex items-center space-x-3">
                  {liveFormPreview.rrRatio && (
                    <span className="text-cyan-300">R:R = 1:{liveFormPreview.rrRatio}</span>
                  )}
                  <span className={`font-bold text-sm ${liveFormPreview.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Net: {liveFormPreview.pnl >= 0 ? '+' : ''}₹{liveFormPreview.pnl.toFixed(2)} ({liveFormPreview.points >= 0 ? '+' : ''}{liveFormPreview.points.toFixed(2)} pts)
                  </span>
                </div>
              </div>

              {/* Row 3: Location, Condition, Discipline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Execution Location</label>
                  <select
                    value={tradeForm.location}
                    onChange={(e) => setTradeForm({ ...tradeForm, location: e.target.value })}
                    className="w-full bg-[#161f36] border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-cyan-400"
                  >
                    <option value="EOS">EOS (Exact Day Low Boundary)</option>
                    <option value="EOR">EOR (Exact Day High Boundary)</option>
                    <option value="US_Diversion">US (Put Side Diversion)</option>
                    <option value="UR_Diversion">UR (Call Side Diversion)</option>
                    <option value="Mid-Air">Mid-Air (In-Between Trap - High Risk)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Market Condition</label>
                  <select
                    value={tradeForm.condition}
                    onChange={(e) => setTradeForm({ ...tradeForm, condition: e.target.value })}
                    className="w-full bg-[#161f36] border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-cyan-400"
                  >
                    <option value="Strong / Strong">Strong / Strong</option>
                    <option value="Support WTT">Support WTT (Bullish Floor)</option>
                    <option value="Resistance WTT">Resistance WTT (Bullish Ceiling Shatter)</option>
                    <option value="Support WTB">Support WTB (Bloodbath)</option>
                    <option value="Resistance WTB">Resistance WTB (Bearish)</option>
                    <option value="State of Confusion">State of Confusion (Violation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Discipline Rating (1-10)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={tradeForm.discipline}
                      onChange={(e) => setTradeForm({ ...tradeForm, discipline: parseInt(e.target.value) })}
                      className="w-full accent-cyan-400"
                    />
                    <span className="text-xs font-mono font-bold text-cyan-300 w-8 text-right">
                      {tradeForm.discipline}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: Psychology Tag & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Execution / Mistake Tag</label>
                  <select
                    value={tradeForm.tag}
                    onChange={(e) => setTradeForm({ ...tradeForm, tag: e.target.value })}
                    className="w-full bg-[#161f36] border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-cyan-400"
                  >
                    <option value="Followed Rules (Line-to-Line)">Followed Rules (Line-to-Line)</option>
                    <option value="FOMO Entry (Mid-Air)">FOMO Entry (Mid-Air)</option>
                    <option value="Cut Loser Quickly">Cut Loser Quickly (Disciplined SL)</option>
                    <option value="Held Loser in Hope">Held Loser in Hope (Disaster)</option>
                    <option value="Exited Too Early">Exited Too Early (Fear of Greed)</option>
                    <option value="Over-Trading">Over-Trading Violation</option>
                    <option value="Revenge Trade">Revenge Trade</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Trade Notes & Psychology Observation</label>
                  <input
                    type="text"
                    placeholder="Why did you take this trade? Speed of percentage? Any emotional rush?"
                    value={tradeForm.notes}
                    onChange={(e) => setTradeForm({ ...tradeForm, notes: e.target.value })}
                    className="w-full bg-[#161f36] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-cyan-400/20 transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Trade to Journal</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: TRADING JOURNAL HISTORY                                */}
        {/* ============================================================== */}
        {activeTab === 'journal' && (
          <div className="space-y-4">
            {/* Filter and Action Bar */}
            <div className="p-4 rounded-2xl bg-[#0f1524] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-[#161f36] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none"
                >
                  <option value="ALL">All Types (CE & PE)</option>
                  <option value="CE">Call Only (CE)</option>
                  <option value="PE">Put Only (PE)</option>
                </select>

                <select
                  value={filterOutcome}
                  onChange={(e) => setFilterOutcome(e.target.value)}
                  className="bg-[#161f36] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none"
                >
                  <option value="ALL">All Outcomes</option>
                  <option value="WIN">Profitable Only</option>
                  <option value="LOSS">Losses Only</option>
                </select>

                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="bg-[#161f36] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none"
                >
                  <option value="ALL">All Locations</option>
                  <option value="EOS">EOS</option>
                  <option value="EOR">EOR</option>
                  <option value="US_Diversion">US Diversion</option>
                  <option value="UR_Diversion">UR Diversion</option>
                  <option value="Mid-Air">Mid-Air</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search notes or strike..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#161f36] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400 w-44 sm:w-56"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={exportCSV}
                  className="px-3 py-1.5 rounded-lg bg-[#161f36] border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={clearAllTrades}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/30 border border-rose-900/50 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="rounded-2xl bg-[#0f1524] border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#141b2d] text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-3">Contract</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Price Action</th>
                      <th className="py-3 px-3">Lots</th>
                      <th className="py-3 px-4">Net P&L</th>
                      <th className="py-3 px-3">Discipline</th>
                      <th className="py-3 px-4">Execution Tag</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredTrades.map(t => {
                      const isWin = t.pnl >= 0;
                      return (
                        <tr key={t.id} className="hover:bg-[#141b2d]/60 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-300">
                            <div>{t.date}</div>
                            <div className="text-[10px] text-slate-500">{t.time || '10:00'}</div>
                          </td>
                          <td className="py-3 px-3 font-mono">
                            <span className={`px-2 py-0.5 rounded font-bold mr-1.5 border text-[10px] ${
                              t.type === 'CE' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-rose-950 text-rose-400 border-rose-800'
                            }`}>
                              {t.type}
                            </span>
                            <span className="font-bold text-white">{t.strike}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                              t.location === 'Mid-Air' ? 'bg-rose-950/50 text-rose-300 border-rose-800' : 'bg-[#161f36] text-cyan-300 border-slate-700'
                            }`}>
                              {t.location}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            ₹{t.buyPrice.toFixed(1)} &rarr; ₹{t.sellPrice.toFixed(1)}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400">{t.lots} ({t.qty}q)</td>
                          <td className="py-3 px-4 font-mono font-bold">
                            <span className={isWin ? 'text-emerald-400' : 'text-rose-400'}>
                              {isWin ? '+' : ''}₹{t.pnl.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-500 block font-normal">
                              {isWin ? '+' : ''}{t.pts.toFixed(1)} pts
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono">
                            <span className={`font-bold ${
                              t.discipline >= 8 ? 'text-emerald-400' : t.discipline >= 5 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {t.discipline}/10
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              t.tag.includes('Followed') ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                              t.tag.includes('FOMO') || t.tag.includes('Held Loser') ? 'bg-rose-950 text-rose-300 border-rose-800' :
                              'bg-amber-950 text-amber-300 border-amber-800'
                            }`}>
                              {t.tag}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-slate-400" title={t.notes}>
                            {t.notes || <span className="text-slate-600 italic">No notes</span>}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => deleteTrade(t.id)}
                              className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredTrades.length === 0 && (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">No trades match your current filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: PERFORMANCE & DISCIPLINE ANALYTICS                     */}
        {/* ============================================================== */}
        {activeTab === 'notes' && (
          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-[#101626] to-[#141d30] p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-cyan-300"><NotebookPen className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.2em]">Knowledge workspace</span></div>
                  <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Trading Notes Studio</h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-400">Scenario search, rich-text notes, colour labels aur automatic local saving — all in one workspace.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={createTradingNote} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-300"><FilePlus2 className="h-4 w-4" /> New note</button>
                  <button onClick={exportTradingNotes} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-500"><Download className="h-4 w-4" /> Backup JSON</button>
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
                <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#090e19] px-4 py-3 focus-within:border-cyan-400">
                  <Search className="h-5 w-5 shrink-0 text-cyan-400" />
                  <input value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)} placeholder="Search: Scenario - 1,2,3 or EOS, EOR" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
                  {noteSearch && <button onClick={() => setNoteSearch('')} className="text-slate-400 hover:text-white" title="Clear search"><X className="h-4 w-4" /></button>}
                </label>
                <select value={noteFilter} onChange={(e) => setNoteFilter(e.target.value)} className="rounded-xl border border-slate-700 bg-[#090e19] px-3 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400">
                  <option value="ALL">All categories</option><option value="Scenario">Scenarios</option><option value="Trading">Trading notes</option><option value="Psychology">Psychology</option><option value="Review">Trade review</option>
                </select>
              </div>
              {noteSearch.trim() && <p className="mt-2 text-xs text-slate-400">{filteredNotes.length} matching note(s). Comma-separated scenario numbers are supported.</p>}
            </div>

            <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1321]">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3"><h3 className="text-sm font-bold text-white">Your library</h3><span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-cyan-300">{filteredNotes.length}</span></div>
                <div className="max-h-[640px] space-y-2 overflow-y-auto p-3">
                  {filteredNotes.length === 0 && <div className="px-3 py-8 text-center"><Search className="mx-auto mb-2 h-7 w-7 text-slate-600" /><p className="text-sm text-slate-400">No notes found.</p><button onClick={createTradingNote} className="mt-3 text-sm font-semibold text-cyan-300 hover:text-cyan-200">Create a new note</button></div>}
                  {filteredNotes.map((note) => (
                    <button key={note.id} onClick={() => { setActiveNoteId(note.id); setNotesEditorReady(false); }} className={`w-full rounded-xl border p-3 text-left transition-all ${activeNoteId === note.id ? 'border-cyan-400/70 bg-cyan-400/10 shadow-lg shadow-cyan-950/30' : 'border-slate-800 bg-[#111827] hover:border-slate-600'}`}>
                      <div className="mb-2 flex items-center justify-between gap-2"><span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${NOTE_COLORS[note.color] || NOTE_COLORS.cyan}`}>{note.scenario ? `Scenario ${note.scenario}` : note.category || 'Note'}</span>{note.pinned && <Pin className="h-3.5 w-3.5 text-amber-300" />}</div>
                      <div className={`${noteSearch.trim() ? 'text-sm font-bold' : 'line-clamp-2 text-sm font-bold'} text-slate-100`}>{note.title || 'Untitled note'}</div>
                      {noteSearch.trim() && (
                        <div className="mt-2 rounded-lg border border-slate-800 bg-[#090e19] p-3">
                          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">Full note</div>
                          <div className="whitespace-pre-wrap break-words text-xs leading-6 text-slate-300">
                            {String(note.content || '')
                              .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n')
                              .replace(/<br\s*\/?\s*>/gi, '\n')
                              .replace(/<[^>]*>/g, '')
                              .replace(/&nbsp;/gi, ' ')
                              .replace(/&amp;/gi, '&')
                              .replace(/&lt;/gi, '<')
                              .replace(/&gt;/gi, '>')
                              .replace(/&quot;/gi, '"')
                              .replace(/&#39;/gi, "'")
                              .trim() || 'This note has no content yet.'}
                          </div>
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">{(Array.isArray(note.tags) ? note.tags : []).slice(0, 3).map((tag) => <span key={tag} className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">#{tag}</span>)}</div>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500"><Clock3 className="h-3 w-3" />{note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : 'Not saved'}</div>
                    </button>
                  ))}
                </div>
              </aside>

              <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1321]">
                {!activeNote ? (
                  <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center"><NotebookPen className="mb-3 h-10 w-10 text-slate-600" /><h3 className="text-lg font-bold text-white">Choose a note to start</h3><p className="mt-1 text-sm text-slate-400">Select a scenario on the left or create a new note.</p><button onClick={createTradingNote} className="mt-4 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-black">Create note</button></div>
                ) : (
                  <>
                    {!showNoteEditingTools && (
                      <div className="border-b border-slate-800 px-4 py-4 sm:px-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-1 flex items-center gap-2">
                              <span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${NOTE_COLORS[noteColorDraft] || NOTE_COLORS.cyan}`}>{activeNote.scenario ? `Scenario ${activeNote.scenario}` : noteCategoryDraft}</span>
                              <span className="text-xs text-emerald-300"><Check className="mr-1 inline h-3.5 w-3.5" />Auto-save on</span>
                            </div>
                            <h3 className="truncate text-lg font-bold text-white">{activeNote.title || 'Untitled note'}</h3>
                          </div>
                          <span className="text-xs text-slate-500">Reading mode</span>
                        </div>
                      </div>
                    )}
                    {showNoteEditingTools && (
                    <>
                    <div className="border-b border-slate-800 p-4 sm:p-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${NOTE_COLORS[noteColorDraft] || NOTE_COLORS.cyan}`}>{activeNote.scenario ? `Scenario ${activeNote.scenario}` : noteCategoryDraft}</span><span className="text-xs text-emerald-300"><Check className="mr-1 inline h-3.5 w-3.5" />Auto-save on</span></div><div className="flex gap-2"><button onClick={() => updateActiveNote({ pinned: !activeNote.pinned })} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${activeNote.pinned ? 'border-amber-400/50 bg-amber-400/10 text-amber-300' : 'border-slate-700 text-slate-400 hover:text-white'}`}><Pin className="mr-1 inline h-3.5 w-3.5" />{activeNote.pinned ? 'Pinned' : 'Pin note'}</button><button onClick={deleteActiveNote} className="rounded-lg border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"><Trash2 className="mr-1 inline h-3.5 w-3.5" />Delete</button></div></div>
                      <input value={noteTitleDraft} onChange={(e) => { setNoteTitleDraft(e.target.value); updateActiveNote({ title: e.target.value }); }} placeholder="Note title..." className="w-full bg-transparent text-xl font-black text-white outline-none placeholder:text-slate-600 sm:text-2xl" />
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <label className="text-xs text-slate-400">Scenario number<input value={activeNote.scenario || ''} onChange={(e) => updateActiveNote({ scenario: e.target.value.replace(/[^0-9]/g, '').slice(0, 2) })} placeholder="e.g. 5" className="mt-1 w-full rounded-lg border border-slate-700 bg-[#090e19] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" /></label>
                        <label className="text-xs text-slate-400">Category<select value={noteCategoryDraft} onChange={(e) => { setNoteCategoryDraft(e.target.value); updateActiveNote({ category: e.target.value }); }} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#090e19] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"><option>Trading</option><option>Scenario</option><option>Psychology</option><option>Review</option></select></label>
                        <label className="text-xs text-slate-400">Label colour<select value={noteColorDraft} onChange={(e) => { setNoteColorDraft(e.target.value); updateActiveNote({ color: e.target.value }); }} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#090e19] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"><option value="cyan">Cyan</option><option value="blue">Blue</option><option value="green">Green</option><option value="amber">Amber</option><option value="red">Red</option><option value="purple">Purple</option></select></label>
                      </div>
                      <label className="mt-3 block text-xs text-slate-400">Tags (comma separated)<input value={noteTagsDraft} onChange={(e) => { setNoteTagsDraft(e.target.value); updateActiveNote({ tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) }); }} placeholder="EOS, entry, risk management" className="mt-1 w-full rounded-lg border border-slate-700 bg-[#090e19] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" /></label>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 border-b border-slate-800 bg-[#101827] p-3">
                      <button type="button" title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => runNoteCommand('bold')} className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-cyan-400 hover:text-cyan-300"><Bold className="h-4 w-4" /></button>
                      <button type="button" title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => runNoteCommand('italic')} className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-cyan-400 hover:text-cyan-300"><Italic className="h-4 w-4" /></button>
                      <button type="button" title="Heading 1" onMouseDown={(e) => e.preventDefault()} onClick={() => runNoteCommand('formatBlock', 'h1')} className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-cyan-400 hover:text-cyan-300"><Heading1 className="h-4 w-4" /></button>
                      <button type="button" title="Heading 2" onMouseDown={(e) => e.preventDefault()} onClick={() => runNoteCommand('formatBlock', 'h2')} className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-cyan-400 hover:text-cyan-300"><Heading2 className="h-4 w-4" /></button>
                      <button type="button" title="Bullet list" onMouseDown={(e) => e.preventDefault()} onClick={() => runNoteCommand('insertUnorderedList')} className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-cyan-400 hover:text-cyan-300"><List className="h-4 w-4" /></button>
                      <button type="button" title="Numbered list" onMouseDown={(e) => e.preventDefault()} onClick={() => runNoteCommand('insertOrderedList')} className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-cyan-400 hover:text-cyan-300"><ListOrdered className="h-4 w-4" /></button>
                      <div className="mx-1 h-7 w-px bg-slate-700" />
                      <label title="Text colour" className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 px-2 py-1.5 text-xs text-slate-300 hover:border-cyan-400"><Palette className="h-4 w-4" /><input type="color" aria-label="Text colour" defaultValue="#67e8f9" onChange={(e) => runNoteCommand('foreColor', e.target.value)} className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0" /></label>
                      <button type="button" title="Highlight" onMouseDown={(e) => e.preventDefault()} onClick={() => runNoteCommand('hiliteColor', '#713f12')} className="rounded-lg border border-slate-700 p-2 text-amber-300 hover:border-amber-400"><Highlighter className="h-4 w-4" /></button>
                      <button type="button" title="Clear formatting" onMouseDown={(e) => e.preventDefault()} onClick={() => runNoteCommand('removeFormat')} className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-cyan-400"><Eraser className="h-4 w-4" /></button>
                      <div className="ml-auto text-[11px] text-slate-500"><AlignLeft className="mr-1 inline h-3.5 w-3.5" />Rich text editor</div>
                    </div>
                    </>
                    )}
                    {showNoteEditingTools ? (
                      <div
                        ref={noteEditorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => updateActiveNote({ content: e.currentTarget.innerHTML })}
                        onBlur={(e) => updateActiveNote({ content: e.currentTarget.innerHTML })}
                        className="trading-note-editor min-h-[320px] px-5 py-6 text-base leading-8 text-slate-200 outline-none sm:px-8"
                        data-placeholder="Write your trading plan here..."
                      />
                    ) : (
                      <div
                        className="trading-note-editor note-reading-content px-5 py-5 text-base leading-8 text-slate-200 sm:px-8"
                        dangerouslySetInnerHTML={{ __html: activeNote.content || '<p class="text-slate-500">This note has no content yet.</p>' }}
                      />
                    )}
                    <div className="border-t border-slate-800 bg-[#0a101c] px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setNotesEditorReady(false);
                          setShowNoteEditingTools((visible) => !visible);
                        }}
                        aria-expanded={showNoteEditingTools}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-200 transition-colors hover:border-cyan-400 hover:bg-cyan-500/20"
                      >
                        {showNoteEditingTools ? <><X className="h-4 w-4" /> Hide edit tools</> : <><Sliders className="h-4 w-4" /> Show edit tools</>}
                      </button>
                      {showNoteEditingTools && (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[11px] text-slate-500">Saved in this browser · Export JSON regularly for backup</p>
                          <span className="text-[11px] text-emerald-300"><Check className="mr-1 inline h-3 w-3" />Changes save automatically</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </section>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100/80"><strong className="text-amber-300">Trading risk reminder:</strong> Scenario notes are for organizing your own plan, not guaranteed buy/sell signals. Verify live levels, position size and stop-loss before any trade.</div>
          </section>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#0f1524] border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Cumulative Net P&L</span>
                <div className={`mt-2 text-2xl font-black font-mono tracking-tight ${
                  analyticsData.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {analyticsData.totalPnl >= 0 ? '+' : ''}₹{analyticsData.totalPnl.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">{analyticsData.totalTrades} Total Trades Logged</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1524] border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Win Rate</span>
                <div className="mt-2 text-2xl font-black font-mono tracking-tight text-cyan-300">
                  {analyticsData.winRate.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  {analyticsData.wins} Wins / {analyticsData.losses} Losses
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1524] border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Avg Discipline Rating</span>
                <div className="mt-2 text-2xl font-black font-mono tracking-tight text-amber-300">
                  {analyticsData.avgDiscipline.toFixed(1)} <span className="text-xs text-slate-500">/ 10</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Goal: Maintain &gt; 8.5 Rating</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f1524] border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Profit Factor</span>
                <div className="mt-2 text-2xl font-black font-mono tracking-tight text-emerald-400">
                  {analyticsData.profitFactor.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Avg Win: ₹{analyticsData.avgWin.toFixed(0)} | Avg Loss: ₹{analyticsData.avgLoss.toFixed(0)}</div>
              </div>
            </div>

            {/* Equity Curve & Mistake Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Equity Chart (8 cols) */}
              <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0f1524] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Cumulative Equity Growth (₹)</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Account Curve</span>
                </div>
                <div className="h-64 relative w-full">
                  <EquityCurveCanvas tradesList={trades} />
                </div>
              </div>

              {/* Psychology & Mistake Breakdown (4 cols) */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0f1524] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <PieChart className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Mistakes & Habit Tags</h3>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {Object.entries(analyticsData.mistakeCounts).map(([tag, count]) => {
                    const pct = ((count / analyticsData.totalTrades) * 100).toFixed(0);
                    return (
                      <div key={tag} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span className="truncate pr-2">{tag}</span>
                          <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#161f36] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${tag.includes('Followed') ? 'bg-emerald-400' : 'bg-rose-400'}`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(analyticsData.mistakeCounts).length === 0 && (
                    <p className="text-xs text-slate-500 py-6 text-center">No tags recorded.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Edge Analysis: Line-to-Line vs Mid-Air */}
            <div className="p-5 rounded-2xl bg-[#0f1524] border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <span>Behavioral Edge: Boundary Accuracy vs FOMO Mid-Air Entries</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/50 space-y-1">
                  <div className="text-emerald-400 font-bold">Line-to-Line Entries (EOS, EOR, Diversion)</div>
                  <div className="text-2xl font-black font-mono text-white">
                    {analyticsData.lineToLineWinRate.toFixed(1)}% Win Rate
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Calculated over {analyticsData.lineTradeCount} trades. Demonstrates the statistical edge of patient execution.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-1">
                  <div className="text-rose-400 font-bold">Mid-Air Entries (FOMO / In-Between)</div>
                  <div className="text-2xl font-black font-mono text-white">
                    {analyticsData.midAirWinRate.toFixed(1)}% Win Rate
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Logged across {analyticsData.midAirTradeCount} trades. Entering mid-air destroys probability due to theta and poor R:R.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: VERCEL & GITHUB DEPLOYMENT INSTRUCTIONS                 */}
        {/* ============================================================== */}
        {activeTab === 'deploy' && (
          <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-[#0f1524] border border-slate-800 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <ExternalLink className="w-5 h-5 text-cyan-400" />
                <span>How to Deploy to Vercel via GitHub (Vite + React)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Follow these exact steps to host this professional terminal on your custom domain or vercel.app in under 3 minutes.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#141b2d] border border-slate-800 space-y-2">
                <div className="font-bold text-cyan-300">Step 1: Create a Vite Project locally</div>
                <div className="bg-[#0b0f19] p-2.5 rounded-lg font-mono text-slate-300 select-all">
                  npm create vite@latest nifty-ltp-terminal -- --template react<br/>
                  cd nifty-ltp-terminal<br/>
                  npm install lucide-react<br/>
                  npm install -D tailwindcss postcss autoprefixer<br/>
                  npx tailwindcss init -p
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#141b2d] border border-slate-800 space-y-2">
                <div className="font-bold text-cyan-300">Step 2: Paste this Code into src/App.jsx</div>
                <p className="text-slate-400">
                  Replace the entire contents of <code className="text-amber-300 font-mono">src/App.jsx</code> with this single file. Add Tailwind directives to <code className="text-amber-300 font-mono">src/index.css</code>:
                </p>
                <div className="bg-[#0b0f19] p-2 rounded-lg font-mono text-slate-300 select-all">
                  @tailwind base;<br/>
                  @tailwind components;<br/>
                  @tailwind utilities;
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#141b2d] border border-slate-800 space-y-2">
                <div className="font-bold text-cyan-300">Step 3: Push to GitHub & Connect to Vercel</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Create a new repository on <a href="https://github.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">GitHub</a>.</li>
                  <li>Run <code className="text-emerald-300 font-mono">git init && git add . && git commit -m "Init" && git push</code>.</li>
                  <li>Go to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">Vercel</a>, click <strong>Add New Project</strong> &rarr; Import your GitHub repo.</li>
                  <li>Click <strong>Deploy</strong>. Vercel will auto-detect Vite and build your live URL.</li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('calculator')}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-cyan-400 text-black hover:bg-cyan-300 transition-colors"
              >
                Back to Terminal &rarr;
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* MODAL: CORE TRADING RULES — READ ONLY, NO CHECKLIST             */}
      {/* ============================================================== */}
      {isRulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 rounded-2xl bg-[#0f1524] border border-slate-800 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 sticky top-0 bg-[#0f1524]">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Core Trading Rules</h3>
                  <p className="text-[11px] text-slate-400">Read before trading · No checkboxes</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsRulesOpen(false)} aria-label="Close trading rules" className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <div className="font-bold text-cyan-300 mb-1">01 · Trade the plan</div>
                <p className="text-slate-300 leading-relaxed">Entry se pehle setup, entry trigger, stop-loss aur exit plan clear hona chahiye. Sirf scenario label ya guess par trade mat lo.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <div className="font-bold text-cyan-300 mb-1">02 · Key levels par hi act karo</div>
                <p className="text-slate-300 leading-relaxed">EOS/EOR/diversion ya apne predefined level par price behaviour dekho. Mid-range mein FOMO entry avoid karo.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <div className="font-bold text-cyan-300 mb-1">03 · Confirmation ka wait</div>
                <p className="text-slate-300 leading-relaxed">Touch alone signal nahi hai. Rejection, breakout/retest ya apne tested trigger ki confirmation ke baad hi entry consider karo.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <div className="font-bold text-cyan-300 mb-1">04 · Risk pehle calculate karo</div>
                <p className="text-slate-300 leading-relaxed">Stop-loss entry se pehle set karo. Quantity aise rakho ki stop hit hone par loss tumhari predefined risk limit ke andar rahe; fixed rupee amount sabke liye sahi nahi hota.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <div className="font-bold text-emerald-300 mb-1">05 · Reward vs risk check</div>
                <p className="text-slate-300 leading-relaxed">Trade ka realistic target aur risk compare karo. Agar potential reward tumhare tested plan ke hisaab se worthwhile nahi, trade skip karo.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <div className="font-bold text-emerald-300 mb-1">06 · Loss ko aur bada mat karo</div>
                <p className="text-slate-300 leading-relaxed">Stop-loss ko door mat shift karo, losing position mein bina plan averaging mat karo, aur loss recover karne ke liye impulsive trade mat lo.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <div className="font-bold text-amber-300 mb-1">07 · SOC means wait</div>
                <p className="text-slate-300 leading-relaxed">Signals conflicting hon, level unclear ho, ya market bahut fast ho to no-trade bhi valid decision hai. Har move pakadna zaroori nahi.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <div className="font-bold text-amber-300 mb-1">08 · Daily loss limit rakho</div>
                <p className="text-slate-300 leading-relaxed">Daily max-loss limit pehle decide karo. Limit hit ho to trading band karo; revenge trading aur repeated re-entry se bacho.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <div className="font-bold text-violet-300 mb-1">09 · Options mein extra caution</div>
                <p className="text-slate-300 leading-relaxed">Option premium volatility, time decay, spread aur slippage se affect hota hai. Liquid contracts use karo aur order execution ka risk samajhkar trade karo.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <div className="font-bold text-violet-300 mb-1">10 · Journal and review</div>
                <p className="text-slate-300 leading-relaxed">Har trade ka reason, risk, exit aur rule-following record karo. Results ko kaafi trades ke sample par review karo; ek trade se strategy judge mat karo.</p>
              </div>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
              <p className="text-xs font-bold text-rose-300 mb-1">Non-negotiable</p>
              <p className="text-xs text-slate-300 leading-relaxed">Capital protection first. Guaranteed setup nahi hota. Ye educational discipline rules hain, profit guarantee ya personalized financial advice nahi.</p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setIsRulesOpen(false)} className="px-5 py-2 text-xs font-bold rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition-all">
                Close Rules
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}