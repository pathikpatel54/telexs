package utils

import "telexs/models"

func GetCommand(device models.Device, cmd string) string {
	switch device.Vendor {
	case "PA", "PaloAlto":
		if cmd == "getinterfaces" {
			return "show interface all"
		} else if cmd == "getroutes" {
			return "show routing route"
		} else if cmd == "sysinfo" {
			return "show system info"
		}
		return ""
	case "Checkpoint", "CheckPoint":
		if cmd == "getinterfaces" {
			return "clish -c \"show interfaces all\""
		} else if cmd == "getroutes" {
			return "clish -c \"show route\""
		} else if cmd == "sysinfo" {
			return "clish -c \"show assets all\""
		}
		return ""
	default:
		return ""
	}
}
