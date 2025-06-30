/**
 * Sitemap Validation Script
 * 
 * This script validates the generated sitemap.xml file to ensure it meets
 * SEO standards and doesn't contain any errors that could affect search
 * engine indexing.
 * 
 * Features:
 * - XML syntax validation
 * - URL format validation
 * - Priority and changefreq validation
 * - File size and URL count checks
 * - SEO best practices verification
 * 
 * Usage:
 * - Run after sitemap generation: node scripts/validate-sitemap.js
 * - Integrate into CI/CD pipeline for automated validation
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { URL, fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SITEMAP_PATH = resolve(__dirname, '../public/sitemap.xml');
const MAX_URLS = 50000; // Google's limit for a single sitemap
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate priority value
 * @param {string} priority - Priority value to validate
 * @returns {boolean} - Whether priority is valid
 */
function isValidPriority(priority) {
  const num = parseFloat(priority);
  return !isNaN(num) && num >= 0.0 && num <= 1.0;
}

/**
 * Validate changefreq value
 * @param {string} changefreq - Change frequency to validate
 * @returns {boolean} - Whether changefreq is valid
 */
function isValidChangefreq(changefreq) {
  const validValues = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
  return validValues.includes(changefreq);
}

/**
 * Validate lastmod date format
 * @param {string} lastmod - Last modification date to validate
 * @returns {boolean} - Whether lastmod is valid
 */
function isValidLastmod(lastmod) {
  // Should be in ISO 8601 format
  const date = new Date(lastmod);
  return !isNaN(date.getTime()) && lastmod.includes('T');
}

/**
 * Parse and validate sitemap XML
 * @param {string} xmlContent - XML content to validate
 * @returns {Object} - Validation results
 */
function validateSitemapContent(xmlContent) {
  const results = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      totalUrls: 0,
      fileSize: Buffer.byteLength(xmlContent, 'utf8'),
      duplicateUrls: 0,
      invalidUrls: 0
    }
  };

  try {
    // Basic XML structure validation
    if (!xmlContent.includes('<urlset')) {
      results.errors.push('Missing <urlset> root element');
      results.isValid = false;
    }

    if (!xmlContent.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
      results.errors.push('Missing or incorrect XML namespace');
      results.isValid = false;
    }

    // Extract URLs using regex (simple parsing for validation)
    const urlMatches = xmlContent.match(/<url>(.*?)<\/url>/gs) || [];
    results.stats.totalUrls = urlMatches.length;

    // Check URL count limit
    if (results.stats.totalUrls > MAX_URLS) {
      results.errors.push(`Too many URLs (${results.stats.totalUrls}). Maximum is ${MAX_URLS}`);
      results.isValid = false;
    }

    // Check file size limit
    if (results.stats.fileSize > MAX_FILE_SIZE) {
      results.errors.push(`File too large (${Math.round(results.stats.fileSize / 1024 / 1024)}MB). Maximum is 50MB`);
      results.isValid = false;
    }

    // Track URLs for duplicate detection
    const seenUrls = new Set();

    // Validate each URL entry
    urlMatches.forEach((urlBlock, index) => {
      const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
      const priorityMatch = urlBlock.match(/<priority>(.*?)<\/priority>/);
      const changefreqMatch = urlBlock.match(/<changefreq>(.*?)<\/changefreq>/);
      const lastmodMatch = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/);

      if (!locMatch) {
        results.errors.push(`URL ${index + 1}: Missing <loc> element`);
        results.isValid = false;
        return;
      }

      const url = locMatch[1];

      // Check for duplicates
      if (seenUrls.has(url)) {
        results.stats.duplicateUrls++;
        results.warnings.push(`Duplicate URL found: ${url}`);
      } else {
        seenUrls.add(url);
      }

      // Validate URL format
      if (!isValidUrl(url)) {
        results.stats.invalidUrls++;
        results.errors.push(`URL ${index + 1}: Invalid URL format: ${url}`);
        results.isValid = false;
      }

      // Validate priority if present
      if (priorityMatch && !isValidPriority(priorityMatch[1])) {
        results.errors.push(`URL ${index + 1}: Invalid priority value: ${priorityMatch[1]}`);
        results.isValid = false;
      }

      // Validate changefreq if present
      if (changefreqMatch && !isValidChangefreq(changefreqMatch[1])) {
        results.errors.push(`URL ${index + 1}: Invalid changefreq value: ${changefreqMatch[1]}`);
        results.isValid = false;
      }

      // Validate lastmod if present
      if (lastmodMatch && !isValidLastmod(lastmodMatch[1])) {
        results.warnings.push(`URL ${index + 1}: Invalid lastmod format: ${lastmodMatch[1]}`);
      }
    });

    // Additional SEO recommendations
    if (results.stats.totalUrls === 0) {
      results.warnings.push('Sitemap contains no URLs');
    }

    if (results.stats.totalUrls < 5) {
      results.warnings.push('Very few URLs in sitemap. Consider adding more pages.');
    }

  } catch (error) {
    results.errors.push(`XML parsing error: ${error.message}`);
    results.isValid = false;
  }

  return results;
}
    results.errors.push(`File too large (${Math.round(results.stats.fileSize / 1024 / 1024)}MB). Maximum is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`);
/**
 * Main validation function
 */
async function validateSitemap() {
  console.log('🔍 Validating sitemap...');
  console.log(`📁 Checking: ${SITEMAP_PATH}`);

  // Check if sitemap file exists
  if (!existsSync(SITEMAP_PATH)) {
    console.error('❌ Sitemap file not found!');
    console.log('💡 Run "node scripts/generate-sitemap.js" to generate the sitemap first.');
    process.exit(1);
  }

  try {
    // Read and validate sitemap content
    const xmlContent = readFileSync(SITEMAP_PATH, 'utf8');
    const results = validateSitemapContent(xmlContent);

    // Display results
    console.log('\n📊 Validation Results:');
    console.log(`   URLs: ${results.stats.totalUrls}`);
    console.log(`   File size: ${Math.round(results.stats.fileSize / 1024)}KB`);
    console.log(`   Duplicates: ${results.stats.duplicateUrls}`);
    console.log(`   Invalid URLs: ${results.stats.invalidUrls}`);

    // Display errors
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(error => console.log(`   • ${error}`));
    }

    // Display warnings
    if (results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      results.warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    // Final result
    if (results.isValid) {
      console.log('\n✅ Sitemap validation passed!');
      console.log('🎉 Your sitemap is ready for search engines.');
      
      console.log('\n💡 Next steps:');
      console.log('   1. Submit sitemap to Google Search Console');
      console.log('   2. Submit sitemap to Bing Webmaster Tools');
      console.log('   3. Monitor indexing status in search tools');
      
    } else {
      console.log('\n❌ Sitemap validation failed!');
      console.log('🔧 Please fix the errors above before deploying.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Validation error:', error.message);
    process.exit(1);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateSitemap().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { validateSitemap, validateSitemapContent };