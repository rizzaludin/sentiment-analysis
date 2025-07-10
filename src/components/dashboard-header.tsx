import { MessageCircleHeart } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="mb-8 flex items-center gap-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <MessageCircleHeart className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h1 className="font-headline text-3xl font-bold text-foreground">TikTok Sentiment Scrubber</h1>
        <p className="text-muted-foreground">Clean, analyze, and visualize your TikTok comment data.</p>
      </div>
    </header>
  );
}
