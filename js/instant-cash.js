let canvas, ctx, isDrawing = false, lastX, lastY, symbols = [], erasedPixels = new Set();

document.addEventListener('DOMContentLoaded', initGame);
window.addEventListener('load', initGame);

function initGame() {
    canvas = document.getElementById('scratch-canvas');
    const buyBtn = document.querySelector('.buy-ticket-btn');
    const revealBtn = document.querySelector('.reveal-all-btn');
    const newGameBtn = document.querySelector('.new-game-btn');
    
    if (buyBtn) {
        const newBuyBtn = buyBtn.cloneNode(true);
        if (buyBtn.parentNode) {
            buyBtn.parentNode.replaceChild(newBuyBtn, buyBtn);
        }
        newBuyBtn.addEventListener('click', e => {
            e.preventDefault();
            buyTicket();
        });
    }
    
    if (revealBtn) {
        revealBtn.addEventListener('click', revealAll);
        revealBtn.style.display = 'none';
        revealBtn.disabled = true;
    }
    
    if (newGameBtn) {
        newGameBtn.addEventListener('click', resetGame);
        newGameBtn.style.display = 'none';
    }
    
    window.buyTicket = buyTicket;
}

function buyTicket() {
    document.querySelector('.buy-ticket-btn').style.display = 'none';
    document.querySelector('.reveal-all-btn').style.display = 'block';
    document.querySelector('.reveal-all-btn').disabled = false;
    document.querySelector('.scratch-area').classList.remove('disabled');
    
    createSymbols();
    setupCanvas();
}

