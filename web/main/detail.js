document.addEventListener('DOMContentLoaded', () => {
    // Obtener el producto seleccionado desde localStorage
    const product = JSON.parse(localStorage.getItem('selectedProduct'));

    if (product) {
        // Obtener los elementos del DOM
        const detailProductName = document.getElementById('detail-product-name');
        const detailProductPrice = document.getElementById('detail-product-price');
        const detailProductDescription = document.getElementById('detail-product-description');
        const detailImage = document.getElementById('detail-image');
        const detailPlatformList = document.getElementById('detail-platform-list');

        // Obtener los elementos para la información de HowLongToBeat
        const hltbMain = document.getElementById('hltb-main');
        const hltbMainExtra = document.getElementById('hltb-main-extra');
        const hltbCompletionist = document.getElementById('hltb-completionist');

        // Configurar los detalles básicos del producto
        detailProductName.textContent = product.name;
        detailProductPrice.textContent = product.price;
        detailProductDescription.textContent = product.description;

        // Asignar la URL de la imagen del producto y verificar si está disponible
        if (product.image_url) {
            console.log("URL de la imagen:", product.image_url); // Verificar en la consola
            detailImage.src = product.image_url;
        } else {
            console.warn("No se encontró la URL de la imagen en el producto seleccionado");
            detailImage.alt = "Imagen no disponible"; // Mensaje alternativo si no hay imagen
        }

        // Configurar la información de HowLongToBeat, si está disponible
        if (product.howlongtobeat) {
            hltbMain.textContent = product.howlongtobeat.main_story || 'N/A';
            hltbMainExtra.textContent = product.howlongtobeat.main_extra || 'N/A';
            hltbCompletionist.textContent = product.howlongtobeat.completionist || 'N/A';
        } else {
            console.warn("No se encontró información de HowLongToBeat para este juego.");
        }

        // Lista de dominios permitidos y sus imágenes
        const allowedDomains = [
            'nintendo.com',
            'walmart.com',
            'bestbuy.com',
            //'humblebundle.com',
            'target.com',
            'amazon.com',
            'play-asia.com',
            'gamestop.com',
            'microsoft.com',
            'playstation.com',
            'xbox.com'
        ];

        const domainImages = {
            'nintendo.com': '../../images/nintendo.com.png',
            'walmart.com': '../../images/walmart.com.png',
            'bestbuy.com': '../../images/bestbuy.com.png',
            //'humblebundle.com': '../../images/humblebundle.com.jpg',
            'target.com': '../../images/target.com.png',
            'amazon.com': '../../images/amazon.com.png',
            'play-asia.com': '../../images/play-asia.com.png',
            'gamestop.com': '../../images/gamestop.com.png',
            'microsoft.com': '../../images/microsoft.com.png',
            'playstation.com': '../../images/playstation.com.png',
            'xbox.com': '../../images/xbox.com.png'
        };

        // Filtrar plataformas según los dominios permitidos
        const filteredPlatforms = product.platforms.filter(platform => {
            try {
                const platformUrl = platform.platform_url.toLowerCase();
                return allowedDomains.some(domain => platformUrl.includes(domain));
            } catch (e) {
                console.error(`URL inválida: ${platform.platform_url}`);
                return false;
            }
        });

        // Ordenar plataformas por precio (de menor a mayor)
        const sortedPlatforms = filteredPlatforms.sort((a, b) => {
            const priceA = parseFloat(a.platform_price.split('-')[0].replace('$', ''));
            const priceB = parseFloat(b.platform_price.split('-')[0].replace('$', ''));
            return priceA - priceB;
        });

        // Usar plataformas ordenadas o todas si no hay coincidencias
        const platformsToDisplay = sortedPlatforms.length > 0 ? sortedPlatforms : product.platforms;

        // Generar el HTML para cada plataforma
        detailPlatformList.innerHTML = platformsToDisplay.map(platform => {
            const domain = allowedDomains.find(domain => platform.platform_url.includes(domain));
            const platformImage = domainImages[domain] || '../../images/default.png';

            return `
                <li class="platform-item">
                    <a href="${platform.platform_url}" target="_blank" class="platform-link">
                        <img src="${platformImage}" alt="${domain}" class="platform-logo" />
                    </a>
                    <div class="platform-price">${platform.platform_price.split('-')[0]}</div>
                    <div class="platform-discount">${platform.platform_price.includes('-') ? platform.platform_price.split('-')[1] : ''}</div>
                    <div class="platform-sale-end">${platform.sale_end}</div>
                </li>
            `;
        }).join('');
    } else {
        console.error('Error: No se encontraron datos del producto seleccionado en localStorage.');
    }
});
