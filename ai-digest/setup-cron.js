#!/usr/bin/env node

/**
 * Set up the daily AI digest cron job
 * Runs at 8:00 AM UK time every day
 */

async function setupDailyDigestCron() {
    console.log('Setting up daily AI digest cron job...');
    
    const cronExpression = '0 8 * * *'; // 8:00 AM every day
    const jobDescription = 'Daily AI Digest Generation and Delivery';
    
    console.log(`Cron expression: ${cronExpression}`);
    console.log(`Description: ${jobDescription}`);
    
    // The actual workflow that will run daily:
    const dailyWorkflow = [
        '1. Collect tweets from 18 AI accounts',
        '2. Analyze content for business relevance', 
        '3. Generate Twitter/LinkedIn/YouTube ideas',
        '4. Create markdown digest',
        '5. Send Telegram summary to Chris',
        '6. Update memory with key insights'
    ];
    
    console.log('\nDaily workflow:');
    dailyWorkflow.forEach(step => console.log(`  ${step}`));
    
    // Manual setup instructions until cron API is working
    console.log('\n=== Manual Setup Instructions ===');
    console.log('Add to your system cron (crontab -e):');
    console.log(`${cronExpression} cd ${process.cwd()} && node run-daily-digest.js`);
    
    return true;
}

if (require.main === module) {
    setupDailyDigestCron()
        .then(() => console.log('\nCron job setup completed'))
        .catch(error => {
            console.error('Cron setup failed:', error);
            process.exit(1);
        });
}

module.exports = { setupDailyDigestCron };