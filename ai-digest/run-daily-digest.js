#!/usr/bin/env node

/**
 * Daily AI Digest Runner
 * This script runs the complete daily workflow:
 * 1. Collect tweets from monitored accounts
 * 2. Analyze content for business relevance
 * 3. Generate content ideas
 * 4. Create digest and send to Chris
 */

const fs = require('fs').promises;
const path = require('path');

// Import our modules
// const TwitterCollector = require('./collectors/browser-twitter');
const ContentAnalyzer = require('./analyzers/content-analyzer');
const DailyDigestGenerator = require('./generators/daily-digest');

async function runDailyDigest() {
    const today = new Date().toISOString().split('T')[0];
    const startTime = new Date();
    
    console.log(`🤖 Starting AI Digest for ${today} at ${startTime.toLocaleString('en-GB')}`);
    
    try {
        // Step 1: Collect tweets (using sample data for now until browser issues resolved)
        console.log('📡 Collecting tweets from AI accounts...');
        
        // For now, we'll use the sample data generator
        const { generateSampleData } = require('./test-sample-data');
        await generateSampleData();
        console.log('✓ Tweet collection completed (sample data)');
        
        // Step 2: Analyze content
        console.log('🧠 Analyzing content for business insights...');
        const analyzer = new ContentAnalyzer();
        const analysisResult = await analyzer.processDay(today);
        
        if (!analysisResult) {
            throw new Error('Content analysis failed');
        }
        console.log(`✓ Analysis completed: ${analysisResult.content_ideas.twitter.length} Twitter + ${analysisResult.content_ideas.linkedin.length} LinkedIn + ${analysisResult.content_ideas.youtube.length} YouTube ideas`);
        
        // Step 3: Generate digest
        console.log('📝 Generating daily digest...');
        const digestGenerator = new DailyDigestGenerator();
        const digest = await digestGenerator.generateDigest(today);
        
        console.log(`✓ Digest generated: ${digest.path}`);
        
        // Step 4: Send Telegram notification
        console.log('📱 Sending Telegram summary...');
        // TODO: Use the message tool to send digest.telegram to Chris
        console.log('Telegram message:');
        console.log('---');
        console.log(digest.telegram);
        console.log('---');
        
        // Step 5: Update memory
        console.log('💾 Updating daily memory...');
        await updateDailyMemory(today, analysisResult);
        
        const endTime = new Date();
        const duration = Math.round((endTime - startTime) / 1000);
        
        console.log(`✅ Daily digest completed in ${duration} seconds`);
        console.log(`📄 Full digest: ${digest.path}`);
        
        return {
            success: true,
            date: today,
            duration,
            stats: {
                accounts: analysisResult.accounts.length,
                posts: analysisResult.accounts.reduce((sum, acc) => sum + acc.relevant_posts.length, 0),
                ideas: analysisResult.content_ideas.twitter.length + analysisResult.content_ideas.linkedin.length + analysisResult.content_ideas.youtube.length
            },
            digestPath: digest.path
        };
        
    } catch (error) {
        console.error(`❌ Daily digest failed:`, error);
        
        // TODO: Send error notification to Chris via Telegram
        console.log('Error notification should be sent to Chris');
        
        return {
            success: false,
            error: error.message,
            date: today
        };
    }
}

async function updateDailyMemory(date, analysisResult) {
    try {
        const memoryDir = path.join(__dirname, '../memory');
        await fs.mkdir(memoryDir, { recursive: true });
        
        const memoryPath = path.join(memoryDir, `${date}.md`);
        
        const topInsights = analysisResult.accounts
            .flatMap(acc => acc.relevant_posts)
            .sort((a, b) => b.relevance_score - a.relevance_score)
            .slice(0, 3);
        
        let memoryContent = `# ${date} - AI Digest Summary\n\n`;
        memoryContent += `## Key Business Insights\n`;
        
        topInsights.forEach((post, i) => {
            memoryContent += `${i + 1}. **${post.text.substring(0, 100)}...**\n`;
            memoryContent += `   - Categories: ${post.categories.join(', ')}\n`;
            memoryContent += `   - Business relevance: ${post.relevance_score}/5\n\n`;
        });
        
        memoryContent += `## Content Generated\n`;
        memoryContent += `- Twitter threads: ${analysisResult.content_ideas.twitter.length}\n`;
        memoryContent += `- LinkedIn posts: ${analysisResult.content_ideas.linkedin.length}\n`;
        memoryContent += `- YouTube tutorials: ${analysisResult.content_ideas.youtube.length}\n\n`;
        
        memoryContent += `## Top Performing Accounts\n`;
        const topAccounts = analysisResult.accounts
            .sort((a, b) => b.content_opportunities - a.content_opportunities)
            .slice(0, 5);
            
        topAccounts.forEach(account => {
            if (account.relevant_posts.length > 0) {
                memoryContent += `- **@${account.username}**: ${account.relevant_posts.length} relevant posts, ${account.content_opportunities} content opportunities\n`;
            }
        });
        
        await fs.writeFile(memoryPath, memoryContent);
        console.log(`✓ Memory updated: ${memoryPath}`);
        
    } catch (error) {
        console.error('Failed to update daily memory:', error);
        // Don't fail the whole process for memory updates
    }
}

// CLI usage
if (require.main === module) {
    runDailyDigest()
        .then(result => {
            if (result.success) {
                console.log('\n🎉 Daily AI digest completed successfully!');
                process.exit(0);
            } else {
                console.log('\n💥 Daily AI digest failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runDailyDigest };