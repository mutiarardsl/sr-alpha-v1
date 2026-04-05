/**
 * SR MVP — useWebSocket Hook
 * Tim 6 Fase 2 | src/hooks/useWebSocket.js
 *
 * Real-time connection untuk teacher live monitoring (Portal Guru).
 *
 * MODE:
 *   "dummy" → simulasi push event via setInterval (Fase 2, default)
 *   "ws"    → WebSocket nyata ke backend (aktifkan VITE_USE_WS=true)
 *
 * Server event format:
 *   { type, siswa: { id, nama, avatar }, payload, timestamp }
 *
 * Event types:
 *   student_active    → siswa mulai sesi belajar
 *   student_emotion   → update deteksi emosi (Tim 1)
 *   student_progress  → update progress materi
 *   student_quiz      → siswa submit quiz
 *   student_inactive  → siswa meninggalkan sesi
 *
 * Usage:
 *   const { connected, wsStatus, events, liveStudents, activeCount } =
 *     useWebSocket({ kelasId: 'k1', guruId: 'g1' });
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const USE_WS = import.meta.env.VITE_USE_WS === 'true';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

// ── Dummy data & constants ──────────────────────────────────────────
const DUMMY_STUDENTS = [
  { id: 's2', nama: 'Dewi Rahayu', avatar: 'DR' },
  { id: 's4', nama: 'Siti Nurhaliza', avatar: 'SN' },
  { id: 's5', nama: 'Bagas Firmansyah', avatar: 'BF' },
  { id: 's6', nama: 'Lina Kartika', avatar: 'LK' },
];
const EMOTIONS = ['boredom', 'confusion', 'frustration', 'engagement'];
const TOPICS = ['Persamaan Linear', 'Statistika', 'Fungsi Kuadrat', 'Ekosistem', 'Teks Argumentasi'];

const now = () =>
  new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const randomEvent = () => {
  const siswa = DUMMY_STUDENTS[Math.floor(Math.random() * DUMMY_STUDENTS.length)];
  const types = ['student_emotion', 'student_progress', 'student_active', 'student_quiz'];
  const type = types[Math.floor(Math.random() * types.length)];
  const payloads = {
    student_emotion: { emosi: EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)], confidence: +(0.70 + Math.random() * 0.28).toFixed(2) },
    student_progress: { topik: TOPICS[Math.floor(Math.random() * TOPICS.length)], progress: Math.floor(30 + Math.random() * 60) },
    student_active: { topik: TOPICS[Math.floor(Math.random() * TOPICS.length)] },
    student_quiz: { topik: TOPICS[Math.floor(Math.random() * TOPICS.length)], score: Math.floor(40 + Math.random() * 60) },
  };
  return { type, siswa, payload: payloads[type], timestamp: now() };
};

// ── Hook ───────────────────────────────────────────────────────────
export function useWebSocket({ kelasId, guruId, enabled = true }) {
  const [connected, setConnected] = useState(false);
  const [wsStatus, setWsStatus] = useState('idle');
  const [events, setEvents] = useState([]);
  const [liveStudents, setLiveStudents] = useState({});

  const wsRef = useRef(null);
  const retryRef = useRef(null);
  const intervalRef = useRef(null);

  // ── Shared: push one event & update liveStudents ───────────────
  const pushEvent = useCallback((event) => {
    setEvents(prev => [event, ...prev].slice(0, 60));
    setLiveStudents(prev => {
      const cur = prev[event.siswa.id] || { ...event.siswa };
      const upd = { ...cur, lastSeen: event.timestamp };
      if (event.type === 'student_emotion') upd.emosi = event.payload.emosi;
      if (event.type === 'student_progress') { upd.topik = event.payload.topik; upd.progress = event.payload.progress; upd.aktif = true; }
      if (event.type === 'student_active') { upd.aktif = true; upd.topik = event.payload.topik; }
      if (event.type === 'student_inactive') upd.aktif = false;
      if (event.type === 'student_quiz') upd.lastQuiz = event.payload.score;
      return { ...prev, [event.siswa.id]: upd };
    });
  }, []);

  // ── DUMMY MODE ─────────────────────────────────────────────────
  const startDummy = useCallback(() => {
    setWsStatus('connected');
    setConnected(true);
    // Seed initial live student states
    DUMMY_STUDENTS.forEach(s => {
      setLiveStudents(prev => ({
        ...prev,
        [s.id]: {
          ...s,
          emosi: 'netral',
          progress: Math.floor(10 + Math.random() * 50),
          aktif: Math.random() > 0.35,
          topik: TOPICS[Math.floor(Math.random() * TOPICS.length)],
          lastSeen: '--',
          lastQuiz: null,
        },
      }));
    });
    // Variadic interval yang lebih realistis
    const schedule = () => {
      const delay = 4500 + Math.random() * 5000;
      intervalRef.current = setTimeout(() => {
        pushEvent(randomEvent());
        schedule();
      }, delay);
    };
    schedule();
  }, [pushEvent]);

  // ── REAL WS MODE ───────────────────────────────────────────────
  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const token = localStorage.getItem('sr_access_token');
    const url = `${WS_URL}/monitoring?kelas_id=${kelasId}&guru_id=${guruId}&token=${token || ''}`;
    setWsStatus('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setWsStatus('connected');
      clearTimeout(retryRef.current);
    };
    ws.onmessage = (e) => {
      try { pushEvent(JSON.parse(e.data)); } catch { /* ignore malformed */ }
    };
    ws.onerror = () => setWsStatus('error');
    ws.onclose = () => {
      setConnected(false);
      setWsStatus('disconnected');
      retryRef.current = setTimeout(connectWS, 5000); // auto-reconnect
    };
  }, [kelasId, guruId, pushEvent]);

  // ── Lifecycle ─────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    if (USE_WS) {
      connectWS();
    } else {
      setWsStatus('connecting');
      const t = setTimeout(startDummy, 900); // simulate brief connect time
      return () => clearTimeout(t);
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
      clearTimeout(intervalRef.current);
      clearTimeout(retryRef.current);
    };
  }, [enabled, connectWS, startDummy]);

  const clearEvents = useCallback(() => setEvents([]), []);
  const disconnect = useCallback(() => {
    clearTimeout(intervalRef.current);
    clearTimeout(retryRef.current);
    wsRef.current?.close();
    setConnected(false);
    setWsStatus('disconnected');
  }, []);

  // ── Computed helpers ───────────────────────────────────────────
  const students = Object.values(liveStudents);
  const activeCount = students.filter(s => s.aktif).length;
  const emotionSummary = students.reduce((acc, s) => {
    if (s.emosi) acc[s.emosi] = (acc[s.emosi] || 0) + 1;
    return acc;
  }, {});

  return {
    connected,
    wsStatus,      // 'idle'|'connecting'|'connected'|'disconnected'|'error'
    events,        // [{ type, siswa, payload, timestamp }]  newest first
    liveStudents,  // { [siswaId]: LiveStudent }
    clearEvents,
    disconnect,
    activeCount,
    emotionSummary,
    isDummy: !USE_WS,
  };
}
