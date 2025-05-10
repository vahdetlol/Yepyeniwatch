/**
 * Anime Archive JavaScript
 * Handles the functionality for the anime archive page
 */
$(document).ready(function() {
    // Global variables
    let currentPage = 1;
    let totalPages = 1;
    let activeCategories = [];
    let totalAnimeCount = 0;
    let categories = [];
    
    // Initialize
    loadCategories();
    loadAnimes();
    
    // Load categories from API
    function loadCategories() {
        // Fotoğrafta gösterilen sabit kategori listesi
        const categoriesList = [
            "Aksiyon", "Isekai",
            "Ecchi", "Harem", 
            "Bilim Kurgu", "Okul",
            "Dram", "Fantastik",
            "Oyun", "Gerilim",
            "Gizem", "Komedi",
            "Seinen", "Macera",
            "Polisiye", "Romantizm",
            "Shounen", "Spor",
            "Tarihi", "Yuri"
        ];
        
        const categoriesContainer = $('#categories-list');
        categoriesContainer.empty();
        
        // Kategorileri tabloya ekle
        let tableHTML = '<table class="categories-table">';
        
        for (let i = 0; i < categoriesList.length; i += 2) {
            tableHTML += '<tr>';
            tableHTML += `<td><span class="category-marker">${categoriesList[i]}</span></td>`;
            
            if (i + 1 < categoriesList.length) {
                tableHTML += `<td><span class="category-marker">${categoriesList[i+1]}</span></td>`;
            } else {
                tableHTML += '<td></td>';
            }
            
            tableHTML += '</tr>';
        }
        
        tableHTML += '</table>';
        categoriesContainer.html(tableHTML);
        
        // Kategori tıklama olaylarını ayarla
        $('.categories-table td').click(function() {
            const category = $(this).text().trim();
            
            if ($(this).hasClass('active')) {
                // Kategoriyi kaldır
                $(this).removeClass('active');
                $(this).find('.category-marker').css('background-color', 'transparent');
                activeCategories = activeCategories.filter(cat => cat !== category);
            } else {
                // Kategoriyi ekle
                $(this).addClass('active');
                $(this).find('.category-marker').css('background-color', '#8e8ec2');
                activeCategories.push(category);
            }
        });
    }
    
    // Load animes from API
    function loadAnimes() {
        const container = $('#anime-container');
        container.html('<div class="loading">Animeler yükleniyor...</div>');
        
        // Prepare parameters
        const keyword = $('#search-keyword').val();
        const minScoreStart = $('#min-score-start').val();
        const minScoreEnd = $('#min-score-end').val();
        const releaseYearStart = $('#release-year-start').val();
        const releaseYearEnd = $('#release-year-end').val();
        
        // Build URL
        let apiUrl = `https://api.openani.me/anime?page=${currentPage}`;
        
        // Kategorileri ve anahtar kelimeleri birleştir
        let keywordsArray = [];
        
        // Seçilen kategorileri ekle
        if (activeCategories.length > 0) {
            keywordsArray = [...activeCategories];
        }
        
        // Keywords parametresini oluştur
        apiUrl += `&keywords=${encodeURIComponent(keywordsArray.join(',').toLowerCase())}`;
        
        // Puan aralığı için API formatına uygun parametre oluştur
        if (minScoreStart && minScoreEnd) {
            apiUrl += `&score=${minScoreStart},${minScoreEnd}`;
        } else if (minScoreStart) {
            apiUrl += `&score=${minScoreStart}`;
        } else if (minScoreEnd) {
            apiUrl += `&score=0,${minScoreEnd}`;
        } else {
            // Puan alanları boş olsa bile parametre eklenir
            apiUrl += `&score=`;
        }
        
        // Tarih aralığı için API formatına uygun parametre oluştur
        if (releaseYearStart && releaseYearEnd) {
            apiUrl += `&date=${releaseYearStart},${releaseYearEnd}`;
        } else if (releaseYearStart) {
            apiUrl += `&date=${releaseYearStart}`;
        } else if (releaseYearEnd) {
            apiUrl += `&date=1880,${releaseYearEnd}`;
        } else {
            // Tarih alanları boş olsa bile parametre eklenir
            apiUrl += `&date=`;
        }
        
        // Fetch data
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(response) {
                container.empty();
                
                if (response && response.animes && response.animes.length > 0) {
                    const animes = response.animes;
                    totalPages = response.totalPages;
                    totalAnimeCount = response.totalCount || animes.length;
                    
                    // Update total anime count
                    $("#anime-count").text(`(${totalAnimeCount} anime)`);
                    
                    // Render animes
                    animes.forEach(anime => {
                        // Process image URL
                        const imageUrl = anime.pictures && anime.pictures.avatar 
                            ? anime.pictures.avatar.replace('image.tmdb.org', 'image.openanime.net')
                            : 'wp-content/themes/yepyeniwatch/images/lazy.png';
                        
                        // Format IMDB score
                        const imdbScore = anime.tmdbScore ? parseFloat(anime.tmdbScore).toFixed(1) : 'N/A';
                        
                        // Get genres
                        const genres = anime.genres || [];
                        const genreTags = genres.slice(0, 5).map(genre => 
                            genreurl = genre.toLowerCase().replace(/ /g, '-')
                            `<span class="anime-tag" href="https://openani.me/explore?page=1&keywords=${genreurl},&score=&date=">${genre}</span>`
                        ).join('');
                        
                        // Format description
                        const description = anime.summary || "Bu animenin açıklaması bulunmamaktadır.";
                        
                        // Create anime card
                        container.append(`
                            <div class="anime-card">
                                <div class="anime-poster">
                                    <a href="https://openani.me/anime/${anime.slug}" target="_blank">
                                        <img src="${imageUrl}" alt="${anime.english}" loading="lazy">
                                    </a>
                                </div>
                                <div class="anime-info">
                                    <div class="imdb-score">IMDb: ${imdbScore}</div>
                                    <h3 class="anime-title">
                                        <a href="https://openani.me/anime/${anime.slug}" target="_blank">${anime.english}</a>
                                    </h3>
                                    <div class="anime-meta">
                                        <span class="seasons-info">${anime.numberOfSeasons || 0} Sezon ${anime.numberOfEpisodes || 0} Bölüm</span>
                                        <span class="release-year">${anime.firstAirDate ? anime.firstAirDate.split('.').pop() : 'N/A'}</span>
                                    </div>
                                    <div class="anime-description">${description}</div>
                                    <div class="anime-tags">${genreTags}</div>
                                </div>
                            </div>
                        `);
                    });
                    
                    // Update pagination
                    updatePagination();
                } else {
                    container.html('<div class="loading">Hiç anime bulunamadı.</div>');
                    $("#anime-count").text("(0 anime)");
                    $("#pagination-container").empty();
                }
            },
            error: function() {
                container.html('<div class="loading">Animeler yüklenirken bir hata oluştu.</div>');
                $("#anime-count").text("");
                $("#pagination-container").empty();
            }
        });
    }
    
    // Update pagination
    function updatePagination() {
        const paginationContainer = $('#pagination-container');
        paginationContainer.empty();
        
        // Don't show pagination if there's only one page
        if (totalPages <= 1) {
            return;
        }
        
        // Previous button
        if (currentPage > 1) {
            paginationContainer.append(`
                <div class="page-link prev-page">«</div>
            `);
        }
        
        // Calculate range of visible pages
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Adjust start if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // First page and ellipsis
        if (startPage > 1) {
            paginationContainer.append(`<div class="page-link" data-page="1">1</div>`);
            if (startPage > 2) {
                paginationContainer.append(`<div class="page-link disabled">...</div>`);
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            paginationContainer.append(`
                <div class="page-link ${activeClass}" data-page="${i}">${i}</div>
            `);
        }
        
        // Last page and ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationContainer.append(`<div class="page-link disabled">...</div>`);
            }
            paginationContainer.append(`<div class="page-link" data-page="${totalPages}">${totalPages}</div>`);
        }
        
        // Next button
        if (currentPage < totalPages) {
            paginationContainer.append(`
                <div class="page-link next-page">»</div>
            `);
        }
        
        // Page click event
        $('.page-link').not('.disabled').click(function() {
            if ($(this).hasClass('prev-page')) {
                currentPage--;
            } else if ($(this).hasClass('next-page')) {
                currentPage++;
            } else {
                currentPage = parseInt($(this).data('page'));
            }
            
            loadAnimes();
            // Scroll to top
            $('html, body').animate({ scrollTop: $('#content').offset().top }, 300);
        });
    }
    
    // Event listeners
    $('#apply-filters').click(function() {
        currentPage = 1;
        loadAnimes();
    });
    
    $('#clear-filters').click(function() {
        $('#min-score-start').val('');
        $('#min-score-end').val('');
        $('#release-year-start').val('');
        $('#release-year-end').val('');
        
        // Tüm kategorilerin seçimini kaldır
        $('.categories-table td').removeClass('active');
        $('.category-marker').css('background-color', 'transparent');
        activeCategories = [];
        
        currentPage = 1;
        loadAnimes();
    });
    
    // Add Enter key handling for search
    $('#search-keyword, #release-year-start, #release-year-end, #min-score-start, #min-score-end').keypress(function(e) {
        if (e.which === 13) {
            e.preventDefault();
            $('#apply-filters').click();
        }
    });
});