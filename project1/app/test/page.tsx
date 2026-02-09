"use client";

import React, { useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TestShell from "../../components/TestShell";
import CameraGuard from "./CameraGuard";

function TestContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [attemptId, setAttemptId] = useState<string>("");
  const testShellRef = useRef<any>(null);

  if (!token || token === "invalid") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Invalid test link</h2>
        <p>Please check your URL.</p>
      </div>
    );
  }

  const handleCameraStatusChange = (status: string, count: number, type?: string) => {
    if (testShellRef.current?.updateStatus) {
      testShellRef.current.updateStatus(status, count, type);
    }
  };

  const handleCameraCounterUpdate = (count: number) => {
    if (testShellRef.current?.updateCameraViolations) {
      testShellRef.current.updateCameraViolations(count);
    }
  };

  return (
    <>
      {attemptId && (
        <CameraGuard
          attemptId={attemptId} 
          onStatusChange={handleCameraStatusChange}
          onCounterUpdate={handleCameraCounterUpdate}
        />
      )}
      <TestShell
        ref={testShellRef}
        token={token}
        onAttemptIdReceived={setAttemptId}
      />
    </>
  );
}

export default function TestLinkPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestContent />
    </Suspense>
  );
}