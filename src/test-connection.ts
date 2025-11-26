#!/usr/bin/env node

/**
 * Test script for Milestone 1: Connect to Chrome and return active tab URL
 * 
 * Run this script to verify that TabNab can successfully connect to Chrome
 * and retrieve the active tab's URL and title.
 * 
 * Prerequisites:
 * 1. Chrome must be running with --remote-debugging-port=9222
 * 2. At least one tab must be open in Chrome
 */

import { BrowserConnection } from './browser/connection.js';

async function testConnection() {
  console.log('🧪 Testing TabNab - Milestone 1: Connect to Chrome and get active tab\n');

  const connection = new BrowserConnection(9222);

  try {
    console.log('📡 Attempting to connect to Chrome on port 9222...');
    await connection.connect();
    console.log('✅ Successfully connected to Chrome!\n');

    console.log('🔍 Retrieving active tab information...');
    const activeTab = await connection.getActiveTab();
    const url = activeTab.url();
    const title = await activeTab.title();

    console.log('✅ Active tab retrieved successfully!\n');
    console.log('📄 Active Tab Info:');
    console.log(`   Title: ${title}`);
    console.log(`   URL:   ${url}\n`);

    console.log('🎉 Milestone 1 Complete: Connection successful and active tab URL retrieved!');

    await connection.disconnect();
    console.log('\n✅ Disconnected from Chrome');
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure Chrome is running with: --remote-debugging-port=9222');
    console.error('   2. Ensure at least one tab is open in Chrome');
    console.error('   3. Check that port 9222 is not blocked by a firewall');
    process.exit(1);
  }
}

testConnection();
