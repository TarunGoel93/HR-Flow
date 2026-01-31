"use client";

import { useProctoring } from "./useProctoring";
import { useState } from "react";

export default function CameraGuard({ attemptId, onStatusChange }: { attemptId: string; onStatusChange?: (status: string, count: number, type?: string) => void }) {
  const [isLocked, setIsLocked] = useState(false);
  
  const { videoRef, violations, recordViolation } = useProctoring(attemptId, async () => {
    console.log("Camera violation detected - sending to backend...");
    try {
      const res = await fetch(`/api/public/session/${attemptId}/violation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "CAMERA" }),
      });
      
      const data = await res.json();
      console.log("Backend response:", data);
      
      if (data.violationsCount !== undefined) {
        recordViolation(data.violationsCount);
      }
      
      if (data.status === "locked") {
        setIsLocked(true);
        // Notify parent component to update status with reason
        onStatusChange?.("locked", data.violationsCount, "CAMERA");
      }
    } catch (error) {
      console.error("Error sending violation:", error);
    }
  });

  return (
    <>
      <video ref={videoRef} muted autoPlay playsInline className="hidden" />
      <div className="text-xs text-red-500">
        Camera Violations: {violations}/2
        {isLocked && <span className="ml-2 font-bold">LOCKED</span>}
      </div>
    </>
  );
}
