package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/ashelycole1/kua/db"
	"github.com/ashelycole1/kua/middleware"
	"github.com/ashelycole1/kua/models"
	"github.com/ashelycole1/kua/services"
)

// POST /generate-campaign
func GenerateCampaign(w http.ResponseWriter, r *http.Request) {
	var req models.CampaignRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	clerkID := middleware.GetClerkID(r)
	user, _ := db.GetUserByClerkID(clerkID)
	if user == nil {
		if strings.ToLower(os.Getenv("DEV_MODE")) != "false" {
			user = db.DevUser
		} else {
			jsonError(w, "User profile not initialized. Please call /auth/login first.", http.StatusUnauthorized)
			return
		}
	}

	// Auto-grant trial credits if empty
	if user.CreditBalance <= 0 {
		db.AddCredits(user.PhoneNumber, 100)
		user.CreditBalance = 100
	}

	inputText := req.Text
	if inputText == "" {
		inputText = "General product promotion"
	}

	// Generate campaign text via Gemini
	variants, err := services.GenerateCampaignText(inputText, req.BizName, req.BizType, req.BrandKeywords)
	if err != nil {
		jsonError(w, "Campaign generation failed", http.StatusInternalServerError)
		return
	}

	// Deduct 1 credit
	db.DeductCredit(user.PhoneNumber)
	updatedUser, _ := db.GetUserByPhone(user.PhoneNumber)
	var creditsRemaining *int
	if updatedUser != nil {
		c := updatedUser.CreditBalance
		creditsRemaining = &c
	}

	// Generate flyer image
	var flyerURL *string
	flyerBytes, _ := services.GenerateFlyer(inputText)
	if len(flyerBytes) > 0 {
		url := services.UploadFlyer(flyerBytes, user.PhoneNumber)
		if url != "" {
			flyerURL = &url
		}
	}

	// Save campaign to DB
	db.SaveCampaign(user.PhoneNumber, inputText, variants, orDefault(req.Tone, "warm"), orStr(flyerURL))

	// Map tone to correct social variant
	tone := strings.ToLower(orDefault(req.Tone, "warm"))
	var social string
	switch tone {
	case "urgent":
		social = variants["hype"]
	case "local":
		social = variants["sheng"]
	default:
		social = variants["professional"]
	}

	jsonOK(w, models.CampaignResponse{
		WhatsApp:         variants["sms"],
		Social:           social,
		Ambassador:       variants["ambassador_message"],
		FlyerURL:         flyerURL,
		CreditsRemaining: creditsRemaining,
	})
}

// GET /campaign-history
func GetCampaignHistory(w http.ResponseWriter, r *http.Request) {
	clerkID := middleware.GetClerkID(r)
	user, _ := db.GetUserByClerkID(clerkID)
	if user == nil {
		jsonOK(w, []interface{}{})
		return
	}
	history := db.GetCampaignHistory(user.PhoneNumber)
	jsonOK(w, history)
}

// POST /generate-campaign/image — multipart form upload
func GenerateCampaignImage(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		jsonError(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	phone := r.FormValue("phone")
	bizName := r.FormValue("biz_name")
	brandKeywords := r.FormValue("brand_keywords")

	clerkID := middleware.GetClerkID(r)
	user, _ := db.GetUserByClerkID(clerkID)
	if user == nil || user.PhoneNumber != phone {
		jsonError(w, "Phone verification check failed.", http.StatusForbidden)
		return
	}
	if user.CreditBalance <= 0 {
		jsonError(w, "Insufficient credits.", http.StatusForbidden)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		jsonError(w, "File upload required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	imageBytes, err := io.ReadAll(file)
	if err != nil {
		jsonError(w, "Failed to read uploaded file", http.StatusInternalServerError)
		return
	}

	mimeType := header.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "image/jpeg"
	}

	// Try Document AI OCR first; fall back to Gemini vision
	extractedText := services.OCRImage(imageBytes, mimeType)
	if strings.TrimSpace(extractedText) == "" {
		extractedText, _ = services.GenerateCampaignFromImage(imageBytes, mimeType)
	}

	variants, err := services.GenerateCampaignText(extractedText, bizName, "", brandKeywords)
	if err != nil {
		jsonError(w, "Campaign generation failed", http.StatusInternalServerError)
		return
	}

	db.DeductCredit(phone)
	db.SaveCampaign(phone, extractedText, variants, "warm", "")

	jsonOK(w, models.CampaignResponse{
		WhatsApp:   variants["sms"],
		Social:     variants["professional"],
		Ambassador: variants["ambassador_message"],
	})
}

// ── helpers ───────────────────────────────────────────────────────────────────

func orDefault(s, def string) string {
	if s == "" {
		return def
	}
	return s
}

func orStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
