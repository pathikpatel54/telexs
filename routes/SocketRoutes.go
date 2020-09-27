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

	"github.com/gobwas/ws"
	"github.com/julienschmidt/httprouter"
	"go.mongodb.org/mongo-driver/mongo"
)

type socketConn struct {
	conn net.Conn
}

type sockets map[string]socketConn

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
				socket.Write([]byte("You have subscribed"), header)
			case "unsubscribe":
				socket.Write([]byte("You have unsubscribed"), header)
			default:
				socket.Write([]byte("Unrecognized Event"), header)
			}

			if header.OpCode == ws.OpClose || header.OpCode == 0 {
				fmt.Println("Close test")
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

func (s socketConn) Write(payload []byte, header ws.Header) {

	serverHeader := header
	serverHeader.Length = int64(len(payload))

	if err := ws.WriteHeader(s.conn, serverHeader); err != nil {
		log.Println(err)
	}

	if _, err := s.conn.Write(payload); err != nil {
		log.Println(err)
	}
}
