package models

// ── Auth ──────────────────────────────────────────────────────────────────────

type AuthRequest struct {
	Phone         string `json:"phone"`
	BizName       string `json:"biz_name"`
	BizType       string `json:"biz_type"`
	BrandKeywords string `json:"brand_keywords"`
	CurrencyCode  string `json:"currency_code"`
}

type AuthResponse struct {
	PhoneNumber   string  `json:"phone_number"`
	CreditBalance int     `json:"credit_balance"`
	Balance       float64 `json:"balance"`
	CurrencyCode  string  `json:"currency_code"`
}

// ── Campaign ──────────────────────────────────────────────────────────────────

type CampaignRequest struct {
	Text          string `json:"text"`
	Phone         string `json:"phone"`
	BizName       string `json:"biz_name"`
	BizType       string `json:"biz_type"`
	BrandKeywords string `json:"brand_keywords"`
	Tone          string `json:"tone"`
	Language      string `json:"language"`
}

type CampaignResponse struct {
	WhatsApp        string  `json:"whatsapp"`
	Social          string  `json:"social"`
	Ambassador      string  `json:"ambassador"`
	FlyerURL        *string `json:"flyer_url,omitempty"`
	CreditsRemaining *int   `json:"credits_remaining,omitempty"`
}

// ── Payments ──────────────────────────────────────────────────────────────────

type TopUpRequest struct {
	Phone    string  `json:"phone"`
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
}

// ── Broadcast ─────────────────────────────────────────────────────────────────

type BroadcastRequest struct {
	Recipients []string `json:"recipients"`
	Message    string   `json:"message"`
	SenderID   string   `json:"sender_id"`
}

// ── Ambassadors ───────────────────────────────────────────────────────────────

type AmbassadorRequest struct {
	Name         string `json:"name"`
	Phone        string `json:"phone"`
	PayoutMethod string `json:"payout_method"`
}

type PayoutRequest struct {
	Amount float64 `json:"amount"`
}

// ── User (internal) ───────────────────────────────────────────────────────────

type User struct {
	ID            string  `json:"id"`
	ClerkID       string  `json:"clerk_id"`
	PhoneNumber   string  `json:"phone_number"`
	Email         string  `json:"email"`
	BizName       string  `json:"biz_name"`
	CreditBalance int     `json:"credit_balance"`
	Balance       float64 `json:"balance"`
	CurrencyCode  string  `json:"currency_code"`
	AccountType   string  `json:"account_type"`
}

// ── Generic map for JSON responses ───────────────────────────────────────────

type M = map[string]interface{}
