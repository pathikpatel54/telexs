package models

//DeviceStats model
type DeviceStats struct {
	Status    bool   `json:"status"`
	AvgCPU    int    `json:"avgCPU"`
	AvgMemory int    `json:"avgMemory"`
	UpTime    string `json:"upTime"`
}
