package main

import (
	"bufio"
	"bytes"
	"crypto/ecdsa"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/big"
	"net/http"
	"os"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
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

func createWallet() *ecdsa.PrivateKey {
	privateKey, err := crypto.GenerateKey()
	if err != nil {
		log.Fatalf("Failed to generate private key: %v", err)
	}

	privateKeyBytes := crypto.FromECDSA(privateKey)
	fmt.Printf("New Wallet Private Key: %x\n", privateKeyBytes)

	publicAddress := crypto.PubkeyToAddress(privateKey.PublicKey)
	fmt.Println("Wallet Address:", publicAddress.Hex())

	return privateKey
}

func sendTransaction(privateKey *ecdsa.PrivateKey, toAddress string, amount *big.Int, rpcURL string) {
	nonce := uint64(0)                     // Should be the actual nonce of the account
	gasLimit := uint64(21000)              // Standard gas limit for simple transactions
	gasPrice := big.NewInt(10000000000000) // Gas price, should be fetched from the blockchain

	// Harmony Mainnet Chain ID
	chainID := big.NewInt(1666600000)

	// Convert toAddress from string to common.Address and get its pointer
	toAddr := common.HexToAddress(toAddress)

	// Construct the transaction data
	txData := &types.LegacyTx{
		Nonce:    nonce,
		To:       &toAddr,
		Value:    amount,
		Gas:      gasLimit,
		GasPrice: gasPrice,
		Data:     nil,
	}

	// Create transaction using NewTx
	tx := types.NewTx(txData)

	// Sign the transaction with the chain ID
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(chainID), privateKey)
	if err != nil {
		log.Fatalf("Failed to sign transaction: %v", err)
	}

	// Marshal transaction to RLP encoded form
	var buf bytes.Buffer
	signedTx.EncodeRLP(&buf)
	rawTx := buf.Bytes()

	// Send transaction via RPC
	payload := RPCPayload{
		Jsonrpc: "2.0",
		Method:  "eth_sendRawTransaction",
		Params:  []string{fmt.Sprintf("0x%x", rawTx)},
		ID:      1,
	}
	transactionHash := sendRPCRequest(payload, rpcURL)

	// Display the transaction hash
	fmt.Printf("Transaction submitted. Hash: %s\n", transactionHash)
}

func sendRPCRequest(payload RPCPayload, rpcURL string) string {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		fmt.Println("Error marshalling JSON:", err)
		return ""
	}

	resp, err := http.Post(rpcURL, "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		fmt.Println("Error making request:", err)
		return ""
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return ""
	}

	// Log the response for debugging
	fmt.Printf("RPC Response: %s\n", string(body))

	var rpcResponse map[string]interface{}
	if err := json.Unmarshal(body, &rpcResponse); err != nil {
		fmt.Println("Error unmarshalling response JSON:", err)
		return ""
	}

	// Extracting transaction hash from the response
	if hash, ok := rpcResponse["result"].(string); ok {
		return hash
	} else {
		if errorInfo, ok := rpcResponse["error"]; ok {
			fmt.Printf("Error in RPC response: %v\n", errorInfo)
		} else {
			fmt.Println("Transaction hash not found in RPC response.")
		}
	}

	return ""
}

func importWallet() *ecdsa.PrivateKey {
	reader := bufio.NewReader(os.Stdin)
	fmt.Println("Enter your private key:")
	privateKeyHex, _ := reader.ReadString('\n')
	privateKeyHex = strings.TrimSpace(privateKeyHex)

	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		log.Fatalf("Invalid private key: %v", err)
	}

	publicAddress := crypto.PubkeyToAddress(privateKey.PublicKey)
	fmt.Println("Wallet Address:", publicAddress.Hex())

	return privateKey
}

func main() {
	reader := bufio.NewReader(os.Stdin)
	var privateKey *ecdsa.PrivateKey
	var publicAddress common.Address

	for {
		fmt.Println("Choose an option:\n1) Import wallet\n2) Create new wallet")
		choice, _ := reader.ReadString('\n')
		choice = strings.TrimSpace(choice)

		switch choice {
		case "1":
			privateKey = importWallet()
			publicAddress = crypto.PubkeyToAddress(privateKey.PublicKey)
			break
		case "2":
			privateKey = createWallet()
			publicAddress = crypto.PubkeyToAddress(privateKey.PublicKey)
			break
		default:
			fmt.Println("Invalid choice")
			continue
		}
		break
	}

	for {
		fmt.Println("Choose an option:\n1) Send tokens\n2) Receive tokens\n3) Check balance")
		actionChoice, _ := reader.ReadString('\n')
		actionChoice = strings.TrimSpace(actionChoice)

		switch actionChoice {
		case "1":
			fmt.Println("Enter destination address:")
			toAddress, _ := reader.ReadString('\n')
			toAddress = strings.TrimSpace(toAddress)

			fmt.Println("Enter amount of ONE to send:")
			var amount big.Int
			amountStr, _ := reader.ReadString('\n')
			amount.SetString(strings.TrimSpace(amountStr), 10)

			rpcURL := "https://api.s0.t.hmny.io"
			sendTransaction(privateKey, toAddress, &amount, rpcURL)
		case "2":
			fmt.Println("Your address to receive tokens:", publicAddress.Hex())
		case "3":
			rpcURL := "https://api.s0.t.hmny.io"
			CheckBalance(publicAddress.Hex(), rpcURL)
		default:
			fmt.Println("Invalid choice")
			continue
		}

		fmt.Println("Do you want to perform another action? (yes/no)")
		anotherAction, _ := reader.ReadString('\n')
		if strings.TrimSpace(anotherAction) != "yes" {
			break
		}
	}
}
