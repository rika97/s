package main

import (
	"crypto/ecdsa"
	"crypto/rand"
	"testing"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/stretchr/testify/require"
)

func TestCreateWallet(t *testing.T) {
	privateKey := createWallet()

	// Check if privateKey is not nil
	require.NotNil(t, privateKey, "Private key should not be nil")

	// Convert the ECDSA private key to bytes
	privateKeyBytes := crypto.FromECDSA(privateKey)

	// Check if the private key has the correct length
	require.Equal(t, len(privateKeyBytes), 32, "Private key should be 32 bytes long")

	// Check if the privateKey is a valid ECDSA private key
	_, _, err := ecdsa.Sign(rand.Reader, privateKey, crypto.Keccak256([]byte("test message")))
	require.NoError(t, err, "Failed to sign with the private key: %v", err)
}
