package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
)

const atAPIBase = "https://api.africastalking.com"

func atUsername() string { return os.Getenv("AT_USERNAME") }
func atAPIKey() string   { return os.Getenv("AT_API_KEY") }

// SendSTKPush initiates an M-Pesa STK Push via Africa's Talking Payments API.
func SendSTKPush(phone string, amount float64) map[string]interface{} {
	username := atUsername()
	apiKey := atAPIKey()
	if username == "" || apiKey == "" {
		return map[string]interface{}{"status": "pending", "data": map[string]string{"status": "mocked"}}
	}

	form := url.Values{}
	form.Set("username", username)
	form.Set("productName", "KuaCredits")
	form.Set("recipients", fmt.Sprintf(`[{"phoneNumber":"%s","amount":"KES %g"}]`, phone, amount))

	resp, err := atPost("/payments/mobile/checkout/request", form, apiKey)
	if err != nil {
		return map[string]interface{}{"status": "error", "message": err.Error()}
	}
	return map[string]interface{}{"status": "pending", "data": resp}
}

// SendBulkSMS sends bulk SMS via Africa's Talking SMS API.
func SendBulkSMS(recipients []string, message, senderID string) map[string]interface{} {
	username := atUsername()
	apiKey := atAPIKey()
	if username == "" || apiKey == "" {
		return map[string]interface{}{"status": "error", "message": "Africa's Talking not configured"}
	}

	form := url.Values{}
	form.Set("username", username)
	form.Set("to", strings.Join(recipients, ","))
	form.Set("message", message)
	if senderID != "" {
		form.Set("from", senderID)
	}

	resp, err := atPost("/version1/messaging", form, apiKey)
	if err != nil {
		return map[string]interface{}{"status": "error", "message": err.Error()}
	}
	return map[string]interface{}{"status": "sent", "data": resp}
}

// atPost sends an HTTP POST to the Africa's Talking API and returns parsed JSON.
func atPost(path string, form url.Values, apiKey string) (interface{}, error) {
	req, err := http.NewRequest("POST", atAPIBase+path, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("apiKey", apiKey)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("AT API error %d: %s", resp.StatusCode, string(body))
	}

	var result interface{}
	_ = json.Unmarshal(body, &result)
	return result, nil
}
