        $(document).ready(function() {
            let currentPage = 1;
            let totalPages = 61; // API'den total page sayısını alabilirsiniz
            let isLoading = false;

            // Episode verilerini çeken fonksiyon
            function loadEpisodes(page = 1) {
                if (isLoading) return;
                
                isLoading = true;
                
                // Loading göstergesi ekle
                $(".episodes.episode.lastepisode").html('<div style="text-align: center; padding: 50px;"><i class="fas fa-spinner fa-spin fa-2x"></i><br>Yükleniyor...</div>');
                
                $.getJSON(`https://api.openani.me/anime/episodes/latest?limit=20&page=${page}`, function (data) {
                    // Mevcut içeriği temizle
                    $(".episodes.episode.lastepisode").empty();
                    
                    // Yeni episode'ları ekle
                    data["episodes"].forEach(function (episode) {
                        const episodeLink = `https://openani.me/anime/${episode.slug}/${episode.season}/${episode.episode}`;
                        const seasonEpisode = `${episode.season}. Sezon ${episode.episode}. Bölüm`;
                        const episodeHtml = `
                            <div class="list-episodes">
                            <div class="episode-box">
                            <div class="poster">
                                <div class="img">
                                <a href="${episodeLink}" target="_blank">
                                    <img width="250px" height="141px" class="lazy" src="${episode.pictures.banner.replace('image.tmdb.org', 'image.openanime.net')}" data-src="${episode.pictures.banner.replace('image.tmdb.org', 'image.openanime.net')}" alt="${episode.english}">
                                </a>
                                </div>
                            </div>
                            <div class="episode-title">
                                <div class="serie-name" lang="en">
                                <a href="${episodeLink}" title="${episode.english}">${episode.english}</a>
                                </div>
                                <div class="episode-name">
                                <a href="${episodeLink}" title="${seasonEpisode}">${seasonEpisode}</a>
                                </div>
                            </div>
                            </div>
                            </div>
                        `;

                        $(".episodes.episode.lastepisode").append(episodeHtml);
                    });
                    
                    currentPage = page;
                    updatePagination();
                    isLoading = false;
                    
                    // Sayfanın üstüne scroll et
                    $('html, body').animate({
                        scrollTop: $(".episodes.episode.lastepisode").offset().top - 100
                    }, 500);
                    
                }).fail(function () {
                    console.error("API'den veri çekilemedi.");
                    $(".episodes.episode.lastepisode").html('<div style="text-align: center; padding: 50px; color: #fff;">Veriler yüklenirken bir hata oluştu.</div>');
                    isLoading = false;
                });
            }

            // Pagination butonlarını oluşturan fonksiyon
            function updatePagination() {
                let paginationHtml = '';
                
                // Önceki sayfa butonu
                if (currentPage > 1) {
                    paginationHtml += `<a href="#" data-page="${currentPage - 1}">&laquo; Önceki</a>`;
                } else {
                    paginationHtml += `<span class="disabled">&laquo; Önceki</span>`;
                }
                
                // Sayfa numaraları
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, currentPage + 2);
                
                if (startPage > 1) {
                    paginationHtml += `<a href="#" data-page="1">1</a>`;
                    if (startPage > 2) {
                        paginationHtml += `<span>...</span>`;
                    }
                }
                
                for (let i = startPage; i <= endPage; i++) {
                    if (i === currentPage) {
                        paginationHtml += `<span class="current">${i}</span>`;
                    } else {
                        paginationHtml += `<a href="#" data-page="${i}">${i}</a>`;
                    }
                }
                
                if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                        paginationHtml += `<span>...</span>`;
                    }
                    paginationHtml += `<a href="#" data-page="${totalPages}">${totalPages}</a>`;
                }
                
                // Sonraki sayfa butonu
                if (currentPage < totalPages) {
                    paginationHtml += `<a href="#" data-page="${currentPage + 1}">Sonraki &raquo;</a>`;
                } else {
                    paginationHtml += `<span class="disabled">Sonraki &raquo;</span>`;
                }
                
                $('#pagination').html(paginationHtml);
            }

            // Pagination buton click eventi
            $(document).on('click', '#pagination a', function(e) {
                e.preventDefault();
                const page = parseInt($(this).data('page'));
                if (page && page !== currentPage && !isLoading) {
                    loadEpisodes(page);
                }
            });

            // İlk sayfa yükle
            loadEpisodes(1);
        });