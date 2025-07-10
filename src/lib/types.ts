export interface CommentData {
  [key: string]: string | number;
}

export interface CleanedComment {
  originalIndex: number;
  comment: string;
}

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  polarity: number;
}

export interface AnalyzedComment extends CleanedComment, SentimentResult {
  originalComment: string;
}
