# CampusHub

CampusHub is a full-stack university event management web application built with **Node.js, Express, MongoDB, Mongoose, HTML, CSS, and JavaScript**.

The project allows students to discover and book campus events, organizers to create and manage their own events, and administrators to manage the platform and view event statistics.

CampusHub was built as a practical backend project to apply real-world concepts including RESTful APIs, authentication, authorization, database modeling, advanced querying, business rules, security, centralized error handling, aggregation, Mongoose middleware, and frontend/backend integration.

---

## Table of Contents

* [Features](#features)
* [User Roles](#user-roles)
* [Technology Stack](#technology-stack)
* [Project Architecture](#project-architecture)
* [Authentication and Authorization](#authentication-and-authorization)
* [Events](#events)
* [Bookings](#bookings)
* [Reviews and Ratings](#reviews-and-ratings)
* [Advanced API Features](#advanced-api-features)
* [Security](#security)
* [Error Handling](#error-handling)
* [Mongoose Features](#mongoose-features)
* [API Overview](#api-overview)
* [Running the Project Locally](#running-the-project-locally)
* [Environment Variables](#environment-variables)
* [Testing](#testing)
* [Project Structure](#project-structure)
* [Current Status](#current-status)
* [Future Improvements](#future-improvements)

---

# Features

CampusHub provides a complete event-management workflow.

### Students

* Create an account and log in
* Browse all campus events
* Search for events by name
* Filter events by category
* Sort events
* View individual event details
* Book available upcoming events
* View personal bookings
* Cancel bookings
* Review events they attended
* Create multiple different reviews for the same event
* Edit and delete their own reviews
* Update profile information
* Update their password

### Organizers

Organizers have the student-facing event browsing functionality plus the ability to:

* Create events
* View their own events
* Update their own events
* Delete their own events
* Manage event information
* View event bookings and ratings
* Access organizer-only pages

Organizers cannot modify events belonging to another organizer.

### Administrators

Administrators can:

* Access the Admin Dashboard
* View platform users
* View event statistics
* Manage events across the platform
* Modify organizer-owned events
* Delete users
* Access admin-only functionality

---

# User Roles

CampusHub uses role-based authorization.

The three application roles are:

```text
student
organizer
admin
```

A newly registered account becomes a normal student.

Users cannot assign themselves the `organizer` or `admin` role through normal signup or profile updates.

Protected backend routes verify permissions independently from the frontend.

This means hiding an Edit or Admin button in the browser is only a user-interface convenience; the backend remains responsible for the actual security decision.

---

# Technology Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Tokens
* bcrypt
* dotenv

## Security

* Helmet
* express-rate-limit
* Mongoose query sanitization
* Request body size limits
* Role-based authorization
* Resource ownership authorization
* Protected field filtering

## Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* Fetch API
* Local Storage for JWT persistence
* Responsive layout

## Development

* Nodemon
* Postman
* MongoDB Atlas
* MongoDB Compass
* Git
* GitHub
* Chrome DevTools

---

# Project Architecture

CampusHub follows an MVC-inspired backend structure.

```text
CampusHub/
│
├── controllers/
│   ├── authController.js
│   ├── bookingController.js
│   ├── errorController.js
│   ├── eventController.js
│   ├── reviewController.js
│   └── userController.js
│
├── models/
│   ├── bookingModel.js
│   ├── eventModel.js
│   ├── reviewModel.js
│   └── userModel.js
│
├── routes/
│   ├── bookingRoutes.js
│   ├── eventRoutes.js
│   ├── reviewRoutes.js
│   └── userRoutes.js
│
├── utils/
│   ├── apiFeatures.js
│   ├── appError.js
│   ├── catchAsync.js
│   └── filterObject.js
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   └── api.js
│   │
│   ├── admin.html
│   ├── bookings.html
│   ├── create-event.html
│   ├── edit-event.html
│   ├── event-details.html
│   ├── events.html
│   ├── index.html
│   ├── login.html
│   ├── my-events.html
│   ├── profile.html
│   └── signup.html
│
├── .gitignore
├── app.js
├── server.js
├── package.json
└── package-lock.json
```

---

# Request Flow

A normal API request follows approximately this flow:

```text
Browser
   ↓
Express
   ↓
Router
   ↓
Authentication / Authorization Middleware
   ↓
Controller
   ↓
Mongoose Model
   ↓
MongoDB Atlas
   ↓
Controller Response
   ↓
Browser
```

For authenticated requests:

```text
Browser
   ↓
Authorization: Bearer <JWT>
   ↓
protect middleware
   ↓
JWT verification
   ↓
current user loaded
   ↓
role / ownership check
   ↓
controller
```

---

# Authentication and Authorization

## Signup

Users can create accounts through the signup page.

Sensitive information such as passwords is never returned in normal API responses.

Passwords are hashed before being stored in MongoDB.

---

## Login

Users log in using their email and password.

After successful authentication, the backend generates a JWT.

The frontend stores the token and sends it with protected requests:

```http
Authorization: Bearer <token>
```

---

## Protected Routes

The authentication middleware:

1. Checks whether a JWT exists.
2. Verifies the token.
3. Finds the current user.
4. Confirms that the user still exists.
5. Checks whether the password was changed after the token was issued.
6. Places the authenticated user on the request object.

---

## Password Change Security

Changing a password invalidates JWTs created before that password change.

This prevents an old stolen token from remaining valid indefinitely after a password has been changed.

---

## Role Authorization

Routes can be restricted according to role.

Example:

```text
student
   ↓
cannot create an event

organizer
   ↓
can create an event

admin
   ↓
can access administrative functionality
```

Authorization is enforced on the backend even when a user manually enters a protected frontend URL.

---

## Ownership Authorization

Role authorization alone is not enough.

For example:

```text
Organizer One
      ↓
tries to update
      ↓
Organizer Two's event
      ↓
403 Forbidden
```

An organizer may modify only events they own unless the authenticated user is an administrator.

The same ownership principle applies to user reviews.

---

# Events

Events contain information such as:

```text
name
description
category
price
duration
location
startDate
capacity
organizer
ratingsAverage
ratingsQuantity
slug
```

An event automatically stores the organizer who created it rather than trusting the client to choose an organizer.

---

## Event CRUD

CampusHub supports:

```text
Create
Read
Update
Delete
```

Organizers can perform CRUD operations on their own events.

Administrators can manage events across the platform.

Students can browse events but cannot create or modify them.

---

## Event Ownership

Organizer ownership is checked before sensitive operations.

The backend does not rely only on whether the frontend displays an Edit/Delete button.

---

## Event Validation

Invalid event data is rejected.

Examples include:

```text
negative price
zero/invalid capacity
invalid category
missing required fields
invalid field values
```

---

# Bookings

Bookings connect:

```text
User
   ↓
Booking
   ↓
Event
```

A booking stores the user, event, booking information, and a price snapshot.

---

## Booking Rules

Before creating a booking, CampusHub verifies that:

* The user is authenticated.
* The event exists.
* The event has not already started.
* The event still has available capacity.
* The user does not already have an active booking for that event.

---

## Duplicate Booking Prevention

The same user cannot create duplicate active bookings for the same event.

The data model and business logic protect the relationship between:

```text
user + event
```

---

## Event Capacity

CampusHub calculates whether an event still has available places.

Example:

```text
capacity = 1

Student One books
        ↓
event becomes full

Student Two attempts booking
        ↓
booking rejected
```

If Student One cancels:

```text
booking deleted
      ↓
capacity becomes available again
      ↓
Student Two can book
```

---

## Past Event Protection

Bookings are rejected after an event has already started.

```text
event.startDate < current time
        ↓
new booking rejected
```

---

## Booking Price Snapshot

A booking stores the event price at the moment the booking is created.

For example:

```text
Event price = 120
Student books event
Booking price = 120

Organizer later changes event price to 200

Current Event price = 200
Existing Booking price = 120
```

This preserves historical booking information.

If the student cancels and books again after the price change:

```text
New Booking price = 200
```

---

# Reviews and Ratings

CampusHub implements custom review rules rather than the common one-review-per-user-per-event design.

A review contains information such as:

```text
review text
rating
user
event
```

---

## Review Eligibility

A user must have booked/attended the event before reviewing it.

The review system is designed around reviews for events that have already happened.

---

## Multiple Reviews

A user **may create multiple reviews for the same event**.

For example:

```text
Excellent backend workshop.

The API examples were very useful.
```

Both are valid reviews from the same student for the same event.

---

## Exact Duplicate Protection

While multiple reviews are allowed, the exact same review text from the same user for the same event is rejected.

Example:

```text
User:
Student One

Event:
Backend Bootcamp Review Test

Review:
Excellent backend workshop.
```

Submitting that exact review again for the same user/event is rejected.

This is an intentional CampusHub business rule.

---

## Review Ownership

Users may update or delete only their own reviews.

Trying to modify another user's review results in an authorization failure.

---

## Rating Aggregation

Event ratings are automatically recalculated when reviews change.

Example:

```text
Ratings:

5
4
3

Quantity:
3

Average:
4
```

If a review is updated:

```text
5
5
3

Average:
≈ 4.3
```

If a review is deleted:

```text
5
3

Quantity:
2

Average:
4
```

Ratings are recalculated after review creation, update, and deletion.

---

# Advanced API Features

CampusHub contains a reusable `APIFeatures` utility for event queries.

It supports:

* Filtering
* Advanced comparison filtering
* Searching
* Sorting
* Field limiting
* Pagination

---

## Filtering

Example:

```http
GET /api/v1/events?category=technology
```

---

## Advanced Filtering

Mongo-style comparison operators are supported through safe query parameters.

Example:

```http
GET /api/v1/events?price[lt]=100
```

Supported comparisons include:

```text
gt
gte
lt
lte
```

These are converted internally into trusted MongoDB operators.

For example:

```text
price[lt]=100
```

becomes conceptually:

```javascript
{
  price: {
    $lt: 100
  }
}
```

The application keeps Mongoose filter sanitization enabled while explicitly trusting only the operators intentionally created by the application's filtering logic.

---

## Search

Events can be searched by name.

Example:

```http
GET /api/v1/events?search=machine
```

Search is case-insensitive.

---

## Sorting

Ascending:

```http
GET /api/v1/events?sort=price
```

Descending:

```http
GET /api/v1/events?sort=-price
```

Multiple fields can also be processed by the API feature utility.

---

## Pagination

Example:

```http
GET /api/v1/events?page=1&limit=5
```

Conceptually:

```text
page 1
↓
skip 0
↓
limit 5

page 2
↓
skip 5
↓
limit 5
```

---

## Field Limiting

Example:

```http
GET /api/v1/events?fields=name,price,startDate
```

This allows clients to request only the fields they need.

Virtual fields such as `id` or `isUpcoming` may still appear in serialized responses.

---

# Security

CampusHub includes multiple security layers.

---

## Helmet

Helmet adds HTTP security headers.

The application also disables the Express technology header:

```javascript
app.disable('x-powered-by');
```

Therefore:

```text
X-Powered-By: Express
```

is not exposed.

Content Security Policy is disabled in the current Helmet configuration to avoid conflicts with the static frontend while other Helmet protections remain enabled.

---

## Rate Limiting

The API includes a global rate limiter.

Production configuration limits API requests per IP within a time window.

Login has an additional stricter limiter to reduce brute-force authentication attempts.

Successful login attempts are not unnecessarily counted against the failed-login protection.

---

## Request Body Limit

JSON request bodies are limited to:

```text
10 KB
```

using:

```javascript
express.json({ limit: '10kb' })
```

Oversized requests are rejected.

---

## NoSQL Injection Protection

Mongoose filter sanitization is enabled:

```javascript
mongoose.set('sanitizeFilter', true);
```

Advanced filtering intentionally supports only selected comparison operators created by the application.

Trusted query objects are used where legitimate MongoDB operators are required.

This allows:

```text
price[lt]=100
```

without disabling protection globally.

---

## Mass Assignment Protection

Sensitive fields cannot simply be added to a normal profile update request.

For example, a student cannot send:

```json
{
  "role": "admin"
}
```

and promote themselves.

Likewise, protected Event properties such as ownership and rating aggregation fields are not intended to be freely overwritten by organizer update requests.

---

## Secrets

Sensitive values are stored in environment variables and are excluded from Git.

Examples include:

```text
DATABASE
JWT_SECRET
```

The local environment configuration file must never be committed to GitHub.

---

# Error Handling

CampusHub uses centralized error handling instead of repeating large `try/catch` blocks throughout every controller.

---

## AppError

Operational errors use a custom `AppError` class.

It extends the native JavaScript `Error` object and contains information such as:

```text
message
statusCode
status
isOperational
```

---

## catchAsync

Asynchronous route handlers are wrapped with `catchAsync`.

Conceptually:

```text
async controller
      ↓
Promise rejection
      ↓
catchAsync
      ↓
next(error)
      ↓
globalErrorHandler
```

This keeps controller code cleaner.

---

## Global Error Handler

Errors ultimately reach one centralized Express error-handling middleware.

Handled error situations include cases such as:

```text
400 → invalid input / malformed data
401 → authentication failure
403 → authorization failure
404 → resource/route not found
429 → too many requests
500 → unexpected server error
```

Database and authentication errors are converted into cleaner API responses instead of exposing raw stack traces to clients in production.

---

## Unknown Routes

Requests to nonexistent routes are converted into operational 404 errors.

Example:

```http
GET /api/v1/banana
```

Response:

```text
404
Can't find /api/v1/banana on this server!
```

---

# Mongoose Features

CampusHub uses several Mongoose features beyond basic CRUD.

---

## Schemas and Models

Separate models are used for:

```text
User
Event
Booking
Review
```

---

## References

Relationships between documents use MongoDB ObjectIds and Mongoose `ref`.

Examples:

```text
Event.organizer → User

Booking.user → User
Booking.event → Event

Review.user → User
Review.event → Event
```

---

## Populate

Referenced documents can be populated to return useful related information rather than only ObjectIds.

Example Event response:

```json
{
  "organizer": {
    "_id": "...",
    "name": "Organizer One",
    "email": "organizer1@example.com"
  }
}
```

Bookings can similarly expose useful event information, while reviews can expose reviewer information.

---

## Middleware

Mongoose middleware is used for model-level behavior such as:

```text
password hashing
slug generation
query behavior
rating recalculation
```

---

## Slugs

An event name can generate a URL-friendly slug.

Example:

```text
Advanced Node Workshop
```

becomes:

```text
advanced-node-workshop
```

If the event name changes, the slug can be regenerated accordingly.

---

## Virtual Properties

CampusHub includes virtual information such as:

```text
isUpcoming
```

Example:

```json
{
  "isUpcoming": true
}
```

A virtual can appear in JSON output without being physically stored as a field inside MongoDB.

---

## Aggregation

MongoDB aggregation is used for statistics and rating-related calculations.

The Admin Dashboard can expose statistics such as:

```text
total events
average price
average rating
events grouped by category
```

---

# API Overview

Base API:

```text
/api/v1
```

---

## Authentication / Users

```http
POST   /api/v1/users/signup
POST   /api/v1/users/login
GET    /api/v1/users/me
PATCH  /api/v1/users/updateMe
```

Password-update and administrative user routes are also handled by the user router.

---

## Events

```http
GET     /api/v1/events
POST    /api/v1/events
GET     /api/v1/events/:id
PATCH   /api/v1/events/:id
DELETE  /api/v1/events/:id
```

Statistics:

```http
GET /api/v1/events/stats
```

Booking an event:

```http
POST /api/v1/events/:eventId/book
```

---

## Bookings

Booking routes support functionality such as:

```text
view current user's bookings
create event bookings
cancel bookings
manage booking records according to permissions
```

---

## Reviews

Review routes support functionality such as:

```text
create review
view reviews
update own review
delete own review
```

Reviews are associated with events and users.

---

# API Response Style

Successful API responses follow a consistent structure similar to:

```json
{
  "status": "success",
  "results": 2,
  "data": {
    "events": []
  }
}
```

Errors use a consistent structure such as:

```json
{
  "status": "fail",
  "message": "..."
}
```

or:

```json
{
  "status": "error",
  "message": "..."
}
```

depending on the status code.

---

# Frontend

CampusHub includes a complete static frontend served directly by Express.

```javascript
app.use(express.static(path.join(__dirname, 'frontend')));
```

Because the frontend and backend are served from the same Express application, API requests can use relative paths such as:

```javascript
fetch('/api/v1/events');
```

instead of depending on a hardcoded localhost backend address.

---

## Frontend Pages

The frontend contains pages for:

```text
Home
Events
Event Details
Login
Signup
Profile
My Bookings
Create Event
Edit Event
My Events
Admin Dashboard
```

---

## Frontend Authorization

Navigation and protected pages change according to authentication state and role.

Examples:

```text
Guest
→ Login
→ Signup

Student
→ Profile
→ My Bookings

Organizer
→ Create Event
→ My Events

Admin
→ Admin Dashboard
```

Protected backend endpoints still perform authorization independently.

---

## Responsive Design

CampusHub was tested at multiple viewport sizes including mobile, tablet, and desktop layouts.

Responsive testing checks included:

```text
navigation
event cards
forms
filters
buttons
bookings
reviews
admin interface
footer
```

---

# Running the Project Locally

## 1. Clone the repository

```bash
git clone <your-repository-url>
```

Enter the project:

```bash
cd CampusHub
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create:

```text
config.env
```

in the project root.

Example:

```env
NODE_ENV=development
PORT=3000

DATABASE=your_mongodb_atlas_connection_string

JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=90d
```

Use your own secure values.

Never commit `config.env`.

---

## 4. Start development server

```bash
npm run dev
```

or production-style local execution:

```bash
npm start
```

---

## 5. Open CampusHub

```text
http://localhost:3000
```

The same Express application serves both:

```text
Frontend
+
REST API
```

---

# NPM Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

Run normally:

```bash
npm start
```

Run with automatic restart during development:

```bash
npm run dev
```

---

# Environment Variables

Important configuration is kept outside source control.

Typical required variables include:

```text
NODE_ENV
PORT
DATABASE
JWT_SECRET
JWT_EXPIRES_IN
```

Production credentials should use strong randomly generated secrets.

---

# Server Lifecycle

The application handles important Node.js process events.

Examples include:

```text
uncaughtException
unhandledRejection
SIGTERM
```

The running HTTP server is stored so it can be closed gracefully when necessary.

Conceptually:

```text
shutdown signal/error
        ↓
stop accepting new requests
        ↓
close server
        ↓
terminate process
```

---

# Testing

CampusHub was manually tested through:

```text
Browser UI
Chrome DevTools
Network panel
Postman
MongoDB Compass
Direct API requests
```

Testing covered both successful and intentionally failing scenarios.

---

## Authentication Tests

```text
✅ valid signup
✅ duplicate email rejection
✅ password mismatch
✅ invalid password
✅ successful login
✅ wrong-password rejection
✅ nonexistent-user rejection
✅ logout
✅ JWT persistence
✅ protected routes
✅ old JWT invalidation after password change
✅ invalid JWT handling
```

---

## Event Tests

```text
✅ create event
✅ read all events
✅ read individual event
✅ update own event
✅ delete own event
✅ organizer ownership protection
✅ validation
✅ slug behavior
✅ isUpcoming virtual
✅ organizer population
```

---

## Query Tests

```text
✅ category filtering
✅ advanced price comparisons
✅ search
✅ ascending sorting
✅ descending sorting
✅ pagination
✅ field limiting
```

Example advanced query:

```http
GET /api/v1/events?price[lt]=100
```

---

## Authorization Tests

```text
✅ student route restrictions
✅ organizer route restrictions
✅ admin route restrictions
✅ event ownership
✅ review ownership
✅ role mass-assignment protection
```

---

## Booking Tests

```text
✅ normal booking
✅ duplicate booking rejection
✅ booking price snapshot
✅ cancellation
✅ rebooking
✅ full event protection
✅ capacity released after cancellation
✅ past-event booking rejection
```

---

## Review Tests

```text
✅ review eligibility
✅ multiple different reviews from same user
✅ exact duplicate review blocked
✅ second user's review
✅ rating aggregation
✅ rating recalculation after update
✅ rating recalculation after delete
✅ review ownership
```

---

## Security Tests

```text
✅ Helmet headers
✅ X-Powered-By removed
✅ request body limit
✅ NoSQL injection protection
✅ rate limiting
✅ invalid token handling
✅ mass-assignment protection
```

---

## Error Tests

```text
✅ malformed ObjectId
✅ valid but nonexistent ObjectId
✅ unknown endpoint
✅ invalid event data
✅ invalid review rating
✅ authentication errors
✅ authorization errors
✅ centralized JSON error responses
```

---

## Frontend Tests

```text
✅ authentication-aware navbar
✅ protected-page redirects
✅ event search
✅ event filters
✅ event sorting
✅ responsive mobile layout
✅ empty states
✅ loading behavior
✅ browser refresh persistence
✅ logout protection
✅ console inspection
✅ network inspection
```

---

# Important Design Decisions

## Multiple Reviews Per Event

CampusHub deliberately does **not** enforce:

```text
one review
per user
per event
```

Instead:

```text
same user + same event + different review
→ allowed

same user + same event + exact same review text
→ rejected
```

This is a deliberate application requirement.

---

## Backend Security Over Frontend Security

Frontend restrictions improve UX but are never treated as sufficient security.

For example:

```text
Student manually opens organizer page
```

may cause the frontend to redirect them, but even if that frontend protection were bypassed:

```text
Backend authorization
→ still blocks unauthorized operation
```

---

## Historical Booking Data

Booking price is copied at booking time rather than always reading the current Event price.

This protects historical accuracy.

---

## Secure Advanced Queries

MongoDB filter sanitization remains enabled.

Legitimate application-generated comparison operators are explicitly trusted rather than globally disabling sanitization.

This preserves both:

```text
Advanced API functionality
+
NoSQL injection protection
```

---

# Git and GitHub

The project uses Git for version control and is stored on GitHub.

Sensitive files such as environment configuration and dependencies are excluded through `.gitignore`.

Typical development workflow:

```bash
git add .
git commit -m "Describe changes"
git push
```

---

# Deployment

CampusHub currently runs as a complete local full-stack web application.

Deployment to a public hosting provider has not yet been finalized.

The architecture is deployment-ready because:

```text
Express serves the frontend
Express exposes the REST API
MongoDB Atlas hosts the database
Configuration uses environment variables
PORT uses process.env.PORT
GitHub contains the application source
```

A future deployment can therefore host the frontend and backend together as one Node.js web service.

---

# Current Status

CampusHub currently includes:

```text
Authentication             ✅
JWT Protection             ✅
Role Authorization         ✅
Ownership Authorization    ✅

Event CRUD                 ✅
Search                     ✅
Filtering                  ✅
Advanced Filtering         ✅
Sorting                    ✅
Pagination                 ✅
Field Limiting             ✅

Bookings                    ✅
Capacity Rules              ✅
Duplicate Protection        ✅
Price Snapshot              ✅
Cancellation                ✅

Reviews                     ✅
Multiple Reviews            ✅
Duplicate Review Protection ✅
Rating Aggregation          ✅
Review Ownership            ✅

Profile Management          ✅
Password Management         ✅

Centralized Errors          ✅
Security Middleware         ✅
Rate Limiting               ✅

Mongoose Middleware         ✅
Populate                    ✅
Virtuals                    ✅
Slugs                       ✅
Aggregation                 ✅

Frontend Integration        ✅
Responsive Interface        ✅
Git Version Control         ✅
GitHub Repository           ✅

Public Deployment           ⏳
```

---

# What I Learned

CampusHub was designed not only to practice writing Express routes but to understand how the different layers of a real backend application work together.

The project demonstrates practical understanding of:

```text
HTTP requests and responses
REST API design
Express middleware
MVC architecture
MongoDB data modeling
Mongoose schemas and middleware
document relationships
authentication
JWTs
password security
role authorization
resource ownership
CRUD
advanced API querying
aggregation
business-rule validation
error handling
application security
frontend/backend communication
Git and GitHub
```

The most important lesson from the project is that a backend is not simply a collection of endpoints.

A real application must coordinate:

```text
data
+
business rules
+
authentication
+
authorization
+
security
+
error handling
+
database behavior
+
client interaction
```

CampusHub brings those pieces together in one complete application.

---

# Author

**Youmna**

Computer Engineering Student

CampusHub was developed as a practical full-stack/backend project while studying and applying Node.js, Express, MongoDB, Mongoose, REST APIs, authentication, security, and production-oriented backend patterns.
