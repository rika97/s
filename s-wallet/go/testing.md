Test Cases
1. checkAndApproveGnosisSafeTransactions
- [ ] Test connection failure to the Harmony client.
- [ ] Test failure in creating an authorized transactor.
- [ ] Test user input handling ("yes" and "no" responses).
- [ ] Test the actual transaction approval logic (will require mocking).

2. CheckBalance
- [ ] Test successful balance check.
- [ ] Test failure in marshalling JSON.
- [ ] Test HTTP request failure.
- [ ] Test failure in reading the response body.
- [ ] Test failure in unmarshalling the response JSON.
- [ ] Test correct handling of the response data.

3. createWallet
- [ ] Test successful wallet creation.
- [ ] Test failure in generating a private key.

4. sendTransaction
- [ ] Test successful transaction sending.
- [ ] Test failure in transaction signing.
- [ ] Test failure in sending RPC request.

5. sendRPCRequest
- [ ] Test successful RPC request.
- [ ] Test failure in marshalling JSON.
- [ ] Test HTTP request failure.
- [ ] Test failure in reading the response body.
- [ ] Test failure in unmarshalling the response JSON.
- [ ] Test error handling in RPC response.

6. importWallet
- [ ] Test successful wallet import.
- [ ] Test failure in importing with an invalid private key.

Main Function (Integration Tests)
- [ ] Test each menu choice handling.
- [ ] Test the flow of user choices and actions.