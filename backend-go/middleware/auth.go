package middleware

import (
	"context"
	"crypto/rsa"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserClaimsKey contextKey = "user_claims"

var devClaims = jwt.MapClaims{
	"sub":   "dev_user_mock_id",
	"email": "dev@kua.local",
	"phone": "+254700000000",
}

func isDevMode() bool {
	return strings.ToLower(os.Getenv("DEV_MODE")) != "false"
}

// RequireAuth is a middleware that validates a Clerk RS256 JWT.
// In DEV_MODE with no CLERK_JWT_KEY configured, it injects a mock user.
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		clerkKey := os.Getenv("CLERK_JWT_KEY")

		// Dev bypass — no Clerk key configured
		if clerkKey == "" {
			if isDevMode() {
				fmt.Println("⚠️  DEV_MODE: No CLERK_JWT_KEY set. Using mock user for local testing.")
				ctx := context.WithValue(r.Context(), UserClaimsKey, devClaims)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}
			http.Error(w, `{"detail":"Clerk authentication is not configured on the server."}`, http.StatusInternalServerError)
			return
		}

		// Extract Bearer token
		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, `{"detail":"Authorization token missing."}`, http.StatusUnauthorized)
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		// Parse PEM public key
		rsaKey, err := parseRSAPublicKey(clerkKey)
		if err != nil {
			fmt.Printf("Failed to parse Clerk JWT key: %v\n", err)
			if isDevMode() {
				fmt.Println("⚠️  DEV_MODE: JWT key parse failed, falling back to mock user.")
				ctx := context.WithValue(r.Context(), UserClaimsKey, devClaims)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}
			http.Error(w, `{"detail":"Server JWT configuration error."}`, http.StatusInternalServerError)
			return
		}

		// Validate JWT
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return rsaKey, nil
		}, jwt.WithoutClaimsValidation())

		if err != nil || !token.Valid {
			fmt.Printf("JWT Verification failed: %v\n", err)
			if isDevMode() {
				fmt.Println("⚠️  DEV_MODE: JWT failed, falling back to mock user.")
				ctx := context.WithValue(r.Context(), UserClaimsKey, devClaims)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}
			http.Error(w, `{"detail":"Could not validate credentials"}`, http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["sub"] == nil {
			http.Error(w, `{"detail":"Token has no user identifier (sub)."}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserClaimsKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetClaims retrieves JWT claims from the request context.
func GetClaims(r *http.Request) jwt.MapClaims {
	claims, _ := r.Context().Value(UserClaimsKey).(jwt.MapClaims)
	return claims
}

// GetClerkID returns the "sub" claim from the JWT context.
func GetClerkID(r *http.Request) string {
	claims := GetClaims(r)
	if claims == nil {
		return ""
	}
	sub, _ := claims["sub"].(string)
	return sub
}

func parseRSAPublicKey(keyStr string) (*rsa.PublicKey, error) {
	// Unescape \n if stored as literal string in env vars
	keyStr = strings.ReplaceAll(keyStr, `\n`, "\n")
	key, err := jwt.ParseRSAPublicKeyFromPEM([]byte(keyStr))
	if err != nil {
		return nil, fmt.Errorf("failed to parse RSA public key: %w", err)
	}
	return key, nil
}
