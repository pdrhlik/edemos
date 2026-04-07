package identity

import "context"

type ctxKey int

const (
	ctxUser ctxKey = 1
)

type User struct {
	ID   uint
	Role string
}

func ContextWithUser(ctx context.Context, user *User) context.Context {
	return context.WithValue(ctx, ctxUser, user)
}

func GetUserFromContext(ctx context.Context) *User {
	user, _ := ctx.Value(ctxUser).(*User)
	return user
}
