package store

import (
	"context"

	"github.com/pdrhlik/edemos/server/model"
)

func (s *Store) CreateResponse(ctx context.Context, resp *model.Response) error {
	q := s.DB.Query(`INSERT INTO response ?values`, resp)
	_, err := q.Exec()
	return err
}

func (s *Store) GetVoteProgress(ctx context.Context, surveyID, userID uint) (model.VoteProgress, error) {
	var p model.VoteProgress
	q := s.DB.Query(`
		SELECT
			(SELECT COUNT(*) FROM response r
				JOIN statement s ON s.id = r.statement_id
				WHERE s.survey_id = ? AND r.user_id = ?) AS voted,
			(SELECT COUNT(*) FROM statement
				WHERE survey_id = ? AND status = 'approved') AS total`,
		surveyID, userID, surveyID)
	if err := q.ScanRow(&p.Voted, &p.Total); err != nil {
		return p, err
	}
	return p, nil
}

func (s *Store) GetStatementSurveyID(ctx context.Context, statementID uint) (uint, error) {
	var surveyID uint
	q := s.DB.Query(`SELECT survey_id FROM statement WHERE id = ?`, statementID)
	if err := q.ScanRow(&surveyID); err != nil {
		return 0, err
	}
	return surveyID, nil
}
