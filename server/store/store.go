package store

import (
	_ "github.com/go-sql-driver/mysql"
	"github.com/mibk/dali"
)

type Store struct {
	DB *dali.DB
}

func New(dsn string) (*Store, error) {
	db, err := dali.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return &Store{DB: db}, nil
}
