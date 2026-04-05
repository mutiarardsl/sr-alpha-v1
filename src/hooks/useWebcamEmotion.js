/**
 * SR MVP — useWebcamEmotion Hook
 * Tim 6 Fase 2 | src/hooks/useWebcamEmotion.js
 *
 * Mengakses webcam, capture frame setiap N detik,
 * kirim ke Tim 1 Emotion API, update state emosi.
 *
 * Cara pakai:
 *   const { emosi, confidence, startCapture, stopCapture, permitted } = useWebcamEmotion(siswaId);
 */

import { useState, useRef, useCallback } from "react";
import { detectEmotion } from "../api/emotion";

const CAPTURE_INTERVAL_MS = 5000; // kirim frame setiap 5 detik
const USE_REAL_API = import.meta.env.VITE_EMOTION_API === "true";

// Dummy emosi siklus untuk Fase 2 (sebelum Tim 1 selesai)
const DUMMY_EMOTIONS = ["engagement", "boredom", "confusion", "frustration", "engagement"];
let dummyEmoIdx = 0;

export function useWebcamEmotion(siswaId) {
  const [permitted, setPermitted] = useState(false);
  const [emosi, setEmosi] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null); // <video> element untuk preview (opsional)
  const canvasRef = useRef(document.createElement("canvas"));

  // ── Request izin kamera ───────────────────────────────────────────
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPermitted(true);
      return true;
    } catch {
      setPermitted(false);
      return false;
    }
  }, []);

  // ── Capture satu frame → base64 JPEG ─────────────────────────────
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !permitted) return null;

    canvas.width = 224; // resize ke ukuran model Tim 1
    canvas.height = 224;
    canvas.getContext("2d").drawImage(video, 0, 0, 224, 224);
    return canvas.toDataURL("image/jpeg", 0.8).split(",")[1]; // base64 tanpa prefix
  }, [permitted]);

  // ── Start capture loop ────────────────────────────────────────────
  const startCapture = useCallback(async () => {
    if (isCapturing) return;
    if (!permitted) {
      const ok = await requestPermission();
      if (!ok) return;
    }
    setIsCapturing(true);

    intervalRef.current = setInterval(async () => {
      if (!USE_REAL_API) {
        // MODE DUMMY: siklus emosi
        const e = DUMMY_EMOTIONS[dummyEmoIdx % DUMMY_EMOTIONS.length];
        dummyEmoIdx++;
        setEmosi(e);
        setConfidence(0.7 + Math.random() * 0.25);
        return;
      }

      // MODE REAL: kirim ke Tim 1
      const frame = captureFrame();
      if (!frame) return;
      try {
        const res = await detectEmotion({ siswa_id: siswaId, frame_base64: frame });
        setEmosi(res.emosi);
        setConfidence(res.confidence);
      } catch {
        // Gagal deteksi → pertahankan emosi sebelumnya
      }
    }, CAPTURE_INTERVAL_MS);
  }, [isCapturing, permitted, captureFrame, requestPermission, siswaId]);

  // ── Stop capture & matikan kamera ─────────────────────────────────
  const stopCapture = useCallback(() => {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsCapturing(false);
  }, []);

  return {
    emosi, confidence, permitted, isCapturing,
    videoRef,            // pasang ke <video ref={videoRef}> untuk preview
    startCapture, stopCapture, requestPermission,
  };
}
