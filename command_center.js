let tg = window.Telegram.WebApp;
tg.expand();

const urlParams = new URLSearchParams(window.location.search);
const familyId = urlParams.get('family_id');

let inventory = {};
let allModules = [];
let ownedModuleIds = [];
let currentCCLevel = 1; // Максимальний рівень від 1 до 5
let targetUpgradeId = null; 

async function loadData() {
    try {
        const response = await fetch(`${API_URL}/inventory?family_id=${familyId}`);
        const data = await response.json();
        
        inventory = data.resources;
        ownedModuleIds = data.modules.map(m => m.id);
        
        renderResources();
        calculateCurrentLevel();
        updateTreeUI();
    } catch (e) {
        console.error("Помилка завантаження", e);
    }
}

function renderResources() {
    const r = inventory;
    document.getElementById('resources-bar').innerHTML = `
        <span>🪙 ${r.coins}</span>
        <span>🔩 ${r.iron}</span>
        <span>💠 ${r.silicon}</span>
        <span>🌫 ${r.hydrogen}</span>
    `;
}

// Визначаємо поточний рівень Центру Командування (від 1 до 5)
function calculateCurrentLevel() {
    currentCCLevel = 1;
    for (let i = 5; i >= 1; i--) {
        if (ownedModuleIds.includes(`cc_lvl${i}`)) {
            currentCCLevel = i;
            break;
        }
    }
    document.getElementById('cc-lvl-badge').innerText = `Lvl ${currentCCLevel}`;
}

function updateTreeUI() {
    // 1. Оновлюємо стан Центральної ноди (вона завжди "owned", але ми можемо її покращити)
    const centerNode = document.getElementById('node-cc_lvl');
    centerNode.className = 'tech-node center-node owned'; // Завжди куплена база
    if (currentCCLevel < 5) {
        centerNode.classList.add('available'); // Є куди рости
    }

    // 2. Оновлюємо Периферійну зброю (Проти годинникової стрілки)
    const weapons = [
        { id: 'cc_w1', reqLvl: 2, lineId: 'line-w1' }, // Лазер
        { id: 'cc_w2', reqLvl: 3, lineId: 'line-w2' }, // Іонна
        { id: 'cc_w3', reqLvl: 4, lineId: 'line-w3' }, // Плазма
        { id: 'cc_w4', reqLvl: 5, lineId: 'line-w4' }  // Орбітальний
    ];

    weapons.forEach(w => {
        const node = document.getElementById(`node-${w.id}`);
        const line = document.getElementById(w.lineId);
        
        if (ownedModuleIds.includes(w.id)) {
            node.className = `tech-node peripheral-node ${w.id.replace('cc_', '')}-node owned`;
            line.classList.add('active');
        } else if (currentCCLevel >= w.reqLvl) {
            node.className = `tech-node peripheral-node ${w.id.replace('cc_', '')}-node available`;
            line.classList.add('active');
        } else {
            node.className = `tech-node peripheral-node ${w.id.replace('cc_', '')}-node locked`;
            line.classList.remove('active');
        }
    });
}

// Модальне вікно
function openModuleModal(baseId) {
    let targetId;
    let isUpgrade = false;

    // Якщо клікнули на Центр, перевіряємо який наступний рівень
    if (baseId === 'cc_lvl') {
        if (currentCCLevel >= 5) {
            alert("Командний Центр досяг максимального рівня!");
            return;
        }
        targetId = `cc_lvl${currentCCLevel + 1}`;
        isUpgrade = true;
    } else {
        targetId = baseId;
    }

    if (ownedModuleIds.includes(targetId)) {
        alert("Цей модуль вже встановлено!");
        return;
    }

    // Робимо запит до сервера для отримання ціни та опису.
    // Оскільки ми не маємо CATALOG на фронтенді, ми симулюємо або зберігаємо словник
    // Найкраще - щоб не дублювати CATALOG, ми можемо хардкодити інфо для відображення
    
    // Спрощений підхід для UI (беремо дані прямо зі словника)
    const dict = {
        'cc_lvl2': {name: 'Командний Центр II', cost: {iron: 2000, silicon: 500, coins: 1500}, req: 1},
        'cc_lvl3': {name: 'Командний Центр III', cost: {iron: 4000, silicon: 1500, coins: 3000}, req: 2},
        'cc_lvl4': {name: 'Командний Центр IV', cost: {iron: 8000, silicon: 3000, hydrogen: 1000, coins: 6000}, req: 3},
        'cc_lvl5': {name: 'Командний Центр V', cost: {iron: 15000, silicon: 6000, hydrogen: 3000, coins: 12000}, req: 4},
        
        'cc_w1': {name: 'Лазерна Батарея', cost: {iron: 1500, fuel: 500, coins: 1000}, req: 2, isWeapon: true},
        'cc_w2': {name: 'Іонна Гармата', cost: {silicon: 2000, oxide: 1000, coins: 2500}, req: 3, isWeapon: true},
        'cc_w3': {name: 'Плазмовий Випромінювач', cost: {hydrogen: 2500, helium: 1500, coins: 5000}, req: 4, isWeapon: true},
        'cc_w4': {name: 'Орбітальний Удар', cost: {regolith: 5000, he3: 3000, coins: 10000}, req: 5, isWeapon: true}
    };

    const mod = dict[targetId];
    if (!mod) return;

    if (mod.isWeapon && currentCCLevel < mod.req) {
        alert(`Потрібен Командний Центр Рівня ${mod.req}!`);
        return;
    }

    targetUpgradeId = targetId;
    document.getElementById('modal-title').innerText = mod.name;
    document.getElementById('modal-desc').innerText = isUpgrade ? "Покращити головну базу для відкриття нової зброї." : "Встановити нову зброю для захисту бази.";

    // Відображення вартості
    let costHTML = `<strong>Вартість:</strong><br>`;
    let canAfford = true;
    for (let [res, amount] of Object.entries(mod.cost)) {
        let playerHas = inventory[res] || 0;
        let color = playerHas >= amount ? '#3fb950' : '#f85149';
        if (playerHas < amount) canAfford = false;
        costHTML += `<span style="color:${color}">${res.toUpperCase()}: ${playerHas}/${amount}</span><br>`;
    }
    document.getElementById('modal-cost').innerHTML = costHTML;

    const btn = document.getElementById('buy-btn');
    btn.disabled = !canAfford;

    document.getElementById('module-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('module-modal').style.display = 'none';
}

async function buyModule() {
    if (!targetUpgradeId) return;
    document.getElementById('buy-btn').disabled = true;

    try {
        const response = await fetch(`${API_URL}/investigate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ family_id: familyId, module_id: targetUpgradeId })
        });
        
        const data = await response.json();
        if (response.ok) {
            tg.showAlert("Успішно встановлено!");
            closeModal();
            loadData(); // Перезавантажуємо дані
        } else {
            tg.showAlert(data.error);
            document.getElementById('buy-btn').disabled = false;
        }
    } catch (e) {
        tg.showAlert("Помилка підключення.");
        document.getElementById('buy-btn').disabled = false;
    }
}

// Старт
loadData();