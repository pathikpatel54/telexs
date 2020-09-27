package models

//Event Model
type Event struct {
	EventName string `json:"eventName"`
	Payload   struct {
		A int `json:"a"`
	} `json:"payload"`
}
