package utils

import (
	"crypto/tls"
	"encoding/xml"
	"log"
	"net/http"
	"strconv"
	"telexs/config"
	"telexs/models"
)

func GetDeviceCPU(Device models.Device, c chan int) {
	switch Device.Vendor {
	case "PA":
		var resp struct {
			CPULoadAverage struct {
				Text  string `xml:",chardata"`
				Entry []struct {
					Text   string `xml:",chardata"`
					Coreid string `xml:"coreid"`
					Value  string `xml:"value"`
				} `xml:"entry"`
			} `xml:"result>resource-monitor>data-processors>dp0>minute>cpu-load-average"`
		}
		http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
		url := "https://" +
			Device.IPAddress +
			config.Keys.PaloAltoURI +
			"<show><running><resource-monitor><minute><last>1</last></minute></resource-monitor></running></show>&key=" +
			config.Keys.PaloAltoKey
		response, err := http.Get(url)
		if err != nil {
			log.Println(err)
		}
		xml.NewDecoder(response.Body).Decode(&resp)
		// mu.Lock()
		// validation[device] = models.DeviceStats{
		// 	Status: true,
		// 	AvgCPU:
		// }
		// mu.Unlock()

		CPU, err := strconv.Atoi(resp.CPULoadAverage.Entry[1].Value)

		if err != nil {
			log.Println(err)
		}
		c <- CPU
		return
	default:
		return
	}
}
