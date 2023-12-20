package main

import "fmt"

func main() {
	var OTPcode = "123456"
	var UserCode string

	fmt.Printf("OTP Code: %s", OTPcode)
	fmt.Print("Enter OPT Code:")
	fmt.Scan(&UserCode)

	if UserCode == OTPcode {
		fmt.Print("OTP code is correct")
	} else {
		fmt.Print("Incorrect OTP code")
	}
}
