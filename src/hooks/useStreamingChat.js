/**
 * SR MVP — useStreamingChat Hook
 * Tim 6 Fase 2 | src/hooks/useStreamingChat.js
 *
 * Mengelola state dan lifecycle chat mentor dengan dukungan streaming.
 *
 * MODE:
 *   "dummy"   → simulasi setTimeout (Fase 2, default sekarang)
 *   "stream"  → SSE real ke Tim 5 (aktifkan saat VITE_MENTOR_STREAM=true)
 *   "rest"    → REST non-streaming fallback
 *
 * Cara pakai:
 *   const { messages, typing, send, reset } = useStreamingChat({ siswaId, materi });
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { openStream } from "../api/client";
import { sendMessage } from "../api/mentor";

const USE_STREAM = import.meta.env.VITE_MENTOR_STREAM === "true";

// ── Dummy responses untuk Fase 2 ──────────────────────────────────────
const DUMMY_RESPONSES = [
  (sub) => `Halo Budi! Kita lanjut belajar **${sub}** ya. 😊\n\nAda yang mau kamu tanyakan dulu?`,
  () => `Pertanyaan yang bagus! Mari kita bahas step by step.\n\n① Pahami konsep dasarnya dulu\n② Coba contoh sederhana\n③ Latihan soal\n\nMau mulai dari mana?`,
  () => `Hampir benar! Yang perlu diperbaiki:\n\n- Perhatikan tanda negatif di langkah ke-2\n- Coba hitung ulang dari situ\n\nKamu pasti bisa! 💪`,
  () => `Keren sekali! Jawabanmu sudah benar. ✅\n\nSekarang coba tantangan yang sedikit lebih sulit ya?`,
];

let dummyIdx = 0;

export function useStreamingChat({ siswaId, materi, initialMessages = [], emosiContext }) {
  const [messages, setMessages] = useState(initialMessages);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef(null);

  // Bersihkan stream saat komponen unmount
  useEffect(() => () => cancelRef.current?.(), []);

  const appendAI = useCallback((text, done = true) => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.role === "ai" && !last.done) {
        // Append chunk ke pesan terakhir yang belum selesai
        return [...prev.slice(0, -1), { ...last, text: last.text + text, done }];
      }
      return [...prev, { id: Date.now(), role: "ai", text, done, time: now(), team: "Tim 5" }];
    });
  }, []);

  const send = useCallback(async (userText, attachments = []) => {
    if (!userText.trim() && !attachments.length) return;
    setError(null);

    const userMsg = {
      id: Date.now(), role: "user",
      text: userText, attachments: attachments.length ? attachments : undefined,
      time: now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // ── MODE: dummy ─────────────────────────────────────────────────
    if (!USE_STREAM) {
      const delay = 1200 + Math.random() * 800;
      await sleep(delay);
      const fn = DUMMY_RESPONSES[dummyIdx % DUMMY_RESPONSES.length];
      dummyIdx++;
      appendAI(fn(materi?.subMateri ?? "materi ini"));
      setTyping(false);
      return;
    }

    // ── MODE: SSE stream ─────────────────────────────────────────────
    // Placeholder AI message untuk diisi token per token
    setMessages(prev => [...prev, { id: Date.now() + 1, role: "ai", text: "", done: false, time: now(), team: "Tim 5" }]);
    setTyping(false); // typing indicator digantikan pesan streaming

    const body = {
      siswa_id: siswaId,
      mapel_id: materi?.mapelId,
      sub_materi: materi?.subMateri,
      message: userText,
      context: {
        emosi: emosiContext ?? null,
        progress: null, // diisi dari StudentContext Fase 3
        rekomendasi_guru: null,
      },
    };

    cancelRef.current = openStream(
      "/mentor/chat/stream",
      body,
      (chunk) => appendAI(chunk, false),   // onChunk
      () => {                          // onDone
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return last?.role === "ai" ? [...prev.slice(0, -1), { ...last, done: true }] : prev;
        });
      },
      (err) => {                          // onError
        setError("Koneksi ke mentor terputus. Coba lagi.");
        console.error("[useStreamingChat]", err);
        // Fallback ke REST
        sendMessage(body)
          .then(res => appendAI(res.reply))
          .catch(() => appendAI("Maaf, mentor sedang tidak bisa dihubungi. Coba beberapa saat lagi."));
      }
    );
  }, [siswaId, materi, emosiContext, appendAI]);

  const reset = useCallback(() => {
    cancelRef.current?.();
    setMessages(initialMessages);
    setTyping(false);
    setError(null);
    dummyIdx = 0;
  }, [initialMessages]);

  return { messages, typing, error, send, reset };
}

// ── Utils ─────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const now = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
