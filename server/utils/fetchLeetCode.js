const axios = require('axios');

async function fetchLeetCodeStats(username) {
  // Query for problem solving stats
  const problemStatsQuery = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  // Query for contest rating
  const contestRatingQuery = `
    query userContestRankingInfo($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
        badge {
          name
        }
      }
    }
  `;

  try {
    // Fetch problem solving stats
    const problemStatsRes = await axios.post(
      'https://leetcode.com/graphql',
      {
        query: problemStatsQuery,
        variables: { username }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    // Fetch contest rating
    const contestRatingRes = await axios.post(
      'https://leetcode.com/graphql',
      {
        query: contestRatingQuery,
        variables: { username }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const stats = problemStatsRes.data.data.matchedUser?.submitStats?.acSubmissionNum;
    const contestData = contestRatingRes.data.data.userContestRanking;

    if (!stats) return null;

    // Process problem solving stats
    const result = {
      totalSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
    };
   
    for (const item of stats) {
      if (item.difficulty === 'All') result.totalSolved = item.count;
      else if (item.difficulty === 'Easy') result.easy = item.count;
      else if (item.difficulty === 'Medium') result.medium = item.count;
      else if (item.difficulty === 'Hard') result.hard = item.count;
    }

    // Process contest rating
    const contestRating = contestData?.rating || null;
    const contestsAttended = contestData?.attendedContestsCount || 0;
    const globalRanking = contestData?.globalRanking || null;
    const badge = contestData?.badge?.name || null;

    return {
      handle: username,
      problemsSolved: result.totalSolved,
      easy: result.easy,
      medium: result.medium,
      hard: result.hard,
      rating: contestRating !== null ? Math.round(contestRating) : 'N/A',
      contestsAttended: contestsAttended,
      globalRanking: globalRanking,
      contestBadge: badge
    };

  } catch (error) {
    console.error('LeetCode fetch error:', error.message);
    return null;
  }
}

module.exports = fetchLeetCodeStats;