/**
 * YepYeniWatch Anime Arşivi JavaScript
 * Tüm veriler backend API'den çekilir
 */
$(document).ready(function() {
    // Global variables
    let currentPage = 1;
    let totalPages = 1;
    let activeCategories = [];
    let totalAnimeCount = 0;
    const PAGE_SIZE = 25;
    
    // Initialize
    loadCategories();
    loadAnimes();
    
    // Resim URL'sini düzelt
    function fixImageUrl(url) {
        if (!url) return "https://wsrv.nl/?url=" + 'https://openani.me/setsuki/chibi/crying.png';
        return "https://wsrv.nl/?url=" + url.replace('image.tmdb.org', 'image.openanime.net');
    }
    
    // Load categories
    function loadCategories() {
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
        
        // Kategori tıklama olayları
        $('.categories-table td').click(function() {
            const category = $(this).text().trim();
            
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $(this).find('.category-marker').css('background-color', 'transparent');
                activeCategories = activeCategories.filter(cat => cat !== category);
            } else {
                $(this).addClass('active');
                $(this).find('.category-marker').css('background-color', '#8e8ec2');
                activeCategories.push(category);
            }
        });
    }
    
    // Load animes from API
    async function loadAnimes() {
        const container = $('#anime-container');
        container.html('<div class="loading">Animeler yükleniyor...</div>');
        
        // Prepare parameters
        const minScoreStart = $('#min-score-start').val();
        const minScoreEnd = $('#min-score-end').val();
        const releaseYearStart = $('#release-year-start').val();
        const releaseYearEnd = $('#release-year-end').val();
        
        // Build filter params
        let keywordsArray = [];
        if (activeCategories.length > 0) {
            keywordsArray = [...activeCategories];
        }
        const keywords = keywordsArray.join(',').toLowerCase();
        
        // Puan aralığı
        let score = '';
        if (minScoreStart && minScoreEnd) {
            score = `${minScoreStart},${minScoreEnd}`;
        } else if (minScoreStart) {
            score = `${minScoreStart},10`;
        } else if (minScoreEnd) {
            score = `0,${minScoreEnd}`;
        }
        
        // Tarih aralığı
        let date = '';
        if (releaseYearStart && releaseYearEnd) {
            date = `${releaseYearStart},${releaseYearEnd}`;
        } else if (releaseYearStart) {
            date = `${releaseYearStart},2100`;
        } else if (releaseYearEnd) {
            date = `1880,${releaseYearEnd}`;
        }
        
        try {
            const data = await YepYeniAPI.getArchiveData({
                page: currentPage,
                keywords: keywords,
                score: score,
                date: date
            });
            
            container.empty();
            
            if (data && data.animes && data.animes.length > 0) {
                const animes = data.animes;
                totalPages = data.totalPages || 1;
                
                // Total count
                if (typeof data.totalCount === 'number') {
                    totalAnimeCount = data.totalCount;
                    $("#anime-count").text(`(${totalAnimeCount} anime)`);
                } else if (totalPages <= 1) {
                    totalAnimeCount = animes.length;
                    $("#anime-count").text(`(${totalAnimeCount} anime)`);
                } else {
                    $("#anime-count").text(`(~${totalPages * PAGE_SIZE} anime)`);
                }
                
                // Render animes
                animes.forEach(anime => {
                    const imageUrl = fixImageUrl(anime.pictures?.avatar);
                    const imdbScore = anime.tmdbScore ? parseFloat(anime.tmdbScore).toFixed(1) : 'N/A';
                    const genres = anime.genres || [];
                    const genreTags = genres.slice(0, 5).map(genre => 
                        `<span class="anime-tag">${genre}</span>`
                    ).join('');
                    const description = anime.summary || "Bu animenin açıklaması bulunmamaktadır.";
                    const animeLink = `/anime/${anime.slug}`;
                    
                    container.append(`
                        <div class="anime-card">
                            <div class="anime-poster">
                                <a href="${animeLink}">
                                    <img src="${imageUrl}" alt="${anime.english}" loading="lazy">
                                </a>
                            </div>
                            <div class="anime-info">
                                <div class="imdb-score">IMDb: ${imdbScore}</div>
                                <h3 class="anime-title">
                                    <a href="${animeLink}">${anime.english}</a>
                                </h3>
                                <div class="anime-meta">
                                    <span class="seasons-info">${anime.numberOfSeasons ? `${anime.numberOfSeasons} Sezon ${anime.numberOfEpisodes} Bölüm` : "Film"}</span>
                                    <span class="release-year">${anime.firstAirDate ? anime.firstAirDate.split('.').pop() : 'N/A'}</span>
                                </div>
                                <div class="anime-description">${description}</div>
                                <div class="anime-tags">${genreTags}</div>
                            </div>
                        </div>
                    `);
                });
                
                updatePagination();
            } else {
                container.html('<div class="loading">Hiç anime bulunamadı.</div>');
                $("#anime-count").text("(0 anime)");
                $("#pagination-container").empty();
            }
        } catch (error) {
            console.error('Animeler yüklenemedi:', error);
            container.html('<div class="loading">Animeler yüklenirken bir hata oluştu.</div>');
            $("#anime-count").text("");
            $("#pagination-container").empty();
        }
    }
    
    // Update pagination
    function updatePagination() {
        const paginationContainer = $('#pagination-container');
        paginationContainer.empty();
        
        if (totalPages <= 1) return;
        
        // Previous button
        if (currentPage > 1) {
            paginationContainer.append(`<div class="page-link prev-page">«</div>`);
        }
        
        // Calculate range
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // First page
        if (startPage > 1) {
            paginationContainer.append(`<div class="page-link" data-page="1">1</div>`);
            if (startPage > 2) {
                paginationContainer.append(`<div class="page-link disabled">...</div>`);
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            paginationContainer.append(`<div class="page-link ${activeClass}" data-page="${i}">${i}</div>`);
        }
        
        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationContainer.append(`<div class="page-link disabled">...</div>`);
            }
            paginationContainer.append(`<div class="page-link" data-page="${totalPages}">${totalPages}</div>`);
        }
        
        // Next button
        if (currentPage < totalPages) {
            paginationContainer.append(`<div class="page-link next-page">»</div>`);
        }
        
        // Click events
        $('.page-link').not('.disabled').click(function() {
            if ($(this).hasClass('prev-page')) {
                currentPage--;
            } else if ($(this).hasClass('next-page')) {
                currentPage++;
            } else {
                currentPage = parseInt($(this).data('page'));
            }
            
            loadAnimes();
            $('html, body').animate({ scrollTop: 0 }, 300);
        });
    }
    
    // Event listeners
    $('#apply-filters').click(function() {
        currentPage = 1;
        loadAnimes();
        $('html, body').animate({ scrollTop: 0 }, 300);
    });
    
    $('#clear-filters').click(function() {
        $('#min-score-start').val('');
        $('#min-score-end').val('');
        $('#release-year-start').val('');
        $('#release-year-end').val('');
        
        $('.categories-table td').removeClass('active');
        $('.category-marker').css('background-color', 'transparent');
        activeCategories = [];
        
        currentPage = 1;
        loadAnimes();
        $('html, body').animate({ scrollTop: 0 }, 300);
    });
    
    // Enter key handling
    $('#search-keyword, #release-year-start, #release-year-end, #min-score-start, #min-score-end').keypress(function(e) {
        if (e.which === 13) {
            e.preventDefault();
            $('#apply-filters').click();
        }
    });
});
