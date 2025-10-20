let money = 100; // Начальный баланс
let cart = []; // Корзина
let totalCost = 0; // Общая стоимость заказа

// Save state to localStorage
function saveState() {
    try {
        const state = {
            money: money,
            cart: cart,
            totalCost: totalCost
        };
        localStorage.setItem('foodChooser_state', JSON.stringify(state));
    } catch (e) {
        console.error('Не удалось сохранить состояние в localStorage', e);
    }
}

// Load state from localStorage
function loadState() {
    try {
        const raw = localStorage.getItem('foodChooser_state');
        if (raw) {
            const state = JSON.parse(raw);
            // validate and assign
            if (Array.isArray(state.cart)) cart = state.cart;
            if (typeof state.totalCost === 'number') totalCost = state.totalCost;
            if (typeof state.money === 'number') money = state.money;
        }
    } catch (e) {
        console.error('Не удалось прочитать состояние из localStorage', e);
    }
}

// Redirect handling: сохранить страницу, на которую нужно вернуться после логина
function saveRedirect(path) {
    try { localStorage.setItem('foodChooser_redirect', path); } catch (e) {}
}

function popRedirect() {
    try {
        const p = localStorage.getItem('foodChooser_redirect');
        localStorage.removeItem('foodChooser_redirect');
        return p;
    } catch (e) { return null; }
}

// --- Простая клиентская авторизация (локальная, для демо) ---
function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('foodChooser_user')) || null; } catch (e) { return null; }
}

function setCurrentUser(user) {
    try { localStorage.setItem('foodChooser_user', JSON.stringify(user)); } catch (e) { console.error(e); }
}

function logout() {
    setCurrentUser(null);
    updateAuthLink();
}

function login(username) {
    const user = { username: username };
    setCurrentUser(user);
    updateAuthLink();
}

function isAuthenticated() {
    return getCurrentUser() !== null;
}

function updateAuthLink() {
    const link = document.getElementById('auth-link');
    const user = getCurrentUser();
    const avatar = document.getElementById('user-avatar');
    if (!link) return;
    if (user) {
        link.textContent = `Выйти (${user.username})`;
        link.href = '#';
        link.onclick = (e) => { e.preventDefault(); logout(); };
        if (avatar) {
            avatar.textContent = user.username[0].toUpperCase();
            avatar.style.display = 'flex';
        }
    } else {
        link.textContent = 'Войти';
        link.href = 'login.html';
        link.onclick = null;
        if (avatar) avatar.style.display = 'none';
    }
}

// Функция для добавления блюда в корзину
function addToCart(dishName, cost) {
    // Проверка авторизации
    if (!isAuthenticated()) {
        alert('Пожалуйста, войдите в систему, чтобы добавлять товары в корзину.');
        // сохраним текущую страницу, чтобы вернуться после логина
        saveRedirect(window.location.pathname + window.location.search);
        window.location.href = 'login.html';
        return;
    }

    cart.push({ name: dishName, cost: cost });
    totalCost += cost;
    updateCart();
    updateCartIcon();
    saveState();
}

// Функция для обновления корзины
function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const totalCostElement = document.getElementById("total-cost");
    if (cartItems && totalCostElement) {
        cartItems.innerHTML = "";
        cart.forEach((item, idx) => {
            const tr = document.createElement("tr");
            const tdName = document.createElement("td");
            tdName.textContent = item.name;
            const tdCost = document.createElement("td");
            tdCost.textContent = item.cost + ' ₽';
            const tdDel = document.createElement("td");
            const del = document.createElement('button');
            del.className = 'remove-item';
            del.title = 'Удалить';
            del.innerHTML = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L14 14M6 14L14 6" stroke="#ff6f61" stroke-width="2.2" stroke-linecap="round"/></svg>';
            del.onclick = () => { removeFromCart(idx); };
            tdDel.appendChild(del);
            tr.appendChild(tdName);
            tr.appendChild(tdCost);
            tr.appendChild(tdDel);
            cartItems.appendChild(tr);
        });
        totalCostElement.textContent = totalCost;
    }
}

// Удалить элемент по индексу
function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    const item = cart.splice(index, 1)[0];
    totalCost -= Number(item.cost) || 0;
    if (totalCost < 0) totalCost = 0;
    updateCart();
    updateCartIcon();
    saveState();
}

// Очистить корзину
function clearCart() {
    if (!cart.length) return;
    confirmModal('Очистить корзину?', () => {
        cart = [];
        totalCost = 0;
        updateCart();
        updateCartIcon();
        saveState();
    });
}

