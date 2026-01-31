import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import Attempt from '@/models/Attempt';
import Test from '@/models/Test';
import connectDB from '@/lib/db';

export async function POST(req, { params }) {
  try {
    await connectDB();
    
    const { attemptId } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return NextResponse.json({ error: 'Invalid attempt ID' }, { status: 400 });
    }
    
    const body = await req.json();
    const { type } = body;
    
    if (!type || typeof type !== 'string' || !["TAB_HIDDEN", "BLUR", "FULLSCREEN_EXIT", "CAMERA", "LOOKING_AWAY"].includes(type)) {
      return NextResponse.json({ error: 'Invalid violation type' }, { status: 400 });
    }
    
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }
    
    if (attempt.status !== 'active') {
      return NextResponse.json({ error: `Attempt is ${attempt.status}` }, { status: 403 });
    }
    
    const test = await Test.findById(attempt.testId).lean();
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    
    attempt.violationsCount += 1;
    attempt.violations.push({ type, at: new Date() });
    
    const maxViolations = test.maxViolations || 2;
    if (attempt.violationsCount > maxViolations) {
      attempt.status = 'locked';
      console.log(`Attempt ${attemptId} locked: ${attempt.violationsCount} violations (max: ${maxViolations})`);
    }
    
    await attempt.save();

    return NextResponse.json({
      ok: true,
      violationsCount: attempt.violationsCount,
      maxViolations,
      status: attempt.status,
    });
  } catch (err) {
    console.error('Error recording violation:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
