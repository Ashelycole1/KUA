package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/ashelycole1/kua/handlers"
	"github.com/ashelycole1/kua/middleware"
	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file (ignored on cloud — env vars are set externally)
	_ = godotenv.Load()

	r := chi.NewRouter()

	// ── Global middleware ──────────────────────────────────────────────────────
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	r.Use(chiMiddleware.RequestID)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{frontendURL, "*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	}))

	// ── Health check ──────────────────────────────────────────────────────────
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintln(w, `{"status":"ok","service":"kua-api-go"}`)
	})

	// ── Auth routes ───────────────────────────────────────────────────────────
	r.Route("/auth", func(r chi.Router) {
		r.Use(middleware.RequireAuth)
		r.Post("/login", handlers.Login)
	})

	// ── Campaign routes ───────────────────────────────────────────────────────
	r.Group(func(r chi.Router) {
		r.Use(middleware.RequireAuth)
		r.Post("/generate-campaign", handlers.GenerateCampaign)
		r.Get("/campaign-history", handlers.GetCampaignHistory)
		r.Post("/generate-campaign/image", handlers.GenerateCampaignImage)
	})

	// ── Payment routes ────────────────────────────────────────────────────────
	r.Route("/momo", func(r chi.Router) {
		// /momo/initiate — requires auth
		r.With(middleware.RequireAuth).Post("/initiate", handlers.InitiatePayment)
		// /momo/webhook — PUBLIC (secured by origin IP in production)
		r.Post("/webhook", handlers.PaymentWebhook)
	})

	// ── Broadcast routes ──────────────────────────────────────────────────────
	r.Route("/broadcast", func(r chi.Router) {
		r.Use(middleware.RequireAuth)
		r.Post("/send", handlers.SendBroadcast)
		r.Get("/history", handlers.GetBroadcastHistory)
	})

	// ── Ambassador routes ─────────────────────────────────────────────────────
	r.Route("/ambassadors", func(r chi.Router) {
		r.Use(middleware.RequireAuth)
		r.Get("/", handlers.ListAmbassadors)
		r.Post("/", handlers.AddAmbassador)
		r.Post("/{ambassador_id}/pay", handlers.PayAmbassador)
	})

	// ── Start server ──────────────────────────────────────────────────────────
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := "0.0.0.0:" + port
	fmt.Printf("🚀 Kua API (Go) listening on %s\n", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		fmt.Fprintf(os.Stderr, "Server error: %v\n", err)
		os.Exit(1)
	}
}
