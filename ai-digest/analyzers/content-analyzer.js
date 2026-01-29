#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class ContentAnalyzer {
    constructor() {
        this.voiceTemplates = {};
        this.businessKeywords = [];
        this.contentFilters = {};
    }

    async loadConfig() {
        try {
            const voicePath = path.join(__dirname, '../config/voice-templates.json');
            const voiceConfig = JSON.parse(await fs.readFile(voicePath, 'utf8'));
            
            this.voiceTemplates = voiceConfig.chris_voice_profile;
            this.contentFilters = voiceConfig.content_filters;
            this.businessKeywords = voiceConfig.content_filters.business_relevance;
            
            console.log('Content analyzer configuration loaded');
            return true;
        } catch (error) {
            console.error('Failed to load analyzer config:', error);
            return false;
        }
    }

    analyzeBusinessRelevance(text) {
        const lowerText = text.toLowerCase();
        let relevanceScore = 0;
        const matchedKeywords = [];

        // Check for business relevance keywords
        this.businessKeywords.forEach(keyword => {
            if (lowerText.includes(keyword.toLowerCase())) {
                relevanceScore += 1;
                matchedKeywords.push(keyword);
            }
        });

        // Check for avoid topics
        const avoidTopics = this.contentFilters.avoid_topics;
        let hasAvoidableContent = false;
        
        avoidTopics.forEach(topic => {
            if (lowerText.includes(topic.toLowerCase())) {
                hasAvoidableContent = true;
                relevanceScore -= 0.5;
            }
        });

        return {
            score: Math.max(0, relevanceScore),
            relevant: relevanceScore > 0 && !hasAvoidableContent,
            keywords: matchedKeywords,
            hasAvoidableContent
        };
    }

    categorizeContent(text, account) {
        const categories = [];
        const lowerText = text.toLowerCase();

        // Business categories
        if (lowerText.match(/automation|efficiency|productivity|scale|growth/)) {
            categories.push('business_automation');
        }
        
        if (lowerText.match(/ai tool|new feature|launch|release/)) {
            categories.push('tool_updates');
        }
        
        if (lowerText.match(/tutorial|how to|step by step|guide/)) {
            categories.push('tutorial_opportunity');
        }
        
        if (lowerText.match(/revenue|profit|\$|income|money|business/)) {
            categories.push('monetization');
        }

        if (lowerText.match(/strategy|framework|approach|methodology/)) {
            categories.push('strategic_insights');
        }

        // Account-specific categorization
        if (account.category === 'business') {
            categories.push('high_priority_business');
        }

        return categories;
    }

    generateContentIdeas(post, account) {
        const ideas = {
            twitter: [],
            linkedin: [],
            youtube: []
        };

        const relevance = this.analyzeBusinessRelevance(post.text);
        
        if (!relevance.relevant) {
            return ideas;
        }

        const categories = this.categorizeContent(post.text, account);

        // Twitter content ideas
        if (categories.includes('tool_updates')) {
            ideas.twitter.push({
                format: this.voiceTemplates.twitter.patterns[2], // "I tested [tool/approach] for [business use]. Results:"
                concept: `Test ${this.extractToolName(post.text)} for business automation`,
                hook: `I tested ${this.extractToolName(post.text)} for automating [specific business process]. Here's what happened:`,
                engagement_potential: 'high'
            });
        }

        if (categories.includes('business_automation')) {
            ideas.twitter.push({
                format: this.voiceTemplates.twitter.patterns[1], // "Most people are doing [X] wrong. Here's the right way:"
                concept: `Correct approach to business automation`,
                hook: `Most businesses are implementing AI automation wrong. Here's the right way:`,
                engagement_potential: 'high'
            });
        }

        // LinkedIn content ideas  
        if (categories.includes('strategic_insights')) {
            ideas.linkedin.push({
                format: this.voiceTemplates.linkedin.patterns[1], // "Here's how [business type] can leverage [AI development]"
                concept: `Strategic business application of recent AI development`,
                title: `How ${this.suggestBusinessType()} can leverage ${this.extractKeyTech(post.text)}`,
                engagement_potential: 'medium'
            });
        }

        if (categories.includes('monetization')) {
            ideas.linkedin.push({
                format: this.voiceTemplates.linkedin.patterns[2], // "3 lessons from helping [X] companies implement AI"
                concept: `Business lessons from AI implementation`,
                title: `3 lessons from helping businesses implement ${this.extractKeyTech(post.text)}`,
                engagement_potential: 'high'
            });
        }

        // YouTube tutorial ideas
        if (categories.includes('tutorial_opportunity')) {
            const toolName = this.extractToolName(post.text);
            if (toolName) {
                this.voiceTemplates.youtube_concepts.business_outcomes.forEach(outcome => {
                    ideas.youtube.push({
                        format: this.voiceTemplates.youtube_concepts.format_patterns[0],
                        title: `How to use ${toolName} to ${outcome} in 15 minutes`,
                        difficulty: 'beginner',
                        business_value: 'high'
                    });
                });
            }
        }

        return ideas;
    }

    extractToolName(text) {
        // Simple extraction - could be improved with NLP
        const toolPatterns = [
            /(\w+\.ai|\w+AI|\w+GPT)/gi,
            /Claude|ChatGPT|Gemini|Cursor|v0/gi,
            /new (\w+) tool/gi
        ];

        for (const pattern of toolPatterns) {
            const match = text.match(pattern);
            if (match) return match[0];
        }
        return 'AI tool';
    }

    extractKeyTech(text) {
        const techTerms = ['AI', 'automation', 'machine learning', 'LLM', 'ChatGPT', 'Claude'];
        for (const term of techTerms) {
            if (text.toLowerCase().includes(term.toLowerCase())) {
                return term;
            }
        }
        return 'AI technology';
    }

    suggestBusinessType() {
        const businessTypes = [
            'small businesses', 'e-commerce stores', 'service businesses', 
            'consultancies', 'agencies', 'SaaS companies'
        ];
        return businessTypes[Math.floor(Math.random() * businessTypes.length)];
    }

    async processDay(date) {
        // Load config first
        if (!await this.loadConfig()) {
            throw new Error('Failed to load analyzer configuration');
        }
        
        const rawDataDir = path.join(__dirname, '../data/raw', date);
        const processedDir = path.join(__dirname, '../data/processed');
        
        await fs.mkdir(processedDir, { recursive: true });
        
        try {
            const files = await fs.readdir(rawDataDir);
            const jsonFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('_'));
            
            const processedContent = {
                date,
                processed_at: new Date().toISOString(),
                accounts: [],
                content_ideas: {
                    twitter: [],
                    linkedin: [],
                    youtube: []
                },
                trending_topics: [],
                business_insights: []
            };

            for (const file of jsonFiles) {
                const filePath = path.join(rawDataDir, file);
                const accountData = JSON.parse(await fs.readFile(filePath, 'utf8'));
                
                const processedAccount = {
                    username: accountData.username,
                    category: accountData.category,
                    priority: accountData.priority,
                    relevant_posts: [],
                    content_opportunities: 0
                };

                for (const post of accountData.posts || []) {
                    const relevance = this.analyzeBusinessRelevance(post.text || '');
                    
                    if (relevance.relevant) {
                        const categories = this.categorizeContent(post.text, accountData);
                        const ideas = this.generateContentIdeas(post, accountData);
                        
                        processedAccount.relevant_posts.push({
                            ...post,
                            relevance_score: relevance.score,
                            categories,
                            content_ideas: ideas
                        });

                        // Aggregate content ideas
                        processedContent.content_ideas.twitter.push(...ideas.twitter);
                        processedContent.content_ideas.linkedin.push(...ideas.linkedin);
                        processedContent.content_ideas.youtube.push(...ideas.youtube);
                        
                        processedAccount.content_opportunities += ideas.twitter.length + ideas.linkedin.length + ideas.youtube.length;
                    }
                }

                processedContent.accounts.push(processedAccount);
            }

            // Save processed content
            const outputPath = path.join(processedDir, `${date}.json`);
            await fs.writeFile(outputPath, JSON.stringify(processedContent, null, 2));
            
            console.log(`Processed ${processedContent.accounts.length} accounts for ${date}`);
            console.log(`Generated ${processedContent.content_ideas.twitter.length} Twitter ideas`);
            console.log(`Generated ${processedContent.content_ideas.linkedin.length} LinkedIn ideas`);
            console.log(`Generated ${processedContent.content_ideas.youtube.length} YouTube ideas`);
            
            return processedContent;
            
        } catch (error) {
            console.error(`Failed to process day ${date}:`, error);
            return null;
        }
    }
}

// CLI usage
if (require.main === module) {
    const analyzer = new ContentAnalyzer();
    const date = process.argv[2] || new Date().toISOString().split('T')[0];
    
    analyzer.loadConfig()
        .then(() => analyzer.processDay(date))
        .then((result) => {
            if (result) {
                console.log('Content analysis completed successfully');
            } else {
                console.log('Content analysis failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Analysis failed:', error);
            process.exit(1);
        });
}

module.exports = ContentAnalyzer;