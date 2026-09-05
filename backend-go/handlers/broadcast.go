package handlers

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"os"
	"strings"

	"github.com/ashelycole1/kua/db"
	"github.com/ashelycole1/kua/middleware"
	"github.com/ashelycole1/kua/models"
	"github.com/ashelycole1/kua/services"
)

// POST /broadcast/send
func SendBroadcast(w http.ResponseWriter, r *http.Request) {
	var req models.BroadcastRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if len(req.Recipients) == 0 {
		jsonError(w, "No recipients provided.", http.StatusBadRequest)
		return
	}

	clerkID := middleware.GetClerkID(r)
	user, _ := db.GetUserByClerkID(clerkID)
	if user == nil {
		if strings.ToLower(os.Getenv("DEV_MODE")) != "false" {
			user = db.DevUser
		} else {
			jsonError(w, "User not found.", http.StatusNotFound)
			return
		}
	}

	numRecipients := len(req.Recipients)
	requiredCredits := int(math.Ceil(float64(numRecipients) / 20.0))

	if user.CreditBalance < requiredCredits {
		jsonError(w,
			"Insufficient credits. Required: "+itoa(requiredCredits)+", Current: "+itoa(user.CreditBalance),
			http.StatusPaymentRequired,
		)
		return
	}

	senderID := req.SenderID
	if senderID == "" {
		senderID = "Kua"
	}

	atRes := services.SendBulkSMS(req.Recipients, req.Message, senderID)
	if status, _ := atRes["status"].(string); status == "error" {
		msg, _ := atRes["message"].(string)
		jsonError(w, "Africa's Talking error: "+msg, http.StatusInternalServerError)
		return
	}

	db.DeductCredit(user.PhoneNumber)
	newCredits := user.CreditBalance - requiredCredits

	db.LogBroadcast(clerkID, req.Message, numRecipients, requiredCredits, req.Recipients)

	jsonOK(w, map[string]interface{}{
		"status":           "success",
		"recipients_sent":  numRecipients,
		"credits_deducted": requiredCredits,
		"remaining_credits": newCredits,
	})
}

// GET /broadcast/history
func GetBroadcastHistory(w http.ResponseWriter, r *http.Request) {
	clerkID := middleware.GetClerkID(r)
	history := db.GetBroadcastHistory(clerkID)
	jsonOK(w, history)
}

func itoa(n int) string {
	return fmt.Sprintf("%d", n)
}
