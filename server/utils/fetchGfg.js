// utils/fetchGfg.js
const axios = require('axios');

const fetchGfgData = async (username) => {
  const apiUrl = `https://geeks-for-geeks-api.vercel.app/${username}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data?.info) {
      throw new Error('User not found');
    }

    return {
    handle: username,
    problemsSolved: data.info.totalProblemsSolved || 0,
    codingScore: data.info.codingScore,
    institute: data.info.institute,
  profilePicture: data.info.profilePicture,
  currentStreak: data.info.currentStreak,
  maxStreak: data.info.maxStreak
};

  } catch (error) {
    console.error('[fetchGfg ERROR]', error.message);
    throw new Error('Failed to fetch GFG data');
  }
};

module.exports = fetchGfgData;
