package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/ashelycole1/kua/db"
	"github.com/ashelycole1/kua/middleware"
	"github.com/ashelycole1/kua/models"
	"github.com/go-chi/chi/v5"
)

// GET /ambassadors — list all ambassadors for the authenticated merchant
func ListAmbassadors(w http.ResponseWriter, r *http.Request) {
	clerkID := middleware.GetClerkID(r)
	user, _ := db.GetUserByClerkID(clerkID)
	if user == nil {
		jsonError(w, "User profile not initialized.", http.StatusUnauthorized)
		return
	}
	ambassadors := db.GetAmbassadors(user.PhoneNumber)
	if ambassadors == nil {
		ambassadors = []map[string]interface{}{}
	}
	jsonOK(w, ambassadors)
}

// POST /ambassadors — add a new ambassador
func AddAmbassador(w http.ResponseWriter, r *http.Request) {
	var req models.AmbassadorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	clerkID := middleware.GetClerkID(r)
	user, _ := db.GetUserByClerkID(clerkID)
	if user == nil {
		jsonError(w, "User profile not initialized.", http.StatusUnauthorized)
		return
	}

	payoutMethod := req.PayoutMethod
	if payoutMethod == "" {
		payoutMethod = "mpesa"
	}

	ambassador := db.CreateAmbassador(user.PhoneNumber, req.Name, req.Phone, payoutMethod)
	if ambassador == nil {
		jsonError(w, "Failed to create ambassador", http.StatusBadRequest)
		return
	}
	jsonOK(w, ambassador)
}

// POST /ambassadors/{ambassador_id}/pay — record a payout to an ambassador
func PayAmbassador(w http.ResponseWriter, r *http.Request) {
	ambassadorID := chi.URLParam(r, "ambassador_id")

	var req models.PayoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	clerkID := middleware.GetClerkID(r)
	user, _ := db.GetUserByClerkID(clerkID)
	if user == nil {
		jsonError(w, "User profile not initialized.", http.StatusUnauthorized)
		return
	}

	payout := db.CreatePayout(ambassadorID, req.Amount)
	if payout == nil {
		jsonError(w, "Failed to record payout", http.StatusBadRequest)
		return
	}
	jsonOK(w, payout)
}
