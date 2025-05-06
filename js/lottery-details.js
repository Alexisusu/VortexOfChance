// Import XML loader functions
import { loadXMLData, getLotteries } from './xml-loader.js';
import { parseXML, stringifyXML } from './xml-utils.js';

// Set a flag to indicate that lottery-details.js has loaded
window.lotteryDetailsLoaded = true;

document.addEventListener('DOMContentLoaded', () => {
    // Get lottery ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const lotteryId = urlParams.get('id') || '1'; // Default to first lottery if no ID provided
    
    // Load lottery data
    loadLotteryData(lotteryId);
    
    // Setup ticket counter and buy button functionality
    setupTicketCounter();
    setupBuyButton(lotteryId);
});

// Function to load lottery data from XML file
async function loadLotteryData(lotteryId) {
    try {
        // Try to load XML data
        const response = await fetch('data.xml');
        if (!response.ok) throw new Error('Failed to load data');
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Find the selected lottery
        const lotteryElement = xmlDoc.querySelector(`lottery[id="${lotteryId}"]`);
        
        if (lotteryElement) {
            // Extract lottery data
            const lottery = {
                id: lotteryId,
                name: getElementText(lotteryElement, 'n') || 'Лотерея',
                description: getElementText(lotteryElement, 'description', 'Описание отсутствует'),
                price: getElementText(lotteryElement, 'price', '10'),
                currency: getElementText(lotteryElement, 'currency', '$'),
                jackpot: getElementText(lotteryElement, 'jackpot', '10000'),
                drawDate: getElementText(lotteryElement, 'drawDate', ''),
                odds: getElementText(lotteryElement, 'odds', '1:10000')
            };
            
            // Update page with lottery details
            populateLotteryDetails(lottery);
        } else {
            console.error(`Lottery with ID ${lotteryId} not found.`);
            useFallbackData();
        }
    } catch (error) {
        console.error('Error loading lottery data:', error);
        useFallbackData();
    }
}

// Helper function to safely get element text
function getElementText(element, selector, defaultValue = '') {
    const el = element.querySelector(selector);
    return el ? el.textContent : defaultValue;
}

// Use fallback data if XML loading fails
function useFallbackData() {
    const fallbackLottery = {
        id: '1',
        name: 'Счастливый билет',
        description: 'Испытай удачу с нашим классическим розыгрышем',
        price: '10',
        currency: '$',
        jackpot: '10000',
        drawDate: '2025-05-01T20:00:00',
        odds: '1:10000'
    };
    
    populateLotteryDetails(fallbackLottery);
}

// Function to populate lottery details on the page
function populateLotteryDetails(lottery) {
    // Update page title
    document.title = `${lottery.name} - VortexOfChance`;
    
    // Update lottery name in breadcrumb
    const lotteryNameElement = document.getElementById('lottery-name');
    if (lotteryNameElement) lotteryNameElement.textContent = lottery.name;
    
    // Update lottery details
    setElementText('lottery-title', lottery.name);
    setElementText('lottery-price', lottery.price);
    setElementText('lottery-currency', lottery.currency);
    setElementText('lottery-description-text', lottery.description);
    setElementText('jackpot-amount', `${Number(lottery.jackpot).toLocaleString()} ${lottery.currency}`);
    
    // Update draw date if available
    if (lottery.drawDate) {
        const date = new Date(lottery.drawDate);
        setElementText('draw-date', date.toLocaleDateString('ru-RU'));
    }
    
    // Update odds if available
    if (lottery.odds) {
        setElementText('odds', lottery.odds);
    }
    
    // Save lottery data for future reference
    document.querySelector('.lottery-details').dataset.lotteryData = stringifyXML(lottery, 'lottery');
}

// Helper function to set element text safely
function setElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = text;
}

// Function to setup ticket counter
function setupTicketCounter() {
    const ticketInput = document.getElementById('ticket-count');
    const decreaseBtn = document.getElementById('decrease-tickets');
    const increaseBtn = document.getElementById('increase-tickets');
    
    if (decreaseBtn && ticketInput) {
        decreaseBtn.addEventListener('click', () => {
            let count = parseInt(ticketInput.value);
            if (count > 1) {
                ticketInput.value = count - 1;
                updateTotal();
            }
        });
    }
    
    if (increaseBtn && ticketInput) {
        increaseBtn.addEventListener('click', () => {
            let count = parseInt(ticketInput.value);
            if (count < 100) {
                ticketInput.value = count + 1;
                updateTotal();
            }
        });
    }
    
    if (ticketInput) {
        ticketInput.addEventListener('change', () => {
            let count = parseInt(ticketInput.value);
            if (isNaN(count) || count < 1) {
                ticketInput.value = 1;
            } else if (count > 100) {
                ticketInput.value = 100;
            }
            updateTotal();
        });
    }
    
    // Add a total price element
    const ticketSelection = document.querySelector('.ticket-selection');
    if (ticketSelection) {
        const totalElement = document.createElement('div');
        totalElement.className = 'total-price';
        totalElement.innerHTML = '<span>Итоговая стоимость: </span><span id="total-amount">10 $</span>';
        ticketSelection.insertBefore(totalElement, document.querySelector('.buy-tickets-btn'));
    }
    
    // Initial update
    updateTotal();
}

