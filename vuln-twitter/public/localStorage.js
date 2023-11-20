const saveSession = function(username) {
    localStorage.setItem('user', username)
}


const getSession = function() {
    return localStorage.getItem('user');
}

const destorySession = function() {
    localStorage.clear();
}