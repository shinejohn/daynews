const fs = require('fs');
const path = require('path');

/**
 * Update database types with all missing fields
 * Based on actual usage in the codebase
 */

const additionalFields = {
  events: {
    venue_name: 'string',
    featured_image: 'string',
    organizer: 'string',
    attendee_count: 'number',
    is_canceled: 'boolean'
  },
  news: {
    is_featured: 'boolean',
    status: 'string'
  },
  businesses: {
    logo_url: 'string',
    featured_image: 'string',
    rating: 'number',
    review_count: 'number'
  }
};

function updateDatabaseTypes() {
  const typesPath = path.join(__dirname, '..', 'src', 'types', 'database.types.ts');
  let content = fs.readFileSync(typesPath, 'utf8');
  
  // Update events table
  content = content.replace(
    /events: {\s*Row: {([^}]+)}/,
    (match, fields) => {
      let newFields = fields.trimEnd();
      
      // Add missing fields
      if (!fields.includes('venue_name')) {
        newFields += ';\n          venue_name?: string';
      }
      if (!fields.includes('featured_image')) {
        newFields += ';\n          featured_image?: string';
      }
      if (!fields.includes('organizer')) {
        newFields += ';\n          organizer?: string';
      }
      if (!fields.includes('attendee_count')) {
        newFields += ';\n          attendee_count?: number';
      }
      if (!fields.includes('is_canceled')) {
        newFields += ';\n          is_canceled?: boolean';
      }
      
      return `events: {\n        Row: {${newFields}\n        }`;
    }
  );
  
  // Update news table
  content = content.replace(
    /news: {\s*Row: {([^}]+)}/,
    (match, fields) => {
      let newFields = fields.trimEnd();
      
      // Add missing fields
      if (!fields.includes('is_featured')) {
        newFields += ';\n          is_featured?: boolean';
      }
      if (!fields.includes('status')) {
        newFields += ';\n          status?: string';
      }
      
      return `news: {\n        Row: {${newFields}\n        }`;
    }
  );
  
  // Update businesses table
  content = content.replace(
    /businesses: {\s*Row: {([^}]+)}/,
    (match, fields) => {
      let newFields = fields.trimEnd();
      
      // Add missing fields
      if (!fields.includes('logo_url')) {
        newFields += ';\n          logo_url?: string';
      }
      if (!fields.includes('featured_image')) {
        newFields += ';\n          featured_image?: string';
      }
      if (!fields.includes('rating')) {
        newFields += ';\n          rating?: number';
      }
      if (!fields.includes('review_count')) {
        newFields += ';\n          review_count?: number';
      }
      
      return `businesses: {\n        Row: {${newFields}\n        }`;
    }
  );
  
  fs.writeFileSync(typesPath, content);
  console.log('Updated database types with missing fields');
}

updateDatabaseTypes();