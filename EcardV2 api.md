| #   | Method | Endpoint       | Authentication | Role Required | Description      |
| --- | ------ | -------------- | -------------- | ------------- | ---------------- |
| 1   | GET    | /health        | ❌             | None          | Health check     |
| 2   | POST   | /api/signup    | ❌             | None          | Create new user  |
| 3   | POST   | /api/login     | ❌             | None          | User login       |
| 4   | GET    | /api/profile   | ✅             | Any           | Get user profile |
| 5   | GET    | /api/users     | ✅             | Admin         | List all users   |
| 6   | PUT    | /api/users/:id | ✅             | Admin         | Update user role |
| 7   | DELETE | /api/users/:id | ✅             | Admin         | Delete user      |
