document.addEventListener('DOMContentLoaded', () => {
    // Cargar los datos de productos desde el archivo JSON
    fetch('../../Scraper python/products.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('data-container');
            const searchInput = document.getElementById('search-input'); // Obtener el input de búsqueda
            const bestDiscountButton = document.getElementById('best-discount-button'); // Botón de mejores descuentos
            const showAllButton = document.getElementById('show-all-button'); // Botón para mostrar todos los productos
            let allProducts = data; // Guardar todos los productos para filtrar

            // Función para mostrar los productos en pantalla
            const displayProducts = (products) => {
                container.innerHTML = ''; // Limpiar contenedor
                products.forEach(item => {
                    // Crear un contenedor para cada producto
                    const productDiv = document.createElement('div');
                    productDiv.classList.add('product');

                    // Extraer el mejor descuento disponible de las plataformas
                    let bestDiscount = null;
                    let bestDiscountText = "";

                    item.platforms.forEach(platform => {
                        const discountMatch = platform.platform_price.match(/-(\d+)%/);
                        if (discountMatch) {
                            const discountValue = parseInt(discountMatch[1]);
                            if (bestDiscount === null || discountValue > bestDiscount) {
                                bestDiscount = discountValue;
                                bestDiscountText = `-${bestDiscount}%`;
                            }
                        }
                    });

                    // Mostrar la imagen, nombre, precios y detalles de la oferta
                    productDiv.innerHTML = `
                        <div class="product-image">
                            <img src="${item.image_url}" alt="${item.name}">
                        </div>
                        <div class="product-details">
                            <h2 class="product-name">${item.name}</h2>
                            <p class="product-pricing">
                                <span class="original-price">${bestDiscountText}</span>
                                <span class="current-price">${item.price}</span>
                            </p>
                            <p class="sale-end">Sale ends: ${item.platforms[0].sale_end}</p>
                        </div>
                    `;

                    // Evento de clic para abrir la página de detalles en lugar de un modal
                    productDiv.addEventListener('click', () => {
                        localStorage.setItem('selectedProduct', JSON.stringify(item));
                        window.location.href = 'web/main/detail.html';
                    });

                    // Añadir el producto al contenedor principal
                    container.appendChild(productDiv);
                });
            };

            // Mostrar todos los productos al inicio
            displayProducts(allProducts);

            // Filtrar productos según el término de búsqueda
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredProducts = allProducts.filter(product =>
                    product.name.toLowerCase().includes(searchTerm)
                );
                displayProducts(filteredProducts); // Mostrar solo los productos filtrados
            });

            // Evento para mostrar los productos con mejores descuentos
            bestDiscountButton.addEventListener('click', () => {
                const productsWithDiscounts = allProducts
                    .map(item => {
                        let bestDiscount = null;
                        item.platforms.forEach(platform => {
                            const discountMatch = platform.platform_price.match(/-(\d+)%/);
                            if (discountMatch) {
                                const discountValue = parseInt(discountMatch[1]);
                                if (bestDiscount === null || discountValue > bestDiscount) {
                                    bestDiscount = discountValue;
                                }
                            }
                        });
                        return { ...item, bestDiscount }; // Añadir el descuento al producto
                    })
                    .filter(item => item.bestDiscount !== null) // Solo productos con descuentos
                    .sort((a, b) => b.bestDiscount - a.bestDiscount); // Ordenar de mayor a menor descuento

                displayProducts(productsWithDiscounts); // Mostrar los productos con los mejores descuentos
            });

            // Evento para mostrar todos los productos al hacer clic en el botón "Mostrar Todos"
            showAllButton.addEventListener('click', () => {
                displayProducts(allProducts); // Mostrar todos los productos nuevamente
            });
        })
        .catch(error => console.error('Error al cargar JSON:', error));
});
