package models

//Event Model
type Event struct {
	EventName string      `json:"eventName"`
	Payload   interface{} `json:"payload"`
}
