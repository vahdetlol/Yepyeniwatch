
// Function to fetch anime data and match with local cache
async function fetchMultipleAnimeData() {
    try {
        // Load local anime data from cache
        let localAnimeData;
        try {
            const localResponse = await $.ajax({
                url: 'https://yepyeniwatch.xyz/yepyeniwatch/caches/guncel-anime-data.json',
                method: 'GET',
                dataType: 'json'
            });
            localAnimeData = localResponse.episodes || [];
        } catch (error) {
            console.error("Failed to load local anime data:", error);
            localAnimeData = [];
        }
        
        // Create a map for quick lookup of local anime data by slug
        const localAnimeMap = new Map();
        localAnimeData.forEach(anime => {
            if (anime.slug) {
                localAnimeMap.set(anime.slug, anime);
            }
        });
        const matchedEpisodes = [];
        for (let page = 1; page <= 5; page++) {
            
            try {
                const episodesResponse = await $.ajax({
                    url: `https://api.openani.me/anime/episodes/latest?page=${page}`,
                    method: 'GET',
                    dataType: 'json'
                });
                
                if (episodesResponse && episodesResponse.episodes) {
                    episodesResponse.episodes.forEach(episode => {
                        // Check if this episode's slug exists in our local cache
                        if (episode.slug && localAnimeMap.has(episode.slug)) {
                            const localAnime = localAnimeMap.get(episode.slug);
                            
                            // Create matched episode with data from both sources
                            matchedEpisodes.push({
                                slug: episode.slug,              // from API
                                season: episode.season,          // from API
                                episode: episode.episode,        // from API
                                english: localAnime.english,     // from local JSON
                                romaji: localAnime.romaji,       // from local JSON
                                pictures: localAnime.pictures,    // from local JSON
                                is4K: localAnime.is4K        // from local JSON
                            });
                        }
                    });
                } 
            } catch (error) {}
        }
        return {
            data: matchedEpisodes
        };
    } catch (error) {

        return { data: [] };
    }
}

