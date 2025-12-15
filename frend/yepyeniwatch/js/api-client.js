/**
 * YepYeniWatch Frontend API Client
 * Tüm API istekleri bu dosya üzerinden yapılır
 * OpenAnime'e doğrudan istek ATILMAZ
 */

const YepYeniAPI = (function() {
  // API base URL (aynı domain)
  const API_BASE = '/api';
  
  /**
   * API isteği yap
   */
  async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  /**
   * Ana sayfa verilerini çek
   */
  async function getHomeData() {
    return request('/home');
  }
  
  /**
   * Feed sayfası verilerini çek
   */
  async function getFeedData(page = 1) {
    return request(`/feed?page=${page}`);
  }
  
  /**
   * Arşiv sayfası verilerini çek
   */
  async function getArchiveData(params = {}) {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page);
    if (params.keywords) searchParams.set('keywords', params.keywords);
    if (params.score) searchParams.set('score', params.score);
    if (params.date) searchParams.set('date', params.date);
    
    return request(`/archive?${searchParams.toString()}`);
  }
  
  /**
   * Arama yap
   */
  async function search(query, page = 1) {
    return request(`/search?q=${encodeURIComponent(query)}&page=${page}`);
  }
  
  /**
   * Anime detaylarını çek
   */
  async function getAnimeDetail(slug) {
    return request(`/anime/${slug}`);
  }
  
  // Public API
  return {
    getHomeData,
    getFeedData,
    getArchiveData,
    search,
    getAnimeDetail,
  };
})();

// Global olarak erişilebilir yap
window.YepYeniAPI = YepYeniAPI;
