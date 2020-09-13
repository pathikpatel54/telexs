package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"telexs/config"
	"telexs/models"
	"time"

	"github.com/julienschmidt/httprouter"
	uuid "github.com/satori/go.uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

//AuthController struct
type AuthController struct {
	db  *mongo.Database
	ctx context.Context
}

//NewAuthController Generates Authcontroller struct
func NewAuthController(ctx context.Context, db *mongo.Database) AuthController {
	return AuthController{db, ctx}
}

var (
	googleOauthConfig *oauth2.Config
	oauthstate        string
)

func init() {
	googleOauthConfig = &oauth2.Config{
		RedirectURL:  "http://localhost:3000/auth/google/callback",
		ClientID:     config.Keys.GoogleClientID,
		ClientSecret: config.Keys.GoogleClientSecret,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"},
		Endpoint:     google.Endpoint,
	}
}

//Login route to catch /auth/google
func (ac AuthController) Login(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	logged, _ := isLoggedIn(w, r, ac.db)

	if logged {
		http.Redirect(w, r, "/api/user", http.StatusSeeOther)
	}

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

//User route to fetch User information in JSON
func (ac AuthController) User(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	logged, user := isLoggedIn(w, r, ac.db)

	if !logged {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&user)
}

//Logout route to log user out.
func (ac AuthController) Logout(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	logged, user := isLoggedIn(w, r, ac.db)
	if !logged {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	result, err := ac.db.Collection("sessions").DeleteMany(ac.ctx, bson.M{"email": user.Email})

	if err != nil {
		log.Println("Error Deleting session")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	fmt.Println(result.DeletedCount)
	http.SetCookie(w, &http.Cookie{
		Name:   "session",
		MaxAge: -1,
		Path:   "/",
	})

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
		Name:     "session",
		Value:    sID.String(),
		MaxAge:   30 * 24 * 60 * 60,
		SameSite: 2,
		Path:     "/",
		HttpOnly: true,
	})
	user.ID = primitive.NewObjectIDFromTimestamp(time.Now())

	_, err := ac.db.Collection("users").UpdateOne(ac.ctx, bson.M{"googleid": user.GoogleID}, bson.M{
		"$setOnInsert": user,
	})

	if err != nil {
		log.Printf("%s", err)
	}

	_, err1 := ac.db.Collection("sessions").UpdateOne(ac.ctx, bson.M{"email": user.Email}, bson.M{
		"$set": bson.M{
			"sessionid": sID.String(),
			"expires":   time.Now().Add(time.Second * 24 * 60 * 60),
		},
	})

	if err1 != nil {
		log.Printf("%s", err1)
	}

}

func isLoggedIn(w http.ResponseWriter, r *http.Request, db *mongo.Database) (bool, models.User) {
	cookie, err := r.Cookie("session")

	if err != nil {
		log.Println("Error retreiving Cookie")
		return false, models.User{}
	}

	var user models.User
	var session models.Session

	err1 := db.Collection("sessions").FindOne(context.TODO(), bson.M{"sessionid": cookie.Value}).Decode(&session)

	if err1 != nil {
		log.Println("Error retreiving Session")
		return false, models.User{}
	}

	if time.Now().After(session.Expires) {
		http.SetCookie(w, &http.Cookie{
			Name:   "session",
			Path:   "/",
			MaxAge: -1,
		})
		db.Collection("sessions").DeleteMany(context.TODO(), bson.M{"email": user.Email})
		return false, models.User{}
	}

	err2 := db.Collection("users").FindOne(context.TODO(), bson.M{"email": session.Email}).Decode(&user)

	if err2 != nil {
		log.Println("Error retreiving User")
		return false, models.User{}
	}

	return true, user
}
