/**
 * SR MVP — Student Store (Zustand)
 * Tim 6 Fase 2 | src/stores/studentStore.js
 *
 * State belajar siswa: progress, chat messages, quiz, konten.
 * Digunakan oleh semua halaman di StudentView.
 * TODO Fase 3: hydrate dari API saat mount.
 */

import { create } from 'zustand';
import { PROGRESS_DATA_INIT } from '../data/masterData';

const makeKey = (mapelId, sub) => `${mapelId}__${sub}`;

export const useStudentStore = create((set, get) => ({
  // ── Progress belajar ──────────────────────────────────────────────
  progressData:  { ...PROGRESS_DATA_INIT },

  markTopicComplete: (materi, score) => set(state => {
    const key = makeKey(materi.mapelId, materi.subMateri);
    const bs = state.progressData.belumSelesai.filter(
      m => makeKey(m.mapelId, m.subMateri) !== key
    );
    const ss = state.progressData.sudahSelesai.filter(
      m => makeKey(m.mapelId, m.subMateri) !== key
    );
    const existing = [
      ...state.progressData.belumSelesai,
      ...state.progressData.sudahSelesai,
    ].find(m => makeKey(m.mapelId, m.subMateri) === key);

    return {
      progressData: {
        belumSelesai: bs,
        sudahSelesai: [
          ...ss,
          { ...(existing ?? materi), progress: 100, quizDone: true, quizScore: score, lastChat: 'Baru saja' },
        ],
      },
    };
  }),

  // ── Chat messages per materi ──────────────────────────────────────
  msgsByKey: {},

  setMessages: (key, msgs) => set(state => ({
    msgsByKey: { ...state.msgsByKey, [key]: msgs },
  })),

  appendMessage: (key, msg) => set(state => ({
    msgsByKey: {
      ...state.msgsByKey,
      [key]: [...(state.msgsByKey[key] ?? []), msg],
    },
  })),

  // ── Konten (mindmap, flashcard, catatan) ──────────────────────────
  confContent: {},

  setConfItem: (materiKey, type, data) => set(state => ({
    confContent: {
      ...state.confContent,
      [materiKey]: { ...(state.confContent[materiKey] ?? {}), [type]: data },
    },
  })),

  // ── Active materi ─────────────────────────────────────────────────
  chatMateri: null,
  setChatMateri: (m) => set({ chatMateri: m }),
}));
