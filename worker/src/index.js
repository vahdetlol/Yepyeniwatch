/**
 * YepYeniWatch Cloudflare Workers Backend
 * Tüm OpenAnime API istekleri bu backend üzerinden yapılır
 */

// HTML şablonları import edilir
import { getAnimePageHTML } from "./anime-page.js";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
};

// OpenAnime API base URL
const OPENANIME_API = "https://api.openani.me";
const OPENANIME_SITE = "https://openani.me";

// Cache süresi (24 saat = 86400 saniye)
const CACHE_TTL = 86400;
const GUNCEL_ANIME_CACHE_KEY = "guncel-anime-data";

// Static dosya uzantıları
const STATIC_EXTENSIONS = [
  ".css",
  ".js",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".xml",
  ".txt",
];

/**
 * OpenAnime API'ye istek yapar
 */
async function fetchFromOpenAnime(path, env) {
  const url = `${OPENANIME_API}${path}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/plain, */*",
      "Referer": "https://openani.me/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      "Client-Protocol-Model": "RCSA-14402/05",
    },
  });

  return response;
}

/**
 * Güncel anime verilerini OpenAnime API'den çeker ve cache'e kaydeder
 * 24 saat boyunca cache'den döner, sonra yeniler
 */
async function getGuncelAnimeData(env) {
  // KV cache'den kontrol et
  if (env.CACHE) {
    try {
      const cachedData = await env.CACHE.get(GUNCEL_ANIME_CACHE_KEY, { type: "json" });
      if (cachedData) {
        console.log("Güncel anime verileri cache'den alındı");
        return cachedData;
      }
    } catch (e) {
      console.error("Cache okuma hatası:", e);
    }
  }

  // Cache'de yoksa veya süresi dolmuşsa, API'den çek
  console.log("Güncel anime verileri API'den çekiliyor...");
  
  try {
    const allSlugs = new Set();
    const animeData = [];
    
    // Son 15 sayfadaki bölümlerden unique slug'ları topla
    for (let page = 1; page <= 15; page++) {
      try {
        const episodesResponse = await fetchFromOpenAnime(`/anime/episodes/latest?page=${page}`, env);
        
        if (episodesResponse.ok) {
          const data = await episodesResponse.json();
          if (data && data.episodes) {
            data.episodes.forEach(episode => {
              if (episode.slug) {
                allSlugs.add(episode.slug);
              }
            });
          }
        }
        
        // Rate limiting için bekle
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Sayfa ${page} çekilemedi:`, error.message);
      }
    }
    
    console.log(`${allSlugs.size} unique anime slug bulundu`);
    
    // Her anime için detay bilgilerini çek
    const slugArray = Array.from(allSlugs);
    for (const slug of slugArray) {
      try {
        const animeDetails = await fetchFromOpenAnime(`/anime/${slug}`, env);
        
        if (animeDetails.ok) {
          const details = await animeDetails.json();
          
          // nextEpisodeToAir null olanları atla (bitmiş animeler)
          if (details.nextEpisodeToAir === null) {
            continue;
          }
          
          animeData.push({
            slug: details.slug,
            season: details.season,
            episode: details.episode,
            english: details.english,
            romaji: details.romaji,
            pictures: details.pictures,
            is4K: details.is4K || false,
          });
        }
        
        // Rate limiting için bekle
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`Anime ${slug} çekilemedi:`, error.message);
      }
    }
    
    const result = { episodes: animeData, lastUpdated: Date.now() };
    
    // KV cache'e kaydet (24 saat TTL ile)
    if (env.CACHE) {
      try {
        await env.CACHE.put(GUNCEL_ANIME_CACHE_KEY, JSON.stringify(result), {
          expirationTtl: CACHE_TTL,
        });
        console.log("Güncel anime verileri cache'e kaydedildi");
      } catch (e) {
        console.error("Cache yazma hatası:", e);
      }
    }
    
    return result;
  } catch (error) {
    console.error("Güncel anime verisi çekme hatası:", error);
    return { episodes: [] };
  }
}

/**
 * Cache'i manuel olarak yenileme endpoint'i
 */
async function refreshGuncelAnimeCache(env) {
  if (env.CACHE) {
    await env.CACHE.delete(GUNCEL_ANIME_CACHE_KEY);
  }
  return await getGuncelAnimeData(env);
}

/**
 * API endpoint handler
 */
