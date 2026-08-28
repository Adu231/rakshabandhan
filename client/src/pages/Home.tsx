// Midnight Screening design reminder: this page is a one-scene-at-a-time film stage. Keep controls scarce, copy paced, and motion camera-like rather than dashboard-like.
import { useCallback, useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import { ChevronRight, Maximize2, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { CONTENT } from "@/lib/content";

const SCENE_NAMES = [
  "पहिली फ्रेम",
  "सुरुवातीचं शीर्षक",
  "गोष्ट सुरू होते",
  "एक छोटीशी गोष्ट",
  "थोडंसं शांत",
  "पत्र",
  "हा धागा",
  "खरं नातं",
  "तुझ्यासाठी",
  "शेवटची पानं",
];

const BEAT_COUNTS = [
  CONTENT.opening.length,
  1,
  CONTENT.story.lines.length,
  CONTENT.personalStory.lines.length,
  CONTENT.silence.length,
  2,
  CONTENT.rakhiReveal.length,
  CONTENT.mainReveal.length,
  CONTENT.finalMessage.length,
  3,
];

function createAmbient() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  const context = new AudioContextClass();
  const master = context.createGain();
  master.gain.value = 0.035;
  master.connect(context.destination);
  const low = context.createOscillator();
  const high = context.createOscillator();
  low.type = "sine";
  high.type = "sine";
  low.frequency.value = 72;
  high.frequency.value = 144;
  low.connect(master);
  high.connect(master);
  low.start();
  high.start();
  return { context, master, low, high };
}

function playChime(audio: ReturnType<typeof createAmbient>) {
  if (!audio) return;
  const now = audio.context.currentTime;
  audio.master.gain.cancelScheduledValues(now);
  audio.master.gain.setValueAtTime(0.02, now);
  audio.master.gain.linearRampToValueAtTime(0.06, now + 0.06);
  audio.master.gain.exponentialRampToValueAtTime(0.02, now + 0.8);
}

function SceneMeta({ scene, beat }: { scene: number; beat: number }) {
  return (
    <div className="scene-meta" aria-label={`दृश्य ${scene + 1} पैकी ${SCENE_NAMES.length}`}>
      <span className="scene-index">{String(scene + 1).padStart(2, "0")} / {String(SCENE_NAMES.length).padStart(2, "0")}</span>
      <span className="meta-rule" />
      <span className="scene-name">{SCENE_NAMES[scene]}</span>
      <span className="beat-count">{String(beat + 1).padStart(2, "0")} / {String(BEAT_COUNTS[scene]).padStart(2, "0")}</span>
    </div>
  );
}

function ContinueCue({ label = "पुढे चला" }: { label?: string }) {
  return (
    <div className="continue-cue" aria-hidden="true">
      <span>{label}</span>
      <ChevronRight size={14} strokeWidth={1.5} />
    </div>
  );
}

function Letter({ opened, onOpenFullscreen }: { opened: boolean; onOpenFullscreen: () => void }) {
  return (
    <div className={`letter-object ${opened ? "is-open" : ""}`}>
      <div className="envelope-shadow" />
      <div className="envelope">
        <div className="envelope-back" />
        <div className="letter-paper custom-letter-paper" onClick={(e) => { e.stopPropagation(); onOpenFullscreen(); }}>
          <div className="letter-image-wrap">
            <button className="expand-letter-btn" type="button" onClick={(e) => { e.stopPropagation(); onOpenFullscreen(); }}>
              <Maximize2 size={13} />
              <span>मोठे करून पहा</span>
            </button>
            <img src="/manus-storage/tai-letter-final.png?v=1000" alt="ताई पत्र" className="letter-image-content" />
          </div>
        </div>
        <div className="envelope-front" />
        <div className="envelope-flap" />
        <div className="wax-seal">✦</div>
      </div>
    </div>
  );
}

function RakhiArtwork() {
  return (
    <div className="rakhi-artwork">
      <div className="rakhi-orbit rakhi-orbit-one" />
      <div className="rakhi-orbit rakhi-orbit-two" />
      <img src="/manus-storage/rakhi-centerpiece_03700bfb.jpg" alt="उबदार प्रकाशात तरंगणारी सुंदर राखी" />
    </div>
  );
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [scene, setScene] = useState(0);
  const [beat, setBeat] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [sceneKey, setSceneKey] = useState(0);
  const [fullscreenLetter, setFullscreenLetter] = useState(false);
  const touchStart = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startStory = useCallback(() => {
    setStarted(true);
    setScene(0);
    setBeat(0);
    setSoundOn(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => {});
    }
  }, []);

  const advance = useCallback(() => {
    if (!started) return;
    if (scene === SCENE_NAMES.length - 1 && beat === BEAT_COUNTS[scene] - 1) return;
    if (beat < BEAT_COUNTS[scene] - 1) {
      setBeat((current) => current + 1);
    } else {
      setScene((current) => Math.min(current + 1, SCENE_NAMES.length - 1));
      setBeat(0);
      setSceneKey((current) => current + 1);
    }
  }, [beat, scene, started]);

  const restart = useCallback(() => {
    setScene(0);
    setBeat(0);
    setSceneKey((current) => current + 1);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && fullscreenLetter) {
        setFullscreenLetter(false);
        return;
      }
      if ([" ", "ArrowRight", "Enter"].includes(event.key)) {
        if (fullscreenLetter) return;
        event.preventDefault();
        if (!started) startStory();
        else advance();
      }
      if (event.key === "r" && started) restart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance, fullscreenLetter, restart, startStory, started]);

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    setMouse({ x, y });
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStart.current = event.touches[0]?.clientX ?? 0;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (fullscreenLetter) return;
    const end = event.changedTouches[0]?.clientX ?? 0;
    if (!started) {
      startStory();
    } else if (Math.abs(end - touchStart.current) > 44) {
      advance();
    }
  };

  const onStageClick = (event: MouseEvent<HTMLDivElement>) => {
    if (fullscreenLetter) return;
    const target = event.target as HTMLElement;
    if (target.closest(".sound-control, .expand-letter-btn, .letter-modal-close, .letter-modal-content")) return;
    if (!started) {
      startStory();
    } else if (!target.closest("button, a")) {
      advance();
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (audioRef.current) {
      if (next) {
        void audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  };

  const isQuiet = scene === 4;
  const sceneClass = `scene-${scene} ${isQuiet ? "is-quiet" : ""}`;

  return (
    <main
      className={`cinema-app ${started ? "is-started" : "is-gate"} ${sceneClass}`}
      style={{ "--mouse-x": `${mouse.x * 14}px`, "--mouse-y": `${mouse.y * 10}px` } as React.CSSProperties}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onStageClick}
    >
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop-image" />
        <div className="light-pool" />
        <div className="light-leak" />
      </div>
      <div className="film-grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="letterbox letterbox-top" aria-hidden="true" />
      <div className="letterbox letterbox-bottom" aria-hidden="true" />

      {!started ? (
        <section className="gate-screen" aria-label="गोष्ट सुरू करा">
          <div className="gate-mark-wrap">
            <img className="brand-mark" src="/manus-storage/rakhi-mark_6715f71d.png" alt="" />
            <span className="gate-mark-caption">आपली गोष्ट</span>
          </div>
          <div className="gate-copy">
            <p className="micro-label">रक्षाबंधनाची एक छोटी सिनेमासारखी गोष्ट</p>
            <h1>ज्याने मला<br /><em>आपलंसं केलं.</em></h1>
            <p className="gate-subtitle">एका एका फ्रेममधून सांगितलेली एक छोटी गोष्ट.</p>
          </div>
          <button className="enter-button" type="button" onClick={startStory}>
            <span>गोष्ट सुरू करा</span>
            <span className="enter-dot" />
          </button>
          <p className="gate-note">कुठेही क्लिक करा किंवा बटण दाबा</p>
        </section>
      ) : (
        <>
          <header className="film-header">
            <div className="header-brand">
              <img src="/manus-storage/rakhi-mark_6715f71d.png" alt="" />
              <span>आपली<br />गोष्ट</span>
            </div>
            <button className="sound-control" type="button" onClick={toggleSound} aria-label={soundOn ? "आवाज बंद करा" : "आवाज सुरू करा"}>
              {soundOn ? <Volume2 size={15} strokeWidth={1.5} /> : <VolumeX size={15} strokeWidth={1.5} />}
              <span>{soundOn ? "आवाज सुरू" : "आवाज बंद"}</span>
            </button>
          </header>
          <SceneMeta scene={scene} beat={beat} />

          <section key={sceneKey} className="scene-stage" aria-live="polite">
            {scene === 0 && (
              <div className="scene-copy opening-scene">
                <p className="micro-label">{beat === 0 ? "पहिली फ्रेम येण्याआधी" : "सुरुवात करण्याआधी एक गोष्ट"}</p>
                <h2 className="display-statement">{CONTENT.opening[beat]}</h2>
                <div className="aperture-line" />
              </div>
            )}

            {scene === 1 && (
              <div className="scene-copy title-scene">
                <p className="episode-label">Episode 01</p>
                <h2 className="title-lockup">{CONTENT.title}</h2>
                <p className="title-subtitle">{CONTENT.subtitle}</p>
                <div className="title-footer"><span>Written somewhere between friendship &amp; family</span><span>01 — {String(SCENE_NAMES.length).padStart(2, "0")}</span></div>
              </div>
            )}

            {scene === 2 && (
              <div className="scene-copy story-scene">
                <p className="micro-label">गोष्ट सुरू होते</p>
                <h2 className="display-statement">{CONTENT.story.lines[beat]}</h2>
                <p className="aside-note">{beat === 0 ? "हे सगळं हळूच घडतं." : "यासाठी कोणतीही घोषणा लागत नाही."}</p>
              </div>
            )}

            {scene === 3 && (
              <div className="scene-copy personal-scene">
                <p className="micro-label">{CONTENT.personalStory.eyebrow}</p>
                <h2 className="personal-line">{CONTENT.personalStory.lines[beat]}</h2>
                <div className="personal-count">0{beat + 1} <span>/</span> 0{CONTENT.personalStory.lines.length}</div>
              </div>
            )}

            {scene === 4 && (
              <div className="scene-copy silence-scene">
                <span className="silence-pulse" />
                <h2 className="display-statement">{CONTENT.silence[beat]}</h2>
                <p className="micro-label">{beat === 2 ? "...and maybe that is enough." : ""}</p>
              </div>
            )}

            {scene === 5 && (
              <div className="letter-scene">
                {!beat ? (
                  <div className="letter-intro">
                    <p className="micro-label">मनापासून लिहिलेलं पत्र</p>
                    <h2 className="display-statement">{CONTENT.letter.intro}</h2>
                  </div>
                ) : (
                  <div className="poem-card-stage">
                    <div className="poem-card-frame" onClick={(e) => { e.stopPropagation(); setFullscreenLetter(true); }}>
                      <button className="expand-letter-btn" type="button" onClick={(e) => { e.stopPropagation(); setFullscreenLetter(true); }}>
                        <Maximize2 size={13} />
                        <span>मोठे करून पहा</span>
                      </button>
                      <img src="/poem.jpeg?v=9999" alt="ताई पत्र" className="poem-card-image" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {scene === 6 && (
              <div className="rakhi-scene"><RakhiArtwork /><div className="rakhi-copy"><p className="micro-label">हा धागा</p><h2 className="display-statement">{CONTENT.rakhiReveal[beat]}</h2></div></div>
            )}

            {scene === 7 && (
              <div className={`reveal-scene reveal-beat-${beat}`}>
                <span className="reveal-glow" />
                <p className="reveal-line">{CONTENT.mainReveal[beat]}</p>
                {beat === 3 && <img className="reveal-mark" src="/manus-storage/rakhi-mark_6715f71d.png" alt="" />}
              </div>
            )}

            {scene === 8 && (
              <div className="final-message-scene">
                <p className="micro-label">तुझ्यासाठी</p>
                <p className={`final-message-line final-message-${beat}`}>{CONTENT.finalMessage[beat]}</p>
                <div className="final-message-rule" />
              </div>
            )}

            {scene === 9 && (
              <div className="credits-scene">
                {beat === 0 && <h2 className="end-title">समाप्त</h2>}
                {beat === 1 && <h2 className="end-title end-title-soft">तुला वाटल असेल <br /><em>मी किती Boring आहे<br /> पण मी असाच आहे</em></h2>}
                {beat === 2 && <div className="credits-roll">{CONTENT.credits.map((line) => <p key={line}>{line}</p>)}<div className="credits-divider" /><h3>{CONTENT.closing.greeting}</h3><p>{CONTENT.closing.subline}</p></div>}
              </div>
            )}
          </section>

          <div className="bottom-controls">
            {scene === SCENE_NAMES.length - 1 && beat === BEAT_COUNTS[scene] - 1 ? (
              <button className="restart-button" type="button" onClick={restart}><RotateCcw size={14} /> गोष्ट पुन्हा सुरू करा</button>
            ) : (
              <button className="continue-button" type="button" onClick={advance}>
                <ContinueCue label={scene === 5 && beat === 0 ? "पत्र उघड" : scene === 9 ? "आगे पहा" : "पुढे चला"} />
              </button>
            )}
            <span className="interaction-hint">कुठेही टॅप कर</span>
          </div>
        </>
      )}

      {fullscreenLetter && (
        <div
          className="letter-modal-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setFullscreenLetter(false);
          }}
        >
          <div className="letter-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="letter-modal-close"
              type="button"
              onClick={() => setFullscreenLetter(false)}
              aria-label="बंद करा"
            >
              <X size={18} />
              <span>बंद करा</span>
            </button>
            <div className="letter-modal-image-container">
              <img src="/poem.jpeg?v=9999" alt="ताई पत्र" className="letter-modal-image" />
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} loop preload="auto">
        <source src="/background-music.mp3" type="audio/mpeg" />
        <source src="/background-music.webm" type="audio/webm" />
      </audio>
    </main>
  );
}
