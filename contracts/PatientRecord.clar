;; PatientRecord Smart Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_PATIENT_NOT_FOUND (err u101))
(define-constant ERR_INVALID_INPUT (err u102))
(define-constant ERR_ALREADY_EXISTS (err u103))
(define-constant ERR_ACCESS_DENIED (err u104))
(define-constant ERR_LIST_FULL (err u105))
(define-constant MAX_ACCESS_LIST_SIZE u20)

;; SIP-009 NFT Interface
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

(define-non-fungible-token patient-record (string-utf8 64))

;; Data structures
(define-map patient-records
  {patient-id: (string-utf8 64)}
  {
    record-hash: (buff 32),
    name: (string-utf8 100),
    date-of-birth: uint,
    blood-type: (string-ascii 3),
    last-updated: uint,
    access-list: (list 20 principal),
    is-active: bool
  }
)

(define-map access-requests
  {patient-id: (string-utf8 64), requester: principal}
  {status: (string-ascii 10), requested-at: uint}
)

(define-map healthcare-providers
  {provider-id: principal}
  {name: (string-utf8 100), license-number: (string-ascii 20), is-active: bool}
)

;; Read-only functions
(define-read-only (get-patient-record (patient-id (string-utf8 64)))
  (match (map-get? patient-records {patient-id: patient-id})
    record (ok (merge record {patient-id: patient-id}))
    ERR_PATIENT_NOT_FOUND
  )
)

(define-read-only (get-access-request (patient-id (string-utf8 64)) (requester principal))
  (map-get? access-requests {patient-id: patient-id, requester: requester})
)

(define-read-only (get-healthcare-provider (provider-id principal))
  (map-get? healthcare-providers {provider-id: provider-id})
)

;; Public functions
(define-public (register-patient 
  (patient-id (string-utf8 64)) 
  (name (string-utf8 100))
  (date-of-birth uint)
  (blood-type (string-ascii 3)))
  (let
    (
      (caller tx-sender)
    )
    (asserts! (is-eq caller CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (is-none (map-get? patient-records {patient-id: patient-id})) ERR_ALREADY_EXISTS)
    (try! (nft-mint? patient-record patient-id caller))
    (ok (map-set patient-records
      {patient-id: patient-id}
      {
        record-hash: 0x,
        name: name,
        date-of-birth: date-of-birth,
        blood-type: blood-type,
        last-updated: block-height,
        access-list: (list caller),
        is-active: true
      }
    ))
  )
)

(define-public (update-patient-record 
  (patient-id (string-utf8 64)) 
  (new-record-hash (buff 32)))
  (let
    (
      (caller tx-sender)
      (current-record (unwrap! (map-get? patient-records {patient-id: patient-id}) ERR_PATIENT_NOT_FOUND))
    )
    (asserts! (is-authorized caller patient-id) ERR_NOT_AUTHORIZED)
    (ok (map-set patient-records
      {patient-id: patient-id}
      (merge current-record { 
        record-hash: new-record-hash,
        last-updated: block-height
      })
    ))
  )
)

(define-public (request-access (patient-id (string-utf8 64)))
  (let
    (
      (caller tx-sender)
      (current-time block-height)
    )
    (asserts! (is-some (get-healthcare-provider caller)) ERR_NOT_AUTHORIZED)
    (ok (map-set access-requests
      {patient-id: patient-id, requester: caller}
      {status: "pending", requested-at: current-time}
    ))
  )
)

(define-public (grant-access (patient-id (string-utf8 64)) (provider principal))
  (let
    (
      (caller tx-sender)
      (current-record (unwrap! (map-get? patient-records {patient-id: patient-id}) ERR_PATIENT_NOT_FOUND))
      (current-access-list (get access-list current-record))
    )
    (asserts! (or (is-eq caller CONTRACT_OWNER) (is-owner caller patient-id)) ERR_NOT_AUTHORIZED)
    (asserts! (is-some (get-healthcare-provider provider)) ERR_INVALID_INPUT)
    (asserts! (< (len current-access-list) MAX_ACCESS_LIST_SIZE) ERR_LIST_FULL)
    (map-set access-requests {patient-id: patient-id, requester: provider} {status: "approved", requested-at: (get requested-at (unwrap! (get-access-request patient-id provider) ERR_INVALID_INPUT))})
    (ok (map-set patient-records
      {patient-id: patient-id}
      (merge current-record { 
        access-list: (append-provider current-access-list provider)
      })
    ))
  )
)

(define-public (revoke-access (patient-id (string-utf8 64)) (provider principal))
  (let
    (
      (caller tx-sender)
      (current-record (unwrap! (map-get? patient-records {patient-id: patient-id}) ERR_PATIENT_NOT_FOUND))
    )
    (asserts! (or (is-eq caller CONTRACT_OWNER) (is-owner caller patient-id)) ERR_NOT_AUTHORIZED)
    (map-set access-requests {patient-id: patient-id, requester: provider} {status: "revoked", requested-at: (get requested-at (unwrap! (get-access-request patient-id provider) ERR_INVALID_INPUT))})
    (ok (map-set patient-records
      {patient-id: patient-id}
      (merge current-record { 
        access-list: (filter remove-principal (get access-list current-record))
      })
    ))
  )
)

(define-public (register-healthcare-provider (name (string-utf8 100)) (license-number (string-ascii 20)))
  (let
    (
      (caller tx-sender)
    )
    (asserts! (is-eq caller CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (ok (map-set healthcare-providers
      {provider-id: caller}
      {name: name, license-number: license-number, is-active: true}
    ))
  )
)

;; Private functions
(define-private (is-authorized (caller principal) (patient-id (string-utf8 64)))
  (let
    (
      (record (unwrap! (map-get? patient-records {patient-id: patient-id}) false))
    )
    (or 
      (is-eq caller CONTRACT_OWNER)
      (is-owner caller patient-id)
      (is-some (index-of (get access-list record) caller))
    )
  )
)

(define-private (is-owner (caller principal) (patient-id (string-utf8 64)))
  (is-eq (some caller) (nft-get-owner? patient-record patient-id))
)

(define-private (remove-principal (value principal))
  (not (is-eq value tx-sender))
)

(define-private (append-provider (current-list (list 20 principal)) (new-provider principal))
  (let
    (
      (list-length (len current-list))
    )
    (if (>= list-length u19)
      current-list
      (unwrap! (as-max-len? (append current-list new-provider) u20) current-list)
    )
  )
)

;; SIP-009 NFT functions
(define-public (transfer (token-id (string-utf8 64)) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_NOT_AUTHORIZED)
    (asserts! (is-none (get-healthcare-provider recipient)) ERR_INVALID_INPUT)
    (try! (nft-transfer? patient-record token-id sender recipient))
    (let
      (
        (current-record (unwrap! (map-get? patient-records {patient-id: token-id}) ERR_PATIENT_NOT_FOUND))
      )
      (ok (map-set patient-records
        {patient-id: token-id}
        (merge current-record { 
          access-list: (list recipient)
        })
      ))
    )
  )
)

(define-public (get-token-uri (token-id (string-utf8 64)))
  (ok none)
)

(define-public (get-owner (token-id (string-utf8 64)))
  (ok (nft-get-owner? patient-record token-id))
)
