package models

import "go.mongodb.org/mongo-driver/bson/primitive"

//User struct
type User struct {
	ID            primitive.ObjectID `json:"objectID" bson:"_id"`
	GoogleID      string             `json:"id"`
	Email         string             `json:"email"`
	VerifiedEmail bool               `json:"verified_email"`
	Name          string             `json:"name"`
	GivenName     string             `json:"given_name"`
	FamilyName    string             `json:"family_name"`
	Picture       string             `json:"picture"`
	Locale        string             `json:"locale"`
	Devices       []DBRef            `json:"devices"`
}
