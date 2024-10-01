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
    (asserts! (< (len (filter not-default current-access-list)) MAX_ACCESS_LIST_SIZE) ERR_LIST_FULL)
    (map-set access-requests {patient-id: patient-id, requester: provider} {status: "approved", requested-at: (get requested-at (unwrap! (get-access-request patient-id provider) ERR_INVALID_INPUT))})
    (ok (map-set patient-records
      {patient-id: patient-id}
      (merge current-record { 
        access-list: (update-access-list current-access-list provider true)
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
        access-list: (update-access-list (get access-list current-record) provider false)
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

(define-public (transfer-ownership (patient-id (string-utf8 64)) (new-owner principal))
  (let
    (
      (caller tx-sender)
      (current-record (unwrap! (map-get? patient-records {patient-id: patient-id}) ERR_PATIENT_NOT_FOUND))
    )
    (asserts! (is-eq caller (get owner current-record)) ERR_NOT_AUTHORIZED)
    (ok (map-set patient-records
      {patient-id: patient-id}
      (merge current-record { 
        owner: new-owner,
        access-list: (update-access-list (get access-list current-record) new-owner true)
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
      (is-owner caller patient-id)
      (is-some (index-of (get access-list record) caller))
    )
  )
)

(define-private (is-owner (caller principal) (patient-id (string-utf8 64)))
  (let
    (
      (record (unwrap! (map-get? patient-records {patient-id: patient-id}) false))
    )
    (is-eq caller (get owner record))
  )
)

(define-private (not-default (value principal))
  (not (is-eq value CONTRACT_OWNER))
)

(define-private (update-access-list (access-list (list 20 principal)) (principal-to-update principal) (add bool))
  (let
    (
      (filtered-list (filter not-default access-list))
      (new-list (if add
                    (unwrap! (as-max-len? (append filtered-list principal-to-update) u20) filtered-list)
                    (filter (lambda (p) (not (is-eq p principal-to-update))) filtered-list)))
    )
    (concat new-list (list-repeat CONTRACT_OWNER (- u20 (len new-list))))
  )
)

(define-private (list-repeat (value principal) (count uint))
  (fold (lambda (index result) (unwrap-panic (as-max-len? (append result value) u20)))
        (list)
        (list u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 u20))
)
