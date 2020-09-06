package utils

import (
	"crypto/rand"
)

//RandNum generates random number of n char length
func RandNum(n int) string {
	b := make([]byte, n)

	if _, err := rand.Read(b); err != nil {
		panic(err)
	}

	return string(b)
}
