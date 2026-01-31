import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import Attempt from '@/models/Attempt';
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
    
    if (attempt.status !== 'active') {
      return NextResponse.json({ error: 'Attempt is not active' }, { status: 403 });
    }
    
    const body = await req.json();
    const answers = body.answers;
    
    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: 'Answers must be an array' }, { status: 400 });
    }

    const current = new Map((attempt.answers || []).map(a => [String(a.questionId), a]));
    for (const a of answers) {
      if (!a.questionId) continue;
      current.set(String(a.questionId), {
        questionId: a.questionId,
        answer: a.answer
      });
    }
    
    attempt.answers = Array.from(current.values());
    await attempt.save();
    
    return NextResponse.json({
      message: 'Answers saved successfully',
      answers: attempt.answers.length
    });
  } catch (err) {
    console.error('Error saving answers:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
