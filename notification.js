// 显示通知
function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const content = document.createElement('div');
    content.className = 'notification-content';
    
    const icon = document.createElement('span');
    icon.className = 'notification-icon';
    icon.innerHTML = type === 'success' ? '✓' : '✕';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '×';
    
    content.appendChild(icon);
    content.appendChild(text);
    notification.appendChild(content);
    notification.appendChild(closeBtn);
    
    container.appendChild(notification);
    
    closeBtn.onclick = () => {
        notification.style.animation = 'slideOut 0.5s ease forwards';
        setTimeout(() => {
            container.removeChild(notification);
        }, 500);
    };
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.5s ease forwards';
            setTimeout(() => {
                if (notification.parentElement) {
                    container.removeChild(notification);
                }
            }, 500);
        }
    }, 3000);
} 