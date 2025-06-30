/**
 * Sitemap Generation Script for Stripro React App
 * 
 * This script generates a sitemap.xml file for the React application to help
 * search engines discover and index all pages. It runs automatically before
 * each build to ensure the sitemap is always up-to-date.
 * 
 * Features:
 * - Static page mapping for main application routes
 * - Dynamic URL generation for client detail pages (when available)
 * - SEO-optimized priority and change frequency settings
 * - Automatic lastmod timestamps
 * - Production-ready XML formatting
 * 
 * Usage:
 * - Runs automatically via prebuild script: npm run build
 * - Can be run manually: node scripts/generate-sitemap.js
 * - Outputs sitemap.xml to public directory
 */

import 'dotenv/config';
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@supabase/supabase-js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SITE_URL = process.env.VITE_SITE_URL || 'https://stripro.online';
const OUTPUT_PATH = resolve(__dirname, '../public/sitemap.xml');

/**
 * Static routes configuration
 * Each route includes URL, priority, and change frequency for SEO optimization
 */
const staticRoutes = [
  {
    url: '/',
    changefreq: 'weekly',
    priority: 1.0,
    lastmod: new Date().toISOString()
  },
  {
    url: '/dashboard',
    changefreq: 'daily',
    priority: 0.9,
    lastmod: new Date().toISOString()
  },
  {
    url: '/clients',
    changefreq: 'daily',
    priority: 0.8,
    lastmod: new Date().toISOString()
  },
  {
    url: '/add-data',
    changefreq: 'weekly',
    priority: 0.7,
    lastmod: new Date().toISOString()
  },
  {
    url: '/settings',
    changefreq: 'monthly',
    priority: 0.6,
    lastmod: new Date().toISOString()
  }
];

/**
 * Generate dynamic routes (e.g., client detail pages)
 * In a real application, this would fetch client IDs from your database
 * 
 * @returns {Array} Array of dynamic route objects
 */
async function generateDynamicRoutes() {
  const dynamicRoutes = [];
  
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data: clients, error } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .limit(1000);
    
    if (!error && clients) {
      clients.forEach(client => {
        dynamicRoutes.push({
          url: `/clients/${client.stripe_customer_id}`,
          changefreq: 'weekly',
          priority: 0.5,
          lastmod: new Date().toISOString()
        });
      });
    }
    
    console.log(`Generated ${dynamicRoutes.length} dynamic routes`);
    
  } catch (error) {
    console.warn('Warning: Could not generate dynamic routes:', error.message);
    console.log('Continuing with static routes only...');
  }
  
  return dynamicRoutes;
}

/**
 * Generate the complete sitemap
 */
async function generateSitemap() {
  try {
    console.log('🗺️  Generating sitemap for Stripro...');
    console.log(`📍 Site URL: ${SITE_URL}`);
    console.log(`📁 Output: ${OUTPUT_PATH}`);
    
    // Create sitemap stream
    const sitemap = new SitemapStream({ 
      hostname: SITE_URL,
      cacheTime: 600000, // 10 minutes cache time
      xmlns: {
        news: false,
        xhtml: false,
        image: false,
        video: false
      }
    });
    
    // Create write stream
    const writeStream = createWriteStream(OUTPUT_PATH);
    sitemap.pipe(writeStream);
    
    // Set up stream promise before writing anything
    const streamPromise = streamToPromise(sitemap);
    
    // Add static routes
    console.log(`📄 Adding ${staticRoutes.length} static routes...`);
    staticRoutes.forEach(route => {
      sitemap.write(route);
      console.log(`   ✓ ${route.url} (priority: ${route.priority})`);
    });
    
    // Add dynamic routes
    const dynamicRoutes = await generateDynamicRoutes();
    if (dynamicRoutes.length > 0) {
      console.log(`🔗 Adding ${dynamicRoutes.length} dynamic routes...`);
      dynamicRoutes.forEach(route => {
        sitemap.write(route);
        console.log(`   ✓ ${route.url} (priority: ${route.priority})`);
      });
    }
    
    // End the sitemap stream
    sitemap.end();
    
    // Wait for the stream to finish
    await streamPromise;
    
    console.log('✅ Sitemap generated successfully!');
    console.log(`📊 Total URLs: ${staticRoutes.length + dynamicRoutes.length}`);
    console.log(`🌐 Sitemap URL: ${SITE_URL}/sitemap.xml`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

/**
 * Validate environment and run sitemap generation
 */
async function main() {
  // Validate required configuration
  if (!SITE_URL || SITE_URL === 'https://stripro.com') {
    console.warn('⚠️  Warning: Using default site URL. Set VITE_SITE_URL environment variable for production.');
  }
  
  // Generate the sitemap
  await generateSitemap();
  
  console.log('\n🎉 Sitemap generation complete!');
  console.log('💡 Tips:');
  console.log('   • Submit your sitemap to Google Search Console');
  console.log('   • Update robots.txt to reference your sitemap');
  console.log('   • Monitor sitemap indexing status in search tools');
}

// Run the script - ES module equivalent of require.main === module
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { generateSitemap, generateDynamicRoutes };