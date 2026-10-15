import { Song } from '../types';
import { convertImageUrlToBase64 } from './imageConverter';

export const FEATURED_SAMPLE_SONGS: Song[] = [
  {
    trackId: 1735165201,
    trackName: 'hate that i made you love me',
    artistName: 'Ariana Grande',
    collectionName: 'eternal sunshine',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/56/f4/96/56f49612-02dd-83f4-44fe-d2118cc70707/26UMGIM51129.rgb.jpg/100x100bb.jpg',
    artworkUrl600: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/56/f4/96/56f49612-02dd-83f4-44fe-d2118cc70707/26UMGIM51129.rgb.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d5/fe/f5/d5fef54e-4f18-d7ba-c9bb-362241cf8a65/mzaf_11303867086846505703.plus.aac.p.m4a'
  },
  {
    trackId: 559725838,
    trackName: 'Thinkin Bout You',
    artistName: 'Frank Ocean',
    collectionName: 'channel ORANGE',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/83/80/f8/8380f8e9-f2f2-c179-883a-8ceee4b3605c/12UMGIM19550.rgb.jpg/100x100bb.jpg',
    artworkUrl600: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/83/80/f8/8380f8e9-f2f2-c179-883a-8ceee4b3605c/12UMGIM19550.rgb.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/e0/75/17/e07517c2-f173-9878-a8d6-63d1ce866a22/mzaf_4413149457630248888.plus.aac.p.m4a'
  },
  {
    trackId: 1098361099,
    trackName: 'No Surprises',
    artistName: 'Radiohead',
    collectionName: 'OK Computer',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/3d/8a/a5/3d8aa5ee-1250-9d10-449e-b816223b56cf/634904078120.png/100x100bb.jpg',
    artworkUrl600: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/3d/8a/a5/3d8aa5ee-1250-9d10-449e-b816223b56cf/634904078120.png/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/5a/09/b8/5a09b837-77eb-7f41-35b8-d98c3ee06579/mzaf_7493033502846875953.plus.aac.p.m4a'
  },
  {
    trackId: 1440810841,
    trackName: 'Video Games',
    artistName: 'Lana Del Rey',
    collectionName: 'Born to Die',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/c4/62/7b/c4627b08-8df0-8d54-8e42-7a28e35cf8dc/11UMGIM33146.rgb.jpg/100x100bb.jpg',
    artworkUrl600: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/c4/62/7b/c4627b08-8df0-8d54-8e42-7a28e35cf8dc/11UMGIM33146.rgb.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/cf/ae/30/cfae30a6-5778-be7c-a496-e2fc318744b4/mzaf_10793666270459522198.plus.aac.p.m4a'
  }
];

export function getHighResArtwork(url: string, size = 600): string {
  if (!url) return '';
  return url.replace(/100x100bb\.(jpg|png)/, `${size}x${size}bb.$1`);
}

export async function searchSongs(query: string, limit = 12): Promise<Song[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  interface ITunesResult {
    trackId: number;
    trackName?: string;
    trackCensoredName?: string;
    artistName?: string;
    collectionName?: string;
    artworkUrl100?: string;
    previewUrl?: string;
  }

  interface DeezerResult {
    id: number;
    title?: string;
    artist?: { name?: string };
    album?: { title?: string; cover_medium?: string; cover_big?: string };
    preview?: string;
  }

  const itunesEndpoint = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&country=US&media=music&entity=song&limit=${limit}`;
  const deezerEndpoint = `https://api.deezer.com/search?q=${encodeURIComponent(trimmed)}&limit=${limit}`;

  const searchITunes = async (): Promise<Song[]> => {
    const response = await fetch(itunesEndpoint);
    if (!response.ok) {
      throw new Error(`iTunes API responded with status ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data.results)) return [];

    return data.results
      .filter((item: ITunesResult) => item.trackName || item.trackCensoredName)
      .map((item: ITunesResult) => {
        const rawArtwork = item.artworkUrl100 || '';
        return {
          trackId: `itunes-${item.trackId}`,
          trackName: item.trackName || item.trackCensoredName || 'Untitled Song',
          artistName: item.artistName || 'Unknown Artist',
          collectionName: item.collectionName || '',
          artworkUrl100: rawArtwork,
          artworkUrl600: getHighResArtwork(rawArtwork, 600),
          previewUrl: item.previewUrl
        };
      });
  };

  const searchDeezer = async (): Promise<Song[]> => {
    type DeezerPayload = { data?: DeezerResult[] };

    const data = await new Promise<DeezerPayload>((resolve, reject) => {
      const callbackName = `pataphorDeezer_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement('script');
      const cleanup = () => {
        Reflect.deleteProperty(window, callbackName);
        script.remove();
      };
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error('Deezer API request timed out'));
      }, 8000);

      Reflect.set(window, callbackName, (payload: DeezerPayload) => {
        window.clearTimeout(timeout);
        cleanup();
        resolve(payload);
      });
      script.onerror = () => {
        window.clearTimeout(timeout);
        cleanup();
        reject(new Error('Deezer API request failed'));
      };
      script.src = `${deezerEndpoint}&output=jsonp&callback=${callbackName}`;
      document.head.appendChild(script);
    });

    if (!Array.isArray(data.data)) return [];

    return data.data
      .filter((item: DeezerResult) => item.title && item.artist?.name)
      .map((item: DeezerResult) => ({
        trackId: `deezer-${item.id}`,
        trackName: item.title || 'Untitled Song',
        artistName: item.artist?.name || 'Unknown Artist',
        collectionName: item.album?.title || '',
        artworkUrl100: item.album?.cover_medium || '',
        artworkUrl600: item.album?.cover_big || item.album?.cover_medium || '',
        previewUrl: item.preview
      }));
  };

  const [itunesResult, deezerResult] = await Promise.allSettled([searchITunes(), searchDeezer()]);
  const providerErrors = [itunesResult, deezerResult]
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map(result => result.reason);
  const songs = [
    ...(deezerResult.status === 'fulfilled' ? deezerResult.value : []),
    ...(itunesResult.status === 'fulfilled' ? itunesResult.value : [])
  ];

  const uniqueSongs = songs.filter((song, index, allSongs) => {
    const key = `${song.trackName.toLowerCase()}-${song.artistName.toLowerCase()}`;
    return allSongs.findIndex(candidate =>
      `${candidate.trackName.toLowerCase()}-${candidate.artistName.toLowerCase()}` === key
    ) === index;
  });

  if (uniqueSongs.length > 0) {
    return uniqueSongs.slice(0, limit);
  }

  console.warn('Music catalog search failed:', providerErrors);
  const lower = trimmed.toLowerCase();
  const matched = FEATURED_SAMPLE_SONGS.filter(
    s => s.trackName.toLowerCase().includes(lower) || s.artistName.toLowerCase().includes(lower)
  );
  if (matched.length > 0) return matched;
  throw providerErrors[0] || new Error('Music catalogs returned no results');
}

/**
 * Enhances a selected song with a cached base64 data URL for smooth, CORS-free PNG generation.
 */
export async function prepareSongForJournal(song: Song): Promise<Song> {
  const bestUrl = song.artworkUrl600 || song.artworkUrl100;
  try {
    const dataUrl = await convertImageUrlToBase64(bestUrl);
    return {
      ...song,
      artworkDataUrl: dataUrl
    };
  } catch (err) {
    console.warn('Failed to convert artwork to dataUrl, falling back to direct URL:', err);
    return {
      ...song,
      artworkDataUrl: bestUrl
    };
  }
}
