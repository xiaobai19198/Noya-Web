const API_BASE_URL = 'https://noyaa.mckkc.fun';

// 获取Cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// 更新用户信息显示
function updateUserInfo(data) {
    document.getElementById('uid').textContent = data.uid;
    document.getElementById('account').textContent = data.account;
    document.getElementById('qq').textContent = data.qq;
    document.getElementById('duetime').textContent = data.duetime;
    document.getElementById('status').textContent = data.isban === "false" ? '正常' : '封禁';
    document.getElementById('location').textContent = data.location;
    
    // 更新欢迎语中的用户名
    document.getElementById('welcomeUser').textContent = data.account;

    // 更新解封按钮状态
    const unbanBtn = document.getElementById('unbanBtn');
    if (data.isban === "true") {
        unbanBtn.disabled = false;  // 如果被封禁，启用解封按钮
        unbanBtn.title = '点击进行账户解封';
        
        // 延迟显示模态窗口
        setTimeout(() => {
            showBanModal();
        }, 800);
    } else {
        unbanBtn.disabled = true;   // 如果未被封禁，禁用解封按钮
        unbanBtn.title = '账户状态正常，无需解封';
    }
}

// 页面加载时获取用户信息
async function loadUserProfile() {
    const token = getCookie('noya_token');
    
    if (!token) {
        showNotification('请先登录', 'error');
        setTimeout(() => {
            window.location.href = '../Login/login.html';
        }, 1500);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/NoyaAuth/Web/getUserProfile?token=${token}`);
        const data = await response.json();

        if (data.status === 200) {
            updateUserInfo(data);
            showNotification('加载成功');
        } else {
            showNotification(data.msg, 'error');
            setTimeout(() => {
                window.location.href = '../Login/login.html';
            }, 1500);
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        showNotification('获取用户信息失败，请重新登录', 'error');
        setTimeout(() => {
            window.location.href = '../Login/login.html';
        }, 1500);
    }
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    updateWelcomeTime();
    // 每分钟更新一次时间问候
    setInterval(updateWelcomeTime, 60000);
});

// 添加注销功能
function handleLogout() {
    // 清除所有cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
    
    // 清除localStorage
    localStorage.clear(); // 清除所有localStorage
    
    // 显示提示
    showNotification('已成功注销');
    // 延迟跳转到首页
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1000);
}

// 切换标签页
function switchTab(tabId) {
    // 移除所有active类
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 添加active类到选中的标签
    document.querySelector(`.tab-btn[onclick="switchTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// 处理每日打卡
async function handleDailyCheckIn() {
    const account = document.getElementById('account').textContent;
    if (account === '加载中...') {
        showNotification('请等待用户信息加载完成', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/NoyaAuth/tianka_anticheat?account=${account}`);
        const data = await response.json();

        if (data.status === 200) {
            showNotification('打卡成功，已领取天卡奖励');
            // 重新加载用户信息
            loadUserProfile();
        } else {
            showNotification(data.msg, 'error');
        }
    } catch (error) {
        console.error('打卡失败:', error);
        showNotification('打卡失败，请稍后重试', 'error');
    }
}

// 更新欢迎语时间
function updateWelcomeTime() {
    const now = new Date();
    const hours = now.getHours();
    let timeText = '';
    
    if (hours >= 5 && hours < 12) {
        timeText = '早上好';
    } else if (hours >= 12 && hours < 14) {
        timeText = '中午好';
    } else if (hours >= 14 && hours < 18) {
        timeText = '下午好';
    } else if (hours >= 18 && hours < 22) {
        timeText = '晚上好';
    } else {
        timeText = '夜深了';
    }
    
    document.getElementById('welcomeTime').textContent = timeText;
}

// 显示封禁模态窗口
function showBanModal() {
    // 检查是否在不提醒期内
    const noRemindUntil = getCookie('ban_no_remind');
    if (noRemindUntil && new Date().getTime() < parseInt(noRemindUntil)) {
        return;
    }

    const modal = document.getElementById('banModal');
    document.body.classList.add('modal-open'); // 添加类防止背景滚动
    
    // 确保DOM更新后再添加active类
    requestAnimationFrame(() => {
        modal.style.display = 'flex';
        // 强制重排
        modal.offsetHeight;
        modal.classList.add('active');
    });
}

// 关闭封禁模态窗口
function closeBanModal(noRemind = false) {
    const modal = document.getElementById('banModal');
    
    // 添加关闭动画
    modal.classList.add('closing');
    
    // 等待动画完成后再隐藏
    setTimeout(() => {
        modal.classList.remove('active', 'closing');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // 如果选择了不再提醒，设置7天的cookie
        if (noRemind) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);
            document.cookie = `ban_no_remind=${expiryDate.getTime()};expires=${expiryDate.toUTCString()};path=/`;
        }
    }, 300);
}

// 跳转到解封页面
function redirectToUnban() {
    window.open('../Unban/unban.html', '_blank');
}
