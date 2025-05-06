document.addEventListener('DOMContentLoaded', function() {
    
    const reels = document.querySelectorAll('.reel');
    const spinButton = document.querySelector('.spin-button');
    const decreaseBtn = document.querySelector('.decrease-bet');
    const increaseBtn = document.querySelector('.increase-bet');
    const currentBetEl = document.querySelector('.current-bet');
    const balanceEl = document.querySelector('.balance');
    const headerBalanceEl = document.querySelector('.header-balance');
    
    
    let currentBet = 5;
    let isSpinning = false;
    
    
    let balance = window.balanceManager ? window.balanceManager.getBalance() : 10000;
    
    
    const symbols = ['🍒', '🍋', '🍊', '🍇', '7️⃣', '💎'];
    const payouts = {
        '🍒': 3,
        '🍋': 5,
        '🍊': 8,
        '🍇': 10,
        '7️⃣': 20,
        '💎': 50
    };
    
    
    initializeReels();
    
    
    spinButton.addEventListener('click', spin);
    decreaseBtn.addEventListener('click', decreaseBet);
    increaseBtn.addEventListener('click', increaseBet);
    
    
    function initializeReels() {
        reels.forEach(reel => {
            
            reel.innerHTML = '';
            
            
            const symbolsContainer = document.createElement('div');
            symbolsContainer.className = 'symbols';
            reel.appendChild(symbolsContainer);
            
            
            for (let i = 0; i < 10; i++) {
                const symbolElement = document.createElement('div');
                symbolElement.className = 'symbol';
                symbolElement.textContent = getRandomSymbol();
                symbolsContainer.appendChild(symbolElement);
            }
        });
        
        
        const slotsReels = document.querySelector('.slots-reels');
        const payline = document.createElement('div');
        payline.className = 'payline';
        payline.style.cssText = `
            position: absolute;
            left: 0;
            width: 100%;
            height: 5px;
            background-color: red;
            top: 50%;
            transform: translateY(-50%);
            z-index: 5;
            opacity: 0.7;
            pointer-events: none;
        `;
        slotsReels.appendChild(payline);
    }
    
    
    function getRandomSymbol() {
        return symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    
    function getRiggedSymbol(previousSymbol) {
        
        if (Math.random() < 0.9999) {
            
            const availableSymbols = symbols.filter(s => s !== previousSymbol);
            return availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
        } else {
            
            return previousSymbol;
        }
    }
    
    
    function updateBetDisplay() {
        currentBetEl.textContent = `$${currentBet}`;
    }
    
    
    function updateBalanceDisplay() {
        
        balanceEl.textContent = `Balance: $${balance}`;
        
        
        if (window.balanceManager) {
            window.balanceManager.setBalance(balance);
        } else {
            localStorage.setItem('globalBalance', balance.toString());
            
            
            if (headerBalanceEl) {
                headerBalanceEl.textContent = `$${balance}`;
            }
        }
    }
    
    
    function increaseBet() {
        if (isSpinning) return;
        
        const betOptions = [5, 10, 25, 50, 100, 200];
        const currentIndex = betOptions.indexOf(currentBet);
        
        if (currentIndex < betOptions.length - 1) {
            currentBet = betOptions[currentIndex + 1];
            updateBetDisplay();
        }
    }
    
    
    function decreaseBet() {
        if (isSpinning) return;
        
        const betOptions = [5, 10, 25, 50, 100, 200];
        const currentIndex = betOptions.indexOf(currentBet);
        
        if (currentIndex > 0) {
            currentBet = betOptions[currentIndex - 1];
            updateBetDisplay();
        }
    }
    
    
    function spin() {
        if (isSpinning) return;
        
        
        if (balance < currentBet) {
            alert('You need more money to play. Better luck next time!');
            return;
        }
        
        
        balance -= currentBet;
        updateBalanceDisplay();
        
        
        isSpinning = true;
        spinButton.disabled = true;
        decreaseBtn.disabled = true;
        increaseBtn.disabled = true;
        
        
        const finalSymbols = [];
        
        
        finalSymbols.push(getRandomSymbol());
        
        
        finalSymbols.push(getRiggedSymbol(finalSymbols[0]));
        
        
        
        const thirdSymbol = getRiggedSymbol(finalSymbols[1]);
        finalSymbols.push(thirdSymbol === finalSymbols[0] ? getRiggedSymbol(thirdSymbol) : thirdSymbol);
        
        
        spinReels(finalSymbols);
    }
    
    
    function cleanupSymbols(symbolsContainer) {
        
        while (symbolsContainer.children.length > 20) {
            symbolsContainer.removeChild(symbolsContainer.firstChild);
        }
    }
    
    
    function spinReels(finalSymbols) {
        const spinDurations = [1500, 2000, 2500]; 
        let completedReels = 0;
        
        reels.forEach((reel, index) => {
            const symbolsContainer = reel.querySelector('.symbols');
            
            
            const currentTransform = symbolsContainer.style.transform;
            const currentY = currentTransform ? 
                parseInt(currentTransform.match(/-?\d+/)[0]) : 0;
            
            
            for (let i = 0; i < 10; i++) {
                const symbol = document.createElement('div');
                symbol.className = 'symbol';
                symbol.textContent = getRandomSymbol();
                symbolsContainer.appendChild(symbol);
            }
            
            
            void symbolsContainer.offsetHeight;
            
            const symbolHeight = 70; 
            const symbolsCount = symbolsContainer.children.length;
            
            
            const targetIndex = symbolsCount - 3;
            symbolsContainer.children[targetIndex].textContent = finalSymbols[index];
            
            
            const finalPosition = currentY - (symbolHeight * 10);
            
            
            symbolsContainer.style.transition = `transform ${spinDurations[index] / 1000}s cubic-bezier(.17,.67,.83,.67)`;
            symbolsContainer.style.transform = `translateY(${finalPosition}px)`;
            
            
            setTimeout(() => {
                symbolsContainer.style.transition = 'transform 0.2s cubic-bezier(.17,.67,.83,1.67)';
                symbolsContainer.style.transform = `translateY(${finalPosition + 10}px)`;
                
                setTimeout(() => {
                    symbolsContainer.style.transition = 'transform 0.1s ease-out';
                    symbolsContainer.style.transform = `translateY(${finalPosition}px)`;
                    
                    
                    const visibleSymbols = Array.from(symbolsContainer.children).slice(-7);
                    symbolsContainer.innerHTML = '';
                    visibleSymbols.forEach(symbol => symbolsContainer.appendChild(symbol));
                    
                    
                    symbolsContainer.style.transition = 'none';
                    symbolsContainer.style.transform = `translateY(${-symbolHeight * 2}px)`;
                    
                    
                    completedReels++;
                    if (completedReels === reels.length) {
                        setTimeout(() => {
                            
                            checkWin(finalSymbols);
                            isSpinning = false;
                            spinButton.disabled = false;
                            decreaseBtn.disabled = false;
                            increaseBtn.disabled = false;
                        }, 300);
                    }
                }, 200);
            }, spinDurations[index]);
        });
    }
    
    
    function checkWin(finalSymbols) {
        
        if (finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2]) {
            const winningSymbol = finalSymbols[0];
            const multiplier = payouts[winningSymbol];
            const winAmount = currentBet * multiplier;
            
            
            balance += winAmount;
            updateBalanceDisplay();
            
            
            showWinAnimation(finalSymbols, winAmount);
            
            
            
        }
    }
    
    
    function showWinAnimation(winningSymbols, amount) {
        
        reels.forEach(reel => {
            const centerSymbol = reel.querySelector('.symbols').children[reel.querySelector('.symbols').children.length - 3];
            centerSymbol.classList.add('winning-symbol');
        });
        
        
        const winMessage = document.createElement('div');
        winMessage.className = 'win-message';
        winMessage.innerHTML = `
            <div class="win-title">WINNER!</div>
            <div class="win-amount">$${amount}</div>
            <div class="win-combo">${winningSymbols.join(' ')}</div>
        `;
        
        
        winMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #eeeeee, #dddddd);
            color: #333;
            font-size: 20px;
            font-weight: bold;
            padding: 15px 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            text-align: center;
            animation: winPulse 0.4s alternate;
        `;
        
        
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes winPulse {
                0% { transform: translate(-50%, -50%) scale(1); }
                100% { transform: translate(-50%, -50%) scale(1.05); }
            }
            
            .winning-symbol {
                animation: symbolPulse 0.4s alternate;
                color: #555;
                text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
            }
            
            @keyframes symbolPulse {
                0% { transform: scale(1); }
                100% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
        
        
        document.body.appendChild(winMessage);
        
        
        setTimeout(() => {
            winMessage.remove();
            style.remove();
            
            
            document.querySelectorAll('.winning-symbol').forEach(el => {
                el.classList.remove('winning-symbol');
            });
        }, 1000);
    }
    
    
    updateBetDisplay();
    updateBalanceDisplay();
}); 
