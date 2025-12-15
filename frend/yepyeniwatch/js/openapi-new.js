/**
 * YepYeniWatch Ana Sayfa JavaScript
 * Tüm veriler backend API'den çekilir
 */

$(document).ready(function () {
    // Carousel başlatma fonksiyonu
    function initCarousel(selector) {
        if ($(selector).length > 0 && !$(selector).hasClass('owl-loaded')) {
            $(selector).owlCarousel({
                autoplay: true,
                autoplaySpeed: 700,
                autoplayTimeout: 10000,
                autoplayHoverPause: false,
                margin: 0,
                nav: true,
                dots: false,
                loop: false,
                rewind: true,
                responsive: {
                    0: { items: 2 },
                    450: { items: 3 },
                    600: { items: 5 },
                    1000: { items: 6 },
                    1440: { items: 7 },
                },
                navText: [
                    "<i class='fas fa-angle-left'></i>",
                    "<i class='fas fa-angle-right'></i>",
                ],
            });
            return true;
        }
        return false;
    }
    
    // Episode carousel (daha geniş kartlar için)
    function initEpisodeCarousel(selector) {
        if ($(selector).length > 0 && !$(selector).hasClass('owl-loaded')) {
            $(selector).owlCarousel({
                autoplay: true,
                autoplaySpeed: 700,
                autoplayTimeout: 10000,
                autoplayHoverPause: false,
                margin: 15,
                nav: true,
                dots: false,
                loop: false,
                rewind: true,
                responsive: {
                    0: { items: 1, margin: 10 },
                    450: { items: 2, margin: 12 },
                    750: { items: 3, margin: 15 },
                    1250: { items: 4, margin: 15 },
                    1700: { items: 5, margin: 15 },
                },
                navText: [
                    "<i class='fas fa-angle-left'></i>",
                    "<i class='fas fa-angle-right'></i>",
                ],
            });
            return true;
        }
        return false;
    }
    
    // Resim URL'sini düzelt
    function fixImageUrl(url) {
        if (!url) return 'https://openani.me/setsuki/chibi/crying.png';
        return url.replace('image.tmdb.org', 'image.openanime.net');
    }
    
    // Anime kartı oluştur
    function createAnimeCard(anime, showScore = false) {
        const animename = anime.romaji || anime.english || "yok";
        const episodeLink = `/anime/${anime.slug}`;
        const avatar = fixImageUrl(anime.pictures?.avatar);
        const fourKlogo = anime.is4K ? 'https://yepyeniwatch.xyz/yepyeniwatch/images/4klogo.png' : '';
        const tmdbScore = anime.tmdbScore ? anime.tmdbScore.toFixed(1) : null;
        const seasonText = anime.numberOfSeasons ? `${anime.numberOfSeasons} Sezon` : "Film";
        
        return `
            <div class="list-series">
                <div class="episode-box">
                    ${showScore && tmdbScore ? `<div class="episode-date"><span>IMDb: ${tmdbScore}</span></div>` : ''}
                    <div class="poster">
                        <div class="img">
                            <a href="${episodeLink}">
                                <img src="${avatar}" width="170px" height="255px" title="${animename}">
                            </a>
                        </div>
                        ${fourKlogo ? `<img src="${fourKlogo}" class="fourk-logo">` : ''}
                    </div>
                    <div class="episode-title">
                        <div class="serie-name">
                            <a href="${episodeLink}">${animename}</a>
                        </div>
                        <div class="episode-name">${seasonText}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Episode kartı oluştur
    function createEpisodeCard(episode, showFourK = false) {
        const animename = episode.romaji || episode.english || "yok";
        const banner = fixImageUrl(episode.pictures?.banner);
        const episodeLink = `/anime/${episode.slug}/${episode.season}/${episode.episode}`;
        const seasonEpisode = `${episode.season}. Sezon ${episode.episode}. Bölüm`;
        const fourKlogo = (showFourK && episode.is4K) ? 'https://yepyeniwatch.xyz/yepyeniwatch/images/4klogo.png' : '';
        
        return `
            <div class="list-series">
                <div class="episode-box">
                    <div class="poster">
                        <div class="img">
                            <a href="${episodeLink}">
                                <img width="244px" height="141px" class="lazy" src="${banner}" data-src="${banner}" alt="${animename}">
                            </a>
                        </div>
                        ${fourKlogo ? `<img src="${fourKlogo}" class="fourk-logo">` : ''}
                    </div>
                    <div class="episode-title">
                        <div class="serie-name" lang="en">
                            <a href="${episodeLink}" title="${animename}">${animename}</a>
                        </div>
                        <div class="episode-name">
                            <a href="${episodeLink}" title="${seasonEpisode}">${seasonEpisode}</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Güncel anime kartı oluştur (sezon bazlı link)
    function createGuncelAnimeCard(episode) {
        const animename = episode.romaji || episode.english || "yok";
        const episodeLink = `/anime/${episode.slug}`;
        const avatar = fixImageUrl(episode.pictures?.avatar);
        const fourKlogo = episode.is4K ? 'https://yepyeniwatch.xyz/yepyeniwatch/images/4klogo.png' : '';
        
        return `
            <div class="list-series">
                <div class="episode-box">
                    <div class="poster">
                        <div class="img">
                            <a href="${episodeLink}">
                                <img src="${avatar}" width="170px" height="255px" title="${animename}">
                            </a>
                        </div>
                        ${fourKlogo ? `<img src="${fourKlogo}" class="fourk-logo">` : ''}
                    </div>
                    <div class="episode-title">
                        <div class="serie-name">
                            <a href="${episodeLink}">${animename}</a>
                        </div>
                        <div class="episode-name">${episode.season}. Sezon</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Ana sayfa verilerini yükle
    async function loadHomeData() {
        try {
            const data = await YepYeniAPI.getHomeData();
            
            // Popüler Animeler
            initCarousel(".slider.popanim");
            (data.populars || []).forEach(function(anime) {
                const card = createAnimeCard(anime, true);
                $(".slider.popanim").trigger("add.owl.carousel", [$(card)]);
            });
            $(".slider.popanim").trigger("refresh.owl.carousel");
            
            // 4K Animeler
            initCarousel(".slider.4kanim");
            (data.fourK || []).forEach(function(anime) {
                const card = createAnimeCard(anime, true);
                $(".slider.4kanim").trigger("add.owl.carousel", [$(card)]);
            });
            $(".slider.4kanim").trigger("refresh.owl.carousel");
            
            // Popüler Animelerden Son Bölümler
            setTimeout(function() {
                $(".slider.popanims").empty();
                (data.popularEpisodes || []).forEach(function(episode) {
                    const card = createEpisodeCard(episode);
                    $(".slider.popanims").append(card);
                });
                if ($(".slider.popanims").hasClass('owl-loaded')) {
                    $(".slider.popanims").trigger('destroy.owl.carousel');
                    $(".slider.popanims").removeClass('owl-loaded owl-drag');
                }
                initEpisodeCarousel(".slider.popanims");
            }, 500);
            
            // Güncel Animeler
            initCarousel(".slider.guncelanim");
            (data.guncelAnimes || []).forEach(function(episode) {
                const card = createGuncelAnimeCard(episode);
                $(".slider.guncelanim").trigger("add.owl.carousel", [$(card)]);
            });
            $(".slider.guncelanim").trigger("refresh.owl.carousel");
            
            // Güncel Animelerden Son Bölümler
            setTimeout(function() {
                $(".slider.guncelepisodes").empty();
                (data.guncelAnimes || []).forEach(function(episode) {
                    const card = createEpisodeCard(episode, true);
                    $(".slider.guncelepisodes").append(card);
                });
                if ($(".slider.guncelepisodes").hasClass('owl-loaded')) {
                    $(".slider.guncelepisodes").trigger('destroy.owl.carousel');
                    $(".slider.guncelepisodes").removeClass('owl-loaded owl-drag');
                }
                initEpisodeCarousel(".slider.guncelepisodes");
            }, 1400);
            
            // Son Eklenen Animeler
            initCarousel(".slider.lastanim");
            (data.lastAnimes || []).forEach(function(anime) {
                const card = createAnimeCard(anime, true);
                $(".slider.lastanim").trigger("add.owl.carousel", [$(card)]);
            });
            $(".slider.lastanim").trigger("refresh.owl.carousel");
            
            // Son Eklenen Anime Bölümleri
            setTimeout(function() {
                $(".slider.lastepisode").empty();
                (data.latestEpisodes || []).forEach(function(episode) {
                    const card = createEpisodeCard(episode);
                    $(".slider.lastepisode").append(card);
                });
                if ($(".slider.lastepisode").hasClass('owl-loaded')) {
                    $(".slider.lastepisode").trigger('destroy.owl.carousel');
                    $(".slider.lastepisode").removeClass('owl-loaded owl-drag');
                }
                initEpisodeCarousel(".slider.lastepisode");
            }, 1600);
            
        } catch (error) {
            console.error("Ana sayfa verileri yüklenemedi:", error);
        }
    }
    
    // Sayfa yüklendiğinde verileri çek
    loadHomeData();
});
