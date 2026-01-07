import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;
const CACHE_FILE_PATH = path.join(__dirname, 'guncel-anime-cache.json');

  const now = new Date();
  const timestamp = now.toLocaleTimeString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const OPENANIME_API = process.env.OPENANIME_API;
const OPENANIME_SITE = process.env.OPENANIME_SITE;

const headers = JSON.parse(process.env.HEADERS);

let guncelAnimeCache = null;
let isUpdatingCache = false;
async function loadCacheFromFile() {
  try {
    const data = await fs.readFile(CACHE_FILE_PATH, 'utf-8');
    const cached = JSON.parse(data);
    guncelAnimeCache = cached;
    console.log(`Cache loaded (${cached.episodes?.length || 0} anime)`);
    return cached;
  } catch (error) {
    console.log('Cache not found, new cache will be created');
    return null;
  }
}

async function saveCacheToFile(data) {
  try {
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Cache saved (${data.episodes?.length || 0} anime)`);
  } catch (error) {
    console.error('Could not save to file:', error.message);
  }
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/yepyeniwatch', express.static(path.join(__dirname, '../frend/yepyeniwatch')));

async function fetchFromOpenAnime(apiPath) {
  const url = `${OPENANIME_API}${apiPath}`;
  
  const response = await fetch(url, {
    headers: headers
  });
  
  return response;
}

async function getGuncelAnimeData() {
  if (isUpdatingCache) {
    return guncelAnimeCache || { episodes: [], lastUpdated: Date.now() };
  }
  isUpdatingCache = true;
  console.log("Fetching latest anime data from API...");
  
  try {
     const allSlugs = new Set();
    const animeData = [];

    for (let page = 1; page <= 15; page++) {
      try {
        const episodesResponse = await fetchFromOpenAnime(`/anime/episodes/latest?page=${page}`);
        
        if (episodesResponse.ok) {
          const data = await episodesResponse.json();
          if (data && data.episodes) {
            data.episodes.forEach(episode => {
              if (episode.slug) {
                allSlugs.add(episode);
              }
            });
          }
        }
        
        // Rate limiting için bekle
        await new Promise(resolve => setTimeout(resolve, 100)); 
      } catch (error) {
        console.error(`Page ${page} could not be fetched:`, error.message);
      }
    }
    
    for (const episode of allSlugs) {
        const slug = episode.slug;
      try {
        const animeDetails = await fetchFromOpenAnime(`/anime/${slug}`);
        
        if (animeDetails.ok) {
          const details = await animeDetails.json();

          if (details.nextEpisodeToAir === null) {
            continue;
          }
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          const currentDate = sevenDaysAgo.toISOString().slice(0, 10);
          if (currentDate > details.nextEpisodeToAir.air_date) {
            continue;
          }

          animeData.push({
            slug: details.slug,
            season: episode.season,
            episode: episode.episode,
            english: details.english,
            romaji: details.romaji,
            pictures: episode.pictures,
            is4K: episode.is4K || false,
          });
        }
        
        // Rate limiting için bekle
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`Anime ${slug} could not be fetched:`, error.message);
      }
    }
    
    const result = { episodes: animeData, lastUpdated: Date.now() };
    guncelAnimeCache = result;
   
    await saveCacheToFile(result);

    isUpdatingCache = false;
    return result;
  } catch (error) {
    console.error("Latest anime data could not be fetched:", error.message);
    isUpdatingCache = false;
    return guncelAnimeCache || { episodes: [], lastUpdated: Date.now() };
  }
}

app.get('/api/home', async (req, res) => {
  try {
    const [
      popularEpisodesRes,
      latestEpisodesRes,
      popularsRes,
      fourKRes,
    ] = await Promise.all([
      fetchFromOpenAnime("/anime/episodes/latest/populars?limit=20"),
      fetchFromOpenAnime("/anime/episodes/latest?limit=20"),
      fetchFromOpenAnime("/anime/populars"),
      fetchFromOpenAnime("/anime/4k-releases"),
    ]);

    const popularEpisodes = popularEpisodesRes.ok
      ? await popularEpisodesRes.json()
      : { episodes: [] };
    const latestEpisodes = latestEpisodesRes.ok
      ? await latestEpisodesRes.json()
      : { episodes: [] };
    const populars = popularsRes.ok ? await popularsRes.json() : [];
    const fourK = fourKRes.ok ? await fourKRes.json() : { animes: [] };
    const totalPagesRes = await fetchFromOpenAnime("/anime");
    const totalPagesData = totalPagesRes.ok
      ? await totalPagesRes.json()
      : { totalPages: 1 };

    let lastAnimes = [];
    if (totalPagesData.totalPages > 0) {
      const lastPageRes = await fetchFromOpenAnime(
      `/anime?page=${totalPagesData.totalPages}`
      );
      if (lastPageRes.ok) {
      const lastPageData = await lastPageRes.json();
      lastAnimes = lastPageData.animes || [];
      
      if (lastAnimes.length < 20 && totalPagesData.totalPages > 1) {
        const prevPageRes = await fetchFromOpenAnime(
        `/anime?page=${totalPagesData.totalPages - 1}`
        );
        if (prevPageRes.ok) {
        const prevPageData = await prevPageRes.json();
        lastAnimes = [...(prevPageData.animes || []), ...lastAnimes];
        }
      }
      lastAnimes = lastAnimes.reverse().slice(0, 20);
      }
    }
    const guncelAnimes = guncelAnimeCache || { episodes: [], lastUpdated: Date.now() };

    res.json({
      popularEpisodes: popularEpisodes.episodes || [],
      latestEpisodes: latestEpisodes.episodes || [],
      populars: Array.isArray(populars) ? populars : [],
      fourK: fourK.animes || [],
      lastAnimes: lastAnimes,
      guncelAnimes: guncelAnimes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/feed', async (req, res) => {
  try {
    const page = req.query.page || "1";
    const response = await fetchFromOpenAnime(
      `/anime/episodes/latest?limit=20&page=${page}`
    );
    const data = response.ok ? await response.json() : { episodes: [] };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/archive', async (req, res) => {
  try {
    const { page = "1", keywords = "", score = "", date = "" } = req.query;

    let apiUrl = `/anime?page=${page}`;
    if (keywords) apiUrl += `&keywords=${encodeURIComponent(keywords)}`;
    if (score) apiUrl += `&score=${score}`;
    if (date) apiUrl += `&date=${date}`;

    const response = await fetchFromOpenAnime(apiUrl);
    const data = response.ok
      ? await response.json()
      : { animes: [], totalPages: 1 };

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { q = "", page = "1" } = req.query;
    const response = await fetchFromOpenAnime(
      `/anime/search?q=${encodeURIComponent(q)}&page=${page}&limit=24`
    );
    const data = response.ok ? await response.json() : { animes: [] };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/anime/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const [animeRes, episodesRes] = await Promise.all([
      fetchFromOpenAnime(`/anime/${slug}`),
      fetchFromOpenAnime(`/anime/${slug}/episodes`),
    ]);

    const anime = animeRes.ok ? await animeRes.json() : null;
    const episodes = episodesRes.ok
      ? await episodesRes.json()
      : { seasons: [] };

    if (!anime) {
      return res.status(404).json({ error: "Anime not found" });
    }

    res.json({
      anime,
      episodes: episodes.seasons || episodes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await fetchFromOpenAnime(`/user/${id}`);

    if (!response.ok) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = await response.json();

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/refresh-cache', async (req, res) => {
  if (isUpdatingCache) {
    return res.json({ success: false, message: 'Cache güncellenmekte' });
  }
  getGuncelAnimeData().catch(err => console.error('Cache update error:', err));
  
  res.json({ success: true, message: 'Cache güncelleme başlatıldı' });
});


import { getAnimePageHTML } from './anime-page.js';
async function initializeCache() {
  await loadCacheFromFile();
  if (!guncelAnimeCache || !guncelAnimeCache.lastUpdated) {
    console.log('Starting initial cache update...');
    getGuncelAnimeData().catch(err => console.error('Initial cache update error:', err));
  }
  setInterval(() => {
    console.log('Starting automatic cache update...');
    getGuncelAnimeData().catch(err => console.error('Automatic cache update error:', err));
  }, 0.5 * 30 * 60 * 1000); 
}


app.get('/anime/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const animeRes = await fetchFromOpenAnime(`/anime/${slug}`);

    if (!animeRes.ok) {
      return res.status(404).send("Anime bulunamadı");
    }

    const anime = await animeRes.json();
    const seasons = anime.seasons || [];

    const html = getAnimePageHTML(anime, seasons, slug);
    res.type('html').send(html);
  } catch (error) {
    res.status(500).send("Hata: " + error.message);
  }
});

app.get('/anime/:slug/:season/:episode', (req, res) => {
  const { slug, season, episode } = req.params;
  res.redirect(302, `${OPENANIME_SITE}/anime/${slug}/${season}/${episode}`);
});

app.get('/api/anime/:slug/season/:seasonNum', async (req, res) => {
  try {
    const { slug, seasonNum } = req.params;
    
    const response = await fetchFromOpenAnime(`/anime/${slug}/season/${seasonNum}`);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'API hatası' });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function createSitemapIndex() {
  const baseUrl = 'https://www.yepyeniwatch.xyz';
  const currentDate = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <sitemap>
    <loc>${baseUrl}/routes.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/episodes.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
}

app.get('/sitemap.xml', (req, res) => {
  try {
    const xml = createSitemapIndex();
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap hatası:', err);
    res.status(500).send('Sitemap oluşturulamadı');
  }
});

app.get('/sitemap_index.xml', (req, res) => {
  try {
    const xml = createSitemapIndex();
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap_index error:', err);
    res.status(500).send('Sitemap oluşturulamadı');
  }
});

app.get('/routes.xml', async (req, res) => {
  try {
    const baseUrl = 'https://www.yepyeniwatch.xyz';
    const currentDate = new Date().toISOString();
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/feed</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/anime-arsivi</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Routes sitemap error:', err);
    res.status(500).send('Sitemap oluşturulamadı');
  }
});

app.get('/episodes.xml', async (req, res) => {
  try {
    const baseUrl = 'https://www.yepyeniwatch.xyz';
    const currentDate = new Date().toISOString();
    
    const headers = JSON.parse(process.env.HEADERS);
    
    console.log('Fetching OpenAnime episodes sitemap...');
    
    const response = await fetch('https://api.openani.me/sitemap/episodes.xml', {
      headers: headers,
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) {
      throw new Error(`OpenAnime sitemap HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlData = await response.text();
    console.log('OpenAnime sitemap received, length:', xmlData.length);
    
    const urlRegex = /<loc>\s*https?:\/\/openani\.me\/anime\/([a-zA-Z0-9_-]+)(?:\/\d+\/\d+)?\s*<\/loc>/gi;
    const slugs = new Set();
    let match;
    let matchCount = 0;
    
    while ((match = urlRegex.exec(xmlData)) !== null) {
      matchCount++;
      const slug = match[1];
      if (slug && slug.length > 0) {
        slugs.add(slug);
      }
    }
    
    console.log(`Total matches: ${matchCount}, Unique slugs: ${slugs.size}`);
    
    if (slugs.size === 0) {
      console.log('No slugs found with primary regex, trying alternative method...');
      
      const alternateRegex = /openani\.me\/anime\/([a-zA-Z0-9_-]+)/gi;
      while ((match = alternateRegex.exec(xmlData)) !== null) {
        const slug = match[1];
        if (slug && slug.length > 0 && !slug.includes('/')) {
          slugs.add(slug);
        }
      }
      
      console.log(`Alternative method found: ${slugs.size} slugs`);
    }

    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    if (slugs.size > 0) {
      for (const slug of slugs) {
        xml += `  <url>
    <loc>${baseUrl}/anime/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    } else {
      xml += `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
    
    console.log(`Episodes sitemap created successfully with ${slugs.size} URLs`);
  } catch (err) {
    console.error('Episodes sitemap error:', err.message);
    console.error('Stack trace:', err.stack);
    
    // Hata durumunda bile geçerli bir sitemap döndür
    const currentDate = new Date().toISOString();
    const baseUrl = 'https://www.yepyeniwatch.xyz';
    
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.status(200).send(errorXml);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frend/index.html'));
});

app.get('/feed', (req, res) => {
  res.sendFile(path.join(__dirname, '../frend/feed.html'));
});

app.get('/anime-arsivi', (req, res) => {
  res.sendFile(path.join(__dirname, '../frend/anime-arsivi.html'));
});

app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, '../frend/search.html'));
});

app.use(express.static(path.join(__dirname, '../frend')));

app.listen(PORT, async () => {
  console.log(`Server is running: http://localhost:${PORT}`);
  await initializeCache();
});
