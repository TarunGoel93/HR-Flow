import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import Test from '@/models/Test';
import TestToken from '@/models/TestToken';
import { generateToken, sha256 } from '@/lib/crypto';
import connectDB from '@/lib/db';

export async function POST(req, { params }) {
  try {
    await connectDB();
    
    const { testId } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return NextResponse.json({ error: 'Invalid test ID' }, { status: 400 });
    }
    
    const test = await Test.findById(testId);
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    
    const token = generateToken();
    const tokenHash = sha256(token);
    const tokenTTLMinutes = parseInt(process.env.TOKEN_TTL_MINUTES) || 60;
    const expiresAt = new Date(Date.now() + tokenTTLMinutes * 60 * 1000);
    
    await TestToken.create({
      testId,
      tokenHash,
      expiresAt,
      status: 'fresh'
    });
    
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    const url = `${baseUrl}/t/${token}`;
    
    return NextResponse.json({ url, expiresAt });
  } catch (err) {
    console.error('Error generating test link:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
