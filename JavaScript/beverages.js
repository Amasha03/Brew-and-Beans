//......................................filter...................................

document.addEventListener('DOMContentLoaded', () => {
    const beverageContainer = document.getElementById('beverages');
    const filterButtons = document.querySelectorAll('.filterButtons button');

    // Load XML Data
    fetch('../XML/beverages.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, 'application/xml');
            renderBeverageItems(xml);
            addFilterFunctionality(xml);
        })
        .catch(err => console.error('Failed to load XML:', err));

    // Function to Render Food Items
    function renderBeverageItems(xml, category = "all") {
        const beverages = xml.getElementsByTagName('beverage');
        beverageContainer.innerHTML = ''; // Clear previous items

        Array.from(beverages).forEach(beverage => {
            const id = beverage.getElementsByTagName('id')[0].textContent;
            const name = beverage.getElementsByTagName('name')[0].textContent;
            const price = beverage.getElementsByTagName('price')[0].textContent;
            const description = beverage.getElementsByTagName('description')[0].textContent;
            const image = beverage.getElementsByTagName('image')[0].textContent;
            const categoryTag = beverage.getElementsByTagName('category')[0].textContent;

            // Check if item matches the selected category or show all
            if (category === "all" || category === categoryTag) {
                beverageContainer.innerHTML += `
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

        if (beverageContainer.innerHTML === '') {
            beverageContainer.innerHTML = '<p>No items found.</p>';
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
                renderBeverageItems(xml, category);
            });
        });
    }
});

//..............................................cart........................................
 


document.addEventListener('DOMContentLoaded', () => {
        // Load beverage items from XML
        fetch('../XML/beverages.xml')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(data, "application/xml");
                const beverages = xml.getElementsByTagName('beverage');
                const container = document.getElementById('beverages');
                
                container.innerHTML = '';
                
                Array.from(beverages).forEach(beverage => {
                    const id = beverage.getElementsByTagName('id')[0].textContent;
                    const name = beverage.getElementsByTagName('name')[0].textContent;
                    const price = beverage.getElementsByTagName('price')[0].textContent;
                    const desc = beverage.getElementsByTagName('description')[0].textContent;
                    const image = beverage.getElementsByTagName('image')[0].textContent;
                    const category = beverage.getElementsByTagName('category')[0].textContent;
                    
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
                            'beverage',
                            item.querySelector('h2').textContent,
                            item.querySelector('.price').textContent.replace('$', ''),
                            item.querySelector('img').src
                        );
                    }
                });
            });
    });


//-----------------------------------search-----------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    

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
    
    // Get all beverage items currently displayed on the page
    function getPageBeverages() {
        const items = document.querySelectorAll('#beverages .item');
        return Array.from(items).map(item => ({
            element: item,
            name: item.querySelector('h2').textContent,
            price: item.querySelector('.price').textContent,
            description: item.querySelector('.description')?.textContent || '',
            image: item.querySelector('img').src,
            category: item.dataset.category || ''
        }));
    }
    
    // search
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        
        if (searchTerm === '') {
            searchResults.style.display = 'none';
            return;
        }
        
        const beverages = getPageBeverages();
        const filteredBeverages = beverages.filter(beverage => 
            beverage.name.toLowerCase().includes(searchTerm) || 
            beverage.description.toLowerCase().includes(searchTerm) ||
            beverage.category.toLowerCase().includes(searchTerm)
        );
        
        if (filteredBeverages.length > 0) {
            filteredBeverages.forEach(beverage => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <img src="${beverage.image}" alt="${beverage.name}">
                    <div class="info">
                        <div class="name">${beverage.name}</div>
                        <div class="price">${beverage.price}</div>
                    </div>
                `;
                
                resultItem.addEventListener('click', () => {
                    // Scroll to and highlight the beverage
                    beverage.element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    beverage.element.classList.add('highlight');
                    setTimeout(() => {
                        beverage.element.classList.remove('highlight');
                    }, 2000);
                    
                    // Close results and keep search term
                    searchResults.style.display = 'none';
                    searchInput.value = beverage.name;
                    searchInput.focus();
                });
                
                searchResults.appendChild(resultItem);
            });
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<div class="no-results">No matching beverages found</div>';
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
    