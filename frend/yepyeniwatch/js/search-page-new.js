
(function () {
    var $ = window.jQuery;
    if (!$) return;

    // Query param al
    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    function setInputValue(val) {
        try {
            var input = document.getElementById('searchInput');
            if (input) input.value = val || '';
        } catch (e) {}
    }

    // Arama sayfasına yönlendir
    function goSearch(query) {
        if (!query || !query.trim()) return;
        var url = '/search?q=' + encodeURIComponent(query.trim());
        window.location.href = url;
    }

    // Form submit
    $(document).on('submit', 'form.example', function (e) {
        e.preventDefault();
        var q = ($('#searchInput').val() || '').trim();
        goSearch(q);
    });

    // Enter key
    $(document).on('keydown', '#searchInput', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            var q = ($(this).val() || '').trim();
            goSearch(q);
        }
    });

    // Resim URL'sini düzelt
    function fixImageUrl(url) {
        if (!url) return "https://wsrv.nl/?url=" + 'https://openani.me/setsuki/chibi/crying.png';
        return "https://wsrv.nl/?url=" + url.replace('image.tmdb.org', 'image.openanime.net');
    }

    // Kart oluştur
    function renderCard(anime) {
        var slug = anime.slug || anime.id || '#';
        var english = anime.english || anime.title || 'İsimsiz';
        var romaji = anime.romaji || '';
        var summary = anime.summary || "";
        var avatar = fixImageUrl(anime.pictures?.avatar);
        var genres = anime.genres || [];
        var typeRaw = (anime.type || '').toString().toLowerCase();
        var seasonText = typeRaw === 'movie' ? 'Film' : (typeRaw === 'tv' ? 'Anime' : (anime.type || '').toString());
        var fourk = anime.is4K ? 'https://yepyeniwatch.xyz/yepyeniwatch/images/4klogo.png' : '';
        var animeLink = '/anime/' + slug;

        return (
            '<div class="anime-card">' +
            '  <div class="anime-poster">' +
            '    <a href="' + animeLink + '">' +
            (avatar ? '      <img src="' + avatar + '" alt="' + english + '" loading="lazy">' : '') +
            '    </a>' +
            '  </div>' +
            '  <div class="anime-info" style="margin-top: -10px;">' +
            '    <div class="imdb-score">' + seasonText + '</div>' +
            '    <h3 class="anime-title">' +
            '      <a href="' + animeLink + '">' + english + '</a>' + 
            (fourk ? '<img class="search-card-4k" src="' + fourk + '" style="height: 35px;">' : '') +
            '    </h3>' +
            '    <div class="anime-meta-2">' +
            '      <span class="seasons-info">' + romaji + '</span>' +
            '    </div>' +
            (summary ? '    <div class="anime-description" style="margin-top: 15px;">' + summary + '</div>' : '') +
            '    <div class="anime-tags">' + (genres.slice(0, 5).map(function (g) { return '<span class="anime-tag">' + g + '</span>'; }).join('')) + '</div>' +
            '  </div>' +
            '</div>'
        );
    }

    var $container = $('#anime-container');
    var $summary = $('#search-summary');
    var $count = $('#results-count');
    var $pagination = $('#pagination-container');

    var q = getQueryParam('q') || getQueryParam('s') || '';
    setInputValue(q);

    var currentPage = 1;
    var totalPages = 1;
    var pageSize = 24;

    function updateSummary(text) {
        if ($summary.length) {
            if (text) {
                $summary.text(text).show();
            } else {
                $summary.hide();
            }
        }
    }

    function updateCount(total) {
        if (!$count.length) return;
        if (typeof total === 'number' && isFinite(total)) {
            $count.text('(' + total + ' sonuç)');
        } else {
            $count.text('');
        }
    }

    function renderPagination() {
        $pagination.empty();
        if (totalPages <= 1) return;

        function addPage(p, label, active, disabled) {
            var cls = 'page-link' + (active ? ' active' : '') + (disabled ? ' disabled' : '');
            var el = $('<div/>').addClass(cls).attr('data-page', p).text(label);
            if (!disabled) {
                el.on('click', function () {
                    var target = Number($(this).attr('data-page')) || 1;
                    if (target !== currentPage) loadPage(target);
                });
            }
            $pagination.append(el);
        }

        addPage(Math.max(1, currentPage - 1), '«', false, currentPage === 1);

        var start = Math.max(1, currentPage - 2);
        var end = Math.min(totalPages, currentPage + 2);
        if (start > 1) {
            addPage(1, '1', false, false);
            if (start > 2) $pagination.append($('<div/>').addClass('page-link disabled').text('...'));
        }
        for (var i = start; i <= end; i++) addPage(i, String(i), i === currentPage, false);
        if (end < totalPages) {
            if (end < totalPages - 1) $pagination.append($('<div/>').addClass('page-link disabled').text('...'));
            addPage(totalPages, String(totalPages), false, false);
        }
        addPage(Math.min(totalPages, currentPage + 1), '»', false, currentPage === totalPages);
    }

    async function loadPage(page) {
        if (!q) {
            updateSummary('Arama sorgusu boş.');
            return;
        }

        updateSummary('Aranıyor...');
        $container.empty();
        currentPage = page;

        try {
            const data = await YepYeniAPI.search(q, page);
            
            var list = [];
            if (Array.isArray(data)) {
                list = data;
            } else if (data && Array.isArray(data.animes)) {
                list = data.animes;
                totalPages = data.totalPages || 1;
            } else if (data && Array.isArray(data.results)) {
                list = data.results;
            }

            if (list.length === 0) {
                updateSummary('"' + q + '" için sonuç bulunamadı.');
                updateCount(0);
                return;
            }

            updateSummary('');
            updateCount(list.length);

            list.forEach(function (anime) {
                $container.append(renderCard(anime));
            });

            renderPagination();
            $('html, body').animate({ scrollTop: 0 }, 200);
        } catch (error) {
            console.error('Arama hatası:', error);
            updateSummary('Arama sırasında bir hata oluştu.');
        }
    }

    // İlk yükleme
    if (q) {
        loadPage(1);
    } else {
        updateSummary('Arama yapmak için bir kelime girin.');
    }
})();
