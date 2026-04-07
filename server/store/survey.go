package store

import (
	"context"

	"github.com/mibk/dali"
	"github.com/pdrhlik/edemos/server/model"
)

func (s *Store) CreateSurvey(ctx context.Context, survey *model.Survey) (uint, error) {
	q := s.DB.Query(`INSERT INTO survey ?values`, survey)
	res, err := q.Exec()
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}

func (s *Store) GetSurvey(ctx context.Context, id uint) (*model.Survey, error) {
	return queryOne[model.Survey](s.DB.Query(`SELECT * FROM survey WHERE id = ?`, id))
}

func (s *Store) ListSurveysByUser(ctx context.Context, userID uint) ([]model.SurveyListItem, error) {
	items := make([]model.SurveyListItem, 0)
	q := s.DB.Query(`
		SELECT s.id, s.title, s.status, sp.role, s.created_at
		FROM survey s
		JOIN survey_participant sp ON sp.survey_id = s.id
		WHERE sp.user_id = ?
		ORDER BY s.created_at DESC`, userID)
	if err := q.All(&items); err != nil {
		return nil, err
	}
	return items, nil
}

func (s *Store) UpdateSurvey(ctx context.Context, id uint, fields dali.Map) error {
	q := s.DB.Query(`UPDATE survey ?set WHERE id = ?`, fields, id)
	_, err := q.Exec()
	return err
}

func (s *Store) AddParticipant(ctx context.Context, p *model.SurveyParticipant) error {
	q := s.DB.Query(`INSERT INTO survey_participant ?values`, p)
	_, err := q.Exec()
	return err
}

func (s *Store) GetParticipant(ctx context.Context, surveyID, userID uint) (*model.SurveyParticipant, error) {
	return queryOne[model.SurveyParticipant](s.DB.Query(
		`SELECT * FROM survey_participant WHERE survey_id = ? AND user_id = ?`, surveyID, userID))
}
