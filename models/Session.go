package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

//Session Model
type Session struct {
	ID        primitive.ObjectID `json:"objectID" bson:"_id"`
	SessionID string             `json:"sessionid"`
	Email     string             `json:"email"`
	Expires   time.Time          `json:"expires"`
}
