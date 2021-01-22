package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

//Device model
type Device struct {
	ID        primitive.ObjectID `json:"objectID" bson:"_id,omitempty"`
	HostName  string             `json:"hostName"`
	IPAddress string             `json:"ipAddress"`
	Port      string             `json:"port"`
	User      string             `json:"user"`
	Password  string             `json:"password,omitempty"`
	Type      string             `json:"type"`
	Vendor    string             `json:"vendor"`
	Model     string             `json:"model"`
	Version   string             `json:"version"`
	EOL       time.Time          `json:"eol"`
	EOS       time.Time          `json:"eos"`
}

// //DevicePass model with Password
// type DevicePass struct {
// 	Device
// 	User     string `json:"user"`
// 	Password string `json:"password"`
// }
