package config

import (
	"os"
)

//Vars struct
type vars struct {
	GoogleClientID     string
	GoogleClientSecret string
	MongodbUser        string
}

//Keys contains evironment variables
var Keys = func() vars {
	if os.Getenv("GO_ENV") == "production" {
		return prodKeys
	}
	return devKeys
}()