$(document).ready(function () {
    const CACHE_TTL = 120 * 1000;
    
    // Function to initialize carousel if not already initialized
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
    
    // Function to initialize episode carousel with different responsive settings for wider episode cards
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
    
    $.getJSON("https://api.openani.me/anime/episodes/latest/populars?limit=20", function (data) {
        setTimeout(function() {
            // Clear placeholder
            $(".slider.popanims").empty();
            
            data["episodes"].forEach(function (episode) {
                const animename = episode.romaji || episode.english || "yok";
                const banner = episode.pictures && episode.pictures.banner 
                ? episode.pictures.banner.replace('image.tmdb.org', 'image.openanime.net')
                : 'https://openani.me/setsuki/chibi/crying.png';
            
                const episodeLink = `https://openani.me/anime/${episode.slug}/${episode.season}/${episode.episode}`;
                const seasonEpisode = `${episode.season}. Sezon ${episode.episode}. Bölüm`;
                const sliderItem = `
                    <div class="list-series">
                        <div class="episode-box">
                            <div class="poster">
                                <div class="img">
                                    <a href="${episodeLink}" target="_blank">
                                        <img width="244px" height="141px" class="lazy" src="${banner}" data-src="${banner}" alt="${animename}">
                                    </a>
                                </div>
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
                
                $(".slider.popanims").append(sliderItem);
            });
            
            // Destroy and reinitialize with episode carousel settings
            if ($(".slider.popanims").hasClass('owl-loaded')) {
                $(".slider.popanims").trigger('destroy.owl.carousel');
                $(".slider.popanims").removeClass('owl-loaded owl-drag');
            }
            initEpisodeCarousel(".slider.popanims");
        }, 500);
    });
    
    fetchMultipleAnimeData().then(function (data) {
        // Initialize carousel first
        initCarousel(".slider.guncelanim");
        
        data["data"].forEach(function (episode) {
            const animename = episode.romaji || episode.english || "yok";
            const episodeLink = `https://openani.me/anime/${episode.slug}/${episode.season}`;
            const fourKlogo = episode.is4K ? 'https://yepyeniwatch.xyz/yepyeniwatch/images/4klogo.png' : '';
            const sliderItem = `
                <div class="list-series">
                    <div class="episode-box">
                    <div class="poster">
                        <div class="img">
                        <a href="${episodeLink}" target="_blank">
                            <img src="${episode.pictures.avatar.replace('image.tmdb.org', 'image.openanime.net')}" width="170px" height="255px" title="${animename}">
                        </a>
                        </div>
                        <img src="${fourKlogo}" class="fourk-logo">
                    </div>
                    <div class="episode-title">
                        <div class="serie-name">
                        <a href="${episodeLink}" target="_blank">${animename}</a>
                        </div>
                        <div class="episode-name">
                        ${episode.season}. Sezon
                        </div>
                    </div>
                    </div>
                </div>
                `;

            $(".slider.guncelanim").trigger("add.owl.carousel", [$(sliderItem)]);
        });

        $(".slider.guncelanim").trigger("refresh.owl.carousel");

        // Initialize carousel for episodes
        setTimeout(function() {
            // Clear placeholder
            $(".slider.guncelepisodes").empty();
            
            data["data"].forEach(function (episode) {
                const animename = episode.romaji || episode.english || "yok";
                const fourKlogo = episode.is4K ? 'https://yepyeniwatch.xyz/yepyeniwatch/images/4klogo.png' : '';
                const banner = episode.pictures && episode.pictures.banner 
                ? episode.pictures.banner.replace('image.tmdb.org', 'image.openanime.net')
                : 'https://openani.me/setsuki/chibi/crying.png';
            
            const episodeLink = `https://openani.me/anime/${episode.slug}/${episode.season}/${episode.episode}`;
            const seasonEpisode = `${episode.season}. Sezon ${episode.episode}. Bölüm`;
            const sliderItem = `
                <div class="list-series">
                    <div class="episode-box">
                        <div class="poster">
                            <div class="img">
                                <a href="${episodeLink}" target="_blank">
                                    <img width="244px" height="141px" class="lazy" src="${banner}" data-src="${banner}" alt="${animename}">
                                </a>
                            </div>
                            <img src="${fourKlogo}" class="fourk-logo">
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
            
            $(".slider.guncelepisodes").append(sliderItem);
            });

            // Destroy and reinitialize with episode carousel settings
            if ($(".slider.guncelepisodes").hasClass('owl-loaded')) {
                $(".slider.guncelepisodes").trigger('destroy.owl.carousel');
                $(".slider.guncelepisodes").removeClass('owl-loaded owl-drag');
            }
            initEpisodeCarousel(".slider.guncelepisodes");
        }, 1400);
        

    }).catch(function () {
        console.error("API'den veri çekilemedi.");
    });
        


    $.getJSON("https://api.openani.me/anime/episodes/latest?limit=20", function (data) {
        setTimeout(function() {
            // Clear placeholder
            $(".slider.lastepisode").empty();
            
            data["episodes"].forEach(function (episode) {
                const animename = episode.romaji || episode.english || "yok";
                const episodeLink = `https://openani.me/anime/${episode.slug}/${episode.season}/${episode.episode}`;
                const seasonEpisode = `${episode.season}. Sezon ${episode.episode}. Bölüm`;
                const sliderItem = `
                    <div class="list-series">
                    <div class="episode-box">
                    <div class="poster">
                        <div class="img">
                        <a href="${episodeLink}" target="_blank">
                            <img width="244px" height="141px" class="lazy" src="${episode.pictures.banner.replace('image.tmdb.org', 'image.openanime.net')}" data-src="${episode.pictures.banner.replace('image.tmdb.org', 'image.openanime.net')}" alt="${animename}">
                        </a>
                        </div>
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

                $(".slider.lastepisode").append(sliderItem);
            });

            // Destroy and reinitialize with episode carousel settings
            if ($(".slider.lastepisode").hasClass('owl-loaded')) {
                $(".slider.lastepisode").trigger('destroy.owl.carousel');
                $(".slider.lastepisode").removeClass('owl-loaded owl-drag');
            }
            initEpisodeCarousel(".slider.lastepisode");
        }, 1600);
    }).fail(function () {
        console.error("API'den veri çekilemedi.");
    });

    $.getJSON("https://api.openani.me/anime", function (data) {
        var totalAnime = [];
        $.getJSON(`https://api.openani.me/anime?page=${data["totalPages"]}`, async function (data) {
            // Initialize carousel first
            initCarousel(".slider.lastanim");
            
            totalAnime = data["animes"].reverse();
            if (totalAnime.length < 20) {
                const response = await $.getJSON(`https://api.openani.me/anime?page=${data["totalPages"] - 1}`);
                totalAnime = totalAnime.concat(response["animes"].reverse());
            }
         
            totalAnime.forEach(function (episode) {
                const animename = episode.romaji || episode.english || "yok";
                const episodeLink = `https://openani.me/anime/${episode.slug}`;
                const tmdbScore = episode.tmdbScore.toFixed(1);
                const fourKlogo = episode.is4K ? 'https://yepyeniwatch.xyz/yepyeniwatch/images/4klogo.png' : '';
                const sliderItem = `
                <div class="list-series">
                    <div class="episode-box">
                    <div class="episode-date">
                        IMDb: ${tmdbScore || "N/A"}
                    </div>
                    <div class="poster">
                        <div class="img">
                        <a href="${episodeLink}" target="_blank">
                            <img src="${episode.pictures.avatar.replace('image.tmdb.org', 'image.openanime.net')}" width="170px" height="255px" title="${animename}">
                        </a>
                        </div>
                        <img src="${fourKlogo}" class="fourk-logo">                    
                    </div>
                    <div class="episode-title">
                        <div class="serie-name">
                        <a href="${episodeLink}" target="_blank">${animename}</a>
                        </div>
                        <div class="episode-name">
                        ${episode.numberOfSeasons ? `${episode.numberOfSeasons} Sezon` : "Film"}
                        </div>
                    </div>
                    </div>
                </div>
                `;

                $(".slider.lastanim").trigger("add.owl.carousel", [$(sliderItem)]);
            });

            $(".slider.lastanim").trigger("refresh.owl.carousel");
        });

    }).fail(function () {
        console.error("API'den veri çekilemedi.");
    });

    $.getJSON("https://api.openani.me/anime/populars", function (data) {
        // Initialize carousel first
        initCarousel(".slider.popanim");
        
        data.forEach(function (episode) {
            const animename = episode.romaji || episode.english || "yok";
            const episodeLink = `https://openani.me/anime/${episode.slug}`;
            const tmdbScore = episode.tmdbScore.toFixed(1);
            const fourKlogo = episode.is4K ? 'https://yepyeniwatch.xyz/yepyeniwatch/images/4klogo.png' : '';
            const sliderItem = `
                <div class="list-series">
                    <div class="episode-box">
                    <div class="episode-date">
                    <span>IMDb: ${tmdbScore || "N/A"}</span>
                    </div>
                    <div class="poster">
                        <div class="img">
                        <a href="${episodeLink}" target="_blank">
                            <img src="${episode.pictures.avatar.replace('image.tmdb.org', 'image.openanime.net')}" width="170px" height="255px" title="${animename}">
                        </a>
                        </div>
                        <img src="${fourKlogo}" class="fourk-logo">                    
                    </div>
                    <div class="episode-title">
                        <div class="serie-name">
                        <a href="${episodeLink}" target="_blank">${animename}</a>
                        </div>
                        <div class="episode-name">
                        ${episode.numberOfSeasons ? `${episode.numberOfSeasons} Sezon` : "Film"}
                        </div>
                    </div>
                    </div>
                </div>
                `;

            $(".slider.popanim").trigger("add.owl.carousel", [$(sliderItem)]);
        });

        $(".slider.popanim").trigger("refresh.owl.carousel");

    }).fail(function () {
        console.error("API'den veri çekilemedi.");
    });

        $.getJSON("https://api.openani.me/anime/4k-releases", function (data) {
        // Initialize carousel first
        initCarousel(".slider.4kanim");
        
        data["animes"].forEach(function (episode) {
            const animename = episode.romaji || episode.english || "yok";
            const episodeLink = `https://openani.me/anime/${episode.slug}`;
            const tmdbScore = episode.tmdbScore.toFixed(1);
            const fourKlogo = episode.is4K ? 'https://yepyeniwatch.xyz/yepyeniwatch/images/4klogo.png' : '';
            const sliderItem = `
                <div class="list-series">
                    <div class="episode-box">
                    <div class="episode-date">
                    <span>IMDb: ${tmdbScore || "N/A"}</span>
                    </div>
                    <div class="poster">
                        <div class="img">
                        <a href="${episodeLink}" target="_blank">
                            <img src="${episode.pictures.avatar.replace('image.tmdb.org', 'image.openanime.net')}" width="170px" height="255px" title="${animename}">
                        </a>
                        </div>
                        <img src="${fourKlogo}" class="fourk-logo">                    
                    </div>
                    <div class="episode-title">
                        <div class="serie-name">
                        <a href="${episodeLink}" target="_blank">${animename}</a>
                        </div>
                        <div class="episode-name">
                        ${episode.numberOfSeasons ? `${episode.numberOfSeasons} Sezon` : "Film"}
                        </div>
                    </div>
                    </div>
                </div>
                `;

            $(".slider.4kanim").trigger("add.owl.carousel", [$(sliderItem)]);
        });

        $(".slider.4kanim").trigger("refresh.owl.carousel");

    }).fail(function () {
        console.error("API'den veri çekilemedi.");
    });
});