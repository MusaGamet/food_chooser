let money = 100; // Начальный баланс
let cart = []; // Корзина
let totalCost = 0; // Общая стоимость заказа

// Функция для добавления блюда в корзину
function addToCart(dishName, cost) {
    cart.push({ name: dishName, cost: cost });
    totalCost += cost;
    updateCart();
    updateCartIcon();
}

// Функция для обновления корзины
function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const totalCostElement = document.getElementById("total-cost");

    if (cartItems && totalCostElement) {
        // Очищаем корзину
        cartItems.innerHTML = "";

        // Добавляем новые элементы
        cart.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.name} - ${item.cost} ₽`;
            cartItems.appendChild(li);
        });

        // Обновляем общую стоимость
        totalCostElement.textContent = totalCost;
    }
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

    if (money >= totalCost) {
        money -= totalCost;
        document.getElementById("money").textContent = money;
        alert(`Заказ оформлен! Спасибо, Котенок!`);
        cart = [];
        totalCost = 0;
        updateCart();
        updateCartIcon();
    } else {
        alert("Недостаточно денег!");
    }
}

// Функция для ежедневного пополнения баланса
function dailyIncome() {
    money += 100; // Пополнение на 100 ₽ каждый день
    document.getElementById("money").textContent = money;
}

// Устанавливаем ежедневное пополнение в 12:00
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 12 && now.getMinutes() === 0 && now.getSeconds() === 0) {
        dailyIncome();
    }
}, 1000);

// Инициализация корзины при загрузке страницы
updateCartIcon();