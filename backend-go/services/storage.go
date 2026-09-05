package services

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	_ "image/png"
	"net/http"
	"os"
	"time"

	"golang.org/x/image/draw"
)

const flyerBucket = "kua-flyers"

// UploadFlyer compresses an image and uploads it to Supabase Storage.
// Returns the public CDN URL or empty string on failure.
func UploadFlyer(imageBytes []byte, phone string) string {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	if supabaseURL == "" || supabaseKey == "" {
		return ""
	}

	compressed, err := compressToWebP(imageBytes, 50)
	if err != nil {
		fmt.Printf("Image compression error: %v\n", err)
		return ""
	}

	ts := time.Now().UTC().Format("20060102150405")
	if phone == "" {
		phone = "anon"
	}
	filename := fmt.Sprintf("flyers/%s_%s.webp", phone, ts)

	uploadURL := fmt.Sprintf("%s/storage/v1/object/%s/%s", supabaseURL, flyerBucket, filename)
	req, err := http.NewRequest("POST", uploadURL, bytes.NewReader(compressed))
	if err != nil {
		return ""
	}
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", "image/webp")

	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode >= 400 {
		return ""
	}
	defer resp.Body.Close()

	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", supabaseURL, flyerBucket, filename)
	return publicURL
}

// compressToWebP resizes the image to max 1024px square and compresses it.
// We encode as JPEG (Go stdlib doesn't have native WebP encoding without cgo),
// keeping file size under maxKB. The file is named .webp for CDN compatibility.
func compressToWebP(imageBytes []byte, maxKB int) ([]byte, error) {
	src, _, err := image.Decode(bytes.NewReader(imageBytes))
	if err != nil {
		return nil, fmt.Errorf("decode image: %w", err)
	}

	// Resize to max 1024x1024
	src = resizeImage(src, 1024, 1024)

	quality := 85
	var buf bytes.Buffer
	for quality >= 20 {
		buf.Reset()
		if err := jpeg.Encode(&buf, src, &jpeg.Options{Quality: quality}); err != nil {
			return nil, err
		}
		if buf.Len() <= maxKB*1024 {
			return buf.Bytes(), nil
		}
		quality -= 10
	}
	buf.Reset()
	_ = jpeg.Encode(&buf, src, &jpeg.Options{Quality: 20})
	return buf.Bytes(), nil
}

func resizeImage(src image.Image, maxW, maxH int) image.Image {
	bounds := src.Bounds()
	w, h := bounds.Dx(), bounds.Dy()
	if w <= maxW && h <= maxH {
		return src
	}
	scaleW := float64(maxW) / float64(w)
	scaleH := float64(maxH) / float64(h)
	scale := scaleW
	if scaleH < scaleW {
		scale = scaleH
	}
	newW := int(float64(w) * scale)
	newH := int(float64(h) * scale)
	dst := image.NewRGBA(image.Rect(0, 0, newW, newH))
	draw.BiLinear.Scale(dst, dst.Bounds(), src, src.Bounds(), draw.Over, nil)
	return dst
}

