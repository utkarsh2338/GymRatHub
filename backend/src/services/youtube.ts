import axios from "axios";

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

// In-memory cache to conserve API quota (Search requests cost 100 units each)
const youtubeCache: Record<string, { videos: YouTubeVideo[]; timestamp: number }> = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function searchTutorialVideos(exerciseName: string): Promise<YouTubeVideo[]> {
  const query = `${exerciseName} exercise form tutorial`;
  const cached = youtubeCache[query];
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[YouTube Service] Cache hit for: "${query}"`);
    return cached.videos;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("[YouTube Service] YOUTUBE_API_KEY is not defined. Using mock fallback videos.");
    return getMockVideos(exerciseName);
  }

  try {
    console.log(`[YouTube Service] Fetching API results for: "${query}"`);
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        maxResults: 3,
        key: apiKey,
      },
    });

    const items = response.data.items || [];
    const videos: YouTubeVideo[] = items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "",
      channelTitle: item.snippet.channelTitle,
    }));

    if (videos.length > 0) {
      youtubeCache[query] = { videos, timestamp: Date.now() };
      return videos;
    } else {
      return getMockVideos(exerciseName);
    }
  } catch (error: any) {
    console.error(`[YouTube Service] API error:`, error.response?.data || error.message);
    console.warn("[YouTube Service] Falling back to mock videos due to API failure.");
    return getMockVideos(exerciseName);
  }
}

function getMockVideos(exerciseName: string): YouTubeVideo[] {
  // Return some high-quality fitness channels or generic tutorial search fallbacks
  // Note: we can use actual working videoIds of famous tutorials
  const videoPool: Record<string, YouTubeVideo[]> = {
    "barbell bench press": [
      {
        videoId: "rT7DgcrgWys",
        title: "How To Bench Press: Golden Rules for Strength and Muscle",
        thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
        channelTitle: "Athlean-X"
      },
      {
        videoId: "vcBig73ojEs",
        title: "How to Bench Press for Great Results (Step-by-Step)",
        thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
        channelTitle: "Jeff Nippard"
      }
    ],
    "deadlift": [
      {
        videoId: "wYREQvRyKQY",
        title: "How To Deadlift: Step-By-Step Tutorial",
        thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80",
        channelTitle: "Alan Thrall"
      }
    ],
    "barbell back squat": [
      {
        videoId: "gcNh17Ckjgg",
        title: "How to Squat: Proper Form, Depth & Setup",
        thumbnail: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80",
        channelTitle: "Buff Dudes"
      }
    ]
  };

  const normalized = exerciseName.toLowerCase().trim();
  if (videoPool[normalized]) {
    return videoPool[normalized];
  }

  // Generic fallback if we don't have matching predefined videos
  return [
    {
      videoId: "aclHkVaku9U",
      title: `${exerciseName} — Proper Form Tutorial`,
      thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80",
      channelTitle: "GymRat Hub Coach",
    },
  ];
}
