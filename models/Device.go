package models

//Device model
type Device struct {
	HostName  string `json:"hostName"`
	IPAddress string `json:"ipAddress"`
	Type      string `json:"type"`
	Vendor    string `json:"vendor"`
	Model     string `json:"model"`
	Version   string `json:"version"`
	EOL       string `json:"EOL"`
	EOS       string `json:"EOS"`
}
