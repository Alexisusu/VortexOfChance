// Import XML loader functions
import { loadXMLData, getLotteries, getFeaturedSlides } from './xml-loader.js';

document.addEventListener('DOMContentLoaded', function() {
    initMenuButton();
    initSubmenuToggle();
    initHeroSlider();
    initWinnersTicker();
    initCountdownTimers();
    smoothScrollToHash();
    initBackToTop();
        });

function initMenuButton() {
    const menuBtn = document.querySelector('.menu-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            dropdownMenu.classList.toggle('active');
        });
    }
}

function initSubmenuToggle() {
    const submenuLinks = document.querySelectorAll('.has-submenu');
    
    submenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const submenu = this.nextElementSibling;
            
            if (submenu && submenu.classList.contains('submenu')) {
                if (submenu.style.maxHeight) {
                    submenu.style.maxHeight = null;
                } else {
                    submenu.style.maxHeight = submenu.scrollHeight + 'px';
                }
            }
        });
    });
}

function initHeroSlider() {
    const sliderContainer = document.querySelector('.lottery-slider');
    
    if (!sliderContainer) return;
    
    const slides = sliderContainer.querySelectorAll('.lottery-slide');
    const totalSlides = slides.length;
    
    if (totalSlides <= 1) return;
    
    let currentSlide = 0;
    
    function showSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'flex' : 'none';
        });
        
        currentSlide = index;
    }
    
    showSlide(0);
    
    const prevBtn = sliderContainer.querySelector('.prev-slide');
    const nextBtn = sliderContainer.querySelector('.next-slide');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
    }
    
    setInterval(() => showSlide(currentSlide + 1), 7000);
}

function initWinnersTicker() {
    const ticker = document.querySelector('.winners-ticker');
    if (!ticker) return;
    
    const tickerContent = ticker.querySelector('.ticker-content');
    if (!tickerContent) return;
    
    const itemWidth = 250;
    const speed = 0.5;
    
    let position = 0;
    
    function animate() {
        position -= speed;
        
        if (position <= -itemWidth) {
            const firstItem = tickerContent.firstElementChild;
            tickerContent.appendChild(firstItem);
            position = 0;
        }
        
        tickerContent.style.transform = `translateX(${position}px)`;
        requestAnimationFrame(animate);
    }
    
    animate();
}

function initCountdownTimers() {
    const timers = document.querySelectorAll('.countdown-timer');
    
    timers.forEach(timer => {
        const drawDate = timer.getAttribute('data-draw-date');
        if (!drawDate) return;
        
        const targetDate = new Date(drawDate);
        
        updateTimer(timer, targetDate);
        
        setInterval(() => updateTimer(timer, targetDate), 1000);
    });
}

function updateTimer(timerElement, targetDate) {
    const now = new Date();
    let distance = targetDate - now;
    
    if (distance < 0) {
        timerElement.innerHTML = '<span class="ended">Розыгрыш состоялся</span>';
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const timeString = `
        <div class="time-unit">
            <span class="time-value">${days}</span>
            <span class="time-label">дней</span>
        </div>
        <div class="time-unit">
            <span class="time-value">${hours}</span>
            <span class="time-label">часов</span>
        </div>
        <div class="time-unit">
            <span class="time-value">${minutes}</span>
            <span class="time-label">минут</span>
        </div>
        <div class="time-unit">
            <span class="time-value">${seconds}</span>
            <span class="time-label">секунд</span>
        </div>
    `;
    
    timerElement.innerHTML = timeString;
}

function smoothScrollToHash() {
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }
            }
            
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
                
                window.history.pushState(null, null, targetId);
            }
        });
    });
}

function initBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (!backToTopButton) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });
    
    backToTopButton.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Function to get featured slides from XML
function getFeaturedSlides(xmlDoc) {
    const slideNodes = xmlDoc.querySelectorAll('featuredSlides > slide');
    const slides = [];
    
    slideNodes.forEach(node => {
        slides.push({
            title: node.querySelector('title').textContent,
            description: node.querySelector('description').textContent,
            image: node.querySelector('image').textContent
        });
    });
    
    return slides;
}

// Function to populate lottery cards
function populateLotteryCards(lotteries) {
    const cardsContainer = document.querySelector('.lottery-cards');
    
    if (!cardsContainer) return;
    
    // Clear container
    cardsContainer.innerHTML = '';
    
    // Add cards
    lotteries.forEach(lottery => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${lottery.name}</h3>
            <p>${lottery.description}</p>
            <div class="price">${lottery.price} ${lottery.currency}</div>
            <div class="jackpot">Джекпот: ${lottery.jackpot} ${lottery.currency}</div>
        `;
        
        // Add click event
        card.addEventListener('click', () => {
            // Redirect to lottery details page with the lottery ID
            window.location.href = `lottery-details.html?id=${lottery.id}`;
        });
        
        cardsContainer.appendChild(card);
    });
}

// Function to populate banner
function populateBanner(slides) {
    const bannerContainer = document.querySelector('.main-banner');
    
    if (!bannerContainer) return;
    
    if (slides.length > 0) {
        const slide = slides[0]; // Start with the first slide
        
        bannerContainer.innerHTML = `
            <h2>${slide.title}</h2>
            <p>${slide.description}</p>
        `;
        
        // Add background image if available
        if (slide.image) {
            bannerContainer.style.backgroundImage = `url(${slide.image})`;
            bannerContainer.style.backgroundSize = 'cover';
            bannerContainer.style.backgroundPosition = 'center';
        }
    }
}

// Display balance in header
function displayHeaderBalance() {
    const headerBalanceEl = document.querySelector('.header-balance');
    if (headerBalanceEl) {
        const balance = localStorage.getItem('globalBalance') || 10000;
        headerBalanceEl.textContent = balance;
    }
}

// Function to initialize the global balance
function initializeGlobalBalance() {
    if (!localStorage.getItem('globalBalance')) {
        localStorage.setItem('globalBalance', '10000');
    }
}

// Global balance manager
window.balanceManager = {
    getBalance: function() {
        return parseInt(localStorage.getItem('globalBalance') || '10000');
    },
    setBalance: function(newBalance) {
        localStorage.setItem('globalBalance', newBalance.toString());
        
        // Update display if on page
        const balanceEl = document.querySelector('.header-balance');
        if (balanceEl) {
            balanceEl.textContent = newBalance;
        }
    },
    addToBalance: function(amount) {
        const currentBalance = this.getBalance();
        this.setBalance(currentBalance + amount);
    },
    subtractFromBalance: function(amount) {
        const currentBalance = this.getBalance();
        this.setBalance(Math.max(0, currentBalance - amount));
    }
}; 