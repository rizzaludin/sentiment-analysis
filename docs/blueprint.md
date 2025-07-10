# **App Name**: TikTok Sentiment Scrubber

## Core Features:

- Data Loading & Parsing: Load and parse messy TikTok comment data from a CSV file, handling inconsistent formatting and encoding issues.
- Text Cleaning: Cleanse comment text by removing corrupted characters, emojis, URLs, mentions, hashtags, and special symbols, and standardizing case.
- Data Deduplication: Deduplicate comments based on cleaned text to ensure unbiased sentiment analysis.
- Sentiment Analysis: Employ the TextBlob library, a pre-trained model, to derive sentiment scores (polarity and subjectivity) from cleaned comment text.
- Sentiment Visualization: Present the distribution of sentiment polarity scores (positive, neutral, negative) using a bar chart.
- Statistical Summary: Calculate and display key statistics like the number of valid comments and counts for each sentiment category.
- Sentiment Insight Tool: Provide insight into the range of sentiments being expressed in the data set, as a tool for brand awareness or campaign success.

## Style Guidelines:

- Primary color: Distinct purple (#9C27B0) to convey creativity and trendiness, aligning with TikTok's brand identity without directly mimicking it.
- Background color: Very light purple (#F3E5F5), nearly white, provides a clean backdrop.
- Accent color: Blue-violet (#7E57C2), chosen to provide visual interest and contrast against the purple, indicating interactive elements.
- Body and headline font: 'Inter', a sans-serif font known for its readability and clean design, which helps ensure comments and stats are easily readable.
- Minimalistic, geometric icons to represent different data processing steps and sentiment categories.
- Clean and organized layout with clear sections for data loading, cleaning, analysis, and visualization.
- Subtle animations for loading data and displaying sentiment results.