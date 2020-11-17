package utils

import (
	"crypto/tls"
	"encoding/xml"
	"log"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"telexs/config"
	"telexs/models"

	"golang.org/x/crypto/ssh"
)

var (
	sshConn = map[string]*ssh.Client{}
	mu      sync.Mutex
)

func GetDeviceCPU(Device models.Device, c chan string) {
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
			c <- "0"
			return
		}
		xml.NewDecoder(response.Body).Decode(&resp)
		if len(resp.CPULoadAverage.Entry) > 0 {
			c <- resp.CPULoadAverage.Entry[1].Value
			return
		}
		c <- "0"
		return
	case "Checkpoint", "CHECKPOINT", "checkpoint":
		CPU, err := writeConn(Device.IPAddress, "admin", "admin123", "cpstat os -f perf", "CPU Usage (%): ", " CPU Queue Length:")
		if err != nil {
			log.Println(err)
			c <- "0"
			return
		}
		c <- CPU
		return
	default:
		c <- "0"
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
			c <- "0,0,0"
			return
		}
		err1 := xml.NewDecoder(response.Body).Decode(&resp)
		if err1 != nil {
			log.Println(err)
			c <- "0,0,0"
			return
		}
		space := regexp.MustCompile(`\s+`)
		Line := space.ReplaceAllString(resp.Result, " ")
		Words := strings.Split(after(Line, "KiB Mem :"), " ")
		if len(Words) > 0 {
			c <- between(Line, "up ", ", ") + "," + Words[1] + "," + between(Line, "free, ", " used,")
			return
		}
		c <- "0,0,0"
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

func createConn(user string, pass string, host string) (*ssh.Client, error) {
	config := &ssh.ClientConfig{
		User: user,
		Auth: []ssh.AuthMethod{
			ssh.Password(pass),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}
	conn, err := ssh.Dial("tcp", host+":22", config)
	if err != nil {
		return nil, err
	}
	return conn, err
}

func writeConn(deviceIP string, username, pass, cmd, btw1, btw2 string) (string, error) {
	if _, ok := sshConn[deviceIP]; ok {
		sess, err := sshConn[deviceIP].NewSession()
		if err != nil {
			log.Printf("%s Trying to connect again", err)
			mu.Lock()
			sshConn[deviceIP], err = createConn(username, pass, deviceIP)
			mu.Unlock()
			if err != nil {
				return "0", err
			}
			sess, err = sshConn[deviceIP].NewSession()
		}
		if err != nil {
			return "0", err
		}
		defer sess.Close()
		bs, err := sess.Output(cmd)
		space := regexp.MustCompile(`\s+`)
		CPU := space.ReplaceAllString(string(bs), " ")
		return between(CPU, btw1, btw2), nil
	}

	var err error
	mu.Lock()
	sshConn[deviceIP], err = createConn(username, pass, deviceIP)
	mu.Unlock()
	if err != nil {
		return "0", err
	}
	sess, err := sshConn[deviceIP].NewSession()
	if err != nil {
		return "0", err
	}
	defer sess.Close()
	// modes := ssh.TerminalModes{
	// 	ssh.ECHO:          0,     // disable echoing
	// 	ssh.TTY_OP_ISPEED: 14400, // input speed = 14.4kbaud
	// 	ssh.TTY_OP_OSPEED: 14400, // output speed = 14.4kbaud
	// }

	// if err := sess.RequestPty("xterm", 80, 40, modes); err != nil {
	// 	log.Fatal(err)
	// }
	bs, err := sess.Output(cmd)
	space := regexp.MustCompile(`\s+`)
	CPU := space.ReplaceAllString(string(bs), " ")
	return between(CPU, btw1, btw2), nil
}
