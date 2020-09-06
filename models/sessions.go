package models

import (
	"time"
)

//Session Model
type Session struct {
	SessionID string    `json:"sessionid"`
	Email     string    `json:"email"`
	Expires   time.Time `json:"expires"`
}
