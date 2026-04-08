package config

import (
	"log"
	"os"
)

type Config struct {
	DBDSN        string
	JWTSecret    string
	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPassword string
	SMTPFrom     string
	BaseURL      string
	ServeWebsite bool
	WebsitePath  string
}

func Load() Config {
	websitePath := os.Getenv("WEBSITE_PATH")
	if websitePath == "" {
		websitePath = "website/dist"
	}

	c := Config{
		DBDSN:        os.Getenv("DB_DSN"),
		JWTSecret:    os.Getenv("JWT_SECRET"),
		SMTPHost:     os.Getenv("SMTP_HOST"),
		SMTPPort:     os.Getenv("SMTP_PORT"),
		SMTPUser:     os.Getenv("SMTP_USER"),
		SMTPPassword: os.Getenv("SMTP_PASSWORD"),
		SMTPFrom:     os.Getenv("SMTP_FROM"),
		BaseURL:      os.Getenv("BASE_URL"),
		ServeWebsite: os.Getenv("SERVE_WEBSITE") == "true",
		WebsitePath:  websitePath,
	}
	if c.DBDSN == "" {
		log.Fatal("Set DB_DSN env to start server")
	}
	if c.JWTSecret == "" {
		log.Fatal("Set JWT_SECRET env to start server")
	}
	return c
}
