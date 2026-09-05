package db

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"

	"github.com/ashelycole1/kua/models"
)

// DevUser is returned when Supabase is not configured and DEV_MODE is on.
var DevUser = &models.User{
	ID:            "00000000-0000-0000-0000-000000000001",
	ClerkID:       "dev_user_mock_id",
	PhoneNumber:   "+254700000000",
	Email:         "dev@kua.local",
	BizName:       "Dev Shop",
	CreditBalance: 100,
	Balance:       0.0,
	CurrencyCode:  "KES",
	AccountType:   "merchant",
}

// IsConfigured returns true when Supabase env vars are set.
func IsConfigured() bool {
	url := os.Getenv("SUPABASE_URL")
	key := os.Getenv("SUPABASE_KEY")
	return url != "" && key != "" && url != "http://localhost:8000" && key != "dummy"
}

func isDevMode() bool {
	v := os.Getenv("DEV_MODE")
	return v != "false" && v != "FALSE" && v != "False"
}

// supabaseGet performs a GET request against the Supabase PostgREST API.
func supabaseGet(path string, query map[string]string) ([]byte, error) {
	url := os.Getenv("SUPABASE_URL") + "/rest/v1/" + path
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	q := req.URL.Query()
	for k, v := range query {
		q.Add(k, v)
	}
	req.URL.RawQuery = q.Encode()
	req.Header.Set("apikey", os.Getenv("SUPABASE_KEY"))
	req.Header.Set("Authorization", "Bearer "+os.Getenv("SUPABASE_KEY"))
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

// supabasePost sends a POST (insert) to Supabase.
func supabasePost(path string, body interface{}) ([]byte, error) {
	return supabaseWrite("POST", path, body, nil)
}

// supabasePatch sends a PATCH (update) to Supabase with filter query params.
func supabasePatch(path string, body interface{}, query map[string]string) ([]byte, error) {
	return supabaseWrite("PATCH", path, body, query)
}

func supabaseWrite(method, path string, body interface{}, query map[string]string) ([]byte, error) {
	raw, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	url := os.Getenv("SUPABASE_URL") + "/rest/v1/" + path
	req, err := http.NewRequest(method, url, bytes.NewReader(raw))
	if err != nil {
		return nil, err
	}
	if query != nil {
		q := req.URL.Query()
		for k, v := range query {
			q.Add(k, v)
		}
		req.URL.RawQuery = q.Encode()
	}
	req.Header.Set("apikey", os.Getenv("SUPABASE_KEY"))
	req.Header.Set("Authorization", "Bearer "+os.Getenv("SUPABASE_KEY"))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

// GetUserByClerkID fetches user by Clerk identity.
func GetUserByClerkID(clerkID string) (*models.User, error) {
	if !IsConfigured() {
		if isDevMode() && clerkID == "dev_user_mock_id" {
			return DevUser, nil
		}
		return nil, nil
	}
	data, err := supabaseGet("users", map[string]string{
		"clerk_id": "eq." + clerkID,
		"limit":    "1",
	})
	if err != nil {
		return nil, fmt.Errorf("supabase GetUserByClerkID: %w", err)
	}
	var users []models.User
	if err := json.Unmarshal(data, &users); err != nil {
		return nil, err
	}
	if len(users) == 0 {
		return nil, nil
	}
	return &users[0], nil
}

// GetUserByPhone fetches user by phone number.
func GetUserByPhone(phone string) (*models.User, error) {
	if !IsConfigured() {
		if isDevMode() && phone == DevUser.PhoneNumber {
			return DevUser, nil
		}
		return nil, nil
	}
	data, err := supabaseGet("users", map[string]string{
		"phone_number": "eq." + phone,
		"limit":        "1",
	})
	if err != nil {
		return nil, fmt.Errorf("supabase GetUserByPhone: %w", err)
	}
	var users []models.User
	if err := json.Unmarshal(data, &users); err != nil {
		return nil, err
	}
	if len(users) == 0 {
		return nil, nil
	}
	return &users[0], nil
}

// UpsertUser creates or updates a user by clerkID.
func UpsertUser(clerkID, phone, currencyCode string) (*models.User, error) {
	if !IsConfigured() {
		if isDevMode() {
			u := *DevUser
			u.ClerkID = clerkID
			u.PhoneNumber = phone
			return &u, nil
		}
		return nil, fmt.Errorf("supabase not configured")
	}

	// Try by clerk_id first
	user, _ := GetUserByClerkID(clerkID)
	if user != nil {
		if user.PhoneNumber != phone {
			_, _ = supabasePatch("users", map[string]string{"phone_number": phone}, map[string]string{"clerk_id": "eq." + clerkID})
			user.PhoneNumber = phone
		}
		return user, nil
	}

	// Try by phone
	byPhone, _ := GetUserByPhone(phone)
	if byPhone != nil && byPhone.ClerkID == "" {
		_, _ = supabasePatch("users", map[string]string{"clerk_id": clerkID}, map[string]string{"phone_number": "eq." + phone})
		byPhone.ClerkID = clerkID
		return byPhone, nil
	}

	// Insert new user
	payload := map[string]interface{}{
		"clerk_id":       clerkID,
		"phone_number":   phone,
		"credit_balance": 100,
		"balance":        0.0,
		"currency_code":  currencyCode,
	}
	data, err := supabasePost("users", payload)
	if err != nil {
		return nil, err
	}
	var users []models.User
	if err := json.Unmarshal(data, &users); err != nil {
		return nil, err
	}
	if len(users) == 0 {
		u := *DevUser
		u.ClerkID = clerkID
		u.PhoneNumber = phone
		return &u, nil
	}
	return &users[0], nil
}

// DeductCredit subtracts 1 credit from the user.
func DeductCredit(phone string) bool {
	if !IsConfigured() {
		fmt.Println("DEV_MODE: Skipping credit deduction (no Supabase)")
		return true
	}
	user, err := GetUserByPhone(phone)
	if err != nil || user == nil || user.CreditBalance <= 0 {
		return false
	}
	newBal := user.CreditBalance - 1
	_, err = supabasePatch("users", map[string]interface{}{"credit_balance": newBal}, map[string]string{"phone_number": "eq." + phone})
	return err == nil
}

// AddCredits adds credits to a user.
func AddCredits(phone string, amount int) bool {
	if !IsConfigured() {
		return isDevMode()
	}
	user, _ := GetUserByPhone(phone)
	if user != nil {
		newBal := user.CreditBalance + amount
		_, err := supabasePatch("users", map[string]interface{}{"credit_balance": newBal}, map[string]string{"phone_number": "eq." + phone})
		return err == nil
	}
	_, err := supabasePost("users", map[string]interface{}{"phone_number": phone, "credit_balance": amount})
	return err == nil
}

// AddBalance adds monetary balance to a user.
func AddBalance(phone string, amount float64) bool {
	if !IsConfigured() {
		return isDevMode()
	}
	user, _ := GetUserByPhone(phone)
	if user == nil {
		return false
	}
	newBal := user.Balance + amount
	_, err := supabasePatch("users", map[string]interface{}{"balance": newBal}, map[string]string{"phone_number": "eq." + phone})
	return err == nil
}

// SaveCampaign stores a generated campaign to the DB.
func SaveCampaign(phone, prompt string, variants map[string]string, tone, flyerURL string) bool {
	if !IsConfigured() {
		fmt.Printf("DEV_MODE: Campaign saved locally (no Supabase) — prompt='%s'\n", truncate(prompt, 60))
		return true
	}
	payload := map[string]interface{}{
		"user_phone":         phone,
		"prompt":             prompt,
		"tone":               tone,
		"professional":       variants["professional"],
		"hype":               variants["hype"],
		"sheng":              variants["sheng"],
		"sms":                variants["sms"],
		"ambassador_message": variants["ambassador_message"],
		"flyer_url":          flyerURL,
	}
	_, err := supabasePost("campaigns", payload)
	if err != nil {
		fmt.Printf("Error saving campaign: %v\n", err)
		return false
	}
	fmt.Printf("✅ Campaign saved to Supabase for phone=%s\n", phone)
	return true
}

// GetCampaignHistory fetches all campaigns for a user.
func GetCampaignHistory(phone string) []map[string]interface{} {
	if !IsConfigured() {
		return []map[string]interface{}{}
	}
	data, err := supabaseGet("campaigns", map[string]string{
		"user_phone": "eq." + phone,
		"order":      "created_at.desc",
	})
	if err != nil {
		fmt.Printf("Error fetching history: %v\n", err)
		return []map[string]interface{}{}
	}
	var result []map[string]interface{}
	_ = json.Unmarshal(data, &result)
	if result == nil {
		return []map[string]interface{}{}
	}
	return result
}

// GetAmbassadors fetches all ambassadors for a merchant.
func GetAmbassadors(merchantPhone string) []map[string]interface{} {
	if !IsConfigured() {
		return []map[string]interface{}{}
	}
	data, err := supabaseGet("ambassadors", map[string]string{
		"merchant_phone": "eq." + merchantPhone,
		"order":          "created_at.desc",
	})
	if err != nil {
		return []map[string]interface{}{}
	}
	var result []map[string]interface{}
	_ = json.Unmarshal(data, &result)
	if result == nil {
		return []map[string]interface{}{}
	}
	return result
}

// CreateAmbassador inserts a new ambassador record.
func CreateAmbassador(merchantPhone, name, phone, payoutMethod string) map[string]interface{} {
	if !IsConfigured() {
		return map[string]interface{}{
			"id": "dev-amb-001", "merchant_phone": merchantPhone,
			"name": name, "phone": phone, "payout_method": payoutMethod,
		}
	}
	payload := map[string]interface{}{
		"merchant_phone": merchantPhone,
		"name":           name,
		"phone":          phone,
		"payout_method":  payoutMethod,
	}
	data, err := supabasePost("ambassadors", payload)
	if err != nil {
		return nil
	}
	var rows []map[string]interface{}
	_ = json.Unmarshal(data, &rows)
	if len(rows) == 0 {
		return nil
	}
	return rows[0]
}

// CreatePayout records a payout and updates total_earned on the ambassador.
func CreatePayout(ambassadorID string, amount float64) map[string]interface{} {
	if !IsConfigured() {
		return map[string]interface{}{
			"id": "dev-payout-001", "ambassador_id": ambassadorID,
			"amount": amount, "status": "completed",
		}
	}
	payload := map[string]interface{}{
		"ambassador_id": ambassadorID,
		"amount":        amount,
		"status":        "completed",
	}
	data, err := supabasePost("payouts", payload)
	if err != nil {
		return nil
	}
	var rows []map[string]interface{}
	_ = json.Unmarshal(data, &rows)

	// Update total_earned on the ambassador
	ambData, _ := supabaseGet("ambassadors", map[string]string{"id": "eq." + ambassadorID, "limit": "1"})
	var ambs []map[string]interface{}
	if json.Unmarshal(ambData, &ambs) == nil && len(ambs) > 0 {
		current, _ := strconv.ParseFloat(fmt.Sprintf("%v", ambs[0]["total_earned"]), 64)
		_, _ = supabasePatch("ambassadors",
			map[string]interface{}{"total_earned": current + amount},
			map[string]string{"id": "eq." + ambassadorID},
		)
	}

	if len(rows) == 0 {
		return nil
	}
	return rows[0]
}

// LogBroadcast stores a broadcast log entry.
func LogBroadcast(clerkID, message string, recipientCount, creditCost int, recipients []string) {
	if !IsConfigured() {
		return
	}
	payload := map[string]interface{}{
		"clerk_id":            clerkID,
		"message":             message,
		"recipient_count":     recipientCount,
		"recipients_json":     recipients,
		"total_cost_credits":  creditCost,
		"status":              "sent",
	}
	_, _ = supabasePost("broadcasts", payload)
}

// GetBroadcastHistory fetches broadcast history for a clerk user.
func GetBroadcastHistory(clerkID string) []map[string]interface{} {
	if !IsConfigured() {
		return []map[string]interface{}{}
	}
	data, err := supabaseGet("broadcasts", map[string]string{
		"clerk_id": "eq." + clerkID,
		"order":    "created_at.desc",
	})
	if err != nil {
		return []map[string]interface{}{}
	}
	var result []map[string]interface{}
	_ = json.Unmarshal(data, &result)
	if result == nil {
		return []map[string]interface{}{}
	}
	return result
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n]
}
