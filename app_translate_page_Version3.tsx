"use client";

import { useEffect, useRef, useState } from "react";
// @ts-ignore
import Tesseract from "tesseract.js";

export const metadata = { title: "Translate • PAIO TravelBiz" };

const TIER1 = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "mr", label: "Marathi" },
  { code: "te", label: "Telugu" },
  { code: "ta", label: "Tamil" },
  { code: "gu", label: "Gujarati" },
  { code: "ur", label: "Urdu" },
  { code: "kn", label: "Kannada" },
  { code: "or", label: "Odia" },
  { code: "ml", label: "Malayalam" }
];

export default function TranslatePage() {
  const [tab, setTab] = useState<"text" | "ocr" | "speech">("text");

  // Text translate
  const [sourceText, setSourceText] = useState("");
  const [targetLang, setTargetLang] = useState("en");
  const [translated, setTranslated] = useState("");
  const [busy, setBusy] = useState(false);

  const translate = async () => {
    setBusy(true);
    setTranslated("");
    try {
      const url = process.env.NEXT_PUBLIC_LIBRETRANSLATE_URL || "https://libretranslate.com";
      const res = await fetch(`${url}/translate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          q: sourceText,
          source: "auto",
          target: targetLang,
          format: "text"
        })
      });
      if (!res.ok) throw new Error("Translate failed");
      const data = await res.json();
      setTranslated(data?.translatedText ?? "");
    } catch (e: any) {
      setTranslated("Translate error: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  // OCR
  const [ocrText, setOcrText] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e: any) {
      alert("Camera error: " + e.message);
    }
  };

  const snap = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    ctx.drawImage(v, 0, 0);
    setImgUrl(c.toDataURL("image/png"));
  };

  const runOCR = async () => {
    if (!imgUrl) return alert("Capture or upload an image first.");
    setBusy(true);
    setOcrText("");
    try {
      // Try Hindi + English by default
      const rec = await Tesseract.recognize(imgUrl, "eng+hin");
      setOcrText(rec.data.text?.trim() || "");
    } catch (e: any) {
      setOcrText("OCR error: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  // Speech (Hindi/English)
  const [sttText, setSttText] = useState("");
  const [listening, setListening] = useState(false);
  let recognitionRef = useRef<any>(null);
  const startSTT = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = "hi-IN"; // start with Hindi; user can switch by changing lang
    recog.interimResults = true;
    recog.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join("\n");
      setSttText(t);
    };
    recog.onend = () => setListening(false);
    recognitionRef.current = recog;
    setListening(true);
    recog.start();
  };
  const stopSTT = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const speak = (text: string, lang = "hi-IN") => {
    if (!("speechSynthesis" in window)) {
      alert("Speech Synthesis not supported");
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    speechSynthesis.speak(u);
  };

  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <button onClick={() => setTab("text")} aria-pressed={tab === "text"}>Text</button>
        <button onClick={() => setTab("ocr")} aria-pressed={tab === "ocr"}>OCR</button>
        <button onClick={() => setTab("speech")} aria-pressed={tab === "speech"}>Speech</button>
      </div>

      {tab === "text" && (
        <div className="card">
          <h2 className="font-bold mb-2">Text Translation</h2>
          <textarea
            className="w-full h-32"
            placeholder="Enter text to translate"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />
          <div className="flex gap-2 items-center my-3">
            <label>Target Language</label>
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
              {TIER1.map(l => <option key={l.code} value={l.code}>{l.label} ({l.code})</option>)}
            </select>
            <button onClick={translate} disabled={busy}>{busy ? "Translating..." : "Translate"}</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-fgMuted">{translated}</pre>
        </div>
      )}

      {tab === "ocr" && (
        <div className="card grid gap-3">
          <h2 className="font-bold">OCR (Image → Text)</h2>
          <div className="flex gap-3 flex-wrap">
            <div>
              <video ref={videoRef} autoPlay playsInline className="w-80 h-60 bg-black rounded-lg" />
              <div className="mt-2 flex gap-2">
                <button onClick={startCamera}>Start Camera</button>
                <button onClick={snap}>Capture</button>
              </div>
            </div>
            <div>
              <input type="file" accept="image/*" onChange={(e) => {
                if (e.target.files?.[0]) {
                  const url = URL.createObjectURL(e.target.files[0]);
                  setImgUrl(url);
                }
              }} />
              {imgUrl && <img src={imgUrl} alt="preview" className="w-80 mt-2 rounded-lg" />}
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
          <button onClick={runOCR} disabled={busy}>{busy ? "Running OCR..." : "Run OCR"}</button>
          <pre className="whitespace-pre-wrap text-sm text-fgMuted">{ocrText}</pre>
        </div>
      )}

      {tab === "speech" && (
        <div className="card grid gap-3">
          <h2 className="font-bold">Speech (Hindi/English)</h2>
          <div className="flex gap-2">
            {!listening ? <button onClick={startSTT}>Start Listening (Hindi)</button> : <button onClick={stopSTT}>Stop</button>}
            <button onClick={() => speak(sttText, "hi-IN")}>Speak Hindi</button>
            <button onClick={() => speak(sttText, "en-IN")}>Speak English</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-fgMuted">{sttText || "Transcript will appear here..."}</pre>
        </div>
      )}
    </div>
  );
}