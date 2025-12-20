# BlueMoon Backend API

Backend API for the BlueMoon apartment management system with admin user management functionality.

## Features

- ✅ Admin user CRUD operations
- ✅ JWT authentication with Supabase
- ✅ Role-based access control
- ✅ User management (Create, Read, Update, Delete)
- ✅ Password reset functionality
- ✅ Pagination and filtering

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your Supabase credentials:

```env
PORT=3001
NODE_ENV=development

# Get these from your Supabase project settings
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

FRONTEND_URL=http://localhost:3000
```

**Important:** You need the `SUPABASE_SERVICE_ROLE_KEY` for admin operations. Get it from:
- Supabase Dashboard → Settings → API → service_role (secret)

### 3. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /api/health
```

### User Management (Admin Only)

All user management endpoints require:
- Valid JWT token in Authorization header: `Bearer <token>`
- Admin role

#### Get All Users
```
GET /api/users?page=1&limit=10&search=&role=
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by username, full name, or email
- `role` - Filter by role (admin, manager, user)

**Response:**
```json
{
  "users": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### Get User by ID
```
GET /api/users/:id
```

#### Create User
```
POST /api/users
```

**Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "username": "newuser",
  "full_name": "New User",
  "role": "user",
  "apartment_number": "B205"
}
```

#### Update User
```
PUT /api/users/:id
```

**Body:**
```json
{
  "username": "updatedusername",
  "full_name": "Updated Name",
  "role": "manager",
  "apartment_number": "C301"
}
```

#### Delete User
```
DELETE /api/users/:id
```

#### Reset User Password
```
POST /api/users/:id/reset-password
```

**Body:**
```json
{
  "password": "newpassword123"
}
```

## Authentication

Include the JWT token from Supabase in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get the token from your frontend:
```javascript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js          # Supabase client configuration
│   ├── controllers/
│   │   └── userController.js    # User CRUD operations
│   ├── middleware/
│   │   └── auth.js               # Authentication & authorization
│   ├── routes/
│   │   ├── index.js              # Main router
│   │   └── userRoutes.js         # User routes
│   └── index.js                  # Express app entry point
├── .env                          # Environment variables (git-ignored)
├── .env.example                  # Environment template
├── package.json
└── README.md
```

## Technologies

- Node.js
- Express.js
- Supabase (Auth & Database)
- JWT Authentication
- bcryptjs
