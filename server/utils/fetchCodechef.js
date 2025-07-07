const axios = require('axios');
const cheerio = require('cheerio');

async function fetchCodechefStats(username) {
  try {
    const url = `https://www.codechef.com/users/${username}`;
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    // Get rating
    const rating = $('div.rating-number').first().text().trim();
    
    // Get stars
    const stars = $('span.rating').first().text().trim().match(/★/g)?.length || 0;
    
    // Get problems solved - CodeChef shows this in different possible locations
    let problemsSolved = 0;
    
    // Method 1: Look for problems solved in the profile stats section
    const problemsText = $('section.rating-data-section h3').filter((i, el) => {
      return $(el).text().includes('Problems Solved') || $(el).text().includes('Solved');
    }).text();
    
    if (problemsText) {
      const match = problemsText.match(/(\d+)/);
      if (match) {
        problemsSolved = parseInt(match[1]);
      }
    }
    
    // Method 2: Look in the rating-data-section for numbers
    if (problemsSolved === 0) {
      $('section.rating-data-section .rating-data-section div').each((i, el) => {
        const text = $(el).text().trim();
        if (text.toLowerCase().includes('solved') || text.toLowerCase().includes('problems')) {
          const match = text.match(/(\d+)/);
          if (match) {
            problemsSolved = parseInt(match[1]);
            return false; // break the loop
          }
        }
      });
    }
    
    // Method 3: Look for numbers in rating-header section
    if (problemsSolved === 0) {
      $('.rating-header .rating-header-data').each((i, el) => {
        const text = $(el).text().trim();
        if (text.toLowerCase().includes('solved') || text.toLowerCase().includes('problems')) {
          const match = text.match(/(\d+)/);
          if (match) {
            problemsSolved = parseInt(match[1]);
            return false; // break the loop
          }
        }
      });
    }
    
    // Method 4: Look in the profile section for any mention of problems
    if (problemsSolved === 0) {
      $('h3, h4, .text-info, .rating-data-section *').each((i, el) => {
        const text = $(el).text().trim();
        // Look for patterns like "Problems Solved: 123" or "Solved: 123"
        const solvedMatch = text.match(/(?:Problems\s+)?Solved:?\s*(\d+)/i);
        if (solvedMatch) {
          problemsSolved = parseInt(solvedMatch[1]);
          return false; // break the loop
        }
      });
    }
    
    // Get highest rating (max rating)
    let maxRating = 0;
    $('div.rating-data-section .rating-data-section div').each((i, el) => {
      const text = $(el).text().trim();
      if (text.toLowerCase().includes('highest') || text.toLowerCase().includes('max')) {
        const match = text.match(/(\d+)/);
        if (match) {
          maxRating = parseInt(match[1]);
          return false; // break the loop
        }
      }
    });
    
    // Get division/category
    let division = '';
    $('.rating span').each((i, el) => {
      const text = $(el).text().trim();
      if (text.includes('Div') || text.includes('Division')) {
        division = text;
        return false;
      }
    });
    
    return {
      handle: username,
      rating: parseInt(rating) || 0,
      stars,
      problemsSolved,
      maxRating: maxRating || parseInt(rating) || 0,
      division: division || `${stars} Star${stars !== 1 ? 's' : ''}`
    };
    
  } catch (error) {
    console.error('CodeChef fetch error:', error.message);
    
    // More specific error handling
    if (error.response) {
      console.error('Response status:', error.response.status);
      if (error.response.status === 404) {
        console.error('CodeChef user not found');
      }
    } else if (error.request) {
      console.error('No response received from CodeChef');
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return null;
  }
}

module.exports = fetchCodechefStats;