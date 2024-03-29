package routes

import (
	"fmt"
	"log"
	"net/http"

	socketio "github.com/googollee/go-socket.io"
	"github.com/googollee/go-socket.io/engineio"
	"github.com/googollee/go-socket.io/engineio/transport"
	"github.com/googollee/go-socket.io/engineio/transport/polling"
	"github.com/googollee/go-socket.io/engineio/transport/websocket"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/net/context"
)

//SocketIOController Struct
type SocketIOController struct {
	db           *mongo.Database
	ctx          context.Context
	socketServer *socketio.Server
}

//NewSocketIOController returns a new SocketIOController Struct
func NewSocketIOController(ctx context.Context, db *mongo.Database) SocketIOController {
	server, err := socketio.NewServer(&engineio.Options{
		Transports: []transport.Transport{
			polling.Default,
			&websocket.Transport{
				CheckOrigin: func(r *http.Request) bool {
					return true
				},
			},
		},
	})

	if err != nil {
		log.Fatal(err)
	}
	return SocketIOController{db, ctx, server}
}

//SocketHandler returns a SocketHandler
func (sic SocketIOController) SocketHandler() *socketio.Server {
	fmt.Println("test1")
	sic.socketServer.OnConnect("/", func(s socketio.Conn) error {
		s.SetContext("")
		fmt.Println("connected:", s.RemoteHeader())
		return nil
	})
	sic.socketServer.OnEvent("/", "notice", func(s socketio.Conn, msg string) {
		fmt.Println("notice:", msg)
		s.Emit("reply", "have "+msg)
	})
	sic.socketServer.OnEvent("/chat", "msg", func(s socketio.Conn, msg string) string {
		s.SetContext(msg)
		return "recv " + msg
	})
	sic.socketServer.OnEvent("/", "bye", func(s socketio.Conn) string {
		last := s.Context().(string)
		s.Emit("bye", last)
		s.Close()
		return last
	})
	sic.socketServer.OnError("/", func(s socketio.Conn, e error) {
		fmt.Println("meet error:", e)
	})
	sic.socketServer.OnDisconnect("/", func(s socketio.Conn, reason string) {
		fmt.Println("closed", reason)
	})
	go sic.socketServer.Serve()
	defer sic.socketServer.Close()

	return sic.socketServer
}
