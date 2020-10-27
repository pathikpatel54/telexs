package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"sync"
	"telexs/models"
	"telexs/utils"
	"time"

	"github.com/gobwas/ws"
	"github.com/julienschmidt/httprouter"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type socketConn struct {
	conn    net.Conn
	header  ws.Header
	devices []interface{}
}

var (
	mu         sync.Mutex
	sockets    = map[string]socketConn{}
	devices    = map[string]int{}
	validation = map[string]models.DeviceStats{}
)

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
		io.WriteString(w, "You are not authorized to make this connection")
		return
	}

	cookie, err := r.Cookie("session")

	if err != nil {
		log.Println(err)
	}

	conn, _, _, err := ws.UpgradeHTTP(r, w)

	if err != nil {
		log.Println(err)
	}

	socket := socketConn{conn, ws.Header{}, user.Devices}

	go func() {
		defer conn.Close()

		for {
			event, header := socket.Read()
			socket.header = header

			switch event.EventName {
			case "subscribe":
				for _, val := range user.Devices {
					if _, ok := sockets[cookie.Value]; !ok {
						devices[val.(primitive.ObjectID).Hex()]++
					}
				}

				sockets[cookie.Value] = socket
				socket.Emit("subEvent", "You have subscribed")
				fmt.Println(sockets, devices)

			case "unsubscribe":
				for _, val := range user.Devices {
					if _, ok := devices[val.(primitive.ObjectID).Hex()]; ok {
						devices[val.(primitive.ObjectID).Hex()]--
						if devices[val.(primitive.ObjectID).Hex()] <= 0 {
							delete(devices, val.(primitive.ObjectID).Hex())
						}
					}
				}

				if _, ok := sockets[cookie.Value]; ok {
					delete(sockets, cookie.Value)
				}

				socket.Emit("subEvent", "You have unsubscribed")
				fmt.Println(sockets, devices)

			default:
				socket.Emit("subEvent", "Unrecognized Event")

			}

			if header.OpCode == ws.OpClose || header.OpCode == 0 {
				fmt.Println("Closing socket")
				for _, val := range user.Devices {
					if _, ok := devices[val.(primitive.ObjectID).Hex()]; ok {
						devices[val.(primitive.ObjectID).Hex()]--
						if devices[val.(primitive.ObjectID).Hex()] <= 0 {
							delete(devices, val.(primitive.ObjectID).Hex())
						}
					}
				}

				if _, ok := sockets[cookie.Value]; ok {
					delete(sockets, cookie.Value)
				}

				fmt.Println(sockets, devices)
				return
			}
		}
	}()
}

func (s socketConn) Read() (models.Event, ws.Header) {
	header, err := ws.ReadHeader(s.conn)

	if err != nil {
		log.Println(err)
	}

	payload := make([]byte, header.Length)
	_, err = io.ReadFull(s.conn, payload)

	if err != nil {
		log.Println(err)
	}

	if header.Masked {
		ws.Cipher(payload, header.Mask, 0)
	}

	header.Masked = false
	var event models.Event
	json.Unmarshal(payload, &event)

	return event, header
}

func (s socketConn) Emit(EventName string, Payload interface{}) {
	var event = models.Event{
		EventName: EventName,
		Payload:   Payload,
	}

	emitMessage, err := json.Marshal(event)

	if err != nil {
		log.Println(err)
	}

	s.header.Length = int64(int(len(emitMessage)))

	if err := ws.WriteHeader(s.conn, s.header); err != nil {
		log.Println(err)
	}

	if _, err := s.conn.Write(emitMessage); err != nil {
		log.Println(err)
	}
}

//SendSocket returns data to socket after validation
func (sc SocketController) SendSocket() {
	ticker := time.NewTicker(1 * time.Second)
	quit := make(chan struct{})
	go func() {
		for {
			select {

			case <-ticker.C:
				for _, socket := range sockets {
					var message = map[string]models.DeviceStats{}
					for _, device := range socket.devices {
						mu.Lock()
						message[device.(primitive.ObjectID).Hex()] = validation[device.(primitive.ObjectID).Hex()]
						mu.Unlock()
					}
					socket.Emit("deviceStatus", message)
				}

			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()
}

//ValidateDevice returns data to socket after validation
func (sc SocketController) ValidateDevice() {
	ticker := time.NewTicker(1 * time.Second)
	quit := make(chan struct{})
	go func() {
		for {
			select {
			case <-ticker.C:

				for device := range devices {
					go func(device string) {
						var resultDevice models.Device
						ID, err := primitive.ObjectIDFromHex(device)

						if err != nil {
							log.Println(err)
						}

						result := sc.db.Collection("devices").FindOne(sc.ctx, bson.M{"_id": ID})
						result.Decode(&resultDevice)

						if _, err := net.DialTimeout("tcp",
							resultDevice.IPAddress+":"+resultDevice.Port, 1*time.Second); err != nil {
							mu.Lock()
							validation[device] = models.DeviceStats{
								Status:    false,
								AvgCPU:    0,
								AvgMemory: 0,
								UpTime:    "0",
							}
							log.Println(err)
							mu.Unlock()
							return
						}
						CPUChan := make(chan int)
						MemChan := make(chan int)
						go utils.GetDeviceCPU(resultDevice, CPUChan)
						go utils.GetDeviceMem(resultDevice, MemChan)
						AvgCPU := <-CPUChan
						AvgMem := <-MemChan
						fmt.Println(DeviceInfo)
					}(device)
				}

			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()
}

//SocketCheck checks the status of socket every minute
func (sc SocketController) SocketCheck() {
	ticker := time.NewTicker(1 * time.Minute)
	quit := make(chan struct{})
	go func() {
		for {
			select {

			case <-ticker.C:
				for _, socket := range sockets {
					socket.Emit("socketStatus", "ping")
				}

			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()
}

//Test function
// func (sc SocketController) Test() {
// 	c := pango.Firewall{Client: pango.Client{
// 		Hostname: "192.168.1.200",
// 		Username: "admin",
// 		Password: "Panos@123",
// 		Logging:  pango.LogAction | pango.LogOp,
// 	}}
// 	if err := c.Initialize(); err != nil {
// 		log.Printf("Failed to initialize client: %s", err)
// 		return
// 	}
// 	log.Printf("Initialize ok")

// 	fmt.Println(c.SystemInfo)
// }
