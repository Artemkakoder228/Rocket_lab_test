const tg = window.Telegram.WebApp;
tg.expand();

// Початкові ресурси (як на твоєму скріні)
let userResources = {
    coins: 15000,
    iron: 500,
    fuel: 200
};

// База даних систем
let nodesData = {
    "cc": { 
        name: "ЦЕНТР КОМАНДУВАННЯ (ЦК)", lvl: 10, 
        desc: "Основа вашої бази. Збільшує загальний ліміт військ та базовий захист.", 
        baseCost: { coins: 5000, iron: 100, fuel: 0 }, effectPrefix: "Захист бази: +" 
    },
    "laser": { 
        name: "Лазерна Батарея", lvl: 0, 
        desc: "Базова зброя для захисту від піратів. Висока швидкострільність.", 
        baseCost: { coins: 100, iron: 20, fuel: 0 }, effectPrefix: "Шкода (DPS): +" 
    },
    "ion": { 
        name: "Іонна Гармата", lvl: 0, 
        desc: "Відключає ворожі щити. Ефективна проти важких кораблів.", 
        baseCost: { coins: 300, iron: 50, fuel: 10 }, effectPrefix: "Пробиття щитів: +" 
    },
    "plasma": { 
        name: "Плазмовий Випромінювач", lvl: 0, 
        desc: "Наносить колосальну шкоду по площі.", 
        baseCost: { coins: 800, iron: 100, fuel: 50 }, effectPrefix: "Шкода по площі: +" 
    },
    "orbital": { 
        name: "Орбітальний Удар", lvl: 0, 
        desc: "Ультимативна зброя масового ураження. Знищує ворогів одним залпом.", 
        baseCost: { coins: 5000, iron: 200, fuel: 100 }, effectPrefix: "Сила удару: +" 
    }
};

let currentNode = null;

// Функція оновлення відображення ресурсів
function updateResourcesUI() {
    document.getElementById('res-coins').innerText = userResources.coins;
    document.getElementById('res-iron').innerText = userResources.iron;
    document.getElementById('res-fuel').innerText = userResources.fuel;
}

// Розрахунок вартості для поточного рівня
function calculateCost(id) {
    const data = nodesData[id];
    const multiplier = Math.pow(1.5, data.lvl); // Кожен рівень дорожче на 50%
    return {
        coins: Math.floor(data.baseCost.coins * multiplier),
        iron: Math.floor(data.baseCost.iron * multiplier),
        fuel: Math.floor(data.baseCost.fuel * multiplier)
    };
}

// Розрахунок поточного ефекту
function calculateEffect(id) {
    const data = nodesData[id];
    const val = (data.lvl === 0 && id !== 'cc') ? 0 : (data.lvl * 10) + (id==='cc'? 500 : 0);
    return `${data.effectPrefix}${val} ➔ ${data.effectPrefix}${val + 10}`;
}

// Вибір вузла на екрані
function selectNode(id) {
    currentNode = id;
    tg.HapticFeedback.selectionChanged();

    // Знімаємо виділення з усіх
    document.querySelectorAll('.node').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.node-line').forEach(el => el.classList.remove('active'));

    // Виділяємо вибраний вузол
    document.getElementById(`node-${id}`).classList.add('selected');
    
    // Активуємо лінію зв'язку (якщо це не центральний вузол)
    if (id !== 'cc') {
        document.getElementById(`line-${id}`).classList.add('active');
    }

    // Заповнюємо панель
    const data = nodesData[id];
    const cost = calculateCost(id);
    
    document.getElementById('panel-title').innerText = data.name;
    document.getElementById('panel-desc').innerText = data.desc;
    
    document.getElementById('panel-effect').innerText = calculateEffect(id);
    
    // Формуємо рядок ціни
    let costString = [];
    if(cost.coins > 0) costString.push(`${cost.coins} 💰`);
    if(cost.iron > 0) costString.push(`${cost.iron} 🔩`);
    if(cost.fuel > 0) costString.push(`${cost.fuel} ⛽`);
    document.getElementById('panel-cost').innerText = costString.join(' | ');

    // Перевіряємо, чи вистачає ресурсів для кнопки
    const btn = document.getElementById('btn-buy');
    if (userResources.coins >= cost.coins && userResources.iron >= cost.iron && userResources.fuel >= cost.fuel) {
        btn.disabled = false;
        btn.innerText = "ПОКРАЩИТИ";
    } else {
        btn.disabled = true;
        btn.innerText = "НЕ ВИСТАЧАЄ РЕСУРСІВ";
    }

    // Показуємо панель
    document.getElementById('upgrade-info').classList.remove('hidden');
    document.getElementById('info-panel').classList.add('show');
}

// Закриття панелі
function closePanel() {
    document.getElementById('info-panel').classList.remove('show');
    document.querySelectorAll('.node').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.node-line').forEach(el => el.classList.remove('active'));
    currentNode = null;
}

// Логіка покращення (Симуляція)
function buyUpgrade() {
    if (!currentNode) return;
    
    const cost = calculateCost(currentNode);
    
    // Подвійна перевірка (про всяк випадок)
    if (userResources.coins >= cost.coins && userResources.iron >= cost.iron && userResources.fuel >= cost.fuel) {
        
        // Віднімаємо ресурси
        userResources.coins -= cost.coins;
        userResources.iron -= cost.iron;
        userResources.fuel -= cost.fuel;
        
        // Піднімаємо рівень
        nodesData[currentNode].lvl += 1;
        
        // Оновлюємо UI
        updateResourcesUI();
        document.getElementById(`lvl-${currentNode}`).innerText = `Lvl ${nodesData[currentNode].lvl}`;
        
        // Вібрація успіху
        tg.HapticFeedback.notificationOccurred('success');
        
        // Оновлюємо панель для наступного рівня
        selectNode(currentNode); 
    } else {
        tg.HapticFeedback.notificationOccurred('error');
    }
}

// Ініціалізація при старті
window.onload = () => {
    updateResourcesUI();
    // Оновлюємо рівні на UI з бази
    for (let id in nodesData) {
        document.getElementById(`lvl-${id}`).innerText = `Lvl ${nodesData[id].lvl}`;
    }
};