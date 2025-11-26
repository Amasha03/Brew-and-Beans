let carts = JSON.parse(localStorage.getItem('brewAndBeansCart')) || [];

// Add item to cart
function addToCart(item_id, category, name, price, image) {
    let existingItem = carts.find(item => 
        item.item_id === item_id && item.category === category
    );
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        carts.push({
            item_id: item_id,
            category: category,
            name: name,
            price: parseFloat(price),
            image: image,
            quantity: 1
        });
    }
    updateCart();
}

// Change item quantity
function changeQuantity(item_id, category, type) {
    const index = carts.findIndex(item => 
        item.item_id == item_id && item.category == category
    );
    
    if (index !== -1) {
        if (type === 'plus') {
            carts[index].quantity++;
        } else {
            if (carts[index].quantity > 1) {
                carts[index].quantity--;
            } else {
                carts.splice(index, 1);
            }
        }
        updateCart();
    }
}

// Update cart
function updateCart() {
    localStorage.setItem('brewAndBeansCart', JSON.stringify(carts));
    renderCart();
    updateCartIcon();
}

// Render cart items
function renderCart() {
    const bagList = document.getElementById('bagList');
    if (!bagList) return;
    
    bagList.innerHTML = '';
    
    if (carts.length === 0) {
        bagList.innerHTML = '<p>Your cart is empty</p>';
        return;
    }
    
    carts.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.dataset.id = item.item_id;
        itemElement.dataset.category = item.category;
        itemElement.innerHTML = `
            <div class="image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="name">${item.name}</div>
            <div class="totalPrice">$${(item.price * item.quantity).toFixed(2)}</div>
            <div class="quantity">
                <button class="minus">-</button>
                <div class="qty">${item.quantity}</div>
                <button class="plus">+</button>
            </div>
        `;
        bagList.appendChild(itemElement);
    });
}

// Update cart icon count
function updateCartIcon() {
    const total = carts.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cartIcon').forEach(icon => {
        icon.textContent = total;
    });
}

// Toggle cart visibility
function toggleCart() {
    const cart = document.getElementById('cart');
    cart.style.display = cart.style.display === 'none' ? 'block' : 'block';
}

// Close cart
function closeCart() {
    document.getElementById('cart').style.display = 'none';
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartIcon();
    renderCart();
    
    // Handle quantity changes
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('minus') || 
            event.target.classList.contains('plus')) {
            const item = event.target.closest('.item');
            if (item) {
                changeQuantity(
                    item.dataset.id, 
                    item.dataset.category,
                    event.target.classList.contains('plus') ? 'plus' : 'minus'
                );
            }
        }
    });
});



function proceedToCheckout() {
    // Save current cart
    localStorage.setItem('brewAndBeansCart', JSON.stringify(carts));
    
    window.location.href = 'checkout.html';
}


document.addEventListener('DOMContentLoaded', () => {
   
    // Checkout button
    document.querySelector('.checkOut')?.addEventListener('click', proceedToCheckout);
});


// Search functionality
let menuItems = [];

function loadMenuItems() {
    // Load from foods.xml
    fetch('foods.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "application/xml");
            const foods = xml.getElementsByTagName('food');
            
            menuItems = Array.from(foods).map(food => ({
                id: food.getElementsByTagName('id')[0].textContent,
                name: food.getElementsByTagName('name')[0].textContent,
                price: food.getElementsByTagName('price')[0].textContent,
                description: food.getElementsByTagName('description')[0].textContent,
                image: food.getElementsByTagName('image')[0].textContent,
                category: 'food'
            }));
        })
        .catch(error => console.error('Error loading menu items:', error));
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    
    if (searchTerm.length < 2) {
        searchResults.style.display = 'none';
        return;
    }
    
    const results = menuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.description.toLowerCase().includes(searchTerm)
    );
    
    displayResults(results);
}

//search bar functions
function displayResults(results) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
    } else {
        results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <img src="${item.image}" width="50" height="50" style="margin-right:10px">
                <div>
                    <strong>${item.name}</strong> - $${item.price}
                    <p style="font-size:0.8em;color:#666">${item.description.substring(0, 50)}...</p>
                </div>
            `;
            resultItem.addEventListener('click', () => {
                // Scroll to the item on the page
                const itemElement = document.querySelector(`[data-id="${item.id}"]`);
                if (itemElement) {
                    itemElement.scrollIntoView({ behavior: 'smooth' });
                    itemElement.style.animation = 'highlight 2.5s';
                    setTimeout(() => {
                        itemElement.style.animation = '';
                    }, 1500);
                }
                searchResults.style.display = 'none';
            });
            searchResults.appendChild(resultItem);
        });
    }
    
    searchResults.style.display = 'block';
}


document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
    
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    

    searchInput.addEventListener('input', performSearch);
    searchButton.addEventListener('click', performSearch);
    
    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
    
    // Add highlight animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes highlight {
            0% { background-color: rgba(233, 219, 98, 0.25); }
            50% { background-color: rgba(243, 205, 33, 0.3); }
            100% { background-color: rgba(204, 165, 56, 0.35); }
        }
    `;
    document.head.appendChild(style);
});