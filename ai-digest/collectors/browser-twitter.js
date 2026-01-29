#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class BrowserTwitterCollector {
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
            return true;
        } catch (error) {
            console.error('Failed to load config:', error);
            return false;
        }
    }

    async collectFromAccount(account, browser) {
        console.log(`Collecting from @${account.username}...`);
        
        try {
            // Navigate to user profile
            const url = `https://twitter.com/${account.username}`;
            await browser.navigate({ targetUrl: url });
            
            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Take snapshot to analyze tweets
            const snapshot = await browser.snapshot({ refs: 'aria' });
            
            // Extract tweet content using CSS selectors or text analysis
            // This would parse the snapshot content to find tweets
            const tweets = this.extractTweetsFromSnapshot(snapshot);
            
            const accountData = {
                username: account.username,
                description: account.description,
                category: account.category,
                priority: account.priority,
                posts: tweets,
                collected_at: new Date().toISOString(),
                source_url: url
            };

            // Save individual account data
            const filename = `${account.username}.json`;
            const filepath = path.join(this.outputDir, filename);
            await fs.writeFile(filepath, JSON.stringify(accountData, null, 2));
            
            return accountData;
        } catch (error) {
            console.error(`Failed to collect from @${account.username}:`, error);
            return null;
        }
    }

    extractTweetsFromSnapshot(snapshot) {
        // Parse snapshot content to extract tweets
        // This would look for tweet patterns in the HTML structure
        const tweets = [];
        
        // Implementation would parse snapshot.content or snapshot.elements
        // to find tweet elements and extract:
        // - Tweet text
        // - Timestamp
        // - Engagement metrics
        // - Links/media
        
        return tweets;
    }

    async collectAll() {
        if (!await this.loadConfig()) {
            throw new Error('Failed to load configuration');
        }

        // This would use the actual browser tool
        const { browser } = require('../../tools/browser-helper');
        
        try {
            await browser.start({ profile: 'clawd' });
            
            const results = [];
            
            // Process high priority accounts first
            const highPriority = this.accounts.filter(acc => acc.priority === 'high');
            const otherPriority = this.accounts.filter(acc => acc.priority !== 'high');
            
            console.log(`Processing ${highPriority.length} high priority accounts...`);
            
            for (const account of highPriority) {
                const data = await this.collectFromAccount(account, browser);
                if (data) results.push(data);
                
                // Wait between accounts to avoid rate limiting
                await this.sleep(2000);
            }
            
            console.log(`Processing ${otherPriority.length} other accounts...`);
            
            for (const account of otherPriority) {
                const data = await this.collectFromAccount(account, browser);
                if (data) results.push(data);
                
                await this.sleep(2000);
            }
            
            // Save combined results
            const summaryPath = path.join(this.outputDir, '_summary.json');
            await fs.writeFile(summaryPath, JSON.stringify({
                collection_date: new Date().toISOString(),
                accounts_processed: results.length,
                total_posts: results.reduce((sum, acc) => sum + (acc.posts?.length || 0), 0),
                accounts: results
            }, null, 2));
            
            console.log(`Collection complete: ${results.length} accounts processed`);
            return results;
            
        } finally {
            await browser.stop();
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = BrowserTwitterCollector;