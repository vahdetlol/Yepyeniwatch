function formatDate(dateStr) {
  if (!dateStr) return "";

  try {
    const date = new Date(dateStr);
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];

    return `${date.getDate().toString().padStart(2, "0")} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

export function getAnimePageHTML(anime, seasons, slug) {
  const title = anime.english || anime.romaji || "Anime";
  const romaji = anime.romaji || "";
  const summary = anime.summary || "Bu animenin açıklaması bulunmamaktadır.";
  const genres = anime.genres || [];
  const vravatar =
    anime.pictures?.avatar?.replace("image.tmdb.org", "image.openanime.net") ||
    "";
  const avatar = "https://wsrv.nl/?url=" + vravatar;
  const vrbanner =
    anime.pictures?.banner?.replace("image.tmdb.org", "image.openanime.net") ||
    "";
  const banner = "https://wsrv.nl/?url=" + vrbanner;
  const tmdbScore = anime.tmdbScore
    ? parseFloat(anime.tmdbScore).toFixed(1)
    : "N/A";
  const trailer = typeof anime.trailer === "string" ? anime.trailer : "";
  const firstAirDate = anime.firstAirDate || "";
  const year = firstAirDate ? firstAirDate.split(".").pop() : "";
  const fourK = anime.is4K;
  const type = anime.type;
  const isTV = type === "tv";

  let seasonButtons = "";
  let firstSeasonNum = 1;

  if (isTV && Array.isArray(seasons) && seasons.length > 0) {
    // Sadece bölüm içeren sezonları filtrele
    const validSeasons = seasons.filter(
      (s) => s.hasEpisode !== false && s.episode_count > 0
    );

    if (validSeasons.length > 0) {
      firstSeasonNum =
        validSeasons[0].season_number !== undefined
          ? validSeasons[0].season_number
          : 1;
    }

    validSeasons.forEach((season, index) => {
      const seasonNum =
        season.season_number !== undefined ? season.season_number : index + 1;
      const activeClass = index === 0 ? "active" : "";
      const seasonName = season.name || `${seasonNum}. Sezon`;
      seasonButtons += `<button class="btn ${activeClass}" data-season="${seasonNum}">${seasonName}</button>`;
    });
  }

  const genreTags = genres
    .map((g) => `<div class="genres"><a href="/anime-arsivi">${g}</a></div>`)
    .join("");

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
      background: url('${
        "" || "/yepyeniwatch/images/background.jpg"
      }') no-repeat fixed center 0px #000000;
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
        ${
          fourK
            ? `<img src="https://yepyeniwatch.xyz/yepyeniwatch/images/4klogo.png" class="fourk-logoo far fa-dot-circle">`
            : '<i class="fourk-logoo far fa-dot-circle"></i>'
        }
          <div class="title-border bd-purple">
             <div class= "anime-title">${title} </div> 
          </div>

        </div>

        <div id="icerikcat" style="background-image: linear-gradient(to bottom,hsla(0, 0%, 0%, 70%), hsla(0, 0%, 0%, 30%)),url('${banner}'); background-size: cover; background-position: top; background-repeat: no-repeat;">
          <div class="imdb-score2">
              ${tmdbScore}
              <i class="fas fa-star"></i>
          </div>
          
          <div id="icerikcatleft">
            <div class="category_image">
              ${avatar ? `<img src="${avatar}" alt="${title}">` : ""}
              ${
                trailer
                  ? `<button id="trailerbutton" onclick="openTrailer()"><i class="fas fa-video"></i> Fragmanı izle</button>`
                  : ""
              }
            </div>

          
          <div id="icerikcatright">
            <div class="category_desc custom-scrollbar">
              ${summary}
            </div>
            <div id="icerikcat2">
              ${genreTags}

              ${
                trailer
                  ? `
              <div id="trailer" class="modaltrailer" style="display:none;">
                <div class="modal-content-trailer">
                  <span class="trailerclose" onclick="closeTrailer()">×</span>
                  <div class="trailer-container">
                    <iframe class="trailer-video" id="trailerFrame" allow="autoplay" src="" frameborder="0" allowfullscreen></iframe>
                  </div>
                </div>
              </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>
        </div>
        ${
          isTV
            ? `
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
        `
            : `
        <div class="listhead">
          <div class="baslik2">
            <i class="fa fa-play"></i> Film Adı
          </div>
          <div class="tarih">
            <i class="fa fa-calendar"></i> Yayınlanma Tarihi
          </div>
        </div>
        
        <div id="scrollbar-container" class="custom-scrollbar">
          <div class="container" id="episodes-container">
            <div class="bolumust show">
              <a href="/anime/${slug}/1/1">
                <div class="baslik">${title}</div>
                <div class="tarih">${formatDate(year)}</div>
              </a>
            </div>
          </div>
        </div>
        `
        }
      </div>
      
    <div class="commentcontent">
  <div class="title">
    <span class="title-border bd-purple">
      <i class="fas fa-comments"></i> Yorumlar		</span>
    <span class="countcom" id="comment-count">
      0 Yorum		</span>   
  </div>
      <div id="respond">
        <form href="https://openani.me/profile/7149634466816724993/" id="commentform" novalidate="novalidate">
      <div class="comment_owner_info">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tbody>
            <tr>
              <td class="yborder" align="left" valign="top">
                <input placeholder="Adınız" name="author" id="name" value="" size="50" tabindex="1" type="text" required="">
              </td>
            </tr>
            <tr>
              <td class="yborder" align="left" valign="top">
                <input placeholder="E-mail Adresiniz" name="email" id="email" value="" size="50" tabindex="2" type="email" required="">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="comment_content">
        <p>
          <textarea placeholder="Yorumunuz ipucu/detay içeriyorsa spoiler butonunu kullanınız." name="comment" id="comment" cols="40" rows="3" tabindex="4" required=""></textarea>
        </p>
              </div>
      <div class="comment_submit">
        <button type="button" class="comment_spoiler" tabindex="5">
          <span><i class="fas fa-exclamation-circle"></i></span> Spoiler Ekle				</button>
        <button herf="https://openani.me/profile/7149634466816724993/"name="yorum" type="submit" class="comment_send" tabindex="5">
          <span><i class="fas fa-paper-plane"></i></span> Yorumu Gönder				</button>
      </div>
    </form>
        <div class="comment_list">
      <ul class="commentlist" id="comments-container">
        <div class="loading-episodes">Yorumlar yükleniyor...</div>
      </ul>
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
        var response = await fetch('/api/anime/' + animeSlug + '/season/' + seasonNum);
        
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
    
    ${
      isTV
        ? `
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
      loadAllComments();
    });
    `
        : `
    document.addEventListener('DOMContentLoaded', function() {
      loadAllComments();
    });
    `
    }
    
    ${
      trailer
        ? `
    function openTrailer() {
      document.getElementById('trailer').style.display = 'flex';
      document.getElementById('trailerFrame').src = '${trailer.embed_url}';
    }
    
    function closeTrailer() {
      document.getElementById('trailer').style.display = 'none';
      document.getElementById('trailerFrame').src = '';
    }
    `
        : ""
    }
    

    async function loadAllComments() {
      var container = document.getElementById('comments-container');
      var commentCount = document.getElementById('comment-count');
      
      container.innerHTML = '<div class="loading-episodes">Yorumlar yükleniyor...</div>';
      try {
        var response = await fetch('/api/anime/' + animeSlug);
        
        if (!response.ok) {
          throw new Error('API hatası');
        }
        
        var data = await response.json();
        var reviews = data.anime && data.anime.reviews ? data.anime.reviews : [];
        
        if (reviews.length === 0) {
          container.innerHTML = '<li class="no-episodes">Bu anime için henüz yorum bulunmamaktadır.</li>';
          commentCount.textContent = '0 Yorum';
          return;
        }
        
        commentCount.textContent = reviews.length + ' Yorum';
        
        var html = '';
        
        for (var i = 0; i < reviews.length; i++) {
          var review = reviews[i];
          var index = i;
          
          var rating = review.rating || 0;
          var authorId = review.author || '';
          var content = review.content || '';
          var reviewId = review.id || index;
          var reviewTitle = review.title || '';
          
          var authorName = 'Annen amk';
          var avatarUrl = '';
          var profileUrl = '#';
          var userRole = '<i class="fas fa-star"></i> Puan: ' + rating + '/10';
          
          if (authorId) {
            try {
              var userResponse = await fetch('/api/user/' + authorId);
              if (userResponse.ok) {
                var userData = await userResponse.json();
                authorName = userData.username || 'Anonim';
                avatarUrl = userData.avatar || '';
                profileUrl = 'https://openani.me/profile/' + authorId;
              }
            } catch (e) {
              console.error('Kullanıcı verisi alınamadı:', e);
            }
          }
          
          var isPopular = rating >= 8;
          var likes = review.likes || 0;
          var dislikes = review.dislikes || 0;
          var borderColor = isPopular ? '#ffd70d' : '#8a2be2';
          
          var isDefaultAvatar = !avatarUrl || avatarUrl.includes('static.openani.me/profile/default');
          var avatarInitial = authorName.charAt(0).toUpperCase();
          
          html += '<li class="' + (index % 2 === 0 ? 'even' : 'odd') + ' thread-' + (index % 2 === 0 ? 'even' : 'odd') + '" style="border-left: 3px solid ' + borderColor + ';">';
          html += '  <div class="comment-body">';
          html += '    <div class="comment-author vcard">';
          
          if (isDefaultAvatar) {
            html += '      <div class="avatar avatar-96 photo" style=" border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: white;">' + avatarInitial + '</div>';
          } else {
            html += '      <img alt="" src="' + avatarUrl + '" srcset="' + avatarUrl + '" class="avatar avatar-96 photo" height="96" width="96" decoding="async">';
          }
          html += '      <a href="' + profileUrl + '">';
          html += '        <cite class="fn">' + authorName + '</cite>';
          html += '      </a>';
          html += '      <cite id="userrole">' + userRole + '</cite>';
          html += '    </div>';
          html += '    <div class="comment-meta commentmetadata">';
          html += '      <span style="color: #ffffffff !important; font-size: 14px !important; font-weight: bolder;">' + reviewTitle + '</span>';
          html += '    </div>';
          
          html += '    <p>' + content + '</p>';
          
          html += '    <div class="cld-like-dislike-wrap cld-template-1">';
          html += '      <div class="cld-like-wrap cld-common-wrap">';
          html += '        <a href="https://openani.me/anime/' + animeSlug + '" class="cld-like-trigger cld-like-dislike-trigger" title="Like" data-comment-id="' + reviewId + '" data-trigger-type="like"><i class="fa fa-thumbs-up"></i></a>';
          html += '        <span class="cld-like-count-wrap cld-count-wrap">' + likes + '</span>';
          html += '      </div>';
          html += '      <div class="cld-dislike-wrap cld-common-wrap">';
          html += '        <a href="https://openani.me/anime/' + animeSlug + '" class="cld-dislike-trigger cld-like-dislike-trigger" title="Dislike" data-comment-id="' + reviewId + '" data-trigger-type="dislike"><i class="fa fa-thumbs-down"></i></a>';
          html += '        <span class="cld-dislike-count-wrap cld-count-wrap">' + dislikes + '</span>';
          html += '      </div>';
          html += '    </div>';
          
          html += '    <div class="reply">';
          html += '      <a rel="nofollow" class="comment-reply-link" href="https://openani.me/anime/' + animeSlug + '">Cevapla</a>';
          html += '    </div>';
          html += '  </div>';
          html += '  <ul class="children"></ul>';
          html += '</li>';
        }
        
        container.innerHTML = html;
        
      } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
        container.innerHTML = '<li class="no-episodes">Yorumlar yüklenirken bir hata oluştu.</li>';
        commentCount.textContent = '0 Yorum';
      }
    }



  </script>
  
  <script src="/yepyeniwatch/js/jquery.perfect-scrollbar.min.js"></script>
  <script src="/yepyeniwatch/js/vpenanime.js"></script>
</body>
</html>`;
}
