package store

import (
	"context"

	"github.com/pdrhlik/edemos/server/model"
)

func (s *Store) JoinSurvey(ctx context.Context, p *model.SurveyParticipant) error {
	q := s.DB.Query(`INSERT INTO survey_participant ?values`, p)
	_, err := q.Exec()
	return err
}

func (s *Store) IsParticipant(ctx context.Context, surveyID, userID uint) (bool, error) {
	var count int
	q := s.DB.Query(`SELECT COUNT(*) FROM survey_participant WHERE survey_id = ? AND user_id = ?`, surveyID, userID)
	if err := q.ScanRow(&count); err != nil {
		return false, err
	}
	return count > 0, nil
}
