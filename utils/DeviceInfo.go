package utils

import (
	"bytes"
	"fmt"
	"log"
	"regexp"
	"strings"
	"sync"
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
		CPU, err := writeConn(Device.IPAddress, "admin", "Panos@123", "show running resource-monitor second last 1")
		if err != nil {
			log.Println(err)
			c <- "0"
			return
		}
		cpusl := strings.Split(between(CPU, "core ", " Resource utilization"), " ")
		if len(cpusl) > 1 && len(cpusl)%2 == 0 {
			cpu1 := cpusl[(len(cpusl)/2)+1]
			c <- cpu1
			return
		}
		c <- ""
		return
	case "Checkpoint", "CHECKPOINT", "checkpoint":
		CPU, err := writeConn(Device.IPAddress, "admin", "admin123", "cpstat os -f perf")
		if err != nil {
			log.Println(err)
			c <- "0"
			return
		}
		c <- between(CPU, "CPU Usage (%): ", " CPU Queue Length:")
		return
	default:
		c <- "0"
		return
	}
}

func GetDeviceMemUp(Device models.Device, c chan string) {
	switch Device.Vendor {
	case "PA":
		Mem, err := writeConn(Device.IPAddress, "admin", "Panos@123", "show system resources")
		if err != nil {
			log.Println(err)
			c <- "0,0,0"
			return
		}
		c <- between(Mem, "up ", ", ") + "," + strings.Split(after(Mem, "KiB Mem :"), " ")[1] + "," + between(Mem, "free, ", " used,")
		return
	case "Checkpoint", "CHECKPOINT", "checkpoint":
		Mem, err := writeConn(Device.IPAddress, "admin", "admin123", "cpstat os -f perf\nuptime")
		if err != nil {
			log.Println(err)
			c <- "0,0,0"
			return
		}
		c <- strings.Split(after(Mem, "up "), ", ")[0] + "," + between(Mem, "Total Real Memory (Bytes): ", " Active Real Memory (Bytes):") + "," + between(Mem, "Free Real Memory (Bytes): ", " Memory Swaps/Sec:")
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
	lenv := len(value)
	adjustedPos := pos + len(a)
	if adjustedPos >= len(value) {
		return ""
	}
	return value[adjustedPos:lenv]
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

func writeConn(deviceIP string, username, pass, cmd string) (string, error) {
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

		stdin, err := sess.StdinPipe()
		if err != nil {
			log.Fatal(err)
		}

		var b bytes.Buffer
		sess.Stdout = &b

		err = sess.Shell()
		if err != nil {
			log.Fatal(err)
		}
		_, err = fmt.Fprintf(stdin, "%s\nexit\n", cmd)
		if err != nil {
			log.Fatal(err)
		}

		err = sess.Wait()
		if err != nil {
			log.Fatal(err)
		}

		space := regexp.MustCompile(`\s+`)
		str := space.ReplaceAllString(b.String(), " ")
		return str, nil
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

	stdin, err := sess.StdinPipe()
	if err != nil {
		log.Fatal(err)
	}

	var b bytes.Buffer
	sess.Stdout = &b

	err = sess.Shell()
	if err != nil {
		log.Fatal(err)
	}
	_, err = fmt.Fprintf(stdin, "%s\nexit\n", cmd)
	if err != nil {
		log.Fatal(err)
	}

	err = sess.Wait()
	if err != nil {
		log.Fatal(err)
	}

	space := regexp.MustCompile(`\s+`)
	str := space.ReplaceAllString(b.String(), " ")
	return str, nil
}
