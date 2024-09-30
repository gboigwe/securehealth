;; PatientRecord Smart Contract

;; Define data variables
(define-data-var contract-owner principal tx-sender)
(define-map patient-records
  { patient-id: (string-ascii 64) }
  { 
    record-hash: (string-ascii 64),
    last-updated: uint,
    access-list: (list 10 principal)
  }
)

;; Define error constants
(define-constant err-not-authorized (err u100))
(define-constant err-patient-not-found (err u101))
(define-constant err-invalid-input (err u102))

;; Add a new patient record
(define-public (add-patient-record (patient-id (string-ascii 64)) (record-hash (string-ascii 64)))
  (let
    (
      (caller tx-sender)
    )
    (asserts! (is-eq caller (var-get contract-owner)) err-not-authorized)
    (ok (map-insert patient-records { patient-id: patient-id }
                    { 
                      record-hash: record-hash,
                      last-updated: block-height,
                      access-list: (list caller)
                    }))
  )
)

;; Update an existing patient record
(define-public (update-patient-record (patient-id (string-ascii 64)) (new-record-hash (string-ascii 64)))
  (let
    (
      (caller tx-sender)
      (current-record (unwrap! (map-get? patient-records { patient-id: patient-id }) err-patient-not-found))
    )
    (asserts! (is-authorized caller patient-id) err-not-authorized)
    (ok (map-set patient-records
                 { patient-id: patient-id }
                 (merge current-record { 
                   record-hash: new-record-hash,
                   last-updated: block-height
                 })))
  )
)

;; Get patient record (only accessible by authorized principals)
(define-read-only (get-patient-record (patient-id (string-ascii 64)))
  (let
    (
      (caller tx-sender)
      (record (unwrap! (map-get? patient-records { patient-id: patient-id }) err-patient-not-found))
    )
    (asserts! (is-authorized caller patient-id) err-not-authorized)
    (ok record)
  )
)

;; Check if a principal is authorized to access a patient's record
(define-private (is-authorized (caller principal) (patient-id (string-ascii 64)))
  (let
    (
      (record (unwrap! (map-get? patient-records { patient-id: patient-id }) false))
    )
    (or (is-eq caller (var-get contract-owner))
        (is-some (index-of (get access-list record) caller)))
  )
)

;; Grant access to a new principal
(define-public (grant-access (patient-id (string-ascii 64)) (new-principal principal))
  (let
    (
      (caller tx-sender)
      (current-record (unwrap! (map-get? patient-records { patient-id: patient-id }) err-patient-not-found))
    )
    (asserts! (or (is-eq caller (var-get contract-owner)) (is-eq caller new-principal)) err-not-authorized)
    (ok (map-set patient-records
                 { patient-id: patient-id }
                 (merge current-record { 
                   access-list: (unwrap! (as-max-len? (append (get access-list current-record) new-principal) u10) err-invalid-input)
                 })))
  )
)
