import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  const res = await fetch("http://localhost:8000/verify-gaze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: body.image }),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
