# API Spec - Student Exchange

Updated: 2026-02-21
Base URL: `/api`

## Conventions
- Pagination response:
  - `content`, `totalElements`, `totalPages`, `currentPage`, `pageSize`
- Error response:
```json
{
  "timestamp": "2026-02-16T10:00:00",
  "status": 400,
  "message": "Validation failed",
  "path": "/api/listings"
}
```

## Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Register request:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "secret123"
}
```

Register response:
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": 3,
    "username": "newuser",
    "fullName": "newuser",
    "email": "newuser@example.com",
    "role": "USER"
  }
}
```

## Health
- `GET /api/health`

## Listings
- `GET /api/listings?search=&category=&page=&size=`
- `GET /api/listings/{id}`
- `POST /api/listings` (auth user)
- `PUT /api/listings/{id}` (owner/admin)
- `DELETE /api/listings/{id}` (owner/admin)
- `GET /api/me/listings?page=&size=` (auth user)

`Listing` fields:
- `id`, `title`, `description`, `category`, `price`, `stock`, `imageUrl`, `active`, `ownerId`, `ownerName`, `createdAt`, `updatedAt`

## IoT Hub
- `GET /api/iot/overview?search=&category=&segment=&page=&size=`

Query behavior:
- `segment` is optional and supports: `COMPONENTS`, `SAMPLE_PRODUCTS`, `SERVICES`
- `category` is optional and kept for backward compatibility
- `category` and `segment` cannot be sent together

Segment mapping:
- `COMPONENTS` -> `Board vi dieu khien / Module phat trien`, `Cam bien`, `Thiet bi thuc thi / Output`, `Module giao tiep / Ket noi`, `Linh kien ho tro co ban`
- `SAMPLE_PRODUCTS` -> `San pham mau / Bo KIT`
- `SERVICES` -> `Dich vu IoT`

Legacy alias categories still accepted in `category` filter:
- `COMPONENT`, `ELECTRONICS`, `SAMPLE_KIT`, `KIT`, `IOT_SERVICE`, `MENTORING`, `CONSULTATION`, `SERVICE`

## Cart
- `GET /api/cart`
- `POST /api/cart/items`
```json
{ "listingId": 1, "quantity": 2 }
```
- `PATCH /api/cart/items/{listingId}`
```json
{ "quantity": 3 }
```
- `DELETE /api/cart/items/{listingId}`

## Orders
- `POST /api/orders`
```json
{
  "customerName": "Student User",
  "customerEmail": "student1@example.com",
  "customerAddress": "District 9, HCMC"
}
```
- `GET /api/orders/{orderCode}`
- `GET /api/orders/track?orderCode=&email=`

`Order` fields:
- `id`, `orderCode`, `customerName`, `customerEmail`, `customerAddress`, `status`, `totalAmount`, `items[]`, `createdAt`

## Events
- `GET /api/events?search=&page=&size=`
- `GET /api/events/{id}`
- `POST /api/events/{id}/registrations`
```json
{ "name": "Student User", "email": "student1@example.com", "phone": "090...", "note": "..." }
```
- `GET /api/me/event-registrations` (auth user)

## Support
- `GET /api/faqs?category=&search=`
- `POST /api/support/tickets`
```json
{
  "name": "Student User",
  "email": "student1@example.com",
  "subject": "Need help",
  "category": "ORDER",
  "message": "..."
}
```
- `GET /api/support/tickets/track?ticketCode=&email=`

## Admin
Requires admin session.

### Listings
- `GET /api/admin/listings?search=&category=&active=&page=&size=`
- `GET /api/admin/listings/{id}`
- `POST /api/admin/listings`
- `PUT /api/admin/listings/{id}`
- `DELETE /api/admin/listings/{id}`

### Orders
- `GET /api/admin/orders?status=&page=&size=`
- `PUT /api/admin/orders/{id}/status`
```json
{ "status": "PROCESSING" }
```

### Events
- `GET /api/admin/events?search=&active=&page=&size=`
- `POST /api/admin/events`
- `PUT /api/admin/events/{id}`
- `DELETE /api/admin/events/{id}`
- `GET /api/admin/events/{id}/registrations`

### Support
- `GET /api/admin/support/tickets?status=&page=&size=`
- `PUT /api/admin/support/tickets/{id}/status`
```json
{ "status": "IN_PROGRESS" }
```
- `POST /api/admin/support/tickets/{id}/reply`
```json
{ "reply": "We have updated your ticket." }
```
