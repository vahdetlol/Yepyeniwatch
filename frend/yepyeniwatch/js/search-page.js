// Powers the full search results page
(function () {
  var $ = window.jQuery;
  if (!$) return;

  // Read query string param 'q' or fallback to 's'
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

  // Redirect to search page with q param
  function goSearch(query) {
    if (!query || !query.trim()) return;
    var url = 'search?q=' + encodeURIComponent(query.trim());
    window.location.href = url;
  }

  // Intercept header search form submit
  $(document).on('submit', 'form.example', function (e) {
    e.preventDefault();
    var q = ($('#searchInput').val() || '').trim();
    goSearch(q);
  });

  // Also handle Enter in input explicitly (for safety)
  $(document).on('keydown', '#searchInput', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var q = ($(this).val() || '').trim();
      goSearch(q);
    }
  });

  // Rendering helpers
  function renderCard(anime) {
    var slug = anime.slug || anime.id || '#';
    var english = anime.english || anime.title || 'İsimsiz';
    var romaji = anime.romaji || '';
    var summary = anime.summary || "";
    var avatar = anime.pictures && anime.pictures.avatar ? anime.pictures.avatar.replace('image.tmdb.org', 'image.openanime.net') : '';
    var genres = anime.genres || [];
    var year = anime.firstAirDate ? String(anime.firstAirDate).split('.').pop() : '';
    var typeRaw = (anime.type || '').toString().toLowerCase();
    var seasonText = typeRaw === 'movie' ? 'Film' : (typeRaw === 'tv' ? 'Anime' : (anime.type || '').toString());
    var fourk = anime.is4K ? 'https://yepyeniwatch.xyz/yepyeniwatch/images/4klogo.png' : '';

    return (
      '<div class="anime-card">' +
      '  <div class="anime-poster">' +
      '    <a href="https://openani.me/anime/' + slug + '" target="_blank" rel="noopener">' +
      (avatar ? '      <img src="' + avatar + '" alt="' + english + '" loading="lazy">' : '') +
      '    </a>' +
      '  </div>' +
      '  <div class="anime-info" style="margin-top: -10px;">' +
      '    <div class="imdb-score">' + seasonText + '</div>' +
      '    <h3 class="anime-title">' +
      '      <a href="https://openani.me/anime/' + slug + '" target="_blank" rel="noopener">' + english + '</a><img class=\"search-card-4k\" src="' + fourk + '" style="height: 35px;"></img>' +
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
  var pageSize = 24; // items per page
  var inFlight = null;

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

  function buildApiUrl(page) {
    // Prefer dedicated search endpoint if available
    var base = 'https://api.openani.me/anime/search';
    var params = new URLSearchParams();
    params.set('q', q || '');
    params.set('page', String(page || 1));
    params.set('limit', String(pageSize));
    return base + '?' + params.toString();
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

  function normalizeList(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.animes)) return data.animes;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.items)) return data.items;
    return [];
  }

  function loadPage(page) {
    if (!q || q.trim().length < 2) {
      updateSummary('Lütfen en az 2 harf girin.');
      $container.empty();
      $pagination.empty();
      updateCount(0);
      return;
    }
    currentPage = page || 1;
    if (inFlight && inFlight.abort) try { inFlight.abort(); } catch (e) {}

    updateSummary('Aranıyor...');
    $container.empty();

    var url = buildApiUrl(currentPage);
    inFlight = $.ajax({
      url: url,
      method: 'GET',
      dataType: 'json'
    }).done(function (resp) {
      var list = normalizeList(resp);
      // totalPages may come from API; fallback based on count if provided
      var tpRaw = resp && (resp.totalPages != null ? resp.totalPages : resp.total_pages);
      var tpNum = parseInt(tpRaw, 10);
      totalPages = isFinite(tpNum) && tpNum > 0 ? tpNum : 1;

      var tcRaw = resp && (resp.totalCount ?? resp.total ?? resp.count);
      var tcNum = (typeof tcRaw === 'number' && isFinite(tcRaw))
        ? tcRaw
        : (typeof tcRaw === 'string' && tcRaw.trim() !== '' && isFinite(Number(tcRaw))
            ? Number(tcRaw)
            : null);

      if (tcNum != null) {
        updateCount(tcNum);
      } else if (totalPages > 1 && list.length > 0) {
        // Unknown grand total with multiple pages; hide count
        updateCount(undefined);
      } else {
        // Single page or unknown; show current page item count
        updateCount(Array.isArray(list) ? list.length : 0);
      }

      if (!list || list.length === 0) {
        updateSummary('Sonuç bulunamadı.');
        $container.html('<div class="loading">Sonuç bulunamadı.</div>');
        $pagination.empty();
        return;
      }

      updateSummary('');
      var html = list.map(renderCard).join('');
      $container.html(html);
      renderPagination();
    }).fail(function () {
      updateSummary('Arama sırasında bir hata oluştu.');
      $container.html('<div class="loading">Arama sırasında bir hata oluştu.</div>');
      $pagination.empty();
    }).always(function () {
      inFlight = null;
    });
  }

  // Initial load
  loadPage(1);
})();
