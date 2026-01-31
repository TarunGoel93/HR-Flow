"use client";

import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import Modal from "./Modal";
import QuestionNav from "./QuestionNAv";
import QuestionPanel from "./QuestionPanel";
import Banner from "./Banner";

function formatTime(sec: number): string {
  const s = Math.max(0, sec);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

const TestShell = forwardRef(function TestShell({ token, onAttemptIdReceived }: { token: string; onAttemptIdReceived?: (id: string) => void }, ref) {
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState("");

  const [attemptId, setAttemptId] = useState("");
  const [test, setTest] = useState<any>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  // answersMap: questionId -> optionIndex
  const [answersMap, setAnswersMap] = useState<Map<string, number>>(() => new Map());

  const [secondsLeft, setSecondsLeft] = useState(0);

  const [status, setStatus] = useState("idle"); // idle|active|locked|submitted
  const [violationsCount, setViolationsCount] = useState(0);
  const [lockReason, setLockReason] = useState("");

  // modals
  const [warnOpen, setWarnOpen] = useState(false);
  const [warnText, setWarnText] = useState("");

  const [submitOpen, setSubmitOpen] = useState(false);

  const autosaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef(status);

  // Keep statusRef in sync with status state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Expose updateStatus method to parent via ref
  useImperativeHandle(ref, () => ({
    updateStatus: (newStatus: string, count: number, violationType?: string) => {
      setStatus(newStatus);
      setViolationsCount(count);
      if (newStatus === "locked" && violationType) {
        const reasons: { [key: string]: string } = {
          "CAMERA": "📷 Camera violation detected - you were looking away from the screen",
          "FULLSCREEN_EXIT": "⚠️ You exited fullscreen mode",
          "TAB_HIDDEN": "⚠️ You switched tabs during the test",
          "BLUR": "⚠️ You switched away from the test window",
          "LOOKING_AWAY": "📷 You were looking away from the screen"
        };
        setLockReason(reasons[violationType] || `Test locked due to ${violationType}`);
      }
    }
  }));

  const questions = useMemo(() => test?.questions || [], [test]);
  const currentQ = questions[currentIndex];

  // ---- Start exam: fullscreen + create session
  async function startTest() {
    try {
      // Try to request fullscreen (optional - may fail in some browsers)
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (fsError) {
        console.warn("Fullscreen not available:", fsError);
      }

      setLoading(true);
      const res = await axios.get(`/api/public/session`, {
        params: { token },
      });

      if (!res.data || !res.data.test) {
        throw new Error("Invalid response data from server");
      }

      setAttemptId(res.data.attemptId);
      onAttemptIdReceived?.(res.data.attemptId);
      setTest(res.data.test);

      setSecondsLeft(res.data.test.durationSeconds || 0);
      setStatus("active");
      setLoading(false);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to start test session";
      setFatalError(msg);
      setLoading(false);
    }
  }

  // ---- autosave
  async function saveAnswers() {
    if (!attemptId || status !== "active") return;

    const answers = Array.from(answersMap.entries()).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    try {
      await axios.post(`/api/public/session/${attemptId}/save`, {
        answers,
      });
    } catch {
      // silent autosave fail
    }
  }

  // ---- submit
  async function submitAttempt() {
    if (!attemptId) return;

    try {
      await axios.post(`/api/public/session/${attemptId}/submit`);
      setStatus("submitted");
      setSubmitOpen(false);

      // exit fullscreen automatically on submit (optional)
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
      }
    } catch (e: any) {
      alert(e?.response?.data?.error || e?.response?.data?.message || "Submit failed");
    }
  }

  // ---- violation
  async function reportViolation(type: string) {
    if (!attemptId || statusRef.current !== "active") return;

    try {
      const res = await axios.post(
        `/api/public/session/${attemptId}/violation`,
        { type }
      );

      setViolationsCount(res.data.violationsCount);

      if (res.data.status === "locked") {
        // Set lock reason based on violation type
        const reasons: { [key: string]: string } = {
          "CAMERA": "📷 Camera violation detected - you were looking away from the screen",
          "FULLSCREEN_EXIT": "⚠️ You exited fullscreen mode",
          "TAB_HIDDEN": "⚠️ You switched tabs during the test",
          "BLUR": "⚠️ You switched away from the test window",
          "LOOKING_AWAY": "📷 You were looking away from the screen"
        };
        setLockReason(reasons[type] || `Test locked due to ${type}`);
        setStatus("locked");
        // No warning modal - just lock silently
      }
    } catch {
      // ignore
    }
  }

  // ---- start timers when active
  useEffect(() => {
    if (status !== "active") return;

    // countdown
    tickTimer.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // time over -> auto submit
          if (tickTimer.current) clearInterval(tickTimer.current);
          setSubmitOpen(false);
          submitAttempt();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // autosave every 10 seconds
    autosaveTimer.current = setInterval(() => {
      saveAnswers();
    }, 10000);

    return () => {
      if (tickTimer.current) clearInterval(tickTimer.current);
      if (autosaveTimer.current) clearInterval(autosaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, attemptId, answersMap]);

  // ---- proctoring-lite events (tab switch / blur / fullscreen exit)
  useEffect(() => {
    if (status !== "active") return;

    let fsTimeout: NodeJS.Timeout | null = null;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") reportViolation("TAB_HIDDEN");
    };

    const onBlur = () => {
      reportViolation("BLUR");
    };

    const onFsChange = () => {
      if (fsTimeout) clearTimeout(fsTimeout);

      fsTimeout = setTimeout(() => {
        const isFullscreen = Boolean(document.fullscreenElement);

        if (!isFullscreen && statusRef.current === "active") {
          console.log("🚨 Fullscreen exited — locking test");
          // Record violation server-side
          reportViolation("FULLSCREEN_EXIT");
          // Immediately lock locally and show reason
          setLockReason("⚠️ You exited fullscreen mode");
          setStatus("locked");
        }
      }, 150);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFsChange);

    return () => {
      if (fsTimeout) clearTimeout(fsTimeout);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, attemptId]);

  // ---- selecting answer
  function setAnswerForCurrent(optionIndex: number) {
    if (!currentQ || status !== "active") return;

    setAnswersMap((prev) => {
      const next = new Map(prev);
      next.set(currentQ._id, optionIndex);
      return next;
    });
  }

  // ---- UI states
  if (fatalError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-200 p-6">
        <div className="mx-auto max-w-xl">
          <Banner variant="error" title="Cannot open test" message={fatalError} />
        </div>
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-200 p-6">
        <div className="mx-auto max-w-xl">
          <Banner variant="success" title="Your response has been submitted" message="Thank you for completing the test. You may now close this window." />
        </div>
      </div>
    );
  }

  if (loading && status === "idle") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-200 p-6">
        <div className="mx-auto max-w-xl space-y-4">
          <Banner variant="info" title="Ready to start?" message="This test may request fullscreen. Please avoid switching tabs." />
          <button className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black" onClick={startTest}>
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (!test) return null;

  const disabled = status !== "active";

  return (
    <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-200">
      <QuestionPanel
        questions={questions}
        currentIndex={currentIndex}
        answersMap={answersMap}
        onJump={setCurrentIndex}
      />

      <div style={styles.main as React.CSSProperties}>
        <div className="bg-white/90 backdrop-blur border-b border-zinc-200 px-4 py-3 flex items-center justify-between" style={{ minHeight: 70 }}>
          <div>
            <div style={{ fontWeight: 800 }}>{test.title}</div>
            <div className="mt-1 flex items-center gap-3">
              {/* Modern violations counter */}
              {(() => {
                const max = Math.max(1, Number(test.maxViolations) || 1);
                const count = Math.max(0, violationsCount);
                const pct = Math.min(100, Math.round((count / max) * 100));
                const level = status === "locked" ? "rose" : pct <= 33 ? "emerald" : pct <= 66 ? "amber" : "rose";
                const bg = `bg-${level}-50`;
                const text = `text-${level}-900`;
                const border = `border-${level}-200`;
                const fill = `bg-${level}-400`;
                return (
                  <div className={`inline-flex items-center gap-2 rounded-xl border ${border} ${bg} ${text} px-3 py-1 text-xs font-medium shadow-sm`}> 
                    <span className={`h-2 w-2 rounded-full ${fill}`}></span>
                    <span>Violations {count}/{max}</span>
                    {status === "locked" ? (
                      <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-rose-700">LOCKED</span>
                    ) : null}
                    <span className="ml-2 inline-block h-2 w-24 rounded-full bg-white/60">
                      <span className={`block h-2 rounded-full ${fill}`} style={{ width: `${pct}%` }}></span>
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="min-w-[86px] rounded-2xl border-2 border-zinc-900 px-3 py-2 text-center text-[18px] font-black">{formatTime(secondsLeft)}</div>
            <button
              className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
              onClick={() => setSubmitOpen(true)}
              disabled={status === "submitted"}
            >
              Submit
            </button>
          </div>
        </div>

        {status === "locked" && lockReason ? (
          <div className="px-4 py-3">
            <Banner variant="locked" title="Attempt Locked" message={lockReason} />
          </div>
        ) : null}

        <QuestionNav
          question={currentQ}
          selectedAnswer={answersMap.get(currentQ?._id)}
          onSelect={setAnswerForCurrent}
          disabled={disabled}
        />

        <div style={styles.bottombar}>
          <button
            style={styles.secondaryBtn}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            Prev
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={currentIndex === questions.length - 1}
          >
            Next
          </button>
        </div>
      </div>

      {/* Warning modal */}
      <Modal
        open={warnOpen}
        title={status === "locked" ? "Attempt Locked" : "Warning"}
        primaryText={status === "locked" ? "OK" : "Continue"}
        onPrimary={() => setWarnOpen(false)}
      >
        <p style={{ marginTop: 0 }}>{warnText}</p>
        {status === "locked" ? (
          <p style={{ marginBottom: 0 }}>
            You can still submit, but you cannot change answers anymore.
          </p>
        ) : null}
      </Modal>

      {/* Submit confirm modal */}
      <Modal
        open={submitOpen}
        title="Submit test?"
        primaryText="Submit Now"
        secondaryText="Cancel"
        onPrimary={submitAttempt}
        onSecondary={() => setSubmitOpen(false)}
      >
        <p style={{ marginTop: 0 }}>
          Once submitted, you can exit normally. Your answers will be finalized.
        </p>
      </Modal>
    </div>
  );
});

const styles: { [key: string]: any } = {
  center: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center" as any,
    background: "#0b0b0b",
    color: "#111",
    padding: 16,
  },
  card: {
    width: "min(520px, 92vw)",
    background: "#fff",
    borderRadius: 14,
    padding: 18,
  },
  primaryBtn: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  layout: { display: "flex", height: "100vh", overflow: "hidden" },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  topbar: {
    height: 70,
    borderBottom: "1px solid #eee",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
  },
  timer: {
    fontWeight: 900,
    fontSize: 18,
    padding: "8px 12px",
    borderRadius: 12,
    border: "2px solid #111",
    minWidth: 86,
    textAlign: "center",
  },
  bottombar: {
    marginTop: "auto",
    padding: 16,
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    background: "#fff",
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
};

export default TestShell;