// Function to update total price
function updateTotal() {
    const ticketInput = document.getElementById('ticket-count');
    const priceElement = document.getElementById('lottery-price');
    const currencyElement = document.getElementById('lottery-currency');
    const totalElement = document.getElementById('total-amount');
    
    if (ticketInput && priceElement && totalElement && currencyElement) {
        const count = parseInt(ticketInput.value) || 1;
        const price = parseFloat(priceElement.textContent) || 10;
        const currency = currencyElement.textContent || '$';
        const total = count * price;
        
        totalElement.textContent = `${total} ${currency}`;
    }
}

// Function to setup buy button
function setupBuyButton(lotteryId) {
    const buyButton = document.querySelector('.buy-tickets-btn');
    if (buyButton) {
        buyButton.addEventListener('click', () => {
            purchaseTickets(lotteryId);
        });
    }
}

// Function to purchase tickets
function purchaseTickets(lotteryId) {
    try {
        // Get lottery data
        const lotteryDetailsElement = document.querySelector('.lottery-details');
        if (!lotteryDetailsElement) throw new Error('Lottery details not found');
        
        const lotteryData = parseXML(lotteryDetailsElement.dataset.lotteryData || '<data></data>');
        const ticketCount = parseInt(document.getElementById('ticket-count').value) || 1;
        
        // Generate tickets and store them
        const tickets = [];
        const drawDate = lotteryData.drawDate ? new Date(lotteryData.drawDate) : new Date();
        
        // Add 14 days if no draw date is specified
        if (!lotteryData.drawDate) {
            drawDate.setDate(drawDate.getDate() + 14);
        }
        
        // Create tickets
        for (let i = 0; i < ticketCount; i++) {
            const ticket = {
                id: `${lotteryId}-${Date.now()}-${i}`,
                type: lotteryData.name,
                number: generateTicketNumber(),
                price: lotteryData.price,
                currency: lotteryData.currency,
                purchaseDate: new Date().toISOString(),
                drawDate: drawDate.toISOString(),
                status: 'active',
                lotteryId: lotteryId
            };
            
            tickets.push(ticket);
        }
        
        // Save tickets to localStorage
        const success = saveTicketsToStorage(tickets);
        
        if (success) {
            // Show success message
            showSuccessMessage(ticketCount, lotteryData.name);
        } else {
            throw new Error('Failed to save tickets');
        }
    } catch (error) {
        console.error('Error purchasing tickets:', error);
        alert('Произошла ошибка при покупке билетов. Пожалуйста, попробуйте позже.');
    }
}

// Generate a random ticket number (format: XXXX-XXXX-XXXX)
function generateTicketNumber() {
    const randomGroup = () => Math.floor(1000 + Math.random() * 9000);
    return `${randomGroup()}-${randomGroup()}-${randomGroup()}`;
}

// Save tickets to localStorage
function saveTicketsToStorage(newTickets) {
    try {
        // Get existing tickets
        const existingTickets = parseXML(localStorage.getItem('myTickets') || '<data></data>', '<data></data>');
        
        // Add new tickets
        const updatedTickets = [...existingTickets, ...newTickets];
        
        // Save to localStorage
        localStorage.setItem('myTickets', stringifyXML(updatedTickets, 'tickets'));
        
        // Log success for debugging
        console.log(`Successfully saved ${newTickets.length} tickets to localStorage`);
        console.log('Total tickets in storage:', updatedTickets.length);
        
        return true;
    } catch (error) {
        console.error('Error saving tickets to storage:', error);
        return false;
    }
}

// Show success message after purchase
function showSuccessMessage(ticketCount, lotteryName) {
    // Create success message container
    const successContainer = document.createElement('div');
    successContainer.className = 'purchase-success';
    
    // Add content to success message
    successContainer.innerHTML = `
        <div class="success-icon"><i class="fas fa-check-circle"></i></div>
        <h3>Покупка успешно завершена!</h3>
        <p>Вы приобрели ${ticketCount} билет${ticketCount > 1 ? 'а' : ''} лотереи "${lotteryName}"</p>
        <div class="success-actions">
            <a href="my-tickets.html" class="view-tickets-btn">Просмотреть мои билеты</a>
            <button class="continue-shopping-btn">Продолжить покупки</button>
        </div>
    `;
    
    // Insert into page
    const main = document.querySelector('main');
    if (main) {
        // Hide existing content
        Array.from(main.children).forEach(child => {
            child.style.display = 'none';
        });
        
        // Show success message
        main.appendChild(successContainer);
        
        // Add animation
        setTimeout(() => {
            successContainer.classList.add('show');
        }, 10);
        
        // Setup continue shopping button
        const continueButton = successContainer.querySelector('.continue-shopping-btn');
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                // Remove success message with animation
                successContainer.classList.remove('show');
                
                setTimeout(() => {
                    // Remove success message
                    successContainer.remove();
                    
                    // Show content again
                    Array.from(main.children).forEach(child => {
                        child.style.display = '';
                    });
                    
                    // Reset ticket count
                    const ticketInput = document.getElementById('ticket-count');
                    if (ticketInput) ticketInput.value = 1;
                    updateTotal();
                }, 300);
            });
        }
    }
} 