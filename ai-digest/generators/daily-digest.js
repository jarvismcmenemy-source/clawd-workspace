#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class DailyDigestGenerator {
    constructor() {
        this.voiceTemplates = {};
    }

    async loadConfig() {
        try {
            const voicePath = path.join(__dirname, '../config/voice-templates.json');
            const voiceConfig = JSON.parse(await fs.readFile(voicePath, 'utf8'));
            this.voiceTemplates = voiceConfig.chris_voice_profile;
            return true;
        } catch (error) {
            console.error('Failed to load voice config:', error);
            return false;
        }
    }

    async generateMarkdownDigest(processedData) {
        const date = processedData.date;
        const totalPosts = processedData.accounts.reduce((sum, acc) => sum + acc.relevant_posts.length, 0);
        const totalIdeas = processedData.content_ideas.twitter.length + 
                          processedData.content_ideas.linkedin.length + 
                          processedData.content_ideas.youtube.length;

        let markdown = `# AI Digest - ${date}\n\n`;
        markdown += `**Generated:** ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}\n`;
        markdown += `**Posts analyzed:** ${totalPosts} | **Content ideas:** ${totalIdeas}\n\n`;

        // Top insights section
        markdown += `## 🔥 Top Business Insights\n\n`;
        
        const topPosts = processedData.accounts
            .flatMap(acc => acc.relevant_posts)
            .sort((a, b) => b.relevance_score - a.relevance_score)
            .slice(0, 5);

        topPosts.forEach((post, i) => {
            markdown += `**${i + 1}. ${this.extractKeyInsight(post.text)}**\n`;
            markdown += `- Source: @${this.findAccountForPost(post, processedData.accounts)}\n`;
            markdown += `- Business relevance: ${post.relevance_score}/5\n`;
            markdown += `- Categories: ${post.categories.join(', ')}\n\n`;
        });

        // Trending tools section
        markdown += `## 📈 Trending Tools & Updates\n\n`;
        
        const toolPosts = processedData.accounts
            .flatMap(acc => acc.relevant_posts)
            .filter(post => post.categories.includes('tool_updates'))
            .slice(0, 3);

        if (toolPosts.length > 0) {
            toolPosts.forEach((post, i) => {
                const toolName = this.extractToolName(post.text);
                markdown += `**${toolName}**\n`;
                markdown += `- ${this.summarizePost(post.text, 60)}\n`;
                markdown += `- Business application: ${this.suggestBusinessUse(post.text)}\n\n`;
            });
        } else {
            markdown += `*No major tool updates detected today*\n\n`;
        }

        // Content ideas section
        markdown += `## 💡 Ready-to-Use Content Ideas\n\n`;
        
        markdown += `### Twitter Threads (${processedData.content_ideas.twitter.length} ideas)\n`;
        processedData.content_ideas.twitter.slice(0, 3).forEach((idea, i) => {
            markdown += `**${i + 1}.** ${idea.hook || idea.concept}\n`;
            markdown += `- Engagement potential: ${idea.engagement_potential}\n`;
            markdown += `- Format: ${idea.format}\n\n`;
        });

        markdown += `### LinkedIn Posts (${processedData.content_ideas.linkedin.length} ideas)\n`;
        processedData.content_ideas.linkedin.slice(0, 3).forEach((idea, i) => {
            markdown += `**${i + 1}.** ${idea.title || idea.concept}\n`;
            markdown += `- Type: Professional insight\n`;
            markdown += `- Engagement potential: ${idea.engagement_potential}\n\n`;
        });

        markdown += `### YouTube Tutorials (${processedData.content_ideas.youtube.length} ideas)\n`;
        processedData.content_ideas.youtube.slice(0, 3).forEach((idea, i) => {
            markdown += `**${i + 1}.** ${idea.title}\n`;
            markdown += `- Difficulty: ${idea.difficulty}\n`;
            markdown += `- Business value: ${idea.business_value}\n\n`;
        });

        // Account highlights
        markdown += `## 📊 Account Highlights\n\n`;
        
        const sortedAccounts = processedData.accounts
            .sort((a, b) => b.content_opportunities - a.content_opportunities)
            .slice(0, 5);

        sortedAccounts.forEach(account => {
            if (account.relevant_posts.length > 0) {
                markdown += `**@${account.username}** (${account.priority} priority)\n`;
                markdown += `- Relevant posts: ${account.relevant_posts.length}\n`;
                markdown += `- Content opportunities: ${account.content_opportunities}\n`;
                markdown += `- Top post: "${this.summarizePost(account.relevant_posts[0].text, 80)}"\n\n`;
            }
        });

        return markdown;
    }

    async generateTelegramDigest(processedData) {
        const date = processedData.date;
        const totalIdeas = processedData.content_ideas.twitter.length + 
                          processedData.content_ideas.linkedin.length + 
                          processedData.content_ideas.youtube.length;

        let message = `🤖 **AI Digest - ${date}**\n\n`;
        message += `📊 **${totalIdeas} content ideas** generated from ${processedData.accounts.length} accounts\n\n`;

        // Top 3 Twitter ideas ready to use
        message += `🐦 **Top Twitter Ideas:**\n`;
        processedData.content_ideas.twitter.slice(0, 3).forEach((idea, i) => {
            message += `${i + 1}. ${idea.hook || idea.concept}\n`;
        });

        // Top 2 YouTube tutorials 
        message += `\n📹 **YouTube Tutorials:**\n`;
        processedData.content_ideas.youtube.slice(0, 2).forEach((idea, i) => {
            message += `${i + 1}. ${idea.title}\n`;
        });

        message += `\n📋 Full digest: ai-digest/data/digests/${date}.md`;

        return message;
    }

    extractKeyInsight(text) {
        // Simple extraction of key business insight
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        return sentences[0]?.substring(0, 100) + '...' || 'Business insight detected';
    }

    summarizePost(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    extractToolName(text) {
        const toolPatterns = [
            /(\w+\.ai|\w+AI|\w+GPT)/gi,
            /Claude|ChatGPT|Gemini|Cursor|v0|Anthropic|OpenAI/gi,
            /new (\w+) tool/gi
        ];

        for (const pattern of toolPatterns) {
            const match = text.match(pattern);
            if (match) return match[0];
        }
        return 'AI Tool';
    }

    suggestBusinessUse(text) {
        const useCases = [
            'Content creation automation',
            'Customer service enhancement', 
            'Sales process optimization',
            'Marketing campaign development',
            'Business process automation',
            'Data analysis and insights'
        ];

        // Simple keyword matching to suggest use case
        const lowerText = text.toLowerCase();
        if (lowerText.includes('content') || lowerText.includes('writing')) return useCases[0];
        if (lowerText.includes('customer') || lowerText.includes('support')) return useCases[1];
        if (lowerText.includes('sales') || lowerText.includes('lead')) return useCases[2];
        if (lowerText.includes('marketing') || lowerText.includes('ads')) return useCases[3];
        if (lowerText.includes('automation') || lowerText.includes('workflow')) return useCases[4];
        
        return useCases[Math.floor(Math.random() * useCases.length)];
    }

    findAccountForPost(post, accounts) {
        // Find which account this post belongs to
        for (const account of accounts) {
            if (account.relevant_posts.some(p => p.id === post.id)) {
                return account.username;
            }
        }
        return 'unknown';
    }

    async generateDigest(date) {
        if (!await this.loadConfig()) {
            throw new Error('Failed to load configuration');
        }

        const processedDataPath = path.join(__dirname, '../data/processed', `${date}.json`);
        
        try {
            const processedData = JSON.parse(await fs.readFile(processedDataPath, 'utf8'));
            
            // Generate markdown digest
            const markdown = await this.generateMarkdownDigest(processedData);
            
            // Save markdown digest
            const digestsDir = path.join(__dirname, '../data/digests');
            await fs.mkdir(digestsDir, { recursive: true });
            
            const markdownPath = path.join(digestsDir, `${date}.md`);
            await fs.writeFile(markdownPath, markdown);
            
            // Generate Telegram summary
            const telegramMessage = await this.generateTelegramDigest(processedData);
            
            console.log(`Digest generated for ${date}`);
            console.log(`Markdown saved to: ${markdownPath}`);
            
            return {
                markdown,
                telegram: telegramMessage,
                path: markdownPath
            };
            
        } catch (error) {
            console.error(`Failed to generate digest for ${date}:`, error);
            throw error;
        }
    }
}

// CLI usage
if (require.main === module) {
    const generator = new DailyDigestGenerator();
    const date = process.argv[2] || new Date().toISOString().split('T')[0];
    
    generator.generateDigest(date)
        .then((result) => {
            console.log('Daily digest generated successfully');
            console.log('Telegram message preview:');
            console.log('---');
            console.log(result.telegram);
        })
        .catch(error => {
            console.error('Digest generation failed:', error);
            process.exit(1);
        });
}

module.exports = DailyDigestGenerator;