async function handleAPIRequest(request, env, path) {
  const url = new URL(request.url);

  // /api/home - Ana sayfa verileri
  if (path === "/api/home") {
    return await handleHomeAPI(env);
  }

  // /api/feed?page=X - Feed sayfası
  if (path === "/api/feed") {
    const page = url.searchParams.get("page") || "1";
    return await handleFeedAPI(env, page);
  }

  // /api/archive?page=X&keywords=X&score=X&date=X - Arşiv sayfası
  if (path === "/api/archive") {
    return await handleArchiveAPI(env, url.searchParams);
  }

  // /api/search?q=X - Arama
  if (path === "/api/search") {
    const q = url.searchParams.get("q") || "";
    const page = url.searchParams.get("page") || "1";
    return await handleSearchAPI(env, q, page);
  }

  // /api/anime/:slug - Anime detayları
  if (path.startsWith("/api/anime/")) {
    const slug = path.replace("/api/anime/", "");
    return await handleAnimeDetailAPI(env, slug);
  }

  // /api/refresh-cache - Cache'i yenile
  if (path === "/api/refresh-cache") {
    const data = await refreshGuncelAnimeCache(env);
    return new Response(
      JSON.stringify({ success: true, count: data.episodes?.length || 0 }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

/**
 * Ana sayfa API
 */
async function handleHomeAPI(env) {
  try {
    // Paralel olarak tüm verileri çek
    const [
      popularEpisodesRes,
      latestEpisodesRes,
      popularsRes,
      fourKRes,
      guncelData,
      totalPagesRes,
    ] = await Promise.all([
      fetchFromOpenAnime("/anime/episodes/latest/populars?limit=20", env),
      fetchFromOpenAnime("/anime/episodes/latest?limit=20", env),
      fetchFromOpenAnime("/anime/populars", env),
      fetchFromOpenAnime("/anime/4k-releases", env),
      getGuncelAnimeData(env),
      fetchFromOpenAnime("/anime", env),
    ]);

    const popularEpisodes = popularEpisodesRes.ok
      ? await popularEpisodesRes.json()
      : { episodes: [] };
    const latestEpisodes = latestEpisodesRes.ok
      ? await latestEpisodesRes.json()
      : { episodes: [] };
    const populars = popularsRes.ok ? await popularsRes.json() : [];
    const fourK = fourKRes.ok ? await fourKRes.json() : { animes: [] };
    const totalPagesData = totalPagesRes.ok
      ? await totalPagesRes.json()
      : { totalPages: 1 };

    // Güncel animeleri eşleştir
    const localAnimeMap = new Map();
    (guncelData.episodes || []).forEach((anime) => {
      if (anime.slug) localAnimeMap.set(anime.slug, anime);
    });

    // Son eklenen animeleri çek (son sayfa)
    const lastPageRes = await fetchFromOpenAnime(
      `/anime?page=${totalPagesData.totalPages}`,
      env
    );
    let lastAnimes = [];
    if (lastPageRes.ok) {
      const lastPageData = await lastPageRes.json();
      lastAnimes = (lastPageData.animes || []).reverse();

      if (lastAnimes.length < 20 && totalPagesData.totalPages > 1) {
        const prevPageRes = await fetchFromOpenAnime(
          `/anime?page=${totalPagesData.totalPages - 1}`,
          env
        );
        if (prevPageRes.ok) {
          const prevPageData = await prevPageRes.json();
          lastAnimes = lastAnimes.concat((prevPageData.animes || []).reverse());
        }
      }
    }

    // Güncel anime bölümlerini eşleştir
    const matchedEpisodes = [];
    for (let page = 1; page <= 5; page++) {
      const episodesRes = await fetchFromOpenAnime(
        `/anime/episodes/latest?page=${page}`,
        env
      );
      if (episodesRes.ok) {
        const episodesData = await episodesRes.json();
        (episodesData.episodes || []).forEach((episode) => {
          if (episode.slug && localAnimeMap.has(episode.slug)) {
            const localAnime = localAnimeMap.get(episode.slug);
            matchedEpisodes.push({
              slug: episode.slug,
              season: episode.season,
              episode: episode.episode,
              english: localAnime.english,
              romaji: localAnime.romaji,
              pictures: localAnime.pictures,
              is4K: localAnime.is4K,
            });
          }
        });
      }
    }

    return new Response(
      JSON.stringify({
        popularEpisodes: popularEpisodes.episodes || [],
        latestEpisodes: latestEpisodes.episodes || [],
        populars: Array.isArray(populars) ? populars : [],
        fourK: fourK.animes || [],
        lastAnimes: lastAnimes.slice(0, 20),
        guncelAnimes: matchedEpisodes,
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

/**
 * Feed sayfası API
 */
async function handleFeedAPI(env, page) {
  try {
    const response = await fetchFromOpenAnime(
      `/anime/episodes/latest?limit=20&page=${page}`,
      env
    );
    const data = response.ok ? await response.json() : { episodes: [] };

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

/**
 * Arşiv sayfası API
 */
async function handleArchiveAPI(env, params) {
  try {
    const page = params.get("page") || "1";
    const keywords = params.get("keywords") || "";
    const score = params.get("score") || "";
    const date = params.get("date") || "";

    let apiUrl = `/anime?page=${page}`;
    if (keywords) apiUrl += `&keywords=${encodeURIComponent(keywords)}`;
    if (score) apiUrl += `&score=${score}`;
    if (date) apiUrl += `&date=${date}`;

    const response = await fetchFromOpenAnime(apiUrl, env);
    const data = response.ok
      ? await response.json()
      : { animes: [], totalPages: 1 };

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

/**
 * Arama API
 */
async function handleSearchAPI(env, query, page) {
  try {
    const response = await fetchFromOpenAnime(
      `/anime/search?q=${encodeURIComponent(query)}&page=${page}&limit=24`,
      env
    );
    const data = response.ok ? await response.json() : { animes: [] };

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

/**
 * Anime detay API
 */
async function handleAnimeDetailAPI(env, slug) {
  try {
    // Anime bilgilerini çek
    const [animeRes, episodesRes] = await Promise.all([
      fetchFromOpenAnime(`/anime/${slug}`, env),
      fetchFromOpenAnime(`/anime/${slug}/episodes`, env),
    ]);

    const anime = animeRes.ok ? await animeRes.json() : null;
    const episodes = episodesRes.ok
      ? await episodesRes.json()
      : { seasons: [] };

    if (!anime) {
      return new Response(JSON.stringify({ error: "Anime not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({
        anime,
        episodes: episodes.seasons || episodes,
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

/**
 * Anime sayfası HTML oluştur
 */
async function handleAnimePage(request, env, slug) {
  try {
    // Anime verilerini API'den çek
    const [animeRes, episodesRes] = await Promise.all([
      fetchFromOpenAnime(`/anime/${slug}`, env),
      fetchFromOpenAnime(`/anime/${slug}/episodes`, env),
    ]);

    if (!animeRes.ok) {
      return new Response("Anime bulunamadı", { status: 404 });
    }

    const anime = await animeRes.json();
    const episodesData = episodesRes.ok
      ? await episodesRes.json()
      : { seasons: [] };

    // HTML sayfasını oluştur
    const html = getAnimePageHTML(
      anime,
      episodesData.seasons || episodesData,
      slug
    );

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    return new Response("Hata: " + error.message, { status: 500 });
  }
}

/**
 * Bölüm sayfasını OpenAnime'e yönlendir
 * /anime/{slug}/{season}/{episode} -> https://openani.me/anime/{slug}/{season}/{episode}
 */
function handleEpisodeRedirect(slug, season, episode) {
  const openAnimeUrl = `${OPENANIME_SITE}/anime/${slug}/${season}/${episode}`;
  
  return new Response(null, {
    status: 302,
    headers: {
      "Location": openAnimeUrl,
    },
  });
}

/**
 * Ana request handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Trailing slash temizle (root hariç)
    if (path !== "/" && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    // API istekleri
    if (path.startsWith("/api/")) {
      return handleAPIRequest(request, env, path);
    }

    // Static dosyalar
    const hasStaticExtension = STATIC_EXTENSIONS.some((ext) =>
      path.endsWith(ext)
    );
    if (hasStaticExtension) {
      return env.ASSETS.fetch(request);
    }

    // Anime bölüm sayfaları: /anime/{slug}/{season}/{episode}
    // Bu URL'ler OpenAnime'e yönlendirilir
    const episodeMatch = path.match(/^\/anime\/([^\/]+)\/(\d+)\/(\d+)$/);
    if (episodeMatch) {
      const [, slug, season, episode] = episodeMatch;
      return handleEpisodeRedirect(slug, season, episode);
    }

    // Anime detay sayfaları: /anime/{slug}
    if (path.startsWith("/anime/") && path.split("/").length === 3) {
      const slug = path.split("/")[2];
      return handleAnimePage(request, env, slug);
    }

    // Ana sayfalar (.html olmadan)
    const pageRoutes = {
      "/": "/index.html",
      "/feed": "/feed.html",
      "/anime-arsivi": "/anime-arsivi.html",
      "/search": "/search.html",
    };

    if (pageRoutes[path]) {
      const assetRequest = new Request(
        new URL(pageRoutes[path], url.origin),
        request
      );
      return env.ASSETS.fetch(assetRequest);
    }

    // Varsayılan olarak static assets'e yönlendir
    return env.ASSETS.fetch(request);
  },
};
