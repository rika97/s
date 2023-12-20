package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

// RPCPayload represents the JSON payload for the RPC request
type RPCPayload struct {
	Jsonrpc string   `json:"jsonrpc"`
	Method  string   `json:"method"`
	Params  []string `json:"params"`
	ID      int      `json:"id"`
}

// RPCResponse represents the JSON response from the RPC request
type RPCResponse struct {
	Result string `json:"result"`
}

// CheckBalance makes an HTTP POST request to the given RPC URL with the address
func CheckBalance(address string, rpcURL string) {
	payload := RPCPayload{
		Jsonrpc: "2.0",
		Method:  "hmy_getBalance",
		Params:  []string{address, "latest"},
		ID:      1,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		fmt.Println("Error marshalling JSON:", err)
		return
	}

	resp, err := http.Post(rpcURL, "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		fmt.Println("Error making request:", err)
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}

	var rpcResponse RPCResponse
	if err := json.Unmarshal(body, &rpcResponse); err != nil {
		fmt.Println("Error unmarshalling response JSON:", err)
		return
	}

	fmt.Println("Balance:", rpcResponse.Result)
}

func main() {
	address := "0xb5B353B145F95d0ca364d92aEA24514f6352f5DF"
	rpcURL := "https://api.s0.t.hmny.io"

	CheckBalance(address, rpcURL)
}
