/**
 * Sitemap Submission Script
 * 
 * This script helps submit your sitemap to major search engines for faster
 * indexing. It provides URLs and instructions for manual submission since
 * automated submission requires API keys and authentication.
 * 
 * Features:
 * - Google Search Console submission instructions
 * - Bing Webmaster Tools submission instructions
 * - Sitemap ping functionality (when available)
 * - Validation before submission
 * 
 * Usage:
 * - Run after sitemap generation: node scripts/submit-sitemap.js
 * - Follow the provided instructions for manual submission
 */

import { existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SITEMAP_PATH = resolve(__dirname, '../public/sitemap.xml');
const SITE_URL = process.env.VITE_SITE_URL || 'https://stripro.online';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

/**
 * Ping search engines about sitemap updates
 * Note: This is a simplified version. In production, you might want to use
 * official APIs with proper authentication.
 */
async function pingSitemapToSearchEngines() {
  const pingUrls = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`
  ];

  console.log('📡 Pinging search engines...');

  for (const pingUrl of pingUrls) {
    try {
      const response = await fetch(pingUrl);
      const engine = pingUrl.includes('google') ? 'Google' : 'Bing';
      
      if (response.ok) {
        console.log(`   ✅ ${engine}: Sitemap ping successful`);
      } else {
        console.log(`   ⚠️  ${engine}: Ping returned status ${response.status}`);
      }
    } catch (error) {
      const engine = pingUrl.includes('google') ? 'Google' : 'Bing';
      console.log(`   ❌ ${engine}: Ping failed - ${error.message}`);
    }
  }
}

/**
 * Display submission instructions
 */
function displaySubmissionInstructions() {
  console.log('\n🎯 Manual Sitemap Submission Instructions:');
  console.log('=' .repeat(60));

  console.log('\n📍 Google Search Console:');
  console.log('   1. Go to: https://search.google.com/search-console');
  console.log('   2. Select your property (or add it if not already added)');
  console.log('   3. Navigate to "Sitemaps" in the left sidebar');
  console.log('   4. Click "Add a new sitemap"');
  console.log(`   5. Enter: sitemap.xml`);
  console.log('   6. Click "Submit"');
  console.log(`   📄 Full URL: ${SITEMAP_URL}`);

  console.log('\n🔍 Bing Webmaster Tools:');
  console.log('   1. Go to: https://www.bing.com/webmasters');
  console.log('   2. Select your site (or add it if not already added)');
  console.log('   3. Navigate to "Sitemaps" under "Configure My Site"');
  console.log('   4. Click "Submit a Sitemap"');
  console.log(`   5. Enter: ${SITEMAP_URL}`);
  console.log('   6. Click "Submit"');

  console.log('\n🌐 Other Search Engines:');
  console.log('   • Yandex Webmaster: https://webmaster.yandex.com/');
  console.log('   • Baidu Webmaster: https://ziyuan.baidu.com/');
  console.log('   • DuckDuckGo: Automatically discovers sitemaps via robots.txt');

  console.log('\n📋 robots.txt Verification:');
  console.log('   Make sure your robots.txt file includes:');
  console.log(`   Sitemap: ${SITEMAP_URL}`);
  console.log(`   Check: ${SITE_URL}/robots.txt`);

  console.log('\n⏰ Monitoring & Maintenance:');
  console.log('   • Check indexing status weekly in Search Console');
  console.log('   • Resubmit sitemap after major site changes');
  console.log('   • Monitor for crawl errors and fix them promptly');
  console.log('   • Update sitemap when adding new pages');

  console.log('\n💡 Pro Tips:');
  console.log('   • Submit sitemap immediately after site launch');
  console.log('   • Use structured data to enhance search results');
  console.log('   • Monitor Core Web Vitals in Search Console');
  console.log('   • Set up email alerts for critical issues');
}

/**
 * Check sitemap accessibility
 */
async function checkSitemapAccessibility() {
  console.log('🌐 Checking sitemap accessibility...');
  
  try {
    const response = await fetch(SITEMAP_URL);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log(`   ✅ Sitemap is accessible at ${SITEMAP_URL}`);
      console.log(`   📄 Content-Type: ${contentType}`);
      
      if (!contentType?.includes('xml')) {
        console.log('   ⚠️  Warning: Content-Type should be application/xml or text/xml');
      }
    } else {
      console.log(`   ❌ Sitemap not accessible: HTTP ${response.status}`);
      console.log('   🔧 Make sure your site is deployed and accessible');
    }
  } catch (error) {
    console.log(`   ❌ Cannot access sitemap: ${error.message}`);
    console.log('   💡 This is normal for local development');
  }
}

/**
 * Main submission function
 */
async function submitSitemap() {
  console.log('🚀 Sitemap Submission Helper');
  console.log('=' .repeat(40));

  // Check if sitemap exists
  if (!existsSync(SITEMAP_PATH)) {
    console.error('❌ Sitemap file not found!');
    console.log('💡 Run "npm run build" to generate the sitemap first.');
    process.exit(1);
  }

  console.log(`✅ Sitemap found: ${SITEMAP_PATH}`);
  console.log(`🌐 Sitemap URL: ${SITEMAP_URL}`);

  // Check sitemap accessibility (if not local)
  if (!SITEMAP_URL.includes('localhost')) {
    await checkSitemapAccessibility();
  } else {
    console.log('🏠 Local development detected - skipping accessibility check');
  }

  // Ping search engines (if not local)
  if (!SITEMAP_URL.includes('localhost')) {
    await pingSitemapToSearchEngines();
  } else {
    console.log('🏠 Local development detected - skipping search engine ping');
  }

  // Display manual submission instructions
  displaySubmissionInstructions();

  console.log('\n🎉 Submission helper complete!');
  console.log('📈 Your sitemap is ready to boost your SEO rankings.');
}

// Run submission helper if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  submitSitemap().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { submitSitemap, pingSitemapToSearchEngines };