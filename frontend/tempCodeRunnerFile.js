const bodyJSON = {
    username: "",
    password: "",
};

fetch("http://localhost:5000/api/signup", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyJSON),
})
    .then((response) => response.json()) // <-- Parse JSON body
    .then((data) => {
        console.log(data); // <-- This will show the error object!
    })
    .catch((error) => {
        console.error(error.message);
    });
