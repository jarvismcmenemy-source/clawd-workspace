#!/usr/bin/env node

// Generate sample data to test the AI digest system

const fs = require('fs').promises;
const path = require('path');

async function generateSampleData() {
    const today = new Date().toISOString().split('T')[0];
    const rawDir = path.join(__dirname, 'data/raw', today);
    
    await fs.mkdir(rawDir, { recursive: true });
    
    const sampleAccounts = [
        {
            username: 'karpathy',
            description: 'ex-Tesla AI, teaches LLMs',
            category: 'technical',
            priority: 'high',
            posts: [
                {
                    id: 'karpathy_1',
                    text: 'Just released a new tutorial on building transformers from scratch. Key insight: most people overcomplicate the attention mechanism. Here\'s the minimal viable implementation that actually works in production.',
                    timestamp: new Date().toISOString(),
                    engagement: { likes: 1200, retweets: 340, replies: 89 },
                    links: ['https://example.com/transformer-tutorial'],
                    mentions: []
                },
                {
                    id: 'karpathy_2', 
                    text: 'The biggest mistake I see in AI implementations: businesses trying to automate everything at once. Start with ONE high-value process, nail it, then expand. ROI comes from focus, not breadth.',
                    timestamp: new Date().toISOString(),
                    engagement: { likes: 890, retweets: 200, replies: 45 }
                }
            ],
            collected_at: new Date().toISOString()
        },
        {
            username: 'gregisenberg',
            description: 'startup ideas daily',
            category: 'business', 
            priority: 'high',
            posts: [
                {
                    id: 'greg_1',
                    text: 'Billion dollar idea: AI-powered local business automation. Think: auto-responding to customer inquiries, scheduling, basic bookkeeping. Small businesses will pay $200/month for this. The market is HUGE.',
                    timestamp: new Date().toISOString(),
                    engagement: { likes: 2100, retweets: 580, replies: 156 }
                },
                {
                    id: 'greg_2',
                    text: 'I just helped a restaurant increase revenue 40% with simple AI automation: automated social media posts, smart ordering system, customer feedback analysis. Total setup cost: $500. Monthly savings: $2000.',
                    timestamp: new Date().toISOString(),
                    engagement: { likes: 1800, retweets: 420, replies: 89 }
                }
            ],
            collected_at: new Date().toISOString()
        },
        {
            username: 'levelsio',
            description: 'ships games, no VC',
            category: 'business',
            priority: 'high', 
            posts: [
                {
                    id: 'levels_1',
                    text: 'Made $50K last month with an AI tool I built in 2 days using Claude and Cursor. The tool helps e-commerce stores write product descriptions automatically. Sometimes the simple ideas win.',
                    timestamp: new Date().toISOString(),
                    engagement: { likes: 3200, retweets: 890, replies: 234 }
                }
            ],
            collected_at: new Date().toISOString()
        }
    ];

    // Save sample data
    for (const account of sampleAccounts) {
        const filename = `${account.username}.json`;
        const filepath = path.join(rawDir, filename);
        await fs.writeFile(filepath, JSON.stringify(account, null, 2));
    }

    // Create summary
    const summary = {
        collection_date: new Date().toISOString(),
        accounts_processed: sampleAccounts.length,
        total_posts: sampleAccounts.reduce((sum, acc) => sum + acc.posts.length, 0),
        accounts: sampleAccounts
    };

    const summaryPath = path.join(rawDir, '_summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`Sample data generated for ${today}`);
    console.log(`Accounts: ${summary.accounts_processed}`);
    console.log(`Posts: ${summary.total_posts}`);
    
    return { date: today, summary };
}

// Run the sample data generation
if (require.main === module) {
    generateSampleData()
        .then(result => {
            console.log('Sample data generation completed');
            console.log(`Data saved to: ai-digest/data/raw/${result.date}/`);
        })
        .catch(error => {
            console.error('Failed to generate sample data:', error);
            process.exit(1);
        });
}

module.exports = { generateSampleData };