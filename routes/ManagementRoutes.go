package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"telexs/config"
	"telexs/models"
	"telexs/utils"

	"github.com/julienschmidt/httprouter"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

//ManagementController type
type ManagementController struct {
	db  *mongo.Database
	ctx context.Context
}

//NewManagementController returns ManagementController
func NewManagementController(ctx context.Context, db *mongo.Database) ManagementController {
	return ManagementController{
		db,
		ctx,
	}
}

//RunCommand runs a command and provides an output in form of string
func (mc ManagementController) RunCommand(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {

	logged, user := isLoggedIn(w, r, mc.db)

	if !logged {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var command models.Command
	err := json.NewDecoder(r.Body).Decode(&command)

	if err != nil {
		log.Println(err)
	}

	if !(utils.StringInSlice(command.DeviceID, user.Devices)) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	deviceObj, err := primitive.ObjectIDFromHex(command.DeviceID)
	if err != nil {
		log.Println(err)
	}

	result := mc.db.Collection("devices").FindOne(mc.ctx, bson.M{"_id": deviceObj})

	var device models.Device
	result.Decode(&device)

	bytePass, err := utils.Decrypt([]byte(config.Keys.DeviceKey), []byte(device.Password))
	if err != nil {
		log.Println(err)
	}
	fmt.Println(string(bytePass))
	output, err := utils.WriteConn(device.IPAddress, device.User, string(bytePass), utils.GetCommand(device, command.CMD))
	if err != nil {
		log.Println(err)
	}

	w.Header().Set("Content-Type", "text/plain")
	io.WriteString(w, output)
}
