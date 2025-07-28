// Example data for login
const loginData = {
    username: "testuser", // or username
    password: "123456",
};

fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
})
    .then((response) => {
        console.log(response);
        if (!response.ok) {
            // Handle HTTP errors (e.g., 401 Unauthorized, 400 Bad Request)
            return response.json().then((err) => {
                throw new Error(err.message || "Login failed");
            });
        }
        return response.json();
    })
    .then((data) => {
        console.log("Login successful:", data);
        // Assuming your API returns a token (e.g., JWT) in the data
        const authToken = data.token;
        if (authToken) {
            // Store the token securely (e.g., in localStorage)
            localStorage.setItem("authToken", authToken);
            console.log("Auth token stored:", authToken);
            // Redirect to a protected page or update UI
        } else {
            console.warn("No authentication token received.");
        }
    })
    .catch((error) => {
        console.error("Error during login:", error.message);
        // Display error to the user
    });
