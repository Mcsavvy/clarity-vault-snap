;; VaultSnap - Secure Image Storage Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-owner (err u100))
(define-constant err-image-not-found (err u101))
(define-constant err-unauthorized (err u102))

;; Data Variables
(define-data-var next-image-id uint u1)

;; Define non-fungible token type for images
(define-non-fungible-token image uint)

;; Image data structure
(define-map image-metadata uint {
  ipfs-hash: (string-ascii 64),
  name: (string-ascii 64), 
  mime-type: (string-ascii 32),
  owner: principal,
  created-at: uint
})

;; Store new image
(define-public (store-image (ipfs-hash (string-ascii 64)) (name (string-ascii 64)) (mime-type (string-ascii 32)))
  (let 
    ((image-id (var-get next-image-id)))
    (try! (nft-mint? image image-id tx-sender))
    (map-set image-metadata image-id {
      ipfs-hash: ipfs-hash,
      name: name,
      mime-type: mime-type,
      owner: tx-sender,
      created-at: block-height
    })
    (var-set next-image-id (+ image-id u1))
    (ok image-id)
  )
)

;; Transfer image ownership
(define-public (transfer-image (image-id uint) (recipient principal))
  (let ((image-data (unwrap! (map-get? image-metadata image-id) err-image-not-found)))
    (asserts! (is-eq tx-sender (get owner image-data)) err-unauthorized)
    (try! (nft-transfer? image image-id tx-sender recipient))
    (map-set image-metadata image-id (merge image-data {owner: recipient}))
    (ok true)
  )
)

;; Get image metadata
(define-read-only (get-image-info (image-id uint))
  (ok (unwrap! (map-get? image-metadata image-id) err-image-not-found))
)

;; Check if user owns specific image
(define-read-only (owns-image (user principal) (image-id uint))
  (let ((image-data (unwrap! (map-get? image-metadata image-id) err-image-not-found)))
    (ok (is-eq user (get owner image-data)))
  )
)
