"use client";

import { useEffect, useRef, useState } from "react";
import { captureFrame } from "@/lib/camera";

const MAX_VIOLATIONS = 2;
const PROCTORING_SERVICE_URL = process.env.NEXT_PUBLIC_PROCTOR_URL ?? "http://localhost:8000";

export function useProctoring(attemptId: string, onLock: () => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [violations, setViolations] = useState(0);
  const violationsRef = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let consecutiveFailures = 0;

    async function initCamera() {
      if (typeof window === "undefined") {
        console.warn("Not in browser environment");
        return;
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        console.error("Camera API not available.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;

        // Wait for metadata to ensure dimensions are available
        await new Promise<void>((resolve) => {
          const v = videoRef.current!;
          const onLoaded = () => {
            v.removeEventListener("loadedmetadata", onLoaded);
            resolve();
          };
          if (v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) {
            resolve();
          } else {
            v.addEventListener("loadedmetadata", onLoaded, { once: true });
            // Fallback resolve after 1s
            setTimeout(resolve, 1000);
          }
        });

        try {
          await videoRef.current.play();
        } catch (err) {
          console.warn("Video play() blocked by policy:", err);
        }

        interval = setInterval(checkGaze, 2000);
        console.log("Camera initialized successfully");
      } catch (error) {
        console.error("Failed to initialize camera:", error);
      }
    }

    async function checkGaze() {
      if (!videoRef.current) return;

      try {
        const v = videoRef.current;
        if (!v || v.videoWidth === 0 || v.videoHeight === 0) {
          // Skip if video not ready
          return;
        }
        const frame = captureFrame(v);

        const res = await fetch(`${PROCTORING_SERVICE_URL}/verify-gaze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: frame }),
        });

        if (!res.ok) {
          consecutiveFailures += 1;
          if (consecutiveFailures >= 3) {
            console.warn("Proctoring service unreachable. Pausing gaze checks.");
            if (interval) clearInterval(interval);
          }
          return;
        }

        const data = await res.json();
        consecutiveFailures = 0;

        if (data.looking_away || data.violation) {
          console.log("Gaze violation detected");
          onLock();
        }
      } catch (error) {
        consecutiveFailures += 1;
        console.error("Gaze check error:", error);
        if (consecutiveFailures >= 3) {
          console.warn("Proctoring service unreachable. Pausing gaze checks.");
          if (interval) clearInterval(interval);
        }
      }
    }

    initCamera();
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const recordViolation = (count: number) => {
    violationsRef.current = count;
    setViolations(count);
    console.log(`Camera violations: ${count}/${MAX_VIOLATIONS}`);
    if (count > MAX_VIOLATIONS) {
      onLock();
    }
  };

  return { videoRef, violations, recordViolation };
}
