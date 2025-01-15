function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function redirectToLogin() {
    const token = getCookie('noya_token');
    if (token) {
        window.location.href = "User/user.html";
    } else {
        window.location.href = "Login/login.html";
    }
}

function redirectToPurchase() {
    window.open('http://121.62.30.230:60906/', '_blank');
}
