const API_BASE_URL = 'https://noyaa.mckkc.fun';

// 设置Cookie
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    
    const account = document.getElementById('account').value;
    const password = document.getElementById('password').value;
    
    try {
        const loginResponse = await fetch(`${API_BASE_URL}/NoyaAuth/Web/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account,
                password
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginData.status === 200) {
            showNotification('登录成功');
            setCookie('noya_token', loginData.token, 7);
            
            const profileResponse = await fetch(`${API_BASE_URL}/NoyaAuth/Web/getUserProfile?token=${loginData.token}`);
            const profileData = await profileResponse.json();
            
            if (profileData.status === 200) {
                localStorage.setItem('userProfile', JSON.stringify(profileData));
                setCookie('noya_uid', profileData.uid, 7);
                window.location.href = '../User/user.html';
            } else {
                showNotification(profileData.msg, 'error');
            }
        } else {
            showNotification(loginData.msg, 'error');
        }
    } catch (error) {
        console.error('登录失败:', error);
        showNotification('登录失败，请稍后重试', 'error');
    }
}
