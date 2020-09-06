package config

import (
	"os"
)

var prodKeys = vars{
	GoogleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
	GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
	MongodbUser:        os.Getenv("MONGODB_USER"),
}
