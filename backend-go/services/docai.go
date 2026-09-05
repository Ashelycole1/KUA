package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

// OCRImage sends the image to Google Document AI and returns extracted text.
// Returns empty string if DocAI is not configured (caller falls back to Gemini vision).
func OCRImage(imageBytes []byte, mimeType string) string {
	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	processorID := os.Getenv("DOCAI_PROCESSOR_ID")

	if projectID == "" || processorID == "" || projectID == "your_gcp_project_id" {
		return ""
	}

	// Use Application Default Credentials token
	token, err := getGCPAccessToken()
	if err != nil {
		fmt.Printf("DocAI: failed to get GCP token: %v\n", err)
		return ""
	}

	apiURL := fmt.Sprintf(
		"https://documentai.googleapis.com/v1/projects/%s/locations/us/processors/%s:process",
		projectID, processorID,
	)

	reqBody := map[string]interface{}{
		"rawDocument": map[string]string{
			"content":  base64.StdEncoding.EncodeToString(imageBytes),
			"mimeType": mimeType,
		},
	}
	raw, err := json.Marshal(reqBody)
	if err != nil {
		return ""
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewReader(raw))
	if err != nil {
		return ""
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Printf("DocAI Error: %v\n", err)
		return ""
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		fmt.Printf("DocAI Error %d: %s\n", resp.StatusCode, string(body))
		return ""
	}

	var result struct {
		Document struct {
			Text string `json:"text"`
		} `json:"document"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return ""
	}
	return result.Document.Text
}

// getGCPAccessToken retrieves an access token using the GCP metadata server
// (works on Cloud Run, GKE, Compute Engine) or GOOGLE_ACCESS_TOKEN env var.
func getGCPAccessToken() (string, error) {
	// Allow override for local dev
	if tok := os.Getenv("GOOGLE_ACCESS_TOKEN"); tok != "" {
		return tok, nil
	}

	req, err := http.NewRequest("GET",
		"http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Metadata-Flavor", "Google")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("metadata server unavailable (not on GCP?): %w", err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var tok struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.Unmarshal(body, &tok); err != nil || tok.AccessToken == "" {
		return "", fmt.Errorf("could not parse access token")
	}
	return tok.AccessToken, nil
}
