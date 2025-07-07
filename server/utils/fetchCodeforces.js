const axios = require('axios');

async function fetchCodeforcesStats(handle) {
  try {
    const res = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Check if the API response is successful
    if (res.data.status !== 'OK') {
      console.error('Codeforces API error:', res.data.comment);
      return null;
    }

    // Check if user data exists
    if (!res.data.result || res.data.result.length === 0) {
      console.error('User not found on Codeforces');
      return null;
    }

    const user = res.data.result[0];
    
    return {
      handle,
      rating: user.rating || 0,
      rank: user.rank || 'unrated',
      maxRating: user.maxRating || 0,
      // Additional useful fields
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      country: user.country || '',
      city: user.city || '',
      titlePhoto: user.titlePhoto || '',
      // Contest participation stats
      friendOfCount: user.friendOfCount || 0,
      contribution: user.contribution || 0
    };

  } catch (err) {
    console.error('Codeforces fetch error:', err.message);
    
    // More specific error handling
    if (err.response) {
      // Server responded with error status
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    } else if (err.request) {
      // Request was made but no response received
      console.error('No response received from Codeforces API');
    } else {
      // Something else happened
      console.error('Request setup error:', err.message);
    }
    
    return null;
  }
}

module.exports = fetchCodeforcesStats;