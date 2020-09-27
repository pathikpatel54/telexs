package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"telexs/models"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/gobwas/ws"
	"github.com/julienschmidt/httprouter"
	"go.mongodb.org/mongo-driver/mongo"
)

type socketConn struct {
	conn net.Conn
}

var sockets = map[string]socketConn{}
var devices = map[string]int{}

//SocketController struct
type SocketController struct {
	db  *mongo.Database
	ctx context.Context
}

//NewSocketController returns SocketController
func NewSocketController(ctx context.Context, db *mongo.Database) SocketController {
	return SocketController{db, ctx}
}

//CheckDeviceStatus route
func (sc SocketController) CheckDeviceStatus(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {

	logged, user := isLoggedIn(w, r, sc.db)

	if !logged {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	cookie, err := r.Cookie("session")

	fmt.Println(user, cookie)

	if err != nil {
		fmt.Println(err)
	}

	conn, _, _, err := ws.UpgradeHTTP(r, w)

	if err != nil {
		fmt.Println(err)
	}

	socket := socketConn{conn}

	go func() {
		defer conn.Close()

		for {
			event, header := socket.Read()

			switch event.EventName {

			case "subscribe":
				sockets[cookie.Value] = socket

				for _, val := range user.Devices {
					devices[val.(primitive.ObjectID).Hex()]++
				}

				socket.Emit("You have subscribed", header)
				fmt.Println(sockets)
				fmt.Println(devices)

			case "unsubscribe":
				if _, ok := sockets[cookie.Value]; ok {
					delete(sockets, cookie.Value)
				}

				for _, val := range user.Devices {
					if _, ok := devices[val.(primitive.ObjectID).Hex()]; ok {
						fmt.Println("Code GOt here")
						devices[val.(primitive.ObjectID).Hex()]--
						if devices[val.(primitive.ObjectID).Hex()] <= 0 {
							delete(devices, val.(primitive.ObjectID).Hex())
						}
					}
				}

				socket.Emit("You have unsubscribed", header)
				fmt.Println(sockets)
				fmt.Println(devices)

			default:
				socket.Emit("Unrecognized Event", header)

			}

			if header.OpCode == ws.OpClose || header.OpCode == 0 {

				fmt.Println("Close test")

				if _, ok := sockets[cookie.Value]; ok {
					delete(sockets, cookie.Value)
				}

				return
			}
		}
	}()
}

func (s socketConn) Read() (models.Event, ws.Header) {

	header, err := ws.ReadHeader(s.conn)
	if err != nil {
		// handle error
	}

	payload := make([]byte, header.Length)
	_, err = io.ReadFull(s.conn, payload)

	if err != nil {
		// handle error
	}
	if header.Masked {
		ws.Cipher(payload, header.Mask, 0)
	}

	// Reset the Masked flag, server frames must not be masked as
	// RFC6455 says.
	header.Masked = false

	var event models.Event

	json.Unmarshal(payload, &event)

	return event, header
}

func (s socketConn) Emit(payload string, header ws.Header) {

	serverPayload := []byte(payload)
	serverHeader := header
	serverHeader.Length = int64(int(len(serverPayload)))

	if err := ws.WriteHeader(s.conn, serverHeader); err != nil {
		log.Println(err)
	}

	if _, err := s.conn.Write(serverPayload); err != nil {
		log.Println(err)
	}
}
