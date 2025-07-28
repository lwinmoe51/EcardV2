# Backend API Server

A Node.js/Express backend server with Supabase integration for user authentication and management.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

Make sure you have a `users` table in your Supabase database with the following structure:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Run the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### POST /api/signup

Create a new user account.

**Request Body:**

```json
{
    "username": "string (min 3 chars, alphanumeric + underscore only)",
    "password": "string (min 6 chars)"
}
```

**Response:**

```json
{
    "message": "User created successfully!",
    "user": {
        "id": "uuid",
        "username": "string",
        "role": "user",
        "created_at": "timestamp"
    },
    "token": "jwt-token"
}
```

#### POST /api/login

Authenticate user and get JWT token.

**Request Body:**

```json
{
    "username": "string",
    "password": "string"
}
```

**Response:**

```json
{
    "message": "Login successful",
    "user": {
        "id": "uuid",
        "username": "string",
        "role": "string",
        "created_at": "timestamp"
    },
    "token": "jwt-token"
}
```

#### GET /api/profile

Get current user profile (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
    "user": {
        "id": "uuid",
        "username": "string",
        "role": "string",
        "created_at": "timestamp"
    }
}
```

### User Management (Admin Only)

#### GET /api/users

Get all users (requires admin role).

#### DELETE /api/users/:id

Delete a user (requires admin role).

#### PUT /api/users/:id

Update user role (requires admin role).

## Error Responses

All endpoints return consistent error responses:

```json
{
    "error": "Error message",
    "details": "Additional error details (optional)"
}
```

## Security Features

-   Password hashing with bcrypt (12 rounds)
-   JWT token authentication
-   Input validation and sanitization
-   CORS configuration
-   Environment variable validation
-   Request logging
-   Global error handling

## Health Check

#### GET /health

Check server status.

**Response:**

```json
{
    "status": "OK",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "environment": "development"
}
```
