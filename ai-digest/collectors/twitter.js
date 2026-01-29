#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class TwitterCollector {
    constructor() {
        this.accounts = [];
        this.outputDir = '';
    }

    async loadConfig() {
        try {
            const configPath = path.join(__dirname, '../config/accounts.json');
            const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
            this.accounts = config.twitter_accounts;
            
            const today = new Date().toISOString().split('T')[0];
            this.outputDir = path.join(__dirname, '../data/raw', today);
            await fs.mkdir(this.outputDir, { recursive: true });
            
            console.log(`Loaded ${this.accounts.length} accounts to monitor`);
        } catch (error) {
            console.error('Failed to load config:', error);
            process.exit(1);
        }
    }

    async collectFromAccount(account) {
        console.log(`Collecting from @${account.username}...`);
        
        try {
            // For now, we'll simulate the data structure
            // In production, this would use Twitter API or web scraping
            const mockData = {
                username: account.username,
                description: account.description,
                category: account.category,
                priority: account.priority,
                posts: [
                    // This would be populated with actual posts
                    {
                        id: 'mock_id',
                        text: 'Sample post content',
                        timestamp: new Date().toISOString(),
                        engagement: {
                            likes: 0,
                            retweets: 0,
                            replies: 0
                        },
                        links: [],
                        mentions: []
                    }
                ],
                collected_at: new Date().toISOString()
            };

            // Save individual account data
            const filename = `${account.username}.json`;
            const filepath = path.join(this.outputDir, filename);
            await fs.writeFile(filepath, JSON.stringify(mockData, null, 2));
            
            return mockData;
        } catch (error) {
            console.error(`Failed to collect from @${account.username}:`, error);
            return null;
        }
    }

    async collectAll() {
        await this.loadConfig();
        
        const results = [];
        
        // Process high priority accounts first
        const highPriority = this.accounts.filter(acc => acc.priority === 'high');
        const otherPriority = this.accounts.filter(acc => acc.priority !== 'high');
        
        console.log(`Processing ${highPriority.length} high priority accounts...`);
        
        for (const account of highPriority) {
            const data = await this.collectFromAccount(account);
            if (data) results.push(data);
            
            // Rate limiting - wait between requests
            await this.sleep(1000);
        }
        
        console.log(`Processing ${otherPriority.length} other accounts...`);
        
        for (const account of otherPriority) {
            const data = await this.collectFromAccount(account);
            if (data) results.push(data);
            
            await this.sleep(1000);
        }
        
        // Save combined results
        const summaryPath = path.join(this.outputDir, '_summary.json');
        await fs.writeFile(summaryPath, JSON.stringify({
            collection_date: new Date().toISOString(),
            accounts_processed: results.length,
            total_posts: results.reduce((sum, acc) => sum + acc.posts.length, 0),
            accounts: results
        }, null, 2));
        
        console.log(`Collection complete: ${results.length} accounts processed`);
        return results;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI usage
if (require.main === module) {
    const collector = new TwitterCollector();
    collector.collectAll()
        .then(() => console.log('Twitter collection completed'))
        .catch(error => {
            console.error('Collection failed:', error);
            process.exit(1);
        });
}

module.exports = TwitterCollector;