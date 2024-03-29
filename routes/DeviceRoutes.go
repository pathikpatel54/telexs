package routes

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"telexs/config"
	"telexs/models"
	"telexs/utils"
	"time"

	"github.com/julienschmidt/httprouter"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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

	err := json.NewDecoder(r.Body).Decode(&NewDevice)
	encPass, err := utils.Encrypt([]byte(config.Keys.DeviceKey), []byte(NewDevice.Password))

	if err != nil {
		log.Println(err)
	}

	ctPassword := NewDevice.Password
	NewDevice.Password = string(encPass)
	NewDevice.ID = primitive.NewObjectIDFromTimestamp(time.Now())

	if err != nil {
		log.Panic(err)
	}

	t := true
	result := dc.db.Collection("devices").FindOneAndUpdate(dc.ctx, bson.M{"ipaddress": NewDevice.IPAddress}, bson.M{
		"$setOnInsert": NewDevice,
	}, &options.FindOneAndUpdateOptions{Upsert: &t})

	result.Decode(&AddedDevice)

	if AddedDevice.ID == primitive.NilObjectID {
		_, err := dc.db.Collection("users").UpdateOne(dc.ctx, bson.M{"_id": user.ID}, bson.M{"$addToSet": bson.M{
			"devices": NewDevice.ID,
		},
		})

		if err != nil {
			log.Panic(err)
		}
		json.NewEncoder(w).Encode(&NewDevice)
		return
	}
	devPass, err := utils.Decrypt([]byte(config.Keys.DeviceKey), []byte(AddedDevice.Password))
	if err != nil {
		log.Println(err)
	}

	if string(devPass) == ctPassword {
		_, err1 := dc.db.Collection("users").UpdateOne(dc.ctx, bson.M{"_id": user.ID}, bson.M{"$addToSet": bson.M{
			"devices": AddedDevice.ID,
		},
		})

		if err1 != nil {
			log.Panic(err)
		}
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(&AddedDevice)
		return
	}
	w.WriteHeader(http.StatusUnauthorized)
	return
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
		device.Password = ""
		devices = append(devices, device)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&devices)
	return
}

//ModifyDevice route
func (dc DeviceController) ModifyDevice(w http.ResponseWriter, r *http.Request, p httprouter.Params) {

	logged, user := isLoggedIn(w, r, dc.db)

	if !logged {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if !(utils.StringInSlice(p.ByName("id"), user.Devices)) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var ModifiedDevice models.Device

	json.NewDecoder(r.Body).Decode(&ModifiedDevice)

	encPass, err := utils.Encrypt([]byte(config.Keys.DeviceKey), []byte(ModifiedDevice.Password))

	if err != nil {
		log.Println(err)
	}

	ModifiedDevice.Password = string(encPass)

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
	return
}

//DeleteDevice route
func (dc DeviceController) DeleteDevice(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	logged, user := isLoggedIn(w, r, dc.db)

	if !logged {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if !(utils.StringInSlice(p.ByName("id"), user.Devices)) {
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
	return
}