function createSymbols() {
    const availableSymbols = ['fa-gem', 'fa-star', 'fa-crown', 'fa-trophy', 'fa-gift', 'fa-coins'];
    
    const willWin = Math.random() < 0.3;
    
    symbols = [];
    
    if (willWin) {
        const winningIndex = Math.floor(Math.random() * availableSymbols.length);
        const winningSymbol = availableSymbols[winningIndex];
        
        for (let i = 0; i < 3; i++) {
            symbols.push(winningSymbol);
        }
        
        for (let i = 0; i < 6; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * availableSymbols.length);
            } while (availableSymbols[randomIndex] === winningSymbol);
            
            symbols.push(availableSymbols[randomIndex]);
            }
        } else {
        const symbolCounts = {};
        availableSymbols.forEach(symbol => {
            symbolCounts[symbol] = 0;
        });
        
        for (let i = 0; i < 9; i++) {
            let selectedSymbol;
            
            do {
                const randomIndex = Math.floor(Math.random() * availableSymbols.length);
                selectedSymbol = availableSymbols[randomIndex];
            } while (symbolCounts[selectedSymbol] >= 2);
            
            symbols.push(selectedSymbol);
            symbolCounts[selectedSymbol]++;
        }
    }
    
    shuffle(symbols);
    
    const cells = document.querySelectorAll('.symbol-cell');
    cells.forEach((cell, index) => {
        if (index < symbols.length) {
            const icon = document.createElement('i');
            icon.className = 'fas ' + symbols[index];
            cell.innerHTML = '';
            cell.appendChild(icon);
        }
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function setupCanvas() {
    try {
        erasedPixels.clear();
        
        const oldCanvas = document.getElementById('scratch-canvas');
        if (oldCanvas?.parentNode) {
            oldCanvas.parentNode.removeChild(oldCanvas);
        }
        
        const container = document.querySelector('.scratch-card');
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        
        canvas = document.createElement('canvas');
        canvas.id = 'scratch-canvas';
        canvas.width = containerRect.width;
        canvas.height = containerRect.height;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '10';
        canvas.style.touchAction = 'none';
        canvas.style.mixBlendMode = 'source-over';
        
        container.appendChild(canvas);
        
        ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        
        ctx.fillStyle = '#8c8c8c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        addCanvasEventListeners();
        updateProgress(0);
    } catch (error) {
        console.error('Canvas setup error:', error);
    }
}

function addCanvasEventListeners() {
    if (!canvas) return;
    
    canvas.removeEventListener('mousedown', startDrawing);
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseup', stopDrawing);
    canvas.removeEventListener('mouseout', stopDrawing);
    canvas.removeEventListener('touchstart', startDrawingTouch);
    canvas.removeEventListener('touchmove', drawTouch);
    canvas.removeEventListener('touchend', stopDrawing);
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawingTouch, { passive: false });
    canvas.addEventListener('touchmove', drawTouch, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    
    const rect = canvas.getBoundingClientRect();
    lastX = (e.clientX - rect.left) * (canvas.width / rect.width);
    lastY = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    erase(lastX, lastY);
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    erase(x, y);
}

function startDrawingTouch(e) {
    e.preventDefault();
    isDrawing = true;
    
    const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
    lastX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    lastY = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    erase(lastX, lastY);
}

function drawTouch(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    erase(x, y);
}

function stopDrawing() {
    isDrawing = false;
}

function erase(x, y) {
    if (!ctx || !canvas) return;
    
    try {
        ctx.globalCompositeOperation = 'destination-out';
        
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fill();
        
        if (lastX !== undefined && lastY !== undefined) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
            ctx.lineWidth = 60;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        ctx.stroke();
        }
        
        for (let i = -30; i <= 30; i += 5) {
            for (let j = -30; j <= 30; j += 5) {
                const areaX = Math.floor(x + i);
                const areaY = Math.floor(y + j);
                if (areaX >= 0 && areaX < canvas.width && areaY >= 0 && areaY < canvas.height) {
                    erasedPixels.add(`${areaX},${areaY}`);
                }
            }
        }
        
        lastX = x;
        lastY = y;
        
        calculateProgress();
        checkCellsUnderCursor(x, y);
    } catch (error) {
        console.error('Erase error:', error);
    }
}

function checkCellsUnderCursor(x, y) {
    const cells = document.querySelectorAll('.symbol-cell');
    const canvasRect = canvas.getBoundingClientRect();
    
    const documentX = (x / canvas.width) * canvasRect.width + canvasRect.left;
    const documentY = (y / canvas.height) * canvasRect.height + canvasRect.top;
    
    cells.forEach(cell => {
        const cellRect = cell.getBoundingClientRect();
        
        if (documentX >= cellRect.left && documentX <= cellRect.right &&
            documentY >= cellRect.top && documentY <= cellRect.bottom) {
            
            const icon = cell.querySelector('i');
            if (icon && !icon.classList.contains('revealed')) {
                icon.classList.add('revealed');
            }
        }
    });
}

function calculateProgress() {
    if (!ctx || !canvas) return;
    
    try {
        const totalPixels = canvas.width * canvas.height;
        const erasedCount = erasedPixels.size;
        const erasedRatio = Math.min(erasedCount / (totalPixels * 0.02), 1);
        const percentage = Math.floor(erasedRatio * 100);
        
        updateProgress(percentage);
        
        if (percentage % 10 === 0 || percentage >= 70) {
            checkAllCells();
        }
        
        if (percentage >= 70) {
            setTimeout(revealAll, 300);
        } else if (percentage >= 50) {
            document.querySelector('.reveal-all-btn').disabled = false;
        }
    } catch (error) {
        console.error('Progress calculation error:', error);
    }
}

function checkAllCells() {
    const cells = document.querySelectorAll('.symbol-cell');
    const canvasRect = canvas.getBoundingClientRect();
    
    cells.forEach(cell => {
        const cellRect = cell.getBoundingClientRect();
        const centerX = (cellRect.left + cellRect.width / 2 - canvasRect.left) / canvasRect.width * canvas.width;
        const centerY = (cellRect.top + cellRect.height / 2 - canvasRect.top) / canvasRect.height * canvas.height;
        
        const checkRadius = Math.min(cellRect.width, cellRect.height) / 4;
        let isErased = false;
        
        for (let i = -checkRadius; i <= checkRadius; i += checkRadius / 2) {
            for (let j = -checkRadius; j <= checkRadius; j += checkRadius / 2) {
                const pointX = Math.floor(centerX + i);
                const pointY = Math.floor(centerY + j);
                
                if (erasedPixels.has(`${pointX},${pointY}`)) {
                    isErased = true;
                    break;
                }
            }
            if (isErased) break;
        }
        
        if (isErased) {
            const icon = cell.querySelector('i');
            if (icon && !icon.classList.contains('revealed')) {
                icon.classList.add('revealed');
            }
        }
    });
}

function updateProgress(percentage) {
    const value = Math.min(100, Math.max(0, percentage));
    
    const progressText = document.querySelector('.scratch-progress');
    if (progressText) {
        progressText.textContent = value + '%';
    }
    
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = value + '%';
    }
    
    if (value >= 30) {
        document.querySelector('.reveal-all-btn').disabled = false;
    }
}

