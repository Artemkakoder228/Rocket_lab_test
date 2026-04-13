const tg = window.Telegram.WebApp;
tg.expand();

// Отримуємо параметри з URL (які ми передали з aiogram бота)
const urlParams = new URLSearchParams(window.location.search);
const familyId = urlParams.get('family_id');

// Локальний довідник модулів Центру Командування (або можна брати з config.js)
const CC_MODULES = {
    "cc_lvl": { name: "Командний Центр", desc: "Основа вашої бази. Збільшує загальний ліміт військ та захист.", cost: { coins: 5000, iron: 1000 }, stats: "Захист бази: +500" },
    "cc_w1": { name: "Лазерна Батарея", desc: "Базова зброя для захисту від піратів. Висока швидкострільність.", cost: { coins: 2000, iron: 500 }, stats: "Шкода: +50" },
    "cc_w2": { name: "Іонна Гармата", desc: "Відключає ворожі щити. Ефективна проти важких кораблів.", cost: { coins: 4000, silicon: 200 }, stats: "Пробиття щитів: +30%" },
    "cc_w3": { name: "Плазмовий Випромінювач", desc: "Наносить колосальну шкоду по площі.", cost: { coins: 6000, fuel: 800 }, stats: "Шкода: +150" },
    "cc_w4": { name: "Орбітальний Удар", desc: "Ультимативна зброя масового ураження. Доступна роз в 24 години.", cost: { coins: 15000, he3: 500 }, stats: "Супер-атака" }
};

let currentSelectedModule = null;

// Функція завантаження даних при відкритті сторінки
async function loadCommandCenter() {
    try {
        const response = await fetch(`/api/get_cc_data?family_id=${familyId}`);
        const data = await response.json();

        if (data.error) {
            tg.showAlert(data.error);
            return;
        }

        // Відображаємо ресурси
        document.getElementById('resources-bar').innerHTML = `
            💰 ${data.resources.coins} | 🔩 ${data.resources.iron} | ⛽ ${data.resources.fuel}
        `;

        // Оновлюємо стан вузлів на дереві
        const owned = data.owned_modules || [];
        
        for (const modId in CC_MODULES) {
            const node = document.getElementById(`node-${modId}`);
            if (node) {
                if (owned.includes(modId)) {
                    node.classList.remove('locked');
                    node.classList.add('owned');
                    // Додаємо зелену обводку або ефект для куплених
                    node.style.borderColor = "#4CAF50"; 
                }
            }
        }
    } catch (error) {
        console.error("Помилка завантаження:", error);
    }
}

// Функції модального вікна
function openModuleModal(moduleId) {
    currentSelectedModule = moduleId;
    const mod = CC_MODULES[moduleId];
    
    document.getElementById('modal-title').innerText = mod.name;
    document.getElementById('modal-desc').innerText = mod.desc;
    document.getElementById('modal-stats').innerText = `📊 Характеристики: ${mod.stats}`;
    
    // Формуємо рядок ціни
    let costText = "Ціна: ";
    for (let [res, amt] of Object.entries(mod.cost)) {
        costText += `${amt} ${res} `;
    }
    document.getElementById('modal-cost').innerText = costText;

    // Перевіряємо чи вже куплено
    const node = document.getElementById(`node-${moduleId}`);
    const btn = document.getElementById('buy-btn');
    if (node.classList.contains('owned')) {
        btn.innerText = "Вже вивчено ✅";
        btn.disabled = true;
        btn.style.background = "#555";
    } else {
        btn.innerText = "Покращити 🚀";
        btn.disabled = false;
        btn.style.background = "#e94560";
    }

    document.getElementById('module-modal').style.display = "block";
    tg.HapticFeedback.impactOccurred('light');
}

function closeModal() {
    document.getElementById('module-modal').style.display = "none";
}

// Покупка модуля
async function buyModule() {
    if (!currentSelectedModule) return;
    
    tg.MainButton.showProgress();
    document.getElementById('buy-btn').disabled = true;

    try {
        const response = await fetch('/api/buy_cc_module', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                family_id: familyId, 
                module_id: currentSelectedModule,
                module_data: CC_MODULES[currentSelectedModule] // Передаємо дані про ціну
            })
        });

        const result = await response.json();
        
        if (result.success) {
            tg.HapticFeedback.notificationOccurred('success');
            closeModal();
            loadCommandCenter(); // Оновлюємо сторінку
        } else {
            tg.HapticFeedback.notificationOccurred('error');
            tg.showAlert("❌ " + result.error);
            document.getElementById('buy-btn').disabled = false;
        }
    } catch (e) {
        tg.showAlert("Помилка з'єднання.");
        document.getElementById('buy-btn').disabled = false;
    } finally {
        tg.MainButton.hideProgress();
    }
}

// Запускаємо завантаження при старті
window.onload = loadCommandCenter;