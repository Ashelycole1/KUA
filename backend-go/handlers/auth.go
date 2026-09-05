package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/ashelycole1/kua/db"
	"github.com/ashelycole1/kua/middleware"
	"github.com/ashelycole1/kua/models"
)

// POST /auth/login
func Login(w http.ResponseWriter, r *http.Request) {
	var req models.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	clerkID := middleware.GetClerkID(r)
	if clerkID == "" {
		jsonError(w, "Invalid token: missing sub claim.", http.StatusUnauthorized)
		return
	}

	currencyCode := req.CurrencyCode
	if currencyCode == "" {
		currencyCode = "KES"
	}

	user, err := db.UpsertUser(clerkID, req.Phone, currencyCode)
	if err != nil || user == nil {
		jsonError(w, "Failed to initialize user profile", http.StatusInternalServerError)
		return
	}

	jsonOK(w, models.AuthResponse{
		PhoneNumber:   user.PhoneNumber,
		CreditBalance: user.CreditBalance,
		Balance:       user.Balance,
		CurrencyCode:  user.CurrencyCode,
	})
}
