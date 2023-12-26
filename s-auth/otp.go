package main

import (
	"fmt"
)

// func generateSecretKey(length int) (string, error) {
// 	randomBytes := make([]byte, (length*5+7)/8)
// 	_, err := rand.Read(randomBytes)
// 	if err != nil {
// 		return "", err
// 	}
// 	return base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(randomBytes)[:length], nil
// }

// func getCounter() int {
// 	var currentTime = time.Now().Unix()
// 	var originTime = 0
// 	var interval = 30
// 	counterValue := int((currentTime - int64(originTime)) / int64(interval))
// 	return counterValue
// }

// func generateHash(base32Key string, counter int64) ([]byte, error) {
// 	key, err := base32.StdEncoding.DecodeString(base32Key)
// 	if err != nil {
// 		return nil, err
// 	}
// 	counterBytes := []byte(fmt.Sprintf("%d", counter))
// 	h := hmac.New(sha256.New, key)
// 	h.Write(counterBytes)
// 	hash := h.Sum(nil)

// 	return hash, nil
// }

// func generateOTP() {
// 	secretKey, err := generateSecretKey(10)
// 	var counter = getCounter()
// 	hash, err := generateHash(secretKey, counter)
// 	if err != nil {
// 		fmt.Println("Error:", err)
// 		return
// 	}
// 	return hash
// }

func main() {
	var OTPcode = "123456"
	var UserCode string

	fmt.Println(getCounter())
	fmt.Printf("Your OTP Code is: %s", OTPcode)
	fmt.Print("Enter OPT Code: ")
	fmt.Scan(&UserCode)

	if UserCode == OTPcode {
		fmt.Print("OTP code is correct.")
	} else {
		fmt.Print("Incorrect OTP code.")
	}
}
