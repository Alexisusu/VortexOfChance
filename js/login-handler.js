// Функция для обработки переключения вкладок
document.addEventListener('DOMContentLoaded', () => {
    console.log('Login handler script loaded');
    
    // Обработчик для переключения вкладок
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginTabs = document.querySelector('.login-tabs');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    
    console.log('Tab buttons:', tabBtns.length);
    console.log('Login tabs container:', loginTabs);
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Tab button clicked:', this.getAttribute('data-tab'));
            
            const tabName = this.getAttribute('data-tab');
            
            // Удаляем активный класс со всех кнопок
            tabBtns.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс к нажатой кнопке
            this.classList.add('active');
            
            // Скрываем все вкладки
            if (loginTab) loginTab.classList.add('hidden');
            if (registerTab) registerTab.classList.add('hidden');
            
            // Показываем нужную вкладку
            const targetTab = document.getElementById(`${tabName}-tab`);
            if (targetTab) {
                targetTab.classList.remove('hidden');
                console.log(`Showing tab: ${tabName}-tab`);
            }
            
            // Обновляем индикатор
            if (tabName === 'register') {
                loginTabs.classList.add('register-active');
                console.log('Adding register-active class');
            } else {
                loginTabs.classList.remove('register-active');
                console.log('Removing register-active class');
            }
        });
    });
    
    // Обработчики форм
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        console.log('Login form found');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                showMessage('error', 'Пожалуйста, заполните все поля');
                return;
            }
            
            // Имитация успешного входа
            showMessage('success', 'Вход выполнен успешно');
            
            // Перенаправление на главную страницу после успешного входа
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    } else {
        console.log('Login form not found');
    }
    
    if (registerForm) {
        console.log('Register form found');
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Register form submitted');
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (!name || !email || !password || !confirmPassword) {
                showMessage('error', 'Пожалуйста, заполните все поля');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('error', 'Пароли не совпадают');
                return;
            }
            
            // Имитация успешной регистрации
            showMessage('success', 'Регистрация прошла успешно');
            
            // Перенаправление на главную страницу после успешной регистрации
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    } else {
        console.log('Register form not found');
    }
});

// Функция для отображения сообщений
function showMessage(type, message) {
    console.log(`Showing message: ${type} - ${message}`);
    
    // Создаем элемент для сообщения, если его нет
    let messageEl = document.querySelector('.message-box');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'message-box';
        document.body.appendChild(messageEl);
        console.log('Created message box element');
    }
    
    // Добавляем класс для стилизации
    messageEl.className = 'message-box';
    messageEl.classList.add(type);
    
    // Устанавливаем текст сообщения
    messageEl.textContent = message;
    
    // Показываем сообщение
    messageEl.style.display = 'block';
    
    // Скрываем через 3 секунды
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
} 