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
    is-active: bool,
    owner: principal
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

(define-read-only (get-owner (patient-id (string-utf8 64)))
  (match (map-get? patient-records {patient-id: patient-id})
    record (ok (get owner record))
    ERR_PATIENT_NOT_FOUND
  )
)

;; Private functions for input validation
(define-private (is-valid-patient-id (patient-id (string-utf8 64)))
  (and (>= (len patient-id) u1) (<= (len patient-id) u64))
)

(define-private (is-valid-name (name (string-utf8 100)))
  (and (>= (len name) u1) (<= (len name) u100))
)

(define-private (is-valid-blood-type (blood-type (string-ascii 3)))
  (or (is-eq blood-type "A+") (is-eq blood-type "A-")
      (is-eq blood-type "B+") (is-eq blood-type "B-")
      (is-eq blood-type "AB+") (is-eq blood-type "AB-")
      (is-eq blood-type "O+") (is-eq blood-type "O-"))
)

(define-private (is-valid-license-number (license-number (string-ascii 20)))
  (and (>= (len license-number) u1) (<= (len license-number) u20))
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
      (initial-access-list (list 
        caller CONTRACT_OWNER CONTRACT_OWNER CONTRACT_OWNER CONTRACT_OWNER
        CONTRACT_OWNER CONTRACT_OWNER CONTRACT_OWNER CONTRACT_OWNER CONTRACT_OWNER
        CONTRACT_OWNER CONTRACT_OWNER CONTRACT_OWNER CONTRACT_OWNER CONTRACT_OWNER
        CONTRACT_OWNER CONTRACT_OWNER CONTRACT_OWNER CONTRACT_OWNER CONTRACT_OWNER
      ))
    )
    (asserts! (is-eq caller CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (is-valid-patient-id patient-id) ERR_INVALID_INPUT)
    (asserts! (is-valid-name name) ERR_INVALID_INPUT)
    (asserts! (> date-of-birth u0) ERR_INVALID_INPUT)
    (asserts! (is-valid-blood-type blood-type) ERR_INVALID_INPUT)
    (asserts! (is-none (map-get? patient-records {patient-id: patient-id})) ERR_ALREADY_EXISTS)
    (ok (map-set patient-records
      {patient-id: patient-id}
      {
        record-hash: 0x,
        name: name,
        date-of-birth: date-of-birth,
        blood-type: blood-type,
        last-updated: block-height,
        access-list: initial-access-list,
        is-active: true,
        owner: caller
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
    (asserts! (is-valid-patient-id patient-id) ERR_INVALID_INPUT)
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
    (asserts! (is-valid-patient-id patient-id) ERR_INVALID_INPUT)
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
    (asserts! (is-valid-patient-id patient-id) ERR_INVALID_INPUT)
    (asserts! (or (is-eq caller CONTRACT_OWNER) (is-eq caller (get owner current-record))) ERR_NOT_AUTHORIZED)
    (asserts! (is-some (get-healthcare-provider provider)) ERR_INVALID_INPUT)
    (asserts! (< (len (filter not-eq-contract-owner current-access-list)) MAX_ACCESS_LIST_SIZE) ERR_LIST_FULL)
    (map-set access-requests {patient-id: patient-id, requester: provider} {status: "approved", requested-at: (get requested-at (unwrap! (get-access-request patient-id provider) ERR_INVALID_INPUT))})
    (ok (map-set patient-records
      {patient-id: patient-id}
      (merge current-record { 
        access-list: (modify-access-list current-access-list provider true)
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
    (asserts! (is-valid-patient-id patient-id) ERR_INVALID_INPUT)
    (asserts! (or (is-eq caller CONTRACT_OWNER) (is-eq caller (get owner current-record))) ERR_NOT_AUTHORIZED)
    (map-set access-requests {patient-id: patient-id, requester: provider} {status: "revoked", requested-at: (get requested-at (unwrap! (get-access-request patient-id provider) ERR_INVALID_INPUT))})
    (ok (map-set patient-records
      {patient-id: patient-id}
      (merge current-record { 
        access-list: (modify-access-list (get access-list current-record) provider false)
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
    (asserts! (is-valid-name name) ERR_INVALID_INPUT)
    (asserts! (is-valid-license-number license-number) ERR_INVALID_INPUT)
    (ok (map-set healthcare-providers
      {provider-id: caller}
      {name: name, license-number: license-number, is-active: true}
    ))
  )
)

(define-public (transfer-ownership (patient-id (string-utf8 64)) (new-owner principal))
  (let
    (
      (caller tx-sender)
      (current-record (unwrap! (map-get? patient-records {patient-id: patient-id}) ERR_PATIENT_NOT_FOUND))
    )
    (asserts! (is-valid-patient-id patient-id) ERR_INVALID_INPUT)
    (asserts! (is-eq caller (get owner current-record)) ERR_NOT_AUTHORIZED)
    (ok (map-set patient-records
      {patient-id: patient-id}
      (merge current-record { 
        owner: new-owner,
        access-list: (modify-access-list (get access-list current-record) new-owner true)
      })
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
      (is-eq caller (get owner record))
      (is-some (index-of (get access-list record) caller))
    )
  )
)

(define-private (not-eq-contract-owner (value principal))
  (not (is-eq value CONTRACT_OWNER))
)

(define-private (modify-access-list (access-list (list 20 principal)) (principal-to-modify principal) (add bool))
  (let
    (
      (new-list (list ))
    )
    (get new-list (fold modify-access-list-iter access-list {new-list: new-list, principal-to-modify: principal-to-modify, add: add, added: false}))
  )
)

(define-private (modify-access-list-iter 
  (current-principal principal) 
  (state {new-list: (list 20 principal), principal-to-modify: principal, add: bool, added: bool})
)
  (let
    (
      (new-list (get new-list state))
      (principal-to-modify (get principal-to-modify state))
      (add (get add state))
      (added (get added state))
      (is-contract-owner (is-eq current-principal CONTRACT_OWNER))
      (should-add (and add (not added) (is-eq (len new-list) u19)))
    )
    (if (< (len new-list) u20)
      (if (or (and add (is-eq current-principal principal-to-modify))
              (and (not add) (not (is-eq current-principal principal-to-modify)))
              (and (not is-contract-owner) (not should-add)))
        (merge state {new-list: (unwrap-panic (as-max-len? (append new-list current-principal) u20)), added: (or added (is-eq current-principal principal-to-modify))})
        (if should-add
          (merge state {new-list: (unwrap-panic (as-max-len? (append new-list principal-to-modify) u20)), added: true})
          state
        )
      )
      state
    )
  )
)
