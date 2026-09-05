package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/ashelycole1/kua/db"
	"github.com/ashelycole1/kua/middleware"
	"github.com/ashelycole1/kua/models"
	"github.com/ashelycole1/kua/services"
)

// POST /momo/initiate — secured with Clerk JWT
func InitiatePayment(w http.ResponseWriter, r *http.Request) {
	var req models.TopUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	clerkID := middleware.GetClerkID(r)
	if clerkID == "" {
		jsonError(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	user, _ := db.GetUserByClerkID(clerkID)
	if user == nil || user.PhoneNumber != req.Phone {
		jsonError(w, "Can only trigger payments for your own account.", http.StatusForbidden)
		return
	}

	currency := req.Currency
	if currency == "" {
		currency = "KES"
	}

	result := services.SendSTKPush(req.Phone, req.Amount)
	db.UpsertUser(clerkID, req.Phone, currency)
	jsonOK(w, result)
}

// POST /momo/webhook — PUBLIC endpoint, receives Africa's Talking payment callbacks
func PaymentWebhook(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		jsonError(w, "Failed to parse form data", http.StatusBadRequest)
		return
	}

	status := firstOf(r.FormValue("Status"), r.FormValue("status"))
	phone := firstOf(r.FormValue("PhoneNumber"), r.FormValue("phone"))
	value := firstOf(r.FormValue("Value"), r.FormValue("amount"), "0")

	// Normalise phone
	phone = strings.TrimSpace(strings.ReplaceAll(phone, " ", ""))
	if strings.HasPrefix(phone, "0") {
		phone = "+254" + phone[1:]
	}

	statusLower := strings.ToLower(status)
	if statusLower == "success" || statusLower == "succeeded" || statusLower == "complete" {
		re := regexp.MustCompile(`[^\d.]`)
		amountStr := re.ReplaceAllString(value, "")
		amount, _ := strconv.ParseFloat(amountStr, 64)

		// KES 100 = 10 credits
		credits := int((amount / 100) * 10)
		if credits < 1 {
			credits = 1
		}
		db.AddCredits(phone, credits)
		jsonOK(w, map[string]interface{}{"message": "Added " + strconv.Itoa(credits) + " credits to " + phone})
		return
	}

	jsonOK(w, map[string]interface{}{"message": "Payment not successful", "status": status})
}

func firstOf(vals ...string) string {
	for _, v := range vals {
		if v != "" {
			return v
		}
	}
	return ""
}
