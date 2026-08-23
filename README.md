# NovaPath — Your Personal Opportunity Execution Agent

> **LaunchPadX 2026 — Track 01: The Agent Hub**  
> Built by **NovaForge** (5-member student engineering team)  
> *Transforming student career goals into personalized, multi-step execution plans using persistent memory, Firebase Firestore, Firebase Authentication, and Gemini API.*

---

## 1. Project Overview

**NovaPath** is a student-first AI opportunity execution agent designed for engineering undergraduates. Rather than acting as a standard conversational chatbot or a passive job search aggregator, NovaPath decomposes a student's high-level career goal into structured subtasks, retrieves long-term profile and interaction memory from **Cloud Firestore**, verifies real-time external and curated opportunity data, computes transparent 5-factor fit scores, identifies concrete skill gaps, and generates an executable timeline action plan with Gemini AI.

---

## 2. Firebase & Cloud Firestore Architecture

### Firestore Collections & Subcollections Hierarchy

```
users/{userId}/profile/data
  - name: string
  - email: string
  - degree: string (e.g. "B.Tech")
  - branch: string (e.g. "Artificial Intelligence & Machine Learning")
  - year: number (e.g. 2)
  - location: string (e.g. "Hyderabad")
  - skills: string[] (e.g. ["Python", "Machine Learning", "SQL"])
  - career_interests: string[]
  - preferred_opportunity_types: string[]
  - remote_preference: boolean
  - created_at / updated_at: timestamp

users/{userId}/memories/{memoryId}
  - memory_type: "PREFERENCE" | "PROFILE" | "INTERACTION" | "FEEDBACK"
  - memory_text: string (e.g. "User prefers Hyderabad and remote AI/ML internships.")
  - importance: "LOW" | "MEDIUM" | "HIGH"
  - category: string
  - created_at / updated_at: timestamp

users/{userId}/agentRuns/{runId}
  - goal: string
  - status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED"
  - steps: AgentStep[]
  - summary: string
  - retrieved_preferences: string[]
  - opportunities: EvaluatedOpportunity[]
  - skill_gaps: SkillGapItem[]
  - action_plan: ActionPlanItem[]
  - completed_at: timestamp

users/{userId}/savedOpportunities/{opportunityId}
  - opportunity_id: string
  - status: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED"
  - notes: string
  - opportunity: Opportunity object
  - created_at / updated_at: timestamp

opportunities/{opportunityId}
  - Global catalog of curated and live search discoveries
```

---

## 3. Modular Service Layer

The frontend components never call raw database APIs directly. Clean modular services decouple the presentation layer from the storage backend:

- `src/firebase/config.ts`: Initializes Firebase App and Cloud Firestore instance
- `src/firebase/auth.ts`: Google Sign-In, Email/Password login/signup, and auth listener
- `src/services/profileService.ts`: `getUserProfile()`, `updateUserProfile()`
- `src/services/memoryService.ts`: `getMemories()`, `saveMemory()`, `deleteMemory()`, `updateMemory()`
- `src/services/opportunityService.ts`: `getOpportunities()`, `getSavedOpportunities()`, `saveOpportunity()`, `updateSavedOpportunityStatus()`, `removeSavedOpportunity()`
- `src/services/agentRunService.ts`: `saveAgentRun()`, `getAgentRuns()`, `getAgentRunById()`

---

## 4. Multi-Step Agent Execution Workflow

```
USER CAREER GOAL
       ↓
AUTHENTICATE USER (Firebase Auth UID)
       ↓
LOAD STUDENT PROFILE (users/{userId}/profile/data)
       ↓
RETRIEVE PERSISTENT MEMORIES (users/{userId}/memories)
       ↓
GEMINI UNDERSTANDS OBJECTIVE & INTENT
       ↓
TASK DECOMPOSITION & SEARCH PLAN CREATION
       ↓
EXTERNAL OPPORTUNITY SEARCH / API DISCOVERY
       ↓
DETERMINISTIC 5-FACTOR OPPORTUNITY MATCHING (0-100%)
  • Skill Match (40%)
  • Eligibility Fit (25%)
  • Location Alignment (15%)
  • Format / Remote (10%)
  • Experience & Year (10%)
       ↓
GEMINI REASONING OVER MATCHES & SKILL GAPS
       ↓
PERSONALIZED TIMELINE ACTION PLAN
       ↓
PERSIST AGENT RUN TO FIRESTORE (users/{userId}/agentRuns)
       ↓
SAVE EXTRACTED PREFERENCES TO FIRESTORE MEMORY BANK
       ↓
RENDER INTERACTIVE DASHBOARD RESULT
```

---

## 5. Firestore Security Rules

The security rules enforce user isolation so User A cannot read or modify User B's private profile, memories, runs, or saved bookmarks:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /profile/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /memories/{memoryId} {
        allow read, write: if isOwner(userId);
      }
      match /agentRuns/{runId} {
        allow read, write: if isOwner(userId);
      }
      match /savedOpportunities/{opportunityId} {
        allow read, write: if isOwner(userId);
      }
    }

    match /opportunities/{opportunityId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

---

## 6. Environment Variables

Define the following in your runtime environment (see `.env.example`):

```env
# Required for Gemini AI Grounding and Multi-Step Reasoning
GEMINI_API_KEY=your_gemini_api_key_here

# App URL (automatically provided in Google AI Studio / Cloud Run)
APP_URL=https://your-app-service.run.app
```

---

## 7. Local Development & Antigravity Compatibility

### Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Full-Stack Dev Server (Express + Vite)
npm run dev

# 3. Build for production
npm run build
```

---

## 8. Hackathon Demo Scenario (Step-by-Step)

1. **Step 1 — Login**: Open NovaPath, sign in with Google or Email.
2. **Step 2 — Profile Check**: Open **Profile & Skills** to view degree (B.Tech AI/ML 2nd Year, Hyderabad, Python, Machine Learning).
3. **Step 3 — Preference Stored**: In Memory Bank or Chat, add *"I prefer Hyderabad and remote AI/ML internships."* Saved directly to Firestore.
4. **Step 4 — Refresh**: Refresh the browser. Auth session and Firestore data persist seamlessly.
5. **Step 5 — Execution**: Type *"Find opportunities for me."* into the Agent Hub.
6. **Step 6 — Agent Reasoning**: NovaPath notes: *"Using your saved preferences: ✓ Hyderabad, ✓ Remote, ✓ AI/ML"*.
7. **Step 7 — Results**: Inspect ranked opportunities with deterministic match score breakdown, identified skill gaps (e.g. TensorFlow, Docker), and the concrete 4-phase action plan.
