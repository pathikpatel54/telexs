package routes

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"telexs/models"
	"time"

	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/julienschmidt/httprouter"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

//DeviceController struct
type DeviceController struct {
	db  *mongo.Database
	ctx context.Context
}

//NewDeviceController returns DeviceController struct
func NewDeviceController(ctx context.Context, db *mongo.Database) DeviceController {
	return DeviceController{db, ctx}
}

//AddDevice route
func (dc DeviceController) AddDevice(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	logged, user := isLoggedIn(w, r, dc.db)

	if !logged {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var NewDevice, AddedDevice models.Device
	NewDevice.ID = primitive.NewObjectIDFromTimestamp(time.Now())

	err := json.NewDecoder(r.Body).Decode(&NewDevice)

	if err != nil {
		log.Panic(err)
	}

	t := true

	result := dc.db.Collection("devices").FindOneAndUpdate(dc.ctx, bson.M{"ipaddress": NewDevice.IPAddress}, bson.M{
		"$setOnInsert": NewDevice,
	}, &options.FindOneAndUpdateOptions{Upsert: &t})

	if err != nil {
		log.Panic(err)
	}

	result.Decode(&AddedDevice)

	user.Devices = append(user.Devices, AddedDevice.ID)

	_, err1 := dc.db.Collection("users").UpdateOne(dc.ctx, bson.M{"_id": user.ID}, bson.M{"$set": &user})

	if err1 != nil {
		log.Panic(err)
	}
}

//GetDevices route
func (dc DeviceController) GetDevices(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {

	logged, user := isLoggedIn(w, r, dc.db)

	if !logged {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	cur, err := dc.db.Collection("devices").Find(dc.ctx, bson.M{"_id": bson.M{"$in": user.Devices}})

	if err != nil {
		log.Panic(err)
	}

	var devices = []models.Device{}

	for cur.Next(dc.ctx) {
		var device = models.Device{}
		cur.Decode(&device)

		devices = append(devices, device)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&devices)
}

//ModifyDevice route
func (dc DeviceController) ModifyDevice(w http.ResponseWriter, r *http.Request, p httprouter.Params) {

	logged, user := isLoggedIn(w, r, dc.db)

	if !logged {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var ModifiedDevice models.Device

	json.NewDecoder(r.Body).Decode(&ModifiedDevice)
	ModifiedDevice.ID = primitive.ObjectID{}

	for _, ObjID := range user.Devices {
		if ObjID.(primitive.ObjectID).Hex() == p.ByName("id") {
			result, err := dc.db.Collection("devices").UpdateOne(dc.ctx, bson.M{"_id": ObjID.(primitive.ObjectID)}, bson.M{
				"$set": ModifiedDevice,
			})
			if err != nil {
				log.Printf("%s 115", err)
				return
			}
			if result.ModifiedCount >= 1 {
				w.WriteHeader(http.StatusOK)
				return
			}
		}
	}

	w.WriteHeader(http.StatusUnauthorized)
}

//DeleteDevice route
func (dc DeviceController) DeleteDevice(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	logged, user := isLoggedIn(w, r, dc.db)

	if !logged {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	ID, err := primitive.ObjectIDFromHex(p.ByName("id"))

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("%s", err)
		return
	}

	DeleteResult, err := dc.db.Collection("devices").DeleteOne(dc.ctx, bson.M{"_id": ID})

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("%s", err)
		return
	}

	UpdateResult, err := dc.db.Collection("users").UpdateOne(dc.ctx, bson.M{"_id": user.ID}, bson.M{
		"$pull": bson.M{"devices": ID},
	})

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("%s", err)
		return
	}

	if (DeleteResult.DeletedCount == 1) && (UpdateResult.ModifiedCount == 1) {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.WriteHeader(http.StatusBadRequest)
}
