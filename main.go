package main

import (
	"context"
	"log"
	"net/http"
	"telexs/routes"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/julienschmidt/httprouter"
)

func main() {
	router := httprouter.New()

	ac := routes.NewAuthController(getMongoClient())

	router.GET("/auth/google", ac.Login)
	router.GET("/auth/google/callback", ac.Callback)
	router.GET("/api/user", ac.User)
	router.GET("/api/logout", ac.Logout)

	err := http.ListenAndServe(":8080", router)

	if err != nil {
		log.Panic(err)
	}
}

func getMongoClient() (context.Context, *mongo.Client) {
	ctx := context.TODO()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(
		"mongodb://pathik:V1qAUg8sSzICUG9q@go-node-shard-00-00.s1mpt.mongodb.net:27017,go-node-shard-00-01.s1mpt.mongodb.net:27017,go-node-shard-00-02.s1mpt.mongodb.net:27017/db?ssl=true&replicaSet=atlas-i8t0aw-shard-0&authSource=admin&retryWrites=true&w=majority",
	))

	if err != nil {
		panic(err)
	}

	return ctx, client
}
