#	Method	Endpoint	    Authentication	Role Required	Description
1	POST	/api/signup	    ❌	            None	        Create new user
2	POST	/api/login	    ❌	            None	        User login
3	GET	    /api/profile	✅	            Any	            Get user profile
4	GET	    /api/users	    ✅	            Admin	        List all users
5	PUT	    /api/users/:id	✅	            Admin	        Update user role
6	DELETE	/api/users/:id	✅	            Admin	        Delete user
7	GET	    /health	        ❌	            None	        Health check

