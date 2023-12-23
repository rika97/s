## Signature Proofs

Signature proofs serve as a secure method to authenticate transactions between the source and destination chains. When a user initiates a deposit transaciton in the source contract, this action triggers the recording of transaction details by relayer, an off chain entity. The relayer is entrusted with a private key corresponding to `trustedSigner` address pre-designated in the contracts. Utilizing this private key, the relayer generates a digital signature over the transaction details, encompassing elements like the user's address, deposit amount, and transaction hash.

Upon initiating a withdrawl on the destination chain, users submit this digital signature as part of their transaction. The destination contract's `withdraw` method includs logic to validate this signature against the stored public key of the `trustedSigner`. This verification ensures that the withdrawl request is legitimate and corresponds to a verified depoist on the source chain. Only upon the successful validation does the contract process the withdrawl, thereby establishing a secure and authenticated bridge between the two chains.

## Exploring Merkle Tree Option: Pros and Cons
The use of Merkle Tree presents an alternative (or complementary) method for verifying cross-chain transactions. Below are the pros and cons of implementing Merkle Trees in the context of the bridge:

### Pros
1. **Efficient Verification**: Merkle Trees enable efficient and secure verification of individual transactions without needing the entire block data, reducing on-chain processing and storage requirements.
2. **Decentralization and Trustlessness**: By relying on cryptographic proofs derived from blockchain data itself, Merkle Trees can enhance the decentralization and trustlessness on the bridge, reducing reliance on external validators or relayers.
3. **Batch Processing** : Merkle Trees are conducive to batch processing, allowing the aggregation of multiple transactions into a single proof, which can be efficient for high-volume bridges. 

### Cons
1. **Complexity**: Implementing Merkle Tree proofs require a more complex setup both on-chain and off-chain compared to straighforward signature-based methods.
2. **Latency in Proof availability**: Building and verifying Merkle Proofs can introduce latency, as proofs can only be generated after transaciton inclusion in a block, and my require additional block confirmations for security.
3. **Resource Intensity**: While more efficient than processing entire blocks, maintaining and verifying Merkle Trees still require resources that might be substantial for light clients.

The initial implementation will employ signature proofs for a streamlined, simple, yet secure setup. As development progresses, the integration of Merkle Trees will be further explored and evaluated.