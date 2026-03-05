function getHeaderTemplate() {
    return `
        <div id="header">
            <div class="headerleft">
                <a href="/">
                    <img src="/yepyeniwatch/images/trans_yepyeniwatch.png" alt="YepYeniWatch" />
                </a>
            </div>
            <div class="headerright">
                <a class="small-button mobil-diziler" title="Mobil Diziler">
                    <i class="fa fa-hashtag"></i>
                </a>
                <a href="https://openani.me/" class="small-button" title="Üye Ol">
                    <i class="fas fa-user-plus"></i>
                    <div class="nomob">Üye Ol</div>
                </a>
                <a class="simplemodal-login small-button" href="https://openani.me/" title="Üye Girişi">
                    <i class="fas fa-sign-in-alt"></i>
                    <div class="nomob">Üye Girişi</div>
                </a>
            </div>
            <nav>
                <ul class="topnav" id="myTopnav">
                    <li id="menu-item-16" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-home menu-item-16">
                        <a href="/">Anasayfa</a>
                    </li>
                    <li id="menu-item-2994" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2994">
                        <a href="https://openani.me/calendar" target="_blank" rel="noopener">Takvim</a>
                    </li>
                    <li id="menu-item-17" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-17">
                        <a href="/anime-arsivi">Anime Arşivi</a>
                    </li>
                    <li id="menu-item-1138" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-1138">
                        <a href="/ekip-alim" rel="noopener">Ekip alımları</a>
                    </li>
                    <li id="menu-item-28" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-28">
                        <a href="/feed">Yeni Bölümler</a>
                    </li>
                    <li id="menu-item-2993" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2993">
                        <a href="https://discord.gg/openanime" target="_blank" rel="noopener">Discord</a>
                    </li>
                    <li id="menu-item-30" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-30">
                        <a href="https://discord.gg/openanime" target="_blank" rel="noopener">İletişim</a>
                    </li>
                    <li>
                        <form method="get" class="example" action="/search" autocomplete="off">
                            <input type="text" class="field" name="q" id="searchInput" onkeyup="fetchResults()" placeholder="bölüm veya anime arayın..." />
                            <button type="submit" title="Ara"><i class="fa fa-search"></i></button>
                            <div id="datafetch"></div>
                        </form>
                    </li>
                </ul>
                <a href="javascript:void(0);" class="icon" onclick="navmenufunc()" title="Menü">
                    <i class="fas fa-bars"></i>
                </a>
            </nav>
        </div>
    `;
}

function loadHeader(currentPage = '') {
    const wrapElement = document.getElementById('wrap');
    if (wrapElement) {
        const headerHTML = getHeaderTemplate();
        
        const existingHeader = document.getElementById('header');
        if (existingHeader) {
            existingHeader.outerHTML = headerHTML;
        } else {
            wrapElement.insertAdjacentHTML('afterbegin', headerHTML);
        }
        
        setActivePage(currentPage);
        
        initializeHeaderEvents();
    }
}

function setActivePage(currentPage) {
    const menuItems = document.querySelectorAll('.topnav li');
    menuItems.forEach(item => {
        item.classList.remove('current-menu-item', 'current_page_item');
    });
    
    let activeSelector = '';
    switch (currentPage) {
        case 'home':
        case 'index':
            activeSelector = '#menu-item-16';
            break;
        case 'anime-arsivi':
        case 'archive':
            activeSelector = '#menu-item-17';
            break;
        case 'feed':
            activeSelector = '#menu-item-28';
            break;
        case 'ekip-alim':
            activeSelector = '#menu-item-1138';
            break;    
        default:
            const path = window.location.pathname;
            if (path === '/' || path === '/index.html') {
                activeSelector = '#menu-item-16';
            } else if (path.includes('anime-arsivi')) {
                activeSelector = '#menu-item-17';
            } else if (path.includes('feed')) {
                activeSelector = '#menu-item-28';
            }
            break;
    }
    
    if (activeSelector) {
        const activeItem = document.querySelector(activeSelector);
        if (activeItem) {
            activeItem.classList.add('current-menu-item', 'current_page_item');
        }
    }
}

function initializeHeaderEvents() {
    if (typeof navmenufunc === 'undefined') {
        window.navmenufunc = function() {
            const nav = document.getElementById("myTopnav");
            if (nav) {
                if (nav.className === "topnav") {
                    nav.className += " responsive";
                } else {
                    nav.className = "topnav";
                }
            }
        };
    }

}

document.addEventListener('DOMContentLoaded', function() {
    const bodyElement = document.body;
    const pageAttribute = bodyElement.getAttribute('data-page');
    loadHeader(pageAttribute);
});

window.YepYeniWatch = window.YepYeniWatch || {};
window.YepYeniWatch.loadHeader = loadHeader;
window.YepYeniWatch.setActivePage = setActivePage;