const SYMBOLS_COUNT = { 
    '🍒': 8, 
    '🍋': 6, 
    '🍊': 6, 
    '💎': 2, 
    '7️⃣': 1, 
    '★': 3 
};
const SYMBOL_VALUES = { 
    '🍒': 2, 
    '🍋': 3, 
    '🍊': 4, 
    '💎': 10, 
    '7️⃣': 25, 
    '★': 0 
};
const BONUS_FEATURES = {
    freeSpinSymbol: '★',
    jackpotSymbol: '💎',
    scatterSymbol: '7️⃣'
};

let balance = 100;
let freeSpins = 0;
let jackpot = 1000;

document.getElementById('balance').textContent = balance;
document.getElementById('spinBtn').addEventListener('click', handleSpin);
document.getElementById('depositBtn').addEventListener('click', handleDeposit);

function handleDeposit() {
    const depositAmount = parseFloat(document.getElementById('deposit').value);
    if (depositAmount > 0) {
        balance += depositAmount;
        updateBalance();
        showMessage(`Deposited $${depositAmount}!`, '#4CAF50');
    } else {
        showMessage('Invalid deposit amount!', '#FF5722');
    }
}

async function handleSpin() {
    const bet = parseFloat(document.getElementById('betAmount').value);
    const lines = parseInt(document.getElementById('lines').value);
    if (!validateSpin(bet, lines)) return;
    
    if (freeSpins <= 0) {
        balance -= bet * lines;
    } else {
        freeSpins--;
        showMessage(`Free spins left: ${freeSpins}`, '#2196F3');
    }
    updateBalance();
    
    const reels = spin();
    const rows = transpose(reels);
    await animateSlots(rows);
    
    const result = calculateResult(rows, bet, lines);
    balance += result.winnings;
    
    if (result.freeSpins > 0) {
        freeSpins += result.freeSpins;
        showMessage(`+${result.freeSpins} FREE SPINS!`, '#2196F3');
    }
    
    if (result.jackpot) {
        balance += jackpot;
        showMessage(`JACKPOT! WON $${jackpot}!!!`, '#4CAF50');
        jackpot = 1000;
    } else if (result.winnings > 0) {
        showMessage(`WIN $${result.winnings}!`, '#4CAF50');
        document.getElementById('balance').classList.add('win-animation');
        setTimeout(() => {
            document.getElementById('balance').classList.remove('win-animation');
        }, 1000);
    } else {
        showMessage('No win this time...', '#FF5722');
    }
    
    updateBalance();
    updateJackpot();
}

function validateSpin(bet, lines) {
    if (isNaN(bet) || isNaN(lines) || bet <= 0 || lines <= 0) {
        showMessage('Invalid bet or line selection!', '#FF5722');
        return false;
    }
    if (balance < bet * lines && freeSpins <= 0) {
        showMessage('Insufficient balance!', '#FF5722');
        return false;
    }
    return true;
}

function spin() {
    let reels = [];
    let symbols = Object.keys(SYMBOLS_COUNT).flatMap(symbol => Array(SYMBOLS_COUNT[symbol]).fill(symbol));
    for (let i = 0; i < 3; i++) {
        reels.push([]);
        for (let j = 0; j < 3; j++) {
            const randIndex = Math.floor(Math.random() * symbols.length);
            reels[i].push(symbols[randIndex]);
        }
    }
    return reels;
}

function transpose(reels) {
    return reels[0].map((_, colIndex) => reels.map(row => row[colIndex]));
}

function calculateResult(rows, bet, lines) {
    let winnings = 0;
    let freeSpins = 0;
    let jackpot = false;
    
    rows.forEach((row, index) => {
        if (index < lines && new Set(row).size === 1) {
            winnings += bet * SYMBOL_VALUES[row[0]];
        }
    });
    
    const scatterCount = rows.flat().filter(s => s === BONUS_FEATURES.scatterSymbol).length;
    if (scatterCount >= 3) {
        freeSpins = Math.floor(scatterCount / 2);
    }
    
    if (rows.flat().every(s => s === BONUS_FEATURES.jackpotSymbol)) {
        jackpot = true;
    }
    
    return { winnings, freeSpins, jackpot };
}

async function animateSlots(rows) {
    const slots = document.querySelectorAll('.slot');
    for (let i = 0; i < slots.length; i++) {
        slots[i].classList.add('spin');
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    rows.flat().forEach((symbol, i) => {
        slots[i].textContent = symbol;
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    slots.forEach(slot => slot.classList.remove('spin'));
}

function updateJackpot() {
    jackpot += Math.floor(Math.random() * 10);
    document.querySelector('.jackpot-display').textContent = `Jackpot: $${jackpot}`;
}

function showMessage(text, color = '#fff') {
    const msg = document.getElementById('message');
    msg.textContent = text;
    msg.style.color = color;
    msg.classList.add('message-pop');
    setTimeout(() => msg.classList.remove('message-pop'), 500);
}

function updateBalance() {
    animateValue('balance', balance);
}

function animateValue(elementId, target) {
    const element = document.getElementById(elementId);
    let current = parseFloat(element.textContent);
    if (current === target) return;
    
    const step = (target - current) / 20;
    const update = () => {
        current += step;
        if (Math.abs(current - target) < 0.5) current = target;
        element.textContent = current.toFixed(2);
        if (current !== target) requestAnimationFrame(update);
    };
    
    requestAnimationFrame(update);
}
