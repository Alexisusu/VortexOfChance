import { parseXML, stringifyXML } from './xml-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    
    // Обработчик для переключения вкладок
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginTabs = document.querySelector('.login-tabs');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Удаляем активный класс со всех кнопок
            tabBtns.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс к нажатой кнопке
            this.classList.add('active');
            
            // Скрываем все вкладки
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.add('hidden');
            });
            
            // Показываем нужную вкладку
            document.getElementById(`${tabName}-tab`).classList.remove('hidden');
            
            // Обновляем индикатор
            if (tabName === 'register') {
                loginTabs.classList.add('register-active');
            } else {
                loginTabs.classList.remove('register-active');
            }
        });
    });
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', e => {
            e.preventDefault();
            showTab('forgotPassword');
        });
    }
    
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', e => {
            e.preventDefault();
            showTab('login');
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', submitLoginForm);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', submitRegisterForm);
    }
    
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', submitForgotPasswordForm);
    }
    
    const passwordFields = document.querySelectorAll('.password-field');
    passwordFields.forEach(field => {
        const input = field.querySelector('input');
        const toggleBtn = field.querySelector('.toggle-password');
        
        if (toggleBtn && input) {
            toggleBtn.addEventListener('click', () => {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                toggleBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            });
        }
    });
    
    const profileSection = document.querySelector('.user-profile-section');
    if (profileSection && isLoggedIn()) {
        updateProfileInfo();
    }
});

function showTab(tabName) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');

    if (loginTab) loginTab.classList.toggle('active', tabName === 'login');
    if (registerTab) registerTab.classList.toggle('active', tabName === 'register');
    
    if (loginForm) loginForm.style.display = tabName === 'login' ? 'block' : 'none';
    if (registerForm) registerForm.style.display = tabName === 'register' ? 'block' : 'none';
    if (forgotPasswordForm) forgotPasswordForm.style.display = tabName === 'forgotPassword' ? 'block' : 'none';
}

function submitLoginForm(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe')?.checked;
    
    if (!email || !password) {
        showMessage('error', 'Пожалуйста, заполните все поля');
        return;
    }
    
    const user = authenticateUser(email, password);
    
    if (user) {
        setUserSession(user, rememberMe);
        showMessage('success', 'Успешный вход');
        redirectToAccount();
    } else {
        showMessage('error', 'Неверный email или пароль');
    }
}

function submitRegisterForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showMessage('error', 'Пожалуйста, заполните все поля');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('error', 'Пароли не совпадают');
        return;
    }
    
    if (userExists(email)) {
        showMessage('error', 'Пользователь с таким email уже существует');
        return;
    }
    
    const newUser = registerUser(name, email, password);
    
    if (newUser) {
        setUserSession(newUser, false);
        showMessage('success', 'Регистрация успешна');
        redirectToAccount();
    } else {
        showMessage('error', 'Ошибка при регистрации');
    }
}

function submitForgotPasswordForm(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotPasswordEmail').value;
    
    if (!email) {
        showMessage('error', 'Пожалуйста, введите ваш email');
        return;
    }
    
    if (!userExists(email)) {
        showMessage('error', 'Пользователь с таким email не найден');
        return;
    }
    
    showMessage('success', 'Инструкции по восстановлению пароля отправлены на ваш email');
}

function showMessage(type, text) {
    const messageContainer = document.querySelector('.message-container') || createMessageContainer();
    
    messageContainer.className = 'message-container';
    messageContainer.classList.add(type);
    messageContainer.textContent = text;
    messageContainer.style.display = 'block';
    
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 3000);
}

function createMessageContainer() {
    const container = document.createElement('div');
    container.className = 'message-container';
    document.body.appendChild(container);
    return container;
}

function authenticateUser(email, password) {
    const users = parseXML(localStorage.getItem('users') || '<data></data>', '<data></data>');
    return users.find(user => user.email === email && user.password === password);
}

function userExists(email) {
    const users = parseXML(localStorage.getItem('users') || '<data></data>', '<data></data>');
    return users.some(user => user.email === email);
}

function registerUser(name, email, password) {
    const users = parseXML(localStorage.getItem('users') || '<data></data>', '<data></data>');
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        balance: 100,
        tickets: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', stringifyXML(users, 'users'));
    
    return newUser;
}

function setUserSession(user, rememberMe) {
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance || 0
    };
    
    sessionStorage.setItem('currentUser', stringifyXML(userData, 'user'));
    
    if (rememberMe) {
        localStorage.setItem('rememberedUser', stringifyXML(userData, 'user'));
    }
}

function isLoggedIn() {
    return !!sessionStorage.getItem('currentUser');
}

function updateProfileInfo() {
    const user = parseXML(sessionStorage.getItem('currentUser'));
    
    if (!user) return;
    
    const nameElement = document.getElementById('userName');
    const emailElement = document.getElementById('userEmail');
    const balanceElement = document.getElementById('userBalance');
    
    if (nameElement) nameElement.textContent = user.name;
    if (emailElement) emailElement.textContent = user.email;
    if (balanceElement) balanceElement.textContent = `${user.balance} $`;
}

function redirectToAccount() {
    setTimeout(() => {
        window.location.href = 'my-tickets.html';
    }, 1500);
} 