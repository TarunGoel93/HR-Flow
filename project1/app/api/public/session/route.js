import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import Test from '@/models/Test';
import TestToken from '@/models/TestToken';
import Attempt from '@/models/Attempt';
import { sha256 } from '@/lib/crypto';
import connectDB from '@/lib/db';

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }
    
    const tokenHash = sha256(token);
    const testToken = await TestToken.findOne({ tokenHash });
    
    if (!testToken) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
    }
    
    if (testToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Link has expired' }, { status: 410 });
    }
    
    if (testToken.status === 'used') {
      return NextResponse.json({ error: 'Link has already been used' }, { status: 403 });
    }
    
    if (testToken.status === 'revoked') {
      return NextResponse.json({ error: 'Link has been revoked' }, { status: 403 });
    }
    
    if (testToken.status === 'active') {
      return NextResponse.json({ error: 'Link is already active in another session' }, { status: 403 });
    }
    
    const test = await Test.findById(testToken.testId).lean();
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    
    const attempt = await Attempt.create({
      testId: test._id,
      tokenId: testToken._id,
      startedAt: new Date(),
      status: 'active',
      violationsCount: 0,
      client: {
        userAgent: req.headers.get('user-agent') || '',
        ip: req.headers.get('x-forwarded-for') || req.ip || ''
      }
    });
    
    testToken.status = 'active';
    testToken.attemptId = attempt._id;
    await testToken.save();
    
    const safeQuestions = (test.questions || []).map((q, index) => ({
      _id: q._id ? q._id.toString() : String(index),
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      marks: q.marks,
    }));

    return NextResponse.json({
      attemptId: attempt._id,
      test: {
        id: test._id,
        title: test.title,
        durationSeconds: test.durationSeconds,
        maxViolations: test.maxViolations,
        questions: safeQuestions,
      },
    });
  } catch (err) {
    console.error('Error starting test session:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
