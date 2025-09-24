# 🔐 **Civic Voice Backend - Enhanced Admin System API Guide**

## 🚀 **Setup Instructions**

### 1. **Create First Super Admin**
```bash
npm run setup-superadmin
```
This creates: `superadmin@civicvoice.com` with password `SuperAdmin123!`

### 2. **Start Server**
```bash
npm start
```

---

## 👥 **User Roles**

| Role | Permissions |
|------|-------------|
| **user** | Submit reports, view own reports |
| **admin** | All user permissions + manage issues, view users, create admins |
| **superadmin** | All permissions + manage user roles, delete users/issues |

---

## 🔑 **Authentication Endpoints**

### **Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### **Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true
  }
}
```

### **Get Profile**
```http
GET /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🛠️ **Admin Issue Management**

### **Get All Issues**
```http
GET /api/admin/issues
Authorization: Bearer ADMIN_JWT_TOKEN
```

### **Get Single Issue**
```http
GET /api/admin/issues/{issueId}
Authorization: Bearer ADMIN_JWT_TOKEN
```

### **Update Issue Status**
```http
PUT /api/admin/issues/{issueId}/status
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "status": "Resolved"
}
```
Valid statuses: `"Pending"`, `"In Progress"`, `"Resolved"`, `"Verified"`

### **Delete Issue** (Super Admin Only)
```http
DELETE /api/admin/issues/{issueId}
Authorization: Bearer SUPERADMIN_JWT_TOKEN
```

---

## 👥 **User Management (Admin)**

### **Get All Users**
```http
GET /api/admin/users
Authorization: Bearer ADMIN_JWT_TOKEN
```

### **Get Single User**
```http
GET /api/admin/users/{userId}
Authorization: Bearer ADMIN_JWT_TOKEN
```

### **Create New Admin** (Super Admin Only)
```http
POST /api/admin/users/create-admin
Authorization: Bearer SUPERADMIN_JWT_TOKEN
Content-Type: application/json

{
  "username": "newadmin",
  "email": "newadmin@civicvoice.com",
  "password": "AdminPass123",
  "role": "admin"
}
```

### **Update User Role** (Super Admin Only)
```http
PUT /api/admin/users/{userId}/role
Authorization: Bearer SUPERADMIN_JWT_TOKEN
Content-Type: application/json

{
  "role": "admin"
}
```
Valid roles: `"user"`, `"admin"`, `"superadmin"`

### **Activate/Deactivate User**
```http
PUT /api/admin/users/{userId}/status
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "isActive": false
}
```

### **Delete User** (Super Admin Only)
```http
DELETE /api/admin/users/{userId}
Authorization: Bearer SUPERADMIN_JWT_TOKEN
```

---

## 📊 **Dashboard Statistics**

### **Get Dashboard Stats**
```http
GET /api/admin/dashboard/stats
Authorization: Bearer ADMIN_JWT_TOKEN

Response:
{
  "overview": {
    "totalIssues": 150,
    "pendingIssues": 45,
    "resolvedIssues": 89,
    "totalUsers": 1250,
    "adminUsers": 5
  },
  "charts": {
    "issuesByType": [
      {"_id": "Road", "count": 67},
      {"_id": "Water", "count": 34}
    ],
    "issuesByStatus": [
      {"_id": "Pending", "count": 45},
      {"_id": "Resolved", "count": 89}
    ]
  },
  "recentIssues": [...]
}
```

---

## 🧪 **Testing Workflow**

### **1. Setup Super Admin**
```bash
npm run setup-superadmin
```

### **2. Login as Super Admin**
```http
POST /api/auth/login
{
  "email": "superadmin@civicvoice.com",
  "password": "SuperAdmin123!"
}
```

### **3. Create Regular Admin**
```http
POST /api/admin/users/create-admin
Authorization: Bearer SUPERADMIN_TOKEN
{
  "username": "admin1",
  "email": "admin1@civicvoice.com",
  "password": "Admin123",
  "role": "admin"
}
```

### **4. Test Admin Capabilities**
- Login as admin
- View all issues
- Update issue statuses
- Manage users (but not delete)

### **5. Test User Registration**
```http
POST /api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123"
}
```

---

## 🔒 **Security Features**

✅ **Role-based Access Control**
✅ **JWT Token Authentication**
✅ **Account Activation/Deactivation**
✅ **Self-protection** (can't delete/deactivate own account)
✅ **Password Hashing** with bcrypt
✅ **Input Validation**
✅ **Rate Limiting**

---

## 📋 **Complete API Endpoint List**

### **Public Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### **User Endpoints**
- `GET /api/auth/profile` - Get user profile
- `POST /api/report` - Submit issue report
- `GET /api/user/my-reports` - Get user's reports

### **Admin Endpoints**
- `GET /api/admin/issues` - Get all issues
- `GET /api/admin/issues/:id` - Get single issue
- `PUT /api/admin/issues/:id/status` - Update issue status
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get single user
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `GET /api/admin/dashboard/stats` - Dashboard statistics

### **Super Admin Endpoints**
- `POST /api/admin/users/create-admin` - Create admin
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `DELETE /api/admin/issues/:id` - Delete issue

---

## 🎯 **Default Credentials**

**Super Admin:**
- Email: `superadmin@civicvoice.com`
- Password: `SuperAdmin123!`
- Role: `superadmin`

**⚠️ IMPORTANT: Change the super admin password after first login!**

---

## 🚀 **Your Enhanced Admin System is Ready!**

You now have a complete role-based admin system with:
- ✅ **3-tier role system** (user/admin/superadmin)
- ✅ **Complete user management**
- ✅ **Advanced issue management**
- ✅ **Dashboard statistics**
- ✅ **Security features**
- ✅ **Easy setup process**
