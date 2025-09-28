export interface Article {
  title: string;
  summary: string;
  fullContent: string;
  category: string;
  imageUrl: string;
  sources: GroundingChunk[];
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}