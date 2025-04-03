document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const errorMessage = document.getElementById('error-message');
    
    checkAuth();
    
    loginBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.location.href = '/profile';
            } else {
                showError(data.message || 'Неверные учетные данные');
            }
        } catch (err) {
            showError('Ошибка соединения');
        }
    });
    
    registerBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                showError('Регистрация успешна. Теперь вы можете войти.', false);
            } else {
                showError(data.message || 'Ошибка регистрации');
            }
        } catch (err) {
            showError('Ошибка соединения');
        }
    });
    
    async function checkAuth() {
        try {
            const response = await fetch('/check-auth', { credentials: 'include' });
            const data = await response.json();
            
            if (data.authenticated) {
                window.location.href = '/profile';
            }
        } catch (err) {
            console.error('Auth check error:', err);
        }
    }
    
    function showError(message, isError = true) {
        errorMessage.textContent = message;
        errorMessage.classList.toggle('error', isError);
        errorMessage.classList.remove('hidden');
        
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 3000);
    }
});