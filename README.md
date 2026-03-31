# Kua – The AI Marketing Engine for the African Merchant

Kua is a full-stack, AI-powered marketing campaign platform designed specifically for mobile-first micro-merchants across Africa. It dynamically localizes pricing, currency formats, and payment methods (M-Pesa, MTN MoMo, Bank Transfers) based on the user's country code, while combining a Progressive Web App (PWA) frontend with a FastAPI backend powered by Google's Gemini 2.5 Flash, Document AI, and Imagen.

## Architecture

* **Frontend:** Next.js 14 (App Router), Tailwind CSS v3, next-pwa (Progressive Web App).
* **Backend:** FastAPI, Python 3.10+.
* **AI:** Google Generative AI (Gemini 2.5 Flash, Imagen), Google Cloud Document AI (OCR).
* **Database & Storage:** Supabase.
* **Payments & SMS:** Africa's Talking (STK Push & Bulk SMS).

## Repository Structure

* `/frontend`: The Next.js PWA.
* `/backend`: The FastAPI backend.
* `/supabase`: Database migrations.

## Getting Started

### 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` (you can use the created `.env` as a base) and fill in your actual API keys.
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will run at `http://localhost:8000`.

### 2. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make sure `.env.local` contains `NEXT_PUBLIC_API_URL=http://localhost:8000`.
4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:3000`.

### 3. Supabase Setup

Run the SQL script located in `backend/db/migrations/00001_users.sql` in your Supabase project's SQL Editor to set up the `users` table and related functions.

Create a public storage bucket named `kua-flyers` in Supabase for holding the generated flyers.

## Note on Development

Currently, the Next.js frontend uses mock data and simulated AI loading states in `CampaignStudio.tsx` to provide immediate feedback during UI development if the backend API isn't fully configured with keys. It attempts to call the backend and falls back to mock responses if it fails.
