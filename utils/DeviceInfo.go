package utils

import (
	"crypto/tls"
	"encoding/xml"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
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

		CPU, err := strconv.Atoi(resp.CPULoadAverage.Entry[1].Value)

		if err != nil {
			log.Println(err)
		}
		c <- CPU
		return
	default:
		c <- 0
		return
	}
}

func GetDeviceMemUp(Device models.Device, c chan string) {
	switch Device.Vendor {
	case "PA":
		var resp struct {
			Result string `xml:"result"`
		}
		http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
		url := "https://" +
			Device.IPAddress +
			config.Keys.PaloAltoURI +
			"<show><system><resources></resources></system></show>&key=" +
			config.Keys.PaloAltoKey
		response, err := http.Get(url)
		if err != nil {
			log.Println(err)
		}
		xml.NewDecoder(response.Body).Decode(&resp)
		space := regexp.MustCompile(`\s+`)
		Line := space.ReplaceAllString(resp.Result, " ")
		c <- between(Line, "up ", ", ") + "," + strings.Split(after(Line, "KiB Mem :"), " ")[1] + "," + between(Line, "free, ", " used,")
		return
	default:
		c <- "0,0,0"
		return
	}
}

func between(value string, a string, b string) string {
	// Get substring between two strings.
	posFirst := strings.Index(value, a)
	if posFirst == -1 {
		return ""
	}
	posLast := strings.Index(value, b)
	if posLast == -1 {
		return ""
	}
	posFirstAdjusted := posFirst + len(a)
	if posFirstAdjusted >= posLast {
		return ""
	}
	return value[posFirstAdjusted:posLast]
}

func after(value string, a string) string {
	// Get substring after a string.
	pos := strings.LastIndex(value, a)
	if pos == -1 {
		return ""
	}
	adjustedPos := pos + len(a)
	if adjustedPos >= len(value) {
		return ""
	}
	return value[adjustedPos:len(value)]
}
