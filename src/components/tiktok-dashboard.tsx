'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { cleanText } from '@/lib/text-cleaner';
import { getSentimentsForBatch } from '@/app/actions';
import type { CommentData, CleanedComment, AnalyzedComment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResultsView } from '@/components/results-view';
import { UploadCloud, FileWarning, Bot, Columns, BarChart2 } from 'lucide-react';

type Stage = 'initial' | 'selecting_column' | 'processing' | 'done' | 'error';
const BATCH_SIZE = 50;

export function TiktokDashboard() {
  const [stage, setStage] = useState<Stage>('initial');
  const [error, setError] = useState<string>('');
  const [parsedData, setParsedData] = useState<CommentData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [analyzedComments, setAnalyzedComments] = useState<AnalyzedComment[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const resetState = () => {
    setStage('initial');
    setError('');
    setParsedData([]);
    setHeaders([]);
    setSelectedColumn('');
    setAnalyzedComments([]);
    setProgress(0);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStage('selecting_column');
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.log('CSV Parsing Errors:', results.errors);
            toast({
              variant: 'destructive',
              title: 'CSV Parsing Error',
              description: 'Could not parse the file. Please check the format.',
            });
            setStage('error');
            setError('Failed to parse the CSV file. Please ensure it is correctly formatted.');
            return;
          }
          setParsedData(results.data as CommentData[]);
          setHeaders(results.meta.fields || []);
        },
        error: (err) => {
          console.log('PapaParse Error:', err);
          setStage('error');
          setError('A critical error occurred while parsing the file.');
        },
      });
    }
  };

  const processData = useCallback(async () => {
    setStage('processing');
    setProgress(0);

    const commentsWithIndex: { originalIndex: number; comment: string }[] = parsedData
      .map((row, index) => ({
        originalIndex: index,
        comment: row[selectedColumn]?.toString() || '',
      }))
      .filter(item => item.comment.trim() !== '');

    const cleanedComments: CleanedComment[] = commentsWithIndex.map(item => ({
      ...item,
      comment: cleanText(item.comment),
    }));

    const uniqueCommentsMap = new Map<string, CleanedComment>();
    cleanedComments.forEach(item => {
      if (!uniqueCommentsMap.has(item.comment)) {
        uniqueCommentsMap.set(item.comment, item);
      }
    });
    const uniqueComments = Array.from(uniqueCommentsMap.values());

    if (uniqueComments.length === 0) {
      setStage('error');
      setError('No valid comments found to analyze in the selected column.');
      return;
    }

    let allResults: AnalyzedComment[] = [];
    for (let i = 0; i < uniqueComments.length; i += BATCH_SIZE) {
      const batch = uniqueComments.slice(i, i + BATCH_SIZE);
      const commentTexts = batch.map(c => c.comment);
      
      try {
        const sentimentResults = await getSentimentsForBatch(commentTexts);
        const batchResults = batch.map((cleaned, index) => ({
          ...cleaned,
          ...sentimentResults[index],
          originalComment: parsedData[cleaned.originalIndex][selectedColumn] as string,
        }));
        allResults = [...allResults, ...batchResults];
        setAnalyzedComments(allResults);
        setProgress(((i + BATCH_SIZE) / uniqueComments.length) * 100);
      } catch (e) {
        console.log('Error processing batch:', e);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'An error occurred during sentiment analysis. Please try again.',
        });
        setStage('error');
        setError('An error occurred during analysis. Not all comments could be processed.');
        return;
      }
    }

    setStage('done');
  }, [parsedData, selectedColumn, toast]);

  const stats = useMemo(() => {
    if (stage !== 'done') return null;
    const total = parsedData.length;
    const valid = analyzedComments.length;
    const positive = analyzedComments.filter(c => c.sentiment === 'positive').length;
    const negative = analyzedComments.filter(c => c.sentiment === 'negative').length;
    const neutral = analyzedComments.filter(c => c.sentiment === 'neutral').length;
    return { total, valid, positive, negative, neutral };
  }, [stage, parsedData.length, analyzedComments]);


  const renderContent = () => {
    switch (stage) {
      case 'initial':
        return (
          <div className="text-center p-8">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Upload your CSV file</h3>
            <p className="mt-1 text-sm text-muted-foreground">Drop your TikTok comment data here or click to upload.</p>
            <Button asChild className="mt-4">
              <label htmlFor="file-upload">
                Select File
                <input id="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
              </label>
            </Button>
          </div>
        );
      case 'selecting_column':
        return (
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Columns className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-semibold">Select Comment Column</h3>
              <p className="text-muted-foreground">Choose the column from your CSV that contains the comments.</p>
              <Select onValueChange={setSelectedColumn} value={selectedColumn}>
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder="Select a column..." />
                </SelectTrigger>
                <SelectContent>
                  {headers.map(header => (
                    <SelectItem key={header} value={header}>{header}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={processData} disabled={!selectedColumn}>Analyze Comments</Button>
            </div>
          </CardContent>
        );
      case 'processing':
        return (
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative">
                    <BarChart2 className="h-10 w-10 text-primary" />
                    <Bot className="absolute -bottom-1 -right-2 h-5 w-5 text-accent animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold">Analyzing Sentiments...</h3>
                <p className="text-muted-foreground">Our AI is processing your comments. Please wait.</p>
                <Progress value={progress} className="w-full max-w-sm" />
                <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
            </div>
          </CardContent>
        );
      case 'done':
        return stats && (
          <ResultsView
            stats={stats}
            analyzedComments={analyzedComments}
            onReset={resetState}
          />
        );
      case 'error':
        return (
          <CardContent className="p-6">
            <Alert variant="destructive">
              <FileWarning className="h-4 w-4" />
              <AlertTitle>An Error Occurred</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={resetState}>Start Over</Button>
            </div>
          </CardContent>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sentiment Analysis Dashboard</CardTitle>
        <CardDescription>
          {stage === 'initial' && 'Begin by uploading your TikTok comment data.'}
          {stage === 'selecting_column' && 'Prepare your data for analysis.'}
          {stage === 'processing' && 'Please wait while we analyze your data.'}
          {stage === 'done' && 'Review your sentiment analysis results.'}
          {stage === 'error' && 'Something went wrong. Please try again.'}
        </CardDescription>
      </CardHeader>
      {renderContent()}
    </Card>
  );
}
