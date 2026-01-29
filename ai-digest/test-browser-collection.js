#!/usr/bin/env node

/**
 * Test script for browser-based Twitter collection
 * This demonstrates how to use Clawdbot's browser tool for account monitoring
 */

async function testTwitterCollection() {
    console.log('Testing browser-based Twitter collection...');
    
    // Test accounts (starting with just a few)
    const testAccounts = [
        { username: 'karpathy', priority: 'high' },
        { username: 'gregisenberg', priority: 'high' },
        { username: 'levelsio', priority: 'high' }
    ];
    
    const results = [];
    
    for (const account of testAccounts) {
        console.log(`\nTesting collection from @${account.username}...`);
        
        try {
            // This would be called via Clawdbot's browser tool
            const accountData = {
                username: account.username,
                collected_at: new Date().toISOString(),
                status: 'success',
                // In real implementation, this would contain extracted tweets
                sample_workflow: [
                    '1. Navigate to https://twitter.com/' + account.username,
                    '2. Wait for page load',
                    '3. Take snapshot',
                    '4. Extract tweet elements',
                    '5. Parse text, timestamps, engagement',
                    '6. Save structured data'
                ]
            };
            
            results.push(accountData);
            console.log(`✓ @${account.username} - collection simulated`);
            
        } catch (error) {
            console.error(`✗ @${account.username} - failed:`, error.message);
            results.push({
                username: account.username,
                status: 'error',
                error: error.message
            });
        }
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n=== Collection Summary ===');
    console.log(`Accounts processed: ${results.length}`);
    console.log(`Successful: ${results.filter(r => r.status === 'success').length}`);
    console.log(`Failed: ${results.filter(r => r.status === 'error').length}`);
    
    return results;
}

// CLI usage
if (require.main === module) {
    testTwitterCollection()
        .then(results => {
            console.log('\nTest completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('\nTest failed:', error);
            process.exit(1);
        });
}

module.exports = { testTwitterCollection };