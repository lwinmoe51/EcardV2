/**
 * Supabase Database Client Configuration
 * Sets up connection to Supabase PostgreSQL database
 *
 * This file:
 * - Loads environment variables
 * - Creates Supabase client instance
 * - Validates required configuration
 * - Exports client for use in routes
 */

// backend/supabaseClient.js
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Load Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
// Service role key has full database access (use with caution)
if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Key must be defined in .env file");
}

// Create Supabase client instance
// Service role key bypasses Row Level Security (RLS)
// TODO: Consider using anon key with proper RLS policies for better security
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;

/**
 * TODO: FUTURE DATABASE CONFIGURATION ENHANCEMENTS
 *
 * 1. SECURITY IMPROVEMENTS:
 *    - Implement Row Level Security (RLS) policies
 *    - Use anon key instead of service role key
 *    - Add connection pooling
 *    - Implement database connection retry logic
 *
 * 2. PERFORMANCE OPTIMIZATIONS:
 *    - Add connection pooling
 *    - Implement query caching
 *    - Add database query logging
 *    - Optimize database indexes
 *
 * 3. MONITORING AND LOGGING:
 *    - Add database performance monitoring
 *    - Implement query analytics
 *    - Add error tracking and alerting
 *    - Set up database backup monitoring
 *
 * 4. DEPLOYMENT CONSIDERATIONS:
 *    - Use different keys for different environments
 *    - Implement database migration system
 *    - Add database seeding for development
 *    - Set up automated backups
 */
