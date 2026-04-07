package store

import (
	"context"

	"github.com/mibk/dali"
)

func InTx(ctx context.Context, db *dali.DB, fn func(tx *dali.Tx) error) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	if err := fn(tx); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}