function revealAll() {
    const revealBtn = document.querySelector('.reveal-all-btn');
    if (revealBtn && revealBtn.style.display === 'none') return;
    
    if (ctx && canvas) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    if (canvas?.parentNode) {
        canvas.parentNode.removeChild(canvas);
    }
    
    updateProgress(100);
    
    document.querySelectorAll('.symbol-cell i').forEach(icon => {
        icon.classList.add('revealed');
    });
    
    checkResult();
    
    if (revealBtn) {
        revealBtn.style.display = 'none';
    }
    
    const newGameBtn = document.querySelector('.new-game-btn');
    if (newGameBtn) {
        newGameBtn.style.display = 'block';
    }
}

function checkResult() {
    const countMap = {};
    symbols.forEach(symbol => {
        countMap[symbol] = (countMap[symbol] || 0) + 1;
    });
    
    let maxCount = 0;
    let maxSymbol = '';
    for (const symbol in countMap) {
        if (countMap[symbol] > maxCount) {
            maxCount = countMap[symbol];
            maxSymbol = symbol;
        }
    }
    
    const resultContainer = document.querySelector('.game-result');
    const resultIcon = document.querySelector('.result-icon');
    const resultTitle = document.querySelector('.result-title');
    const resultMessage = document.querySelector('.result-message');
    const winningAmount = document.querySelector('.winning-amount');
    
    if (resultContainer) {
        resultContainer.style.display = 'block';
    }
    
    let isWinner = maxCount >= 3;
    let isBonusGame = false;
    
    if (isWinner) {
        let prize = '0';
        let iconClass = 'fas ' + maxSymbol;
        
        switch(maxSymbol) {
            case 'fa-gem':
                prize = '5000';
                break;
            case 'fa-star':
                prize = 'Бонусная игра';
                isBonusGame = true;
                break;
            case 'fa-crown':
                prize = '1000';
                break;
            case 'fa-trophy':
                prize = '500';
                break;
            case 'fa-gift':
                prize = '250';
                break;
            case 'fa-coins':
                prize = '100';
                break;
            default:
                prize = '0';
                break;
        }
        
        if (resultIcon) {
            resultIcon.innerHTML = `<i class="${iconClass}"></i>`;
        }
        
        if (resultTitle) {
            resultTitle.textContent = 'Поздравляем!';
        }
        
        if (resultMessage) {
            resultMessage.textContent = `Вы нашли 3 одинаковых символа!`;
        }
        
        if (winningAmount) {
            winningAmount.textContent = prize + (isBonusGame ? '' : '$');
            winningAmount.style.display = 'block';
        }
        
        if (isBonusGame) {
            setTimeout(() => {
                document.querySelector('.bonus-game').style.display = 'block';
                setupBonusGame();
            }, 1500);
        }
    } else {
        if (resultIcon) {
            resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        }
        
        if (resultTitle) {
            resultTitle.textContent = 'Не повезло';
        }
        
        if (resultMessage) {
            resultMessage.textContent = 'К сожалению, вы не нашли 3 одинаковых символа. Попробуйте ещё раз!';
        }
        
        if (winningAmount) {
            winningAmount.style.display = 'none';
        }
    }
    
    document.querySelector('.new-game-btn').style.display = 'block';
    document.querySelector('.reveal-all-btn').style.display = 'none';
}

function resetGame() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    isDrawing = false;
    erasedPixels.clear();
    symbols = [];
    
    document.querySelector('.game-result').style.display = 'none';
    document.querySelector('.bonus-game').style.display = 'none';
    
    const chests = document.querySelectorAll('.chest');
    chests.forEach(chest => {
        chest.classList.remove('selected', 'revealed');
    const chestBack = chest.querySelector('.chest-back');
        if (chestBack) {
            chestBack.innerHTML = '';
        }
    });
    document.querySelector('.bonus-result').style.display = 'none';
    
    document.querySelector('.buy-ticket-btn').style.display = 'block';
    document.querySelector('.new-game-btn').style.display = 'none';
    document.querySelector('.reveal-all-btn').style.display = 'none';
    document.querySelector('.scratch-area').classList.add('disabled');
    
    const cells = document.querySelectorAll('.symbol-cell');
    cells.forEach(cell => {
        cell.innerHTML = '';
    });
    
    updateProgress(0);
}

