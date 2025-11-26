//...................................filter..............................................................................................


        document.addEventListener('DOMContentLoaded', () => {
            const foodContainer = document.getElementById('foods');
            const filterButtons = document.querySelectorAll('.filterButtons button');

            // Load XML Data
            fetch('../XML/foods.xml')
                .then(response => response.text())
                .then(data => {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(data, 'application/xml');
                    renderFoodItems(xml);
                    addFilterFunctionality(xml);
                })
                .catch(err => console.error('Failed to load XML:', err));

        
            function renderFoodItems(xml, category = "all") {
                const foods = xml.getElementsByTagName('food');
                foodContainer.innerHTML = ''; 

                Array.from(foods).forEach(food => {
                    const id = food.getElementsByTagName('id')[0].textContent;
                    const name = food.getElementsByTagName('name')[0].textContent;
                    const price = food.getElementsByTagName('price')[0].textContent;
                    const description = food.getElementsByTagName('description')[0].textContent;
                    const image = food.getElementsByTagName('image')[0].textContent;
                    const categoryTag = food.getElementsByTagName('category')[0].textContent;

                    // Check if item matches the selected category or show all
                    if (category === "all" || category === categoryTag) {
                        foodContainer.innerHTML += `
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

                if (foodContainer.innerHTML === '') {
                    foodContainer.innerHTML = '<p>No items found.</p>';
                }
            }

            // Add Filter
            function addFilterFunctionality(xml) {
                filterButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        // Remove active class from all buttons
                        document.querySelector('.filterButtons .active').classList.remove('active');
                        e.target.classList.add('active');

                        // Get the category from the button
                        const category = e.target.getAttribute('data-filter');
                        renderFoodItems(xml, category);
                    });
                });
            }
        });


//.......................................cart............................


    document.addEventListener('DOMContentLoaded', () => {
        // Load food items from XML
        fetch('../XML/foods.xml')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(data, "application/xml");
                const foods = xml.getElementsByTagName('food');
                const container = document.getElementById('foods');
                
                container.innerHTML = '';
                
                Array.from(foods).forEach(food => {
                    const id = food.getElementsByTagName('id')[0].textContent;
                    const name = food.getElementsByTagName('name')[0].textContent;
                    const price = food.getElementsByTagName('price')[0].textContent;
                    const desc = food.getElementsByTagName('description')[0].textContent;
                    const image = food.getElementsByTagName('image')[0].textContent;
                    const category = food.getElementsByTagName('category')[0].textContent;
                    
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
                            'food',
                            item.querySelector('h2').textContent,
                            item.querySelector('.price').textContent.replace('$', ''),
                            item.querySelector('img').src
                        );
                    }
                });
            });
    });
    


                //search functionality
            document.addEventListener('DOMContentLoaded', function() {
                const searchInput = document.getElementById('searchInput');
                const searchButton = document.getElementById('searchButton');
                const searchResults = document.getElementById('searchResults');
                
                //limit how often search executes
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
                
                // Get all food items currently displayed on the page
                function getPageFoods() {
                    const items = document.querySelectorAll('#foods .item');
                    return Array.from(items).map(item => ({
                        element: item,
                        name: item.querySelector('h2').textContent,
                        price: item.querySelector('.price').textContent,
                        description: item.querySelector('.description')?.textContent || '',
                        image: item.querySelector('img').src,
                        category: item.dataset.category || ''
                    }));
                }
                
                // search on current page foods
                function performSearch() {
                    const searchTerm = searchInput.value.toLowerCase().trim();
                    searchResults.innerHTML = '';
                    
                    if (searchTerm === '') {
                        searchResults.style.display = 'none';
                        return;
                    }
                    
                    const foods = getPageFoods();
                    const filteredFoods = foods.filter(food => 
                        food.name.toLowerCase().includes(searchTerm) || 
                        food.description.toLowerCase().includes(searchTerm) ||
                        food.category.toLowerCase().includes(searchTerm)
                    );
                    
                    if (filteredFoods.length > 0) {
                        filteredFoods.forEach(food => {
                            const resultItem = document.createElement('div');
                            resultItem.className = 'search-result-item';
                            resultItem.innerHTML = `
                                <img src="${food.image}" alt="${food.name}">
                                <div class="info">
                                    <div class="name">${food.name}</div>
                                    <div class="price">${food.price}</div>
                                </div>
                            `;
                            
                            resultItem.addEventListener('click', () => {
                                // Scroll and highlight the food item
                                food.element.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center'
                                });
                                food.element.classList.add('highlight');
                                setTimeout(() => {
                                    food.element.classList.remove('highlight');
                                }, 2000);
                                
                                // Close results and keep search term
                                searchResults.style.display = 'none';
                                searchInput.value = food.name;
                                searchInput.focus();
                            });
                            
                            searchResults.appendChild(resultItem);
                        });
                        searchResults.style.display = 'block';
                    } else {
                        searchResults.innerHTML = '<div class="no-results">No matching food items found</div>';
                        searchResults.style.display = 'block';
                    }
                }
                
                // search functionality
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
                    
                    // Highlight item if URL has hash
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