// Функция для обновления иконки корзины
function updateCartIcon() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Функция для оформления заказа
function placeOrder() {
    if (totalCost === 0) {
        alert("Корзина пуста!");
        return;
    }

    if (!isAuthenticated()) {
        alert('Пожалуйста, войдите в систему, чтобы оформить заказ.');
        window.location.href = 'login.html';
        return;
    }

    if (money >= totalCost) {
        money -= totalCost;
        document.getElementById("money").textContent = money;
        alert(`Заказ оформлен! Спасибо, Котенок!`);
        cart = [];
        totalCost = 0;
        updateCart();
        updateCartIcon();
        saveState();
    } else {
        alert("Недостаточно денег!");
    }
}

// --- Модальные окна ---
function confirmModal(message, onConfirm) {
    showModal(message, [
        { text: 'Отмена', style: 'background:#eee;color:#333;', action: closeModal },
        { text: 'OK', style: 'background:#ff6f61;color:#fff;', action: () => { closeModal(); onConfirm && onConfirm(); } }
    ]);
}

function alertModal(message, onClose) {
    showModal(message, [
        { text: 'OK', style: 'background:#ff6f61;color:#fff;', action: () => { closeModal(); onClose && onClose(); } }
    ]);
}

function showModal(message, actions) {
    const overlay = document.getElementById('modal-overlay');
    const msg = document.getElementById('modal-message');
    const act = document.getElementById('modal-actions');
    if (!overlay || !msg || !act) return;
    msg.textContent = message;
    act.innerHTML = '';
    actions.forEach(btn => {
        const b = document.createElement('button');
        b.textContent = btn.text;
        b.style = btn.style || '';
        b.onclick = btn.action;
        act.appendChild(b);
    });
    overlay.style.display = 'flex';
    // Allow closing modal by clicking overlay (not modal window)
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
}
// Функция для ежедневного пополнения баланса
function dailyIncome() {
    money += 100; // Пополнение на 100 ₽ каждый день
    document.getElementById("money").textContent = money;
    saveState();
}

// Устанавливаем ежедневное пополнение в 12:00
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 12 && now.getMinutes() === 0 && now.getSeconds() === 0) {
        dailyIncome();
    }
}, 1000);

// Инициализация корзины при загрузке страницы
// Восстанавливаем состояние, если оно есть
loadState();

// Если totalCost не указан, пересчитаем по элементам корзины (защита от несовпадений)
if (!totalCost && Array.isArray(cart) && cart.length) {
    totalCost = cart.reduce((s, it) => s + (Number(it.cost) || 0), 0);
}

// Обновляем UI (иконка корзины, сумма и список) после загрузки
// --- Toast notifications ---
function showToast(message, type = 'success', timeout = 2600) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    // Add icon based on type
    let icon = '';
    if (type === 'success') icon = '<span style="margin-right:8px;">✅</span>';
    else if (type === 'error') icon = '<span style="margin-right:8px;">❌</span>';
    else if (type === 'info') icon = '<span style="margin-right:8px;">ℹ️</span>';
    else if (type === 'warning') icon = '<span style="margin-right:8px;">⚠️</span>';
    toast.innerHTML = icon + message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, timeout);
}

