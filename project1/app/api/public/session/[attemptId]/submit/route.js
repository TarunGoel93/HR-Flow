import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import Attempt from '@/models/Attempt';
import Test from '@/models/Test';
import TestToken from '@/models/TestToken';
import { scoreAttempt } from '@/lib/scoring';
import connectDB from '@/lib/db';

export async function POST(req, { params }) {
  try {
    await connectDB();
    
    const { attemptId } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return NextResponse.json({ error: 'Invalid attempt ID' }, { status: 400 });
    }
    
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }
    
    if (attempt.status === 'submitted') {
      return NextResponse.json({ error: 'Attempt has already been submitted' }, { status: 403 });
    }
    
    if (!["active", "locked"].includes(attempt.status)) {
      return NextResponse.json({ message: `Attempt is ${attempt.status}` }, { status: 409 });
    }

    const test = await Test.findById(attempt.testId).lean();
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    
    const tokenDoc = await TestToken.findById(attempt.tokenId);
    if (!tokenDoc) {
      return NextResponse.json({ error: 'Test token not found' }, { status: 404 });
    }
    
    const { score, maxScore } = scoreAttempt(test, attempt);
    
    attempt.score = score;
    attempt.maxScore = maxScore;
    attempt.submittedAt = new Date();
    attempt.status = 'submitted';
    await attempt.save();
    
    tokenDoc.status = 'used';
    tokenDoc.usedAt = new Date();
    await tokenDoc.save();

    return NextResponse.json({
      ok: true,
      status: attempt.status,
      score,
      maxScore,
      violationsCount: attempt.violationsCount,
    });
  } catch (err) {
    console.error('Error submitting attempt:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
