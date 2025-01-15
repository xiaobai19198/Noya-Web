const API_BASE_URL = 'https://noyaa.mckkc.fun';

// 获取Cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// 更新状态显示
function updateStatusDisplay(status, message, unbantime = null) {
    const statusContainer = document.getElementById('statusContainer');
    const unbanForm = document.getElementById('unbanForm');
    const unbanProgress = document.getElementById('unbanProgress');
    const buttonGroup = document.getElementById('buttonGroup');
    
    // 显示UID
    const uid = getCookie('noya_uid');
    document.getElementById('userUid').textContent = uid || '-';
    
    // 更新状态文本
    const statusTitle = statusContainer.querySelector('h3');
    const statusDesc = statusContainer.querySelector('p');
    
    switch (status) {
        case 200: // 可以申请解封
            statusTitle.textContent = "可以申请解封";
            statusDesc.textContent = "请输入解封码进行解封";
            unbanForm.style.display = 'block';
            unbanProgress.style.display = 'none';
            buttonGroup.innerHTML = `
                <a href="../User/user.html" class="btn back">返回用户中心</a>
                <a href="http://121.62.30.230:60906/" target="_blank" class="btn buy">购买解封码</a>
            `;
            break;
            
        case 3001: // 账号未被封禁
            statusTitle.textContent = "账号状态正常";
            statusDesc.textContent = "您的账号未被封禁，无需解封 (5秒后返回)";
            unbanForm.style.display = 'none';
            unbanProgress.style.display = 'none';
            buttonGroup.innerHTML = `
                <a href="../User/user.html" class="btn back" style="grid-column: 1 / -1;">返回用户中心</a>
            `;
            break;
            
        case 3002: // 已提交解封申请
            statusTitle.textContent = "解封申请处理中";
            statusDesc.textContent = "您已提交解封申请，请耐心等待";
            unbanForm.style.display = 'none';
            unbanProgress.style.display = 'block';
            document.getElementById('unbanTime').textContent = unbantime;
            buttonGroup.innerHTML = `
                <a href="../User/user.html" class="btn back" style="grid-column: 1 / -1;">返回用户中心</a>
            `;
            break;
            
        default: // 错误状态
            statusTitle.textContent = "发生错误";
            statusDesc.textContent = message || "请稍后重试";
            unbanForm.style.display = 'none';
            unbanProgress.style.display = 'none';
            buttonGroup.innerHTML = `
                <a href="../User/user.html" class="btn back" style="grid-column: 1 / -1;">返回用户中心</a>
            `;
    }
}

// 倒计时返回函数
function countdownAndReturn() {
    let seconds = 5;
    const statusDesc = document.querySelector('.status-container p');
    
    const timer = setInterval(() => {
        seconds--;
        statusDesc.textContent = `您的账号未被封禁，无需解封 (${seconds}秒后返回)`;
        
        if (seconds <= 0) {
            clearInterval(timer);
            window.location.href = '../User/user.html';
        }
    }, 1000);
}

// 检查解封状态
async function checkUnbanStatus() {
    const uid = getCookie('noya_uid');
    if (!uid) {
        window.location.href = '../Login/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/NoyaAuth/Web/CheckUnbanStatus?uid=${uid}`);
        const data = await response.json();
        
        // 如果状态是3002（已提交申请），检查是否已经过了解封时间
        if (data.status === 3002) {
            const now = new Date();
            const unbanTime = new Date(data.unbantime);
            
            if (now >= unbanTime) {
                setTimeout(() => {
                    checkUnbanStatus();
                }, 1000);
                return;
            }
        }
        
        updateStatusDisplay(data.status, data.msg, data.unbantime);
        
        if (data.status === 3001) {
            showNotification('账号未被封禁', 'success');
            countdownAndReturn(); // 启动倒计时
        }
    } catch (error) {
        console.error('检查状态失败:', error);
        showNotification('检查状态失败，请稍后重试', 'error');
        updateStatusDisplay(500, '服务器连接失败');
    }
}

// 提交解封申请
async function handleUnban(event) {
    event.preventDefault();
    
    const uid = getCookie('noya_uid');
    const card = document.getElementById('card').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/NoyaAuth/Web/RequestUnban`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: uid,
                card: card
            })
        });
        
        const data = await response.json();
        
        if (data.status === 200) {
            showNotification('解封申请提交成功');
            updateStatusDisplay(3002, data.msg, data.unbantime);
        } else {
            showNotification(data.msg, 'error');
        }
    } catch (error) {
        console.error('提交申请失败:', error);
        showNotification('提交申请失败，请稍后重试', 'error');
    }
}

// 页面加载时检查状态
document.addEventListener('DOMContentLoaded', () => {
    checkUnbanStatus();
    
    // 绑定表单提交事件
    const unbanForm = document.getElementById('unbanForm');
    unbanForm.addEventListener('submit', handleUnban);
});