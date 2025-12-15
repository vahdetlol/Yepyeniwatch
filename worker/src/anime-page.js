function formatDate(dateStr) {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}
export function getAnimePageHTML(anime, seasons, slug) {
  const title = anime.english || anime.romaji || 'Anime';
  const romaji = anime.romaji || '';
  const summary = anime.summary || 'Bu animenin açıklaması bulunmamaktadır.';
  const genres = anime.genres || [];
  const avatar = anime.pictures?.avatar?.replace('image.tmdb.org', 'image.openanime.net') || '';
  const banner = anime.pictures?.banner?.replace('image.tmdb.org', 'image.openanime.net') || '';
  const tmdbScore = anime.tmdbScore ? parseFloat(anime.tmdbScore).toFixed(1) : 'N/A';
  const trailer = typeof anime.trailer === 'string' ? anime.trailer : '';
  const numberOfSeasons = anime.numberOfSeasons || 0;
  const numberOfEpisodes = anime.numberOfEpisodes || 0;
  const firstAirDate = anime.firstAirDate || '';
  const year = firstAirDate ? firstAirDate.split('.').pop() : '';
  const fourK = anime.is4K;
  
  // Debug: seasons verisini konsola yaz
  // console.log('Seasons data:', JSON.stringify(seasons, null, 2));
  
  // Sezon butonlarını oluştur (bölümler dinamik olarak yüklenecek)
  let seasonButtons = '';
  let firstSeasonNum = 1;
  
  if (Array.isArray(seasons) && seasons.length > 0) {
    // Sadece bölüm içeren sezonları filtrele
    const validSeasons = seasons.filter(s => s.hasEpisode !== false && s.episode_count > 0);
    
    if (validSeasons.length > 0) {
      firstSeasonNum = validSeasons[0].season_number !== undefined ? validSeasons[0].season_number : 1;
    }
    
    validSeasons.forEach((season, index) => {
      const seasonNum = season.season_number !== undefined ? season.season_number : (index + 1);
      const activeClass = index === 0 ? 'active' : '';
      const seasonName = season.name || `${seasonNum}. Sezon`;
      seasonButtons += `<button class="btn ${activeClass}" data-season="${seasonNum}">${seasonName}</button>`;
    });
  }


  // Genre tags
  const genreTags = genres.map(g => 
    `<div class="genres"><a href="/anime-arsivi?tur=${encodeURIComponent(g)}">${g}</a></div>`
  ).join('');

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - YepYeniWatch</title>
  <meta name="description" content="${summary.substring(0, 160)}">
  <meta name="keywords" content="${title}, ${romaji}, anime izle, türkçe anime">
  <meta content="tr" http-equiv="Content-Language">
  <meta name="language" content="Turkish">
  <meta name="google" content="notranslate">
  
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css">
  <link rel="stylesheet" href="/yepyeniwatch/style.css" type="text/css" media="all">
  <link rel="shortcut icon" href="/yepyeniwatch/images/yepyeniwatch_dik.png">
  
  <meta property="og:title" content="${title} - YepYeniWatch">
  <meta property="og:site_name" content="YepYeniWatch">
  <meta property="og:url" content="https://yepyeniwatch.xyz/anime/${slug}">
  <meta property="og:description" content="${summary.substring(0, 200)}">
  <meta property="og:image" content="${avatar}">
  
  <style>
    .body-clickable {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1;
      height: 100%;
      width: 100%;
      background: url('${banner || "/yepyeniwatch/images/background.jpg"}') no-repeat fixed center 0px #000000;
      cursor: default;
      background-size: cover;
    }
    @media only screen and (max-width: 1000px) {
      .body-clickable { display: none; }
    }
    .bolumust { display: block; }
    .loading-episodes, .no-episodes {
      padding: 20px;
      text-align: center;
      color: #aaa;
      font-size: 14px;
    }
    .loading-episodes {
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
  </style>
  
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
</head>
<body>
  <div class="body-clickable"></div>
  
  <div id="wrap">
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
                    <li id="menu-item-16"
                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-home menu-item-16">
                        <a href="/">Anasayfa</a>
                    </li>
                    <li id="menu-item-2994"
                        class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2994">
                        <a href="https://openani.me/calendar">Takvim</a>
                    </li>
                    <li id="menu-item-17" class="menu-item menu-item-type-post_type menu-item-object-page current-menu-item current_page_item menu-item-17">
                        <a href="/anime-arsivi">Anime Arşivi</a>
                    </li>
                    <li id="menu-item-1138"
                        class="menu-item menu-item-type-post_type menu-item-object-page menu-item-1138">
                        <a href="https://androidoyun.club/apks">Mobil Uygulama</a>
                    </li>
                    <li id="menu-item-28" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-28">
                        <a href="/feed">Yeni Bölümler</a>
                    </li>
                    <li id="menu-item-2034"
                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-2034">
                        <a href="https://discord.gg/openanime">Discord</a>
                    </li>
                    <li id="menu-item-19" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-19">
                        <a href="https://discord.gg/openanime">İletişim</a>
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
    
    <div id="content" class="page serie">
      <div class="incontentx">
        <div class="title">
        ${fourK ? `<img src="https://yepyeniwatch.xyz/yepyeniwatch/images/4klogo.png" class="fourk-logoo far fa-dot-circle">` : '<i class="fourk-logoo far fa-dot-circle"></i>'}
          <div class="title-border bd-purple">
             <div class= "anime-title">${title} </div> 
          </div>

        </div>

        <div id="icerikcat">
          <div class="imdb-score2">
              ${tmdbScore}
              <i class="fas fa-star"></i>
          </div>
          
          <div id="icerikcatleft">
            <div class="category_image">
              ${avatar ? `<img src="${avatar}" alt="${title}">` : ''}
              ${trailer ? `<button id="trailerbutton" onclick="openTrailer()"><i class="fas fa-video"></i> Fragmanı izle</button>` : ''}
            </div>

          
          <div id="icerikcatright">
            <div class="category_desc custom-scrollbar">
              ${summary}
            </div>
            <div id="icerikcat2">
              ${genreTags}

              ${trailer ? `
              <div id="trailer" class="modaltrailer" style="display:none;">
                <div class="modal-content-trailer">
                  <span class="trailerclose" onclick="closeTrailer()">×</span>
                  <div class="trailer-container">
                    <iframe class="trailer-video" id="trailerFrame" allow="autoplay" src="" frameborder="0" allowfullscreen></iframe>
                  </div>
                </div>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
        </div>
        <div id="myBtnContainer">
          <div id="butonlar">
            ${seasonButtons}
          </div>
        </div>
        
        <div class="listhead">
          <div class="baslik2">
            <i class="fa fa-play"></i> Bölüm Adı
          </div>
          <div class="tarih">
            <i class="fa fa-calendar"></i> Yayınlanma Tarihi
          </div>
        </div>
        
        <div id="scrollbar-container" class="custom-scrollbar">
          <div class="container" id="episodes-container">
            <div class="loading-episodes">Bölümler yükleniyor...</div>
          </div>
        </div>
      </div>
    </div>
    
    <div id="footer">
      <div class="footerleft">
        Copyright &copy; 2025 <a href="https://openani.me/profile/7149634466816724993/">YepYeniWatch</a><br>
        <span>Tüm Hakları Saklıdır</span>
        <a href="https://openani.me/profile/7149634466816724993/">vahdetlol</a>
      </div>
    </div>
  </div>
  
  <script>
    var animeSlug = '${slug}';
    var currentSeason = ${firstSeasonNum};
    var loadedSeasons = {};
    
    

    function navmenufunc() {
      var x = document.getElementById("myTopnav");
      if (x.className === "topnav") {
        x.className += " responsive";
      } else {
        x.className = "topnav";
      }
    }
    
    async function loadSeasonEpisodes(seasonNum) {
      var container = document.getElementById('episodes-container');
      
      if (loadedSeasons[seasonNum]) {
        container.innerHTML = loadedSeasons[seasonNum];
        return;
      }
      
      container.innerHTML = '<div class="loading-episodes">Bölümler yükleniyor...</div>';
      
      try {
        var response = await fetch('https://api.openani.me/anime/' + animeSlug + '/season/' + seasonNum, {
          headers: {
            'Accept': 'application/json',
            'Referer': 'https://openani.me/'
          }
        });
        
        if (!response.ok) {
          throw new Error('API hatası');
        }
        
        var data = await response.json();
        var episodes = data.season && data.season.episodes ? data.season.episodes : [];
        
        if (episodes.length === 0) {
          container.innerHTML = '<div class="no-episodes">Bu sezon için bölüm bulunamadı.</div>';
          loadedSeasons[seasonNum] = container.innerHTML;
          return;
        }
        
        var html = '';
        episodes.forEach(function(ep) {
          var epNum = ep.episodeNumber || 1;
          var epTitle = ep.name || '';
          var airDate = ep.airDate || '';
          var episodeLink = '/anime/' + animeSlug + '/' + seasonNum + '/' + epNum;
          
          html += '<div class="bolumust show">';
          html += '  <a href="' + episodeLink + '">';
          html += '    <div class="baslik">';
          html += '      ' + seasonNum + '. Sezon ' + epNum + '. Bölüm';
          if (epTitle) {
            html += ' — ' + epTitle + '';
          }
          html += '    </div>';
          html += '    <div class="tarih">' + airDate + '</div>';
          html += '  </a>';
          html += '</div>';
        });
        
        container.innerHTML = html;
        loadedSeasons[seasonNum] = html;
        
      } catch (error) {
        console.error('Bölümler yüklenirken hata:', error);
        container.innerHTML = '<div class="no-episodes">Bölümler yüklenirken bir hata oluştu.</div>';
      }
    }
    
    document.querySelectorAll('#butonlar .btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('#butonlar .btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        var seasonNum = this.getAttribute('data-season');
        currentSeason = parseInt(seasonNum);
        loadSeasonEpisodes(seasonNum);
      });
    });
    
    document.addEventListener('DOMContentLoaded', function() {
      loadSeasonEpisodes(currentSeason);
    });
    
    ${trailer ? `
    function openTrailer() {
      document.getElementById('trailer').style.display = 'flex';
      document.getElementById('trailerFrame').src = '${trailer && trailer.includes('youtube') ? trailer.replace('watch?v=', 'embed/') : trailer}';
    }
    
    function closeTrailer() {
      document.getElementById('trailer').style.display = 'none';
      document.getElementById('trailerFrame').src = '';
    }
    ` : ''}
    
  </script>
  
  <script src="/yepyeniwatch/js/jquery.perfect-scrollbar.min.js"></script>
  <script src="/yepyeniwatch/js/vpenanime.js"></script>
</body>
</html>`;
}
