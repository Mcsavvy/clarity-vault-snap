# VaultSnap
A secure image storage platform built on Stacks blockchain using Clarity smart contracts.

## Features
- Store image metadata on-chain 
- Control access to images through ownership tokens
- Transfer image ownership between users
- View image metadata and ownership history

## Setup and Installation
1. Clone the repository
2. Install Clarinet
3. Run `clarinet check` to verify contracts
4. Run `clarinet test` to execute test suite

## Usage Examples
```clarity
;; Store new image metadata
(contract-call? .vault-snap store-image "QmHash123" "My Image" "image/jpeg")

;; Transfer image ownership
(contract-call? .vault-snap transfer-image u1 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Get image metadata
(contract-call? .vault-snap get-image-info u1)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
