import mongoose from 'mongoose';

const testTokenSchema = new mongoose.Schema(
    {
        testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },

        tokenHash: { type: String, required: true, unique: true, index: true },
        status: {
            type: String, enum: ['fresh', 'active', 'used', 'expired', 'revoked'],
            default: 'fresh',
            index: true
        },
        expiresAt: {type: Date, required:true},
        attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', default: null},
        usedAt: { type: Date, default: null },
        
    }
);
testTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.testTokens || mongoose.model("testTokens", testTokenSchema);