   document.addEventListener('DOMContentLoaded', () => {
// Load dessert items from XML
fetch('../XML/desserts.xml')
    .then(response => response.text())
    .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "application/xml");
        const desserts = xml.getElementsByTagName('dessert');
        const container = document.getElementById('desserts');
            
        container.innerHTML = '';
            
        Array.from(desserts).forEach(dessert => {
            const id = dessert.getElementsByTagName('id')[0].textContent;
            const name = dessert.getElementsByTagName('name')[0].textContent;
            const price = dessert.getElementsByTagName('price')[0].textContent;
            const desc = dessert.getElementsByTagName('description')[0].textContent;
            const image = dessert.getElementsByTagName('image')[0].textContent;
            const category = dessert.getElementsByTagName('category')[0].textContent;
                
            const item = document.createElement('div');
            item.className = 'item';
            item.dataset.id = id;
            item.dataset.category = category;
            item.innerHTML = `
                <img src="${image}" alt="${name}" width="300" height="300">
                <h2>${name}</h2>
                <p class="price">${price}</p>
                <p class="description">${desc}</p>
                <button class="addBag">ADD TO BAG</button>
            `;
            container.appendChild(item);
        });
            
        // Add event listeners for adding to cart
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('addBag')) {
                const item = e.target.closest('.item');
                addToCart(
                    item.dataset.id,
                    'dessert',
                    item.querySelector('h2').textContent,
                    item.querySelector('.price').textContent.replace('$', ''),
                    item.querySelector('img').src
                );
            }
        });
     });
});
           
//..............................................filter.....................................

document.addEventListener('DOMContentLoaded', () => {
const dessertContainer = document.getElementById('desserts');
const filterButtons = document.querySelectorAll('.filterButtons button');

// Load XML Data
fetch('../XML/desserts.xml')
    .then(response => response.text())
    .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, 'application/xml');
        renderDessertItems(xml);
        addFilterFunctionality(xml);
    })
    .catch(err => console.error('Failed to load XML:', err));

// Function to Render Food Items
function renderDessertItems(xml, category = "all") {
    const desserts = xml.getElementsByTagName('dessert');
    dessertContainer.innerHTML = ''; // Clear previous items

    Array.from(desserts).forEach(dessert => {
        const id = dessert.getElementsByTagName('id')[0].textContent;
        const name = dessert.getElementsByTagName('name')[0].textContent;
        const price = dessert.getElementsByTagName('price')[0].textContent;
        const description = dessert.getElementsByTagName('description')[0].textContent;
        const image = dessert.getElementsByTagName('image')[0].textContent;
        const categoryTag = dessert.getElementsByTagName('category')[0].textContent;

        // Check if item matches the selected category or show all
        if (category === "all" || category === categoryTag) {
            dessertContainer.innerHTML += `
                <div class="item" data-category="${categoryTag}" data-id="${id}">
                    <img src="${image}" alt="${name}" width="300" height="300">
                    <h2>${name}</h2>
                    <p class="price">${price}</p>
                    <p class="description">${description}</p>
                    <button class="addBag">ADD TO BAG</button>
                </div>
            `;
        }
    });

    if (dessertContainer.innerHTML === '') {
        dessertContainer.innerHTML = '<p>No items found.</p>';
    }
}

// Function to Add Filter Functionality
function addFilterFunctionality(xml) {
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active class from all buttons
            document.querySelector('.filterButtons .active').classList.remove('active');
            e.target.classList.add('active');

            // Get the category from the button
            const category = e.target.getAttribute('data-filter');
            renderDessertItems(xml, category);
        });
    });
}
});

//.......................................search..............................


document.addEventListener('DOMContentLoaded', function() {
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');

// Debounce function to limit how often search executes
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Get all dessert displayed on the page
function getPageDesserts() {
    const items = document.querySelectorAll('#desserts .item');
    return Array.from(items).map(item => ({
        element: item,
        name: item.querySelector('h2').textContent,
        price: item.querySelector('.price').textContent,
        description: item.querySelector('.description')?.textContent || '',
        image: item.querySelector('img').src,
        category: item.dataset.category || ''
    }));
}

//search on current page desserts
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    searchResults.innerHTML = '';
    
    if (searchTerm === '') {
        searchResults.style.display = 'none';
        return;
    }
    
    const desserts = getPageDesserts();
    const filteredDesserts = desserts.filter(dessert => 
        dessert.name.toLowerCase().includes(searchTerm) || 
        dessert.description.toLowerCase().includes(searchTerm) ||
        dessert.category.toLowerCase().includes(searchTerm)
    );
    
    if (filteredDesserts.length > 0) {
        filteredDesserts.forEach(dessert => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <img src="${dessert.image}" alt="${dessert.name}">
                <div class="info">
                    <div class="name">${dessert.name}</div>
                    <div class="price">${dessert.price}</div>
                </div>
            `;
            
            resultItem.addEventListener('click', () => {
                // Scroll and highlight the dessert
                dessert.element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                dessert.element.classList.add('highlight');
                setTimeout(() => {
                    dessert.element.classList.remove('highlight');
                }, 2000);
                
                // Close results and keep search term
                searchResults.style.display = 'none';
                searchInput.value = dessert.name;
                searchInput.focus();
            });
            
            searchResults.appendChild(resultItem);
        });
        searchResults.style.display = 'block';
    } else {
        searchResults.innerHTML = '<div class="no-results">No matching desserts found</div>';
        searchResults.style.display = 'block';
    }
}


function initSearch() {
    
    searchInput.addEventListener('input', debounce(function() {
        if (this.value.trim() !== '') {
            performSearch();
        } else {
            searchResults.style.display = 'none';
        }
    }, 300));
    
    searchButton.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Close results when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });
    
    // Highlight item 
    if (window.location.hash) {
        const itemId = window.location.hash.substring(1);
        const itemElement = document.querySelector(`.item[data-id="${itemId}"]`);
        if (itemElement) {
            setTimeout(() => {
                itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                itemElement.classList.add('highlight');
                setTimeout(() => {
                    itemElement.classList.remove('highlight');
                }, 2000);
            }, 500);
        }
    }
}


initSearch();
});
