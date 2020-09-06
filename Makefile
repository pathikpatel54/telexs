build:
	go build -o server main.go

run: 
	go run main.go

watch:
	concurrently "fresh main.go" "npm start --prefix client"