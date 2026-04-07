package handler

import (
	"net/http"

	"github.com/pdrhlik/edemos/server/identity"
	"github.com/pdrhlik/edemos/server/model"
)

func (h *Handler) ListStatements() AppHandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) error {
		surveyID, err := parseIDParam(r, "id")
		if err != nil {
			return writeError(w, http.StatusBadRequest, "invalid survey id")
		}

		items, err := h.Store.ListStatementsBySurvey(r.Context(), surveyID, "approved")
		if err != nil {
			return err
		}
		return writeJSON(w, http.StatusOK, items)
	}
}

func (h *Handler) AddSeedStatement() AppHandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) error {
		surveyID, err := parseIDParam(r, "id")
		if err != nil {
			return writeError(w, http.StatusBadRequest, "invalid survey id")
		}

		user := identity.GetUserFromContext(r.Context())

		// Verify user is survey admin
		participant, err := h.Store.GetParticipant(r.Context(), surveyID, user.ID)
		if err != nil {
			return err
		}
		if participant == nil || participant.Role != "admin" {
			return writeError(w, http.StatusForbidden, "only survey admins can add seed statements")
		}

		var in model.CreateStatementRequest
		if err := parseJSON(r, &in); err != nil {
			return writeError(w, http.StatusBadRequest, "invalid request body")
		}

		if in.Text == "" {
			return writeError(w, http.StatusBadRequest, "text is required")
		}

		// Validate character limits
		survey, err := h.Store.GetSurvey(r.Context(), surveyID)
		if err != nil {
			return err
		}
		textLen := uint(len([]rune(in.Text)))
		if textLen < survey.StatementCharMin || textLen > survey.StatementCharMax {
			return writeError(w, http.StatusBadRequest, "statement text length out of range")
		}

		st := &model.Statement{
			SurveyID: surveyID,
			Text:     in.Text,
			Type:     "seed",
			Status:   "approved",
			AuthorID: &user.ID,
		}

		id, err := h.Store.CreateStatement(r.Context(), st)
		if err != nil {
			return err
		}
		st.ID = id

		return writeJSON(w, http.StatusCreated, st)
	}
}

func (h *Handler) SubmitStatement() AppHandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) error {
		surveyID, err := parseIDParam(r, "id")
		if err != nil {
			return writeError(w, http.StatusBadRequest, "invalid survey id")
		}

		user := identity.GetUserFromContext(r.Context())

		// Verify user is participant
		isParticipant, err := h.Store.IsParticipant(r.Context(), surveyID, user.ID)
		if err != nil {
			return err
		}
		if !isParticipant {
			return writeError(w, http.StatusForbidden, "must be a participant to submit statements")
		}

		survey, err := h.Store.GetSurvey(r.Context(), surveyID)
		if err != nil {
			return err
		}
		if survey.Status != "active" {
			return writeError(w, http.StatusBadRequest, "survey is not active")
		}

		var in model.CreateStatementRequest
		if err := parseJSON(r, &in); err != nil {
			return writeError(w, http.StatusBadRequest, "invalid request body")
		}

		if in.Text == "" {
			return writeError(w, http.StatusBadRequest, "text is required")
		}

		textLen := uint(len([]rune(in.Text)))
		if textLen < survey.StatementCharMin || textLen > survey.StatementCharMax {
			return writeError(w, http.StatusBadRequest, "statement text length out of range")
		}

		st := &model.Statement{
			SurveyID: surveyID,
			Text:     in.Text,
			Type:     "user_submitted",
			Status:   "pending",
			AuthorID: &user.ID,
		}

		id, err := h.Store.CreateStatement(r.Context(), st)
		if err != nil {
			return err
		}
		st.ID = id

		return writeJSON(w, http.StatusCreated, st)
	}
}

func (h *Handler) GetNextStatement() AppHandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) error {
		surveyID, err := parseIDParam(r, "id")
		if err != nil {
			return writeError(w, http.StatusBadRequest, "invalid survey id")
		}

		user := identity.GetUserFromContext(r.Context())

		survey, err := h.Store.GetSurvey(r.Context(), surveyID)
		if err != nil {
			return err
		}
		if survey == nil {
			return writeError(w, http.StatusNotFound, "survey not found")
		}

		st, err := h.Store.GetNextStatement(r.Context(), surveyID, user.ID, survey.StatementOrder)
		if err != nil {
			return err
		}
		if st == nil {
			w.WriteHeader(http.StatusNoContent)
			return nil
		}

		return writeJSON(w, http.StatusOK, st)
	}
}
