# GET /api/health NoNeedRole NoAuthenticationNeed Health check

```bash
curl http://localhost:5000/health
```

# POST /api/signup NoNeedRole CreateNewUser

```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"<username>","email":"<email>","password":"<password>"}'
```

# POST /api/login NoNeedRole UserLogin

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "<username || email>", "password": "<password>"}'
```

# GET /api/profile AnyUser GetUserProfile

```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer <anyUser_token>"
```

# GET /api/users AdminOnly ListAllUsers

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <admin_token>"
```

# PUT /api/users/:id AdminOnly UpdateUserRole

```bash
curl -X PUT http://localhost:5000/api/users/<userID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"role": "admin"}'
```

# DELETE /api/users/:id AdminOnlyDeleteUser

```bash
curl -X DELETE http://localhost:5000/api/users/<usreId> \
  -H "Authorization: Bearer <admin_token>"
```