// --- Theme switcher ---
function setTheme(dark) {
    if (dark) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('foodChooser_theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('foodChooser_theme', 'light');
    }
}
function toggleTheme() {
    setTheme(!document.body.classList.contains('dark-theme'));
}
function initTheme() {
    const theme = localStorage.getItem('foodChooser_theme');
    setTheme(theme === 'dark');
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Kamila balance management (admin) ---
    const setBalanceForm = document.getElementById('set-balance-kamila-form');
    const kamilaBalanceInput = document.getElementById('kamila-balance');
    const kamilaBalanceStatus = document.getElementById('kamila-balance-status');
    async function fetchKamilaBalance() {
        // prefer same origin, but if page opened via file:// try localhost fallback
        const origin = (window.location && window.location.protocol === 'file:') ? 'http://localhost:3000' : (window.location && window.location.origin) || 'http://localhost:3000';
        const url = origin + '/api/user_balance?username=Kamila';
        try {
            kamilaBalanceStatus.textContent = 'Загрузка...';
            kamilaBalanceStatus.style.color = '#2b8aef';
            const res = await fetch(url, {cache: 'no-store'});
            if (!res.ok) {
                const body = await res.text().catch(() => '');
                console.warn('Balance fetch failed', res.status, body, 'url', url);
                kamilaBalanceStatus.textContent = `Ошибка сервера (${res.status})`;
                kamilaBalanceStatus.style.color = '#b00020';
                return;
            }
            const data = await res.json();
            if (data.ok) {
                kamilaBalanceInput.value = data.balance;
                kamilaBalanceStatus.textContent = `Текущий баланс: ${data.balance} ₽`;
                kamilaBalanceStatus.style.color = '#2b8aef';
            } else {
                kamilaBalanceStatus.textContent = data.error || 'Ошибка';
                kamilaBalanceStatus.style.color = '#b00020';
            }
        } catch (e) {
            console.error('fetchKamilaBalance error', e, 'url', url);
            kamilaBalanceStatus.textContent = 'Ошибка соединения';
            kamilaBalanceStatus.style.color = '#b00020';
        }
    }
    if (setBalanceForm) {
        setBalanceForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const value = Number(kamilaBalanceInput.value);
            if (isNaN(value) || value < 0) {
                kamilaBalanceStatus.textContent = 'Введите корректное число';
                kamilaBalanceStatus.style.color = '#b00020';
                return;
            }
            kamilaBalanceStatus.textContent = 'Сохраняем...';
            kamilaBalanceStatus.style.color = '#2b8aef';
            try {
                const token = getJwt();
                const origin = (window.location && window.location.protocol === 'file:') ? 'http://localhost:3000' : (window.location && window.location.origin) || '';
                const endpoint = (origin ? origin : '') + '/api/set_balance_kamila';
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: 'Bearer ' + token } : {})
                    },
                    body: JSON.stringify({ balance: value })
                });
                const data = await res.json();
                if (data.ok) {
                    kamilaBalanceStatus.textContent = 'Баланс обновлён!';
                    kamilaBalanceStatus.style.color = '#2b8aef';
                    await fetchKamilaBalance();
                } else {
                    kamilaBalanceStatus.textContent = data.error || 'Ошибка';
                    kamilaBalanceStatus.style.color = '#b00020';
                }
            } catch (e) {
                kamilaBalanceStatus.textContent = 'Ошибка соединения';
                kamilaBalanceStatus.style.color = '#b00020';
            }
        });
        fetchKamilaBalance();
    }
    // Theme switcher
    initTheme();
    const themeBtn = document.getElementById('theme-switch');
    if (themeBtn) themeBtn.onclick = toggleTheme;

    const moneyEl = document.getElementById('money');
    if (moneyEl) moneyEl.textContent = money;
    updateCart();
    updateCartIcon();
    updateAuthLink();

    // --- Dishes management ---
    const dishesList = document.getElementById('dishes-list');
    const adminPanel = document.getElementById('admin-dish-panel');
    const addDishForm = document.getElementById('add-dish-form');

    let dishes = [];
    let jwtToken = null;

    // Получить JWT из localStorage (если есть)
    function getJwt() {
        return localStorage.getItem('foodChooser_jwt') || null;
    }
    function setJwt(token) {
        localStorage.setItem('foodChooser_jwt', token);
    }

    // Загрузить блюда с backend
    async function loadDishes() {
        try {
            const res = await fetch('/api/dishes');
            const data = await res.json();
            console.log('DEBUG: /api/dishes response', data);
            if (data.ok && Array.isArray(data.dishes)) {
                dishes = data.dishes;
                renderDishes();
            }
        } catch (e) {
            dishesList.innerHTML = '<div style="color:#b00020">Ошибка загрузки блюд</div>';
            console.error('DEBUG: Ошибка загрузки блюд', e);
        }
    }

    // Отрисовать блюда
    function renderDishes() {
        if (!dishesList) return;
        dishesList.innerHTML = '';
        const user = getCurrentUser();
        const isAdmin = user && user.username === 'admin';
        console.log('DEBUG: user', user, 'isAdmin', isAdmin, 'jwt', getJwt());
        dishes.forEach(dish => {
            const card = document.createElement('div');
            card.className = 'dish-card';
            card.innerHTML = `
                <img src="${dish.image || 'images/dish1.jpg'}" alt="${dish.name}">
                <h3>${dish.name}</h3>
                <p>Стоимость: ${dish.cost} ₽</p>
            `;
            const addBtn = document.createElement('button');
            addBtn.textContent = 'Добавить в корзину';
            addBtn.onclick = () => addToCart(dish.name, dish.cost);
            card.appendChild(addBtn);
            if (isAdmin) {
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Удалить блюдо';
                delBtn.style = 'margin-left:10px;background:#eee;color:#b00020;border:1px solid #b00020;';
                delBtn.onclick = () => confirmModal(`Удалить блюдо «${dish.name}»?`, () => deleteDish(dish.id));
                card.appendChild(delBtn);
            }
            dishesList.appendChild(card);
        });
    }

    // Добавить блюдо (admin)
    async function addDish(name, cost, image) {
        try {
            const token = getJwt();
            const res = await fetch('/api/dishes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: 'Bearer ' + token } : {})
                },
                body: JSON.stringify({ name, cost, image })
            });
            const data = await res.json();
            if (data.ok) {
                alertModal('Блюдо добавлено!');
                loadDishes();
            } else {
                alertModal(data.error || 'Ошибка добавления блюда');
            }
        } catch (e) {
            alertModal('Ошибка добавления блюда');
        }
    }

    // Удалить блюдо (admin)
    async function deleteDish(id) {
        try {
            const token = getJwt();
            const res = await fetch('/api/dishes/' + id, {
                method: 'DELETE',
                headers: token ? { Authorization: 'Bearer ' + token } : {}
            });
            const data = await res.json();
            if (data.ok) {
                alertModal('Блюдо удалено!');
                loadDishes();
            } else {
                alertModal(data.error || 'Ошибка удаления блюда');
            }
        } catch (e) {
            alertModal('Ошибка удаления блюда');
        }
    }

    // Показать админ-панель только для admin
    function updateAdminPanel() {
        const user = getCurrentUser();
        const isAdmin = user && user.username === 'admin';
        if (adminPanel) adminPanel.style.display = isAdmin ? 'flex' : 'none';
    }

    // Обработка формы добавления блюда
    if (addDishForm) {
        addDishForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('dish-name').value.trim();
            const cost = Number(document.getElementById('dish-cost').value);
            const image = document.getElementById('dish-image').value.trim();
            if (!name || !cost) {
                alertModal('Введите название и стоимость блюда');
                return;
            }
            addDish(name, cost, image);
            addDishForm.reset();
        });
    }

    // При логине через API сохранять JWT
    const origLogin = login;
    login = function(username, token) {
        origLogin(username);
        if (token) setJwt(token);
        updateAdminPanel();
        loadDishes();
        console.log('DEBUG: login', username, token, 'jwt now', getJwt());
    };

    // При логауте очищать JWT
    const origLogout = logout;
    logout = function() {
        origLogout();
        setJwt('');
        updateAdminPanel();
        loadDishes();
        console.log('DEBUG: logout, jwt now', getJwt());
    };

    updateAdminPanel();
    loadDishes();
});

    // Login form handling (если есть на странице)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameEl = document.getElementById('username');
            const passwordEl = document.getElementById('password');
            const errorEl = document.getElementById('login-error');
            const submitBtn = document.getElementById('login-submit');
            const username = usernameEl.value.trim();
            const password = passwordEl.value;
            errorEl.textContent = '';

            if (!username) {
                errorEl.textContent = 'Введите логин';
                return;
            }

            // Включим состояние загрузки
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
            const spinner = document.createElement('span');
            spinner.className = 'spinner';
            submitBtn.prepend(spinner);

            // Попробуем реальный локальный API: POST /api/login { username, password }
            let loggedIn = false;
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                if (res.ok) {
                    const body = await res.json();
                    // Ожидаем { ok: true, user: { username } }
                    if (body && body.ok) {
                        login(body.user.username, body.token);
                        loggedIn = true;
                    } else {
                        errorEl.textContent = body && body.error ? body.error : 'Ошибка входа';
                    }
                } else {
                    const body = await res.json().catch(() => ({}));
                    errorEl.textContent = body && body.error ? body.error : `Ошибка сервера: ${res.status}`;
                }
            } catch (err) {
                // Сервер недоступен — fallback: локальный вход (демо)
                console.warn('API недоступен, выполняем локальный вход', err);
                login(username);
                loggedIn = true;
            }

            // Сброс загрузочного состояния
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
            if (spinner && spinner.parentNode) spinner.remove();

            if (loggedIn) {
                const back = popRedirect();
                if (back) window.location.href = back; else window.location.href = 'index.html';
            }
        });
    }
// ... конец DOMContentLoaded ...