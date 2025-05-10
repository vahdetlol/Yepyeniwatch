$(document).ready(function () {
    const CACHE_TTL = 120 * 1000;
    const guncelpopAnime = [
        "one-piece",
        "kijin-gentoushou",
        "kusuriya-no-hitorigoto",
        "witch-watch",
        "aharen-san-wa-hakarenai",
        "tu-bian-yingxiong-baba",
        "tu-bian-yingxiong-x",
        "isshun-de-chiryou-shiteita-noni-yakutatazu-to-tsuihou-sareta-tensai-chiyushi-yami-healer-toshite-tanoshiku-ikiru",
        "saikyou-no-ousama-nidome-no-jinsei-wa-nani-wo-suru",
        "slime-taoshite-300-nen-shiranai-uchi-ni-level-max-ni-nattemashita",
        "wind-breaker",
    ];
    
    const animejson = `https://api.yepyeniwatch.xyz/latest-anime`;
    
    $.getJSON(animejson, function (data) {
        data["data"].forEach(function (episode) {
        if (guncelpopAnime.includes(episode.slug)) {
            
            const banner = episode.pictures && episode.pictures.banner 
            ? episode.pictures.banner.replace('image.tmdb.org', 'image.openanime.net')
            : 'https://openani.me/setsuki/chibi/crying.png';
        
            const episodeLink = `https://openani.me/anime/${episode.slug}/${episode.season}/${episode.episode}`;
            const seasonEpisode = `${episode.season}. Sezon ${episode.episode}. Bölüm`;
            const episodeHtml = `
                <div class="list-episodes">
                    <div class="episode-box">
                        <div class="poster">
                            <div class="img">
                                <a href="${episodeLink}" target="_blank">
                                    <img width="250px" height="141px" class="lazy" src="${banner}" data-src="${banner}" alt="${episode.english}">
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
            
            $(".episodes.episode.popanims").append(episodeHtml);
    }});
            
    
        });
    

    $.getJSON("https://api.yepyeniwatch.xyz/latest-anime", function (data) {
        data["data"].forEach(function (episode) {
            const episodeLink = `https://openani.me/anime/${episode.slug}/${episode.season}`;

            const sliderItem = `
                <div class="list-series">
                    <div class="episode-box">
                    <div class="poster">
                        <div class="img">
                        <a href="${episodeLink}" target="_blank">
                            <img src="${episode.pictures.avatar.replace('image.tmdb.org', 'image.openanime.net')}" width="170px" height="255px" title="${episode.english}">
                        </a>
                        </div>
                    </div>
                    <div class="episode-title">
                        <div class="serie-name">
                        <a href="${episodeLink}" target="_blank">${episode.english}</a>
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

    }).fail(function () {
        console.error("API'den veri çekilemedi.");
    });



    $.getJSON("https://api.yepyeniwatch.xyz/latest-anime", function (data) {
        data["data"].forEach(function (episode) {
            
            const banner = episode.pictures && episode.pictures.banner 
            ? episode.pictures.banner.replace('image.tmdb.org', 'image.openanime.net')
            : 'https://openani.me/setsuki/chibi/crying.png';
        
        const episodeLink = `https://openani.me/anime/${episode.slug}/${episode.season}/${episode.episode}`;
        const seasonEpisode = `${episode.season}. Sezon ${episode.episode}. Bölüm`;
        const episodeHtml = `
            <div class="list-episodes">
                <div class="episode-box">
                    <div class="poster">
                        <div class="img">
                            <a href="${episodeLink}" target="_blank">
                                <img width="250px" height="141px" class="lazy" src="${banner}" data-src="${banner}" alt="${episode.english}">
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
        
        $(".episodes.episode.guncelepisodes").append(episodeHtml);
        });
        

    });
        


    $.getJSON("https://api.openani.me/anime/episodes/latest?limit=20", function (data) {
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
    }).fail(function () {
        console.error("API'den veri çekilemedi.");
    });

    $.getJSON("https://api.openani.me/anime", function (data) {
        var totalAnime = [];
        $.getJSON(`https://api.openani.me/anime?page=${data["totalPages"]}`, async function (data) {
            totalAnime = data["animes"].reverse();
            if (totalAnime.length < 20) {
                const response = await $.getJSON(`https://api.openani.me/anime?page=${data["totalPages"] - 1}`);
                totalAnime = totalAnime.concat(response["animes"].reverse());
            }
         
            totalAnime.forEach(function (episode) {
                const episodeLink = `https://openani.me/anime/${episode.slug}`;
                const tmdbScore = episode.tmdbScore.toFixed(1);
                const sliderItem = `
                <div class="list-series">
                    <div class="episode-box">
                    <div class="episode-date">
                        IMDb: ${tmdbScore || "N/A"}
                    </div>
                    <div class="poster">
                        <div class="img">
                        <a href="${episodeLink}" target="_blank">
                            <img src="${episode.pictures.avatar.replace('image.tmdb.org', 'image.openanime.net')}" width="170px" height="255px" title="${episode.english}">
                        </a>
                        </div>
                    </div>
                    <div class="episode-title">
                        <div class="serie-name">
                        <a href="${episodeLink}" target="_blank">${episode.english}</a>
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
        data.forEach(function (episode) {
            const episodeLink = `https://openani.me/anime/${episode.slug}`;
            const tmdbScore = episode.tmdbScore.toFixed(1);
            const sliderItem = `
                <div class="list-series">
                    <div class="episode-box">
                    <div class="episode-date">
                        IMDb: ${episode.tmdbScore || "N/A"}
                    </div>
                    <div class="poster">
                        <div class="img">
                        <a href="${episodeLink}" target="_blank">
                            <img src="${episode.pictures.avatar.replace('image.tmdb.org', 'image.openanime.net')}" width="170px" height="255px" title="${episode.english}">
                        </a>
                        </div>
                    </div>
                    <div class="episode-title">
                        <div class="serie-name">
                        <a href="${episodeLink}" target="_blank">${episode.english}</a>
                        </div>
                        <div class="episode-name">
                        ${episode.numberOfSeasons} Sezon
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

    const responseData = { success: true, data: matchedAnime };
    cache = { data: responseData, timestamp: now };
    res.json(responseData);
});