import { Article } from '../types';

// API Keys
const NEWSDATA_API_KEY = 'pub_7f5d2c4e4a954992af38cb0c1f2781a7';
const NEWSAPI_ORG_KEY = 'd62a25179ef04906b3c8e6af6247d985';

// API URLs
const NEWSDATA_API_URL = 'https://newsdata.io/api/1/news';
const NEWSAPI_ORG_URL_EVERYTHING = 'https://newsapi.org/v2/everything';
const NEWSAPI_ORG_URL_TOP = 'https://newsapi.org/v2/top-headlines';


// --- Type Definitions ---
interface NewsDataArticle {
  title: string;
  link: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  category: string[];
  source_id: string;
}
interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
}

interface NewsApiArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}
interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
  message?: string;
}

const UI_CATEGORIES = ["technology", "business", "sports", "science"];

// --- Helper Functions ---
const isPaywalled = (article: { content?: string | null, description?: string | null, title: string }): boolean => {
    const content = `${article.title} ${article.content || ''} ${article.description || ''}`.toLowerCase();
    const paywallIndicators = [
        '[removed]',
        'to continue reading',
        'subscribe to read',
        'log in to read',
        'premium content',
    ];
    return paywallIndicators.some(indicator => content.includes(indicator));
};

const shuffleArray = <T,>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- API Fetching Functions ---

async function fetchFromNewsData(topic: string): Promise<Article[]> {
  const params = new URLSearchParams({
    apikey: NEWSDATA_API_KEY,
    country: 'za',
    language: 'en',
  });
  
  const lowerTopic = topic.toLowerCase().replace('world news', 'world');
  
  if (lowerTopic === 'latest' || lowerTopic === 'top') {
    params.set('category', 'top');
  } else if (UI_CATEGORIES.includes(lowerTopic)) {
    params.set('category', lowerTopic);
  } else {
    params.set('q', topic);
  }

  const response = await fetch(`${NEWSDATA_API_URL}?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.results?.message || `NewsData.io request failed with status ${response.status}`);
  }

  const data: NewsDataResponse = await response.json();

  if (data.status !== 'success' || !data.results) return [];

  return data.results
    .filter(article => !isPaywalled(article))
    .map((article): Article => ({
      title: article.title,
      summary: article.description || 'No summary available.',
      fullContent: article.content || article.description || 'Full content not available.',
      category: article.category?.[0]?.toUpperCase() || 'General',
      imageUrl: article.image_url || `https://picsum.photos/seed/${encodeURIComponent(article.title)}/800/600`,
      sources: [{ web: { uri: article.link, title: article.source_id || new URL(article.link).hostname } }],
    }));
}

async function fetchFromNewsApi(topic: string): Promise<Article[]> {
    const lowerTopic = topic.toLowerCase().replace('world news', 'world');
    const params = new URLSearchParams({ apiKey: NEWSAPI_ORG_KEY, language: 'en' });
    let url = NEWSAPI_ORG_URL_EVERYTHING;

    if (UI_CATEGORIES.includes(lowerTopic)) {
        url = NEWSAPI_ORG_URL_TOP;
        params.set('category', lowerTopic);
        params.set('country', 'za');
    } else if (lowerTopic === 'latest' || lowerTopic === 'top') {
        url = NEWSAPI_ORG_URL_TOP;
        params.set('country', 'za');
    } else {
        params.set('q', topic);
        params.set('sortBy', 'relevancy');
    }
    
    const response = await fetch(`${url}?${params.toString()}`);
    if (!response.ok) {
        const errorData: NewsApiResponse = await response.json();
        throw new Error(errorData?.message || `NewsAPI.org request failed with status ${response.status}`);
    }
    const data: NewsApiResponse = await response.json();

    if (data.status !== 'ok' || !data.articles) return [];
    
    return data.articles
        .filter(article => !isPaywalled(article) && article.title && article.url)
        .map((article): Article => ({
            title: article.title,
            summary: article.description || 'No summary available.',
            fullContent: article.content || article.description || 'Full content not available.',
            category: UI_CATEGORIES.find(c => c === lowerTopic)?.toUpperCase() || 'General',
            imageUrl: article.urlToImage || `https://picsum.photos/seed/${encodeURIComponent(article.title)}/800/600`,
            sources: [{ web: { uri: article.url, title: article.source.name || new URL(article.url).hostname }}],
        }));
}


// --- Main Exported Function ---
export async function fetchNews(topic: string): Promise<Article[]> {
  try {
    const [newsDataResult, newsApiResult] = await Promise.allSettled([
      fetchFromNewsData(topic),
      fetchFromNewsApi(topic)
    ]);

    let allArticles: Article[] = [];

    if (newsDataResult.status === 'fulfilled') {
      allArticles.push(...newsDataResult.value);
    } else {
      console.error("Failed to fetch from NewsData.io:", newsDataResult.reason);
    }

    if (newsApiResult.status === 'fulfilled') {
      allArticles.push(...newsApiResult.value);
    } else {
      console.error("Failed to fetch from NewsAPI.org:", newsApiResult.reason);
    }
    
    if (allArticles.length === 0) {
      if (newsDataResult.status === 'rejected' && newsApiResult.status === 'rejected') {
        throw new Error('Could not fetch news from any source.');
      }
      return []; // Return empty array if no results but no critical error
    }
    
    // Deduplicate articles based on title
    const uniqueArticles = Array.from(new Map(allArticles.map(article => [article.title.toLowerCase(), article])).values());
    
    return shuffleArray(uniqueArticles).slice(0, 20); // Limit to 20 total articles

  } catch (error) {
    console.error("Error in fetchNews aggregator:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred while fetching news from sources.");
  }
}
