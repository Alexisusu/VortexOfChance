// Countdown timer for jackpot
document.addEventListener('DOMContentLoaded', () => {
    initCountdowns();
});

function initCountdowns() {
    const countdownElements = document.querySelectorAll('[data-countdown]');
    
    if (countdownElements.length === 0) return;
    
    countdownElements.forEach(element => {
        const targetDateStr = element.getAttribute('data-countdown');
        if (!targetDateStr) return;
        
        const targetDate = new Date(targetDateStr);
        
        if (isNaN(targetDate.getTime())) {
            console.error(`Invalid date format: ${targetDateStr}`);
            return;
        }
        
        const countdownInterval = setInterval(() => {
            const timeRemaining = calculateTimeRemaining(targetDate);
            
            if (timeRemaining.total <= 0) {
                clearInterval(countdownInterval);
                renderExpiredCountdown(element);
                return;
            }
            
            renderCountdown(element, timeRemaining);
        }, 1000);
        
        const timeRemaining = calculateTimeRemaining(targetDate);
        renderCountdown(element, timeRemaining);
    });
}

function calculateTimeRemaining(targetDate) {
    const now = new Date();
    const total = targetDate.getTime() - now.getTime();
    
    if (total <= 0) {
        return {
            total: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }
    
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    return { total, days, hours, minutes, seconds };
}

function renderCountdown(element, timeRemaining) {
    element.innerHTML = `
        <div class="countdown-unit">
            <div class="countdown-value">${padZero(timeRemaining.days)}</div>
            <div class="countdown-label">дней</div>
        </div>
        <div class="countdown-unit">
            <div class="countdown-value">${padZero(timeRemaining.hours)}</div>
            <div class="countdown-label">часов</div>
        </div>
        <div class="countdown-unit">
            <div class="countdown-value">${padZero(timeRemaining.minutes)}</div>
            <div class="countdown-label">минут</div>
        </div>
        <div class="countdown-unit">
            <div class="countdown-value">${padZero(timeRemaining.seconds)}</div>
            <div class="countdown-label">секунд</div>
        </div>
    `;
}

function renderExpiredCountdown(element) {
    const endedClass = element.getAttribute('data-countdown-ended-class') || 'countdown-ended';
    
    element.classList.add(endedClass);
    
    const endedText = element.getAttribute('data-countdown-ended-text') || 'Розыгрыш начался!';
    element.innerHTML = `<div class="countdown-expired">${endedText}</div>`;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

// Function to animate jackpot increase
const animateJackpot = (start, end, element) => {
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    
    const updateJackpot = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Calculate current value using easeOutExpo
        const currentValue = start + (end - start) * (1 - Math.pow(2, -10 * progress));
        
        // Format with commas
        element.textContent = Math.floor(currentValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        if (progress < 1) {
            requestAnimationFrame(updateJackpot);
        }
    };
    
    requestAnimationFrame(updateJackpot);
};

// Update timer immediately and then every second
updateTimer();
setInterval(updateTimer, 1000); 