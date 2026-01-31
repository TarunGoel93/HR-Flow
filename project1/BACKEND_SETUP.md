# Backend Setup Guide

Your Next.js frontend is now properly configured to connect to your Express.js backend.

## Prerequisites

Make sure you have your backend server with:
- Node.js + Express
- MongoDB
- The API endpoints as documented:
  - `GET /api/public/session?token={token}`
  - `POST /api/public/session/:attemptId/save`
  - `POST /api/public/session/:attemptId/submit`
  - `POST /api/public/session/:attemptId/violation`

## Configuration

### 1. Environment Variable

The frontend is configured to connect to: `http://localhost:5000`

If your backend runs on a different port, update `.env.local`:

```bash
NEXT_PUBLIC_API_BASE=http://localhost:YOUR_PORT
```

### 2. Backend CORS Setup

Your Express backend needs CORS enabled to accept requests from Next.js:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // Next.js dev server
  credentials: true
}));
```

### 3. Start Your Backend

```bash
cd your-backend-folder
npm install
npm start
```

The backend should be running on port 5000 (or your configured port).

## Testing the Integration

1. **Start Backend**: Run your Express server
2. **Start Frontend**: Run `npm run dev` in this folder
3. **Generate Test Link**: Use your backend's admin API to create a test token
4. **Access Test**: Navigate to `http://localhost:3000/test?token=YOUR_TOKEN`

## API Flow

### 1. Start Test Session
**Request:** `GET /api/public/session?token={token}`

**Response:**
```json
{
  "attemptId": "attempt-id-here",
  "test": {
    "id": "test-id",
    "title": "Test Title",
    "durationSeconds": 3600,
    "maxViolations": 3,
    "questions": [
      {
        "_id": "q1",
        "type": "mcq",
        "prompt": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "marks": 1
      }
    ]
  }
}
```

**Note:** Correct answers are NOT sent to frontend (security feature)

### 2. Auto-save Answers
**Request:** `POST /api/public/session/{attemptId}/save`

**Body:**
```json
{
  "answers": [
    { "questionId": "q1", "answer": 1 },
    { "questionId": "q2", "answer": 0 }
  ]
}
```

Called automatically every 10 seconds.

### 3. Report Violation
**Request:** `POST /api/public/session/{attemptId}/violation`

**Body:**
```json
{
  "type": "TAB_HIDDEN" // or "BLUR" or "FULLSCREEN_EXIT"
}
```

**Response:**
```json
{
  "ok": true,
  "violationsCount": 1,
  "maxViolations": 3,
  "status": "active"
}
```

### 4. Submit Test
**Request:** `POST /api/public/session/{attemptId}/submit`

**Response:**
```json
{
  "ok": true,
  "status": "submitted",
  "score": 8,
  "maxScore": 10,
  "violationsCount": 1
}
```

## Troubleshooting

### "Cannot open test - Request failed with status code 404"
- ✅ Backend is not running
- Solution: Start your Express server

### "Cannot open test - Network Error"
- ✅ Wrong API_BASE URL
- Solution: Check `.env.local` has correct backend URL

### "CORS Error"
- ✅ Backend doesn't allow Next.js origin
- Solution: Add CORS middleware to Express

### "Fullscreen blocked"
- ✅ Browser permissions policy
- Solution: Test works without fullscreen, it's optional

## Demo Mode (No Backend)

If you want to test the UI without a backend, you can modify `TestShell.tsx` to use mock data instead of API calls. This is useful for development.

## Production Deployment

For production:
1. Update `NEXT_PUBLIC_API_BASE` to your production backend URL
2. Ensure backend has proper CORS for your production frontend domain
3. Use HTTPS for both frontend and backend
4. Set up proper environment variables on your hosting platform
