document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const dataDisplay = document.getElementById('data-display');
    
    checkAuth();
    
    loadProfile();
    
    loadData();
    
    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.location.href = '/';
            }
        } catch (err) {
            console.error('Ошибка выхода:', err);
            alert('Ошибка при выходе');
        }
    });
    
    refreshBtn.addEventListener('click', () => {
        loadData(true);
    });
    
    async function checkAuth() {
        try {
            const response = await fetch('/check-auth', { credentials: 'include' });
            const data = await response.json();
            
            if (!data.authenticated) {
                window.location.href = '/';
            }
        } catch (err) {
            console.error('Ошибка проверки авторизации:', err);
            window.location.href = '/';
        }
    }
    
    function loadProfile() {
        fetch('/check-auth', { credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                if (data.authenticated && data.user) {
                    usernameDisplay.textContent = data.user.username;
                }
            })
            .catch(err => {
                console.error('Ошибка загрузки профиля:', err);
            });
    }
    
    function loadData(forceRefresh = false) {
        const url = '/data' + (forceRefresh ? '?refresh=true' : '');
        
        fetch(url, { credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    dataDisplay.textContent = JSON.stringify(data.data, null, 2);
                }
            })
            .catch(err => {
                console.error('Ошибка загрузки данных:', err);
                dataDisplay.textContent = 'Ошибка загрузки данных';
            });
    }
});