package model

import (
	"encoding/json"
	"time"
)

type SurveyParticipant struct {
	ID            uint             `db:"id,selectonly" json:"id"`
	SurveyID      uint             `db:"survey_id" json:"surveyId"`
	UserID        uint             `db:"user_id" json:"userId"`
	Role          string           `db:"role" json:"role"`
	IntakeData    *json.RawMessage `db:"intake_data" json:"intakeData,omitempty"`
	PrivacyChoice *string          `db:"privacy_choice" json:"privacyChoice,omitempty"`
	InvitedBy     *uint            `db:"invited_by" json:"invitedBy,omitempty"`
	JoinedAt      time.Time        `db:"joined_at,selectonly" json:"joinedAt"`
	CompletedAt   *time.Time       `db:"completed_at" json:"completedAt,omitempty"`
}
