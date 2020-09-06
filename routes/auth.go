package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"telexs/config"
	"telexs/models"

	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/julienschmidt/httprouter"
	uuid "github.com/satori/go.uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

//AuthController struct
type AuthController struct {
	client *mongo.Client
	ctx    context.Context
}

//NewAuthController Generates Authcontroller struct
func NewAuthController(ctx context.Context, c *mongo.Client) AuthController {
	return AuthController{client: c, ctx: ctx}
}

var (
	googleOauthConfig *oauth2.Config
	oauthstate        string
)

func init() {
	googleOauthConfig = &oauth2.Config{
		RedirectURL:  "http://dev.telexs.in/auth/google/callback",
		ClientID:     config.Keys.GoogleClientID,
		ClientSecret: config.Keys.GoogleClientSecret,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
		Endpoint:     google.Endpoint,
	}
}

//Index route
func (ac AuthController) Index(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	resp := `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Document</title>
	</head>
	<body>
		<a href="/auth/google">
		Sign-in with Google
		</a>
	</body>
	</html>`

	logged, user := isLoggedIn(r, ac)

	if logged {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}

	io.WriteString(w, resp)

}

//Login route to catch /auth/google
func (ac AuthController) Login(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	oauthstate = "pseudoerandomnum"

	url := googleOauthConfig.AuthCodeURL(oauthstate)

	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

//Callback route to catch callback to /auth/google/callback after oauth flow
func (ac AuthController) Callback(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	content, err := getUserInfo(r.FormValue("state"), r.FormValue("code"))

	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	generateSession(content, w, r, ac)

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func getUserInfo(state string, code string) ([]byte, error) {
	if state != oauthstate {
		fmt.Println(oauthstate)
		return nil, fmt.Errorf("Oauth State does not match")
	}

	token, err := googleOauthConfig.Exchange(oauth2.NoContext, code)

	if err != nil {
		return nil, fmt.Errorf("Coud not generate token")
	}

	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)

	if err != nil {
		return nil, fmt.Errorf("Request to get user details failed")
	}

	defer response.Body.Close()

	contents, err := ioutil.ReadAll(response.Body)

	if err != nil {
		return nil, fmt.Errorf("failed reading response body: %s", err.Error())
	}
	return contents, nil
}

func generateSession(content []byte, w http.ResponseWriter, r *http.Request, ac AuthController) {
	var user models.User

	json.Unmarshal(content, &user)

	sID := uuid.NewV4()
	http.SetCookie(w, &http.Cookie{
		Name:   "session",
		Value:  sID.String(),
		MaxAge: 5000,
		Path:   "/",
	})
	t := true
	ac.client.Database("db").Collection("users").UpdateOne(ac.ctx, bson.M{"email": user.Email}, &bson.M{
		"$set": &user,
	}, &options.UpdateOptions{Upsert: &t})

	ac.client.Database("db").Collection("sessions").UpdateOne(ac.ctx, bson.M{"email": user.Email}, &bson.M{
		"$set": &models.Session{
			Email:     user.Email,
			SessionID: sID.String(),
		},
	}, &options.UpdateOptions{Upsert: &t})

}

func isLoggedIn(r *http.Request, ac AuthController) (bool, models.User) {
	cookie, err := r.Cookie("session")

	if err != nil {
		log.Println("Error retreiving Cookie")
		return false, models.User{}
	}

	var user models.User
	var session models.Session

	err1 := ac.client.Database("db").Collection("session").FindOne(ac.ctx, bson.M{"sessionid": cookie.Value}).Decode(&session)

	if err1 != nil {
		log.Println("Error retreiving Session")
		return false, models.User{}
	}

	err2 := ac.client.Database("db").Collection("session").FindOne(ac.ctx, bson.M{"email": session.Email}).Decode(&user)

	if err2 != nil {
		log.Println("Error retreiving User")
		return false, models.User{}
	}

	return true, user
}
