## Setup Instructions

### 1. Install Dependencies

Run the following command in both the `frontend` and `backend` folders:

```
npm install
```

---

### 2. Redis Setup (Windows)

- Use **Memurai** (Redis-compatible for Windows).
- Download and install: https://www.memurai.com/get-memurai

---

### 3. Backend Environment Variables

Create a `.env` file inside the `backend` folder and add:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017
DB_NAME=RES_TS
CLIENT_ORIGIN=http://localhost:5173

JWT_ACCESS_SECRET=this-is-secret-for-jwt-access-token
JWT_ACCESS_EXPIRES_IN=1d

JWT_REFRESH_SECRET=this-is-secret-for-jwt-access-token
JWT_REFRESH_EXPIRES_IN=7d

REDIS_URL=redis://localhost:6379/0
```

---

### 4. Frontend Environment Variables

Create a `.env` file inside the `frontend` folder and add:

```
VITE_API_URL=http://localhost:5000/api
```
