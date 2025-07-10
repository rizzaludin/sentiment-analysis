'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FileText,
  CheckCircle,
  Smile,
  Frown,
  Meh,
  Sparkles,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import type { AnalyzedComment } from '@/lib/types';
import { getInsight } from '@/app/actions';

type ResultsViewProps = {
  stats: {
    total: number;
    valid: number;
    positive: number;
    negative: number;
    neutral: number;
  };
  analyzedComments: AnalyzedComment[];
  onReset: () => void;
};

function StatsGrid({ stats }: { stats: ResultsViewProps['stats'] }) {
  const statItems = [
    { title: 'Total Rows', value: stats.total, icon: FileText, color: 'text-blue-500' },
    { title: 'Analyzed Comments', value: stats.valid, icon: CheckCircle, color: 'text-purple-500' },
    { title: 'Positive', value: stats.positive, icon: Smile, color: 'text-green-500' },
    { title: 'Negative', value: stats.negative, icon: Frown, color: 'text-red-500' },
    { title: 'Neutral', value: stats.neutral, icon: Meh, color: 'text-yellow-500' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 text-muted-foreground ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SentimentChart({ stats }: { stats: ResultsViewProps['stats'] }) {
    const data = [
        { name: 'Sentiments', Positive: stats.positive, Negative: stats.negative, Neutral: stats.neutral },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>A visual breakdown of comment sentiments.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                        }}
                    />
                    <Legend />
                    <Bar dataKey="Positive" fill="hsl(var(--chart-2))" stackId="a" />
                    <Bar dataKey="Negative" fill="hsl(var(--chart-1))" stackId="a" />
                    <Bar dataKey="Neutral" fill="hsl(var(--chart-4))" stackId="a" />
                </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function InsightCard({ analyzedComments }: { analyzedComments: AnalyzedComment[] }) {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetInsight = async () => {
    setIsLoading(true);
    const sentimentDataString = analyzedComments
      .map(c => `Comment: ${c.comment.substring(0, 100)}... | Polarity: ${c.polarity.toFixed(2)}`)
      .join('\n');
    const result = await getInsight(sentimentDataString);
    setInsight(result);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          AI-Powered Insight
        </CardTitle>
        <CardDescription>
          Get a summary of the sentiment trends in your data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insight ? (
          <p className="text-sm text-foreground bg-primary/5 p-4 rounded-md border border-primary/20">{insight}</p>
        ) : (
          <div className="flex justify-center">
            <Button onClick={handleGetInsight} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Insight'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResultsTable({ comments }: { comments: AnalyzedComment[] }) {
  const getBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'default';
      case 'negative':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyzed Comments</CardTitle>
        <CardDescription>A preview of the analyzed comments (showing first 100).</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[400px] overflow-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm">
              <TableRow>
                <TableHead>Original Comment</TableHead>
                <TableHead>Cleaned Comment</TableHead>
                <TableHead className="text-center">Sentiment</TableHead>
                <TableHead className="text-right">Polarity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.slice(0, 100).map((c, i) => (
                <TableRow key={`${c.originalIndex}-${i}`}>
                  <TableCell className="max-w-xs truncate">{c.originalComment}</TableCell>
                  <TableCell className="max-w-xs truncate">{c.comment}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getBadgeVariant(c.sentiment)}>{c.sentiment}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{c.polarity.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}


export function ResultsView({ stats, analyzedComments, onReset }: ResultsViewProps) {
    const sortedComments = useMemo(() => 
        [...analyzedComments].sort((a,b) => Math.abs(b.polarity) - Math.abs(a.polarity)),
        [analyzedComments]
    );

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analysis Complete</h2>
        <Button variant="outline" onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Start New Analysis
        </Button>
      </div>
      <StatsGrid stats={stats} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <SentimentChart stats={stats} />
        </div>
        <InsightCard analyzedComments={analyzedComments} />
      </div>
      <ResultsTable comments={sortedComments} />
    </div>
  );
}
