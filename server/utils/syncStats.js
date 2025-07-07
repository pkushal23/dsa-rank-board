const fetchCodeforcesStats = require('./fetchCodeforces');
const fetchLeetCodeStats = require('./fetchLeetCode');
const fetchCodechefStats = require('./fetchCodechef');
const fetchGfgData = require('./fetchGfg');
const db = require('../db');

const fetchMap = {
  leetcode: fetchLeetCodeStats,
  codeforces: fetchCodeforcesStats,
  codechef: fetchCodechefStats,
  gfg: fetchGfgData,
};

async function syncUserStats(userId) {
  // Optional: Set DB session timezone to IST
  await db.query(`SET TIME ZONE 'Asia/Kolkata'`);

  const { rows } = await db.query(
    'SELECT platform, handle FROM user_profiles WHERE user_id = $1',
    [userId]
  );

  let totalScore = 0;
  const weights = {
    codeforces: 0.4,
    leetcode: 0.3,
    codechef: 0.2,
    gfg: 0.1,
  };

  for (const { platform, handle } of rows) {
    const fetchFn = fetchMap[platform];
    if (!fetchFn) continue;

    try {
      const stats = await fetchFn(handle);
      if (!stats) {
        console.error(`Stats fetch returned null for ${platform} (${handle})`);
        continue;
      }

      const problemsSolved = stats.problemsSolved || stats.totalProblemsSolved || 0;
      const rating = stats.rating || 0;
      const profileHandle = stats.handle || handle;
      const weight = weights[platform] || 0;

      let platformScore = 0;
      if (platform === 'codeforces' || platform === 'codechef') {
        platformScore = rating * weight;
      } else if (platform === 'leetcode' || platform === 'gfg') {
        platformScore = problemsSolved * weight;
      }

      totalScore += platformScore;

      // Upsert platform stats
      await db.query(
        `INSERT INTO user_platform_stats (user_id, platform, handle, problems_solved, rating, total_score, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (user_id, platform)
         DO UPDATE SET 
           handle = EXCLUDED.handle, 
           problems_solved = EXCLUDED.problems_solved, 
           rating = EXCLUDED.rating, 
           total_score = EXCLUDED.total_score, 
           last_updated = NOW()`,
        [userId, platform, profileHandle, problemsSolved, rating, platformScore]
      );
    } catch (err) {
      console.error(`Failed to sync stats for ${platform} (${handle}):`, err.message);
    }
  }

  if (totalScore > 0) {
    const roundedScore = Math.round(totalScore);

    // Use CURRENT_DATE in DB to avoid JS timezone issues
    const existingEntry = await db.query(
      `SELECT id, total_score FROM user_score_history 
       WHERE user_id = $1 AND snapshot_time::date = CURRENT_DATE`,
      [userId]
    );

    if (existingEntry.rows.length > 0) {
      const existingScore = existingEntry.rows[0].total_score;

      if (Math.abs(existingScore - roundedScore) > 0) {
        await db.query(
          `UPDATE user_score_history 
           SET total_score = $1, snapshot_time = NOW() 
           WHERE user_id = $2 AND snapshot_time::date = CURRENT_DATE`,
          [roundedScore, userId]
        );
        console.log(`✅ Score updated: ${existingScore} → ${roundedScore}`);
      } else {
        console.log(`⚠️ No score change for user ${userId} (${roundedScore})`);
      }
    } else {
      await db.query(
        `INSERT INTO user_score_history (user_id, total_score, snapshot_time) 
         VALUES ($1, $2, NOW())`,
        [userId, roundedScore]
      );
      console.log(`✅ New score snapshot created for user ${userId}: ${roundedScore}`);
    }
  }
}

module.exports = syncUserStats;
