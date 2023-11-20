

function initialize() {
    const loginForm = document.getElementById('loginForm');
    const LOGIN_URL = '/api/login'
    destorySession();
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
      
        let usernameInput = document.getElementById("username");
        let passwordInput = document.getElementById("password");
        const rawResponse = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: usernameInput.value, password: passwordInput.value})
        });
        const content = await rawResponse.json();
        
        if (!content) {
            alert("Login fail!");
            usernameInput.value = '';
            passwordInput.value = '';
            return;
        }
        
        if (content.auth != "true") {
            alert(content.message);
            usernameInput.value = '';
            passwordInput.value = '';
            return;            
        }

        saveSession(content.name);
        window.location.href = '/public/feed.html';
    });
}

window.addEventListener('load', initialize);

