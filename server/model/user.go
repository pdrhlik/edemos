package model

import (
	"encoding/json"
	"time"
)

type User struct {
	ID                uint       `db:"id,selectonly" json:"id"`
	OrganizationID    *uint      `db:"organization_id" json:"organizationId,omitempty"`
	Email             string     `db:"email" json:"email"`
	PasswordHash      string     `db:"password_hash" json:"-"`
	Name              string     `db:"name" json:"name"`
	Locale            string     `db:"locale" json:"locale"`
	Role              string     `db:"role" json:"role"`
	EmailVerifiedAt   *time.Time `db:"email_verified_at" json:"-"`
	NotificationPrefs *string    `db:"notification_prefs" json:"-"`
	CreatedAt         time.Time  `db:"created_at,selectonly" json:"createdAt"`
	UpdatedAt         time.Time  `db:"updated_at,selectonly" json:"updatedAt"`
}

func (u User) EmailVerified() bool {
	return u.EmailVerifiedAt != nil
}

// MarshalJSON includes the computed emailVerified field.
func (u User) MarshalJSON() ([]byte, error) {
	type Alias User
	return json.Marshal(&struct {
		Alias
		EmailVerified bool `json:"emailVerified"`
		HasPassword   bool `json:"hasPassword"`
	}{
		Alias:         Alias(u),
		EmailVerified: u.EmailVerified(),
		HasPassword:   u.PasswordHash != "",
	})
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Locale   string `json:"locale"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