function setupBonusGame() {
    const chests = document.querySelectorAll('.chest');
    const prizes = [300, 500, 1000];
    const prizeWeights = [65, 25, 10];
    
    chests.forEach(chest => {
        chest.classList.remove('selected', 'revealed');
        const chestBack = chest.querySelector('.chest-back');
        if (chestBack) {
        chestBack.innerHTML = '';
        }
        
        chest.replaceWith(chest.cloneNode(true));
    });
    
    const refreshedChests = document.querySelectorAll('.chest');
    
    document.querySelector('.bonus-result').style.display = 'none';
    
    let assignedPrizes = [];
    
    for (let i = 0; i < 3; i++) {
        assignedPrizes.push(prizes[i]);
    }
    
    shuffle(assignedPrizes);
    
    refreshedChests.forEach((chest, index) => {
        chest.addEventListener('click', function() {
            if (!chest.classList.contains('selected') && !chest.classList.contains('revealed')) {
                playBonusGame(chest, assignedPrizes[index]);
            }
        });
        
        chest.addEventListener('mouseenter', function() {
            if (!chest.classList.contains('selected') && !chest.classList.contains('revealed')) {
                chest.classList.add('hover');
            }
        });
        
        chest.addEventListener('mouseleave', function() {
            chest.classList.remove('hover');
        });
    });
    
    const continueBtn = document.querySelector('.bonus-continue-btn');
    if (continueBtn) {
        const newBtn = continueBtn.cloneNode(true);
        if (continueBtn.parentNode) {
            continueBtn.parentNode.replaceChild(newBtn, continueBtn);
        }
        newBtn.addEventListener('click', function() {
            document.querySelector('.bonus-result').style.display = 'none';
            document.querySelector('.bonus-game').style.display = 'none';
        });
    }
}

function playBonusGame(selectedChest, prize) {
    selectedChest.classList.add('selected');
    
    setTimeout(() => {
        selectedChest.classList.add('revealed');
        
        const chestBack = selectedChest.querySelector('.chest-back');
        if (chestBack) {
            chestBack.innerHTML = `<div class="prize-amount">${prize}$</div>`;
        }
        
    setTimeout(() => {
            document.querySelectorAll('.chest:not(.revealed)').forEach((chest, index) => {
                chest.classList.add('revealed');
                const chestBack = chest.querySelector('.chest-back');
                if (chestBack) {
                    const chestIndex = Array.from(document.querySelectorAll('.chest')).indexOf(chest);
                    chestBack.innerHTML = `<div class="prize-amount">${chest === selectedChest ? prize : (chestIndex < 3 ? prize : '0')}$</div>`;
                }
            });
            
            setTimeout(() => {
                document.querySelector('.bonus-win-amount').textContent = prize + '$';
                document.querySelector('.bonus-result').style.display = 'block';
            }, 500);
        }, 1000);
    }, 500);
}

function weightedRandom(weights) {
    const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
        if (random < weights[i]) {
            return i;
        }
        random -= weights[i];
    }
    
    return 0;
}

document.addEventListener('DOMContentLoaded', () => {
    const chests = document.querySelectorAll('.chest');
    const continueBtn = document.querySelector('.bonus-continue-btn');
    
    chests.forEach(chest => {
        chest.addEventListener('click', () => {
            if (chest.classList.contains('opened')) return;
            
            chest.classList.add('opened');
            
            const random = Math.random();
            let prize = 300;
            
            if (random < 0.1) {
                prize = 1000;
            } else if (random < 0.35) {
                prize = 500;
            }
            
            document.querySelector('.bonus-win-amount').textContent = prize + '$';
            document.querySelector('.bonus-result').style.display = 'block';
            
            chests.forEach(c => {
                if (c !== chest) c.classList.add('disabled');
            });
        });
    });
    
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            document.querySelector('.bonus-game').style.display = 'none';
        });
    }
}); 