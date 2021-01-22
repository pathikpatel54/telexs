package utils

import (
	"crypto/rand"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

//RandNum generates random number of n char length
func RandNum(n int) string {
	b := make([]byte, n)

	if _, err := rand.Read(b); err != nil {
		panic(err)
	}

	return string(b)
}

//StringInSlice checks if slice contains a string
func StringInSlice(a string, list []interface{}) bool {
	for _, b := range list {
		if b.(primitive.ObjectID).Hex() == a {
			return true
		}
	}
	return false
}
