package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

const (
	geminiModel  = "gemini-2.5-flash"
	imagenModel  = "imagen-3.0-generate-001"
	geminiAPIBase = "https://generativelanguage.googleapis.com/v1beta/models"
)

var systemPrompt = `You are a pan-African marketing copywriter for small mobile-first merchants.
Generate campaign copy that feels authentic, local, and compelling for the merchant's target audience.
Return ONLY a valid JSON object with specific keys for different channels and tones:
- professional: A formal, professional message for mature social media or business context.
- hype: Call-to-action focused urgent deal message.
- sheng: Localized Slang/Sheng variation highly relatable to urban youth and community.
- sms: High-conversion direct message for WhatsApp/SMS (Keep under 160 chars if possible).
- ambassador_message: A warm, personalized message for a friend (Ambassador) to forward.
No markdown, no extra text — just the JSON.`

func geminiAPIKey() string {
	return os.Getenv("GEMINI_API_KEY")
}

// GenerateCampaignText calls Gemini 2.5 Flash and returns tone variants.
func GenerateCampaignText(text, bizName, bizType, brandKeywords string) (map[string]string, error) {
	var sb strings.Builder
	if bizName != "" {
		fmt.Fprintf(&sb, "Business: %s\n", bizName)
	}
	if bizType != "" {
		fmt.Fprintf(&sb, "Type: %s\n", bizType)
	}
	if brandKeywords != "" {
		fmt.Fprintf(&sb, "Brand keywords: %s\n", brandKeywords)
	}
	fmt.Fprintf(&sb, "\nProduct/Offer: %s\n\nGenerate 5 campaign variations as JSON:\n- professional: Formal & professional tone.\n- hype: Urgent, flash-sale tone.\n- sheng: Local street/sheng variation.\n- sms: Direct chat/SMS format.\n- ambassador_message: Friendly forwardable message.", text)

	reqBody := map[string]interface{}{
		"system_instruction": map[string]interface{}{
			"parts": []map[string]string{{"text": systemPrompt}},
		},
		"contents": []map[string]interface{}{
			{"role": "user", "parts": []map[string]string{{"text": sb.String()}}},
		},
		"generationConfig": map[string]interface{}{
			"response_mime_type": "application/json",
		},
	}

	raw, err := callGeminiREST(geminiModel+":generateContent", reqBody)
	if err != nil {
		fmt.Printf("Gemini API Error: %v\n", err)
		return fallbackVariants(text), nil
	}

	text2, err := extractGeminiText(raw)
	if err != nil {
		fmt.Printf("Gemini parse error: %v\n", err)
		return fallbackVariants(text), nil
	}

	var result map[string]string
	if err := json.Unmarshal([]byte(text2), &result); err != nil {
		fmt.Printf("Gemini JSON parse error: %v\n", err)
		return fallbackVariants(text), nil
	}
	return result, nil
}

// GenerateFlyer calls Imagen to generate a 1024x1024 promotional image.
func GenerateFlyer(prompt string) ([]byte, error) {
	reqBody := map[string]interface{}{
		"instances": []map[string]string{
			{"prompt": "A highly aesthetic, professional promotional flyer for a local African business: " + prompt},
		},
		"parameters": map[string]interface{}{
			"sampleCount":    1,
			"outputMimeType": "image/jpeg",
			"aspectRatio":    "1:1",
		},
	}

	raw, err := callGeminiREST(imagenModel+":predict", reqBody)
	if err != nil {
		fmt.Printf("Imagen Error: %v\n", err)
		return nil, err
	}

	var resp struct {
		Predictions []struct {
			BytesBase64Encoded string `json:"bytesBase64Encoded"`
		} `json:"predictions"`
	}
	if err := json.Unmarshal(raw, &resp); err != nil || len(resp.Predictions) == 0 {
		return nil, fmt.Errorf("no image generated")
	}
	return base64.StdEncoding.DecodeString(resp.Predictions[0].BytesBase64Encoded)
}

// GenerateCampaignFromImage uses Gemini vision to extract text from product images.
func GenerateCampaignFromImage(imageBytes []byte, mimeType string) (string, error) {
	b64 := base64.StdEncoding.EncodeToString(imageBytes)
	reqBody := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"role": "user",
				"parts": []interface{}{
					map[string]interface{}{
						"inline_data": map[string]string{
							"mime_type": mimeType,
							"data":      b64,
						},
					},
					map[string]string{
						"text": "This is a photo from a Kenyan market vendor. " +
							"Extract: product name, price if visible, and any phone numbers. " +
							"Return a single descriptive sentence suitable for a marketing campaign.",
					},
				},
			},
		},
	}

	raw, err := callGeminiREST(geminiModel+":generateContent", reqBody)
	if err != nil {
		fmt.Printf("Vision Error: %v\n", err)
		return "", err
	}
	return extractGeminiText(raw)
}

// callGeminiREST performs an HTTP POST to the Gemini REST API.
func callGeminiREST(endpoint string, body interface{}) ([]byte, error) {
	apiKey := geminiAPIKey()
	url := fmt.Sprintf("%s/%s?key=%s", geminiAPIBase, endpoint, apiKey)

	raw, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(url, "application/json", bytes.NewReader(raw))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("gemini API error %d: %s", resp.StatusCode, string(data))
	}
	return data, nil
}

// extractGeminiText pulls the text from a Gemini generateContent response.
func extractGeminiText(raw []byte) (string, error) {
	var resp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.Unmarshal(raw, &resp); err != nil {
		return "", err
	}
	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("empty gemini response")
	}
	return strings.TrimSpace(resp.Candidates[0].Content.Parts[0].Text), nil
}

func fallbackVariants(text string) map[string]string {
	t := strings.ToUpper(text)
	tc := toTitleCase(text)
	return map[string]string{
		"professional":       fmt.Sprintf("Dear valued customer, %s is now available. Visit us to purchase.", tc),
		"hype":               fmt.Sprintf("🔥🔥 FLASH DEAL!! %s grabbing fast! Limited stock! 📉", t),
		"sheng":              fmt.Sprintf("Eish fam! Ile %s imeland. Piga tizi ukuje ucheki 👊", text),
		"sms":                fmt.Sprintf("Hey fam! Fresh stock of %s arrived. WhatsApp order now! 📉", text),
		"ambassador_message": fmt.Sprintf("Guys! My friend at the shop has a crazy deal on %s. Check it out here: kua.link/amb-thandi 🔥", text),
	}
}

func toTitleCase(s string) string {
	if s == "" {
		return s
	}
	lower := strings.ToLower(s)
	return strings.ToUpper(lower[:1]) + lower[1:]
}
