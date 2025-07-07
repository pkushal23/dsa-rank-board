// server/routes/profile.js
const express = require('express');
const router = express.Router();
const db = require('../db');

const fetchCodeforcesStats = require('../utils/fetchCodeforces');
const fetchLeetCodeStats = require('../utils/fetchLeetCode');
const fetchCodechefStats = require('../utils/fetchCodechef');
const fetchGfgData = require('../utils/fetchGfg');
const syncUserStats = require('../utils/syncStats')

router.post('/link', async (req, res) => {
  const { uid, platform, handle } = req.body;

  try {
    const userRes = await db.query('SELECT id FROM users WHERE uid = $1', [uid]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userRes.rows[0].id;

    // Check if already linked
    const exists = await db.query(
      'SELECT * FROM user_profiles WHERE user_id = $1 AND platform = $2',
      [userId, platform]
    );
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Profile already linked' });
    }

    // ✅ Handle Validation Based on Platform
    let isValid = false;
    if (platform === "leetcode") {
      const stats = await fetchLeetCodeStats(handle);
      isValid = !!stats;
    } else if (platform === "codeforces") {
      const stats = await fetchCodeforcesStats(handle);
      isValid = !!stats;
    } else if (platform === "codechef") {
      const stats = await fetchCodechefStats(handle);
      isValid = !!stats;
    } else if (platform === "gfg") {
      const stats = await fetchGfgData(handle);
      isValid = !!stats;
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid handle. Please provide a valid profile.' });
    }

    // Save to Database
    await db.query(
      'INSERT INTO user_profiles (user_id, platform, handle) VALUES ($1, $2, $3)',
      [userId, platform, handle]
    );

    // Sync Stats
    await syncUserStats(userId);

    res.json({ message: 'Profile linked and stats synced successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/leetcode/:handle', async (req, res) => {
  const { handle } = req.params;

  try {
    const stats = await fetchLeetCodeStats(handle);

    if (!stats) {
      return res.status(404).json({ error: 'User not found or error fetching data' });
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/codeforces/:handle', async (req, res) => {
  const { handle } = req.params;

  try {
    const stats = await fetchCodeforcesStats(handle);

    if (!stats) {
      return res.status(404).json({ error: 'Codeforces user not found' });
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching Codeforces stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/codechef/:handle', async (req, res) => {
  const { handle } = req.params;
  
  try {
    const stats = await fetchCodechefStats(handle);

    if (!stats) {
      return res.status(404).json({ error: 'CodeChef user not found' });
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching CodeChef stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/gfg/:username', async (req, res) => {
  const { username } = req.params;
  console.log('GFG Route Hit:', username);

  try {
    const gfgData = await fetchGfgData(username);
    res.json(gfgData);
  } catch (error) {
    console.error('Error in GFG route:', error.message);
    res.status(404).json({ error: error.message });
  }
});

router.post('/sync/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;
    const userRes = await db.query('SELECT id FROM users WHERE uid = $1', [uid]);

    if (userRes.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    const userId = userRes.rows[0].id;
    await syncUserStats(userId);

    res.json({ message: 'Stats synced successfully' });
  } catch (error) {
    console.error('Error syncing stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ IMPROVED: Return empty array instead of 404 for no stats
router.get('/stats/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const userRes = await db.query('SELECT id FROM users WHERE uid = $1', [uid]);

    if (userRes.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    const userId = userRes.rows[0].id;
    const statsRes = await db.query(`
      SELECT s.platform, s.problems_solved, s.rating, s.last_updated, p.handle
      FROM user_platform_stats s
      JOIN user_profiles p ON s.user_id = p.user_id AND s.platform = p.platform
      WHERE s.user_id = $1
    `, [userId]);

    // Return empty array if no stats found instead of 404
    res.json(statsRes.rows || []);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await db.query(`
      SELECT u.name, SUM(s.total_score) AS score
      FROM user_platform_stats s
      JOIN users u ON u.id = s.user_id
      GROUP BY u.name
      ORDER BY score DESC
      LIMIT 10
    `);

    res.json(leaderboard.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ IMPROVED: Return 0 score instead of 404 for no score
router.get('/score/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    // First get numeric user_id from users table
    const userRes = await db.query('SELECT id FROM users WHERE uid = $1', [uid]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userRes.rows[0].id;

    const { rows } = await db.query(
      'SELECT * FROM user_platform_stats WHERE user_id = $1',
      [userId]
    );

    // Return 0 score if no stats found instead of error
    if (rows.length === 0) {
      return res.json({ totalScore: 0 });
    }

    let totalScore = 0;

    const weights = {
      codeforces: 0.4,
      leetcode: 0.3,
      codechef: 0.2,
      gfg: 0.1,
    };

    for (const row of rows) {
      const platform = row.platform;
      const weight = weights[platform] || 0;

      if (platform === 'codeforces') {
        totalScore += (row.rating || 0) * weight;
      } else if (platform === 'leetcode' || platform === 'gfg') {
        totalScore += (row.problems_solved || 0) * weight;
      } else if (platform === 'codechef') {
        totalScore += (row.rating || 0) * weight;
      }
    }

    res.json({ totalScore: Math.round(totalScore) });
    console.log(totalScore);
  } catch (err) {
    console.error('Error calculating score:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/leaderboard/:platform', async (req, res) => {
  try {
    const { platform } = req.params;

    const result = await db.query(`
      SELECT u.name, s.total_score
      FROM user_platform_stats s
      JOIN users u ON u.id = s.user_id
      WHERE s.platform = $1
      ORDER BY s.total_score DESC
      LIMIT 10
    `, [platform]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching platform leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Daily & Weekly Top Coders
router.get('/top-coders/:type', async (req, res) => {
  try {
    const { type } = req.params;

    let query = `
      SELECT u.name, SUM(s.total_score) AS score
      FROM user_platform_stats s
      JOIN users u ON u.id = s.user_id
      WHERE 
    `;

    let values = [];

    if (type === "daily") {
      query += "s.last_updated::date = CURRENT_DATE";
    } else if (type === "weekly") {
      query += "s.last_updated >= NOW() - INTERVAL '7 days'";
    } else {
      return res.status(400).json({ error: "Invalid type. Use daily or weekly." });
    }

    query += `
      GROUP BY u.name
      ORDER BY score DESC
      LIMIT 10
    `;

    const leaderboard = await db.query(query, values);
    res.json(leaderboard.rows);
  } catch (err) {
    console.error("Leaderboard fetch error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ IMPROVED: Return empty array instead of 404 for no score history
router.get('/score-history/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { groupBy } = req.query; // optional: 'day', 'week', 'month'

    const userRes = await db.query('SELECT id FROM users WHERE uid = $1', [uid]);
    if (userRes.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    const userId = userRes.rows[0].id;

    let query;
    let params = [userId];

    // Default to daily aggregation to avoid multiple entries per day
    if (groupBy === 'week') {
      query = `
        SELECT 
          DATE_TRUNC('week', snapshot_time) as snapshot_time,
          MAX(total_score) as total_score
        FROM user_score_history
        WHERE user_id = $1
        GROUP BY DATE_TRUNC('week', snapshot_time)
        ORDER BY snapshot_time ASC
      `;
    } else if (groupBy === 'month') {
      query = `
        SELECT 
          DATE_TRUNC('month', snapshot_time) as snapshot_time,
          MAX(total_score) as total_score
        FROM user_score_history
        WHERE user_id = $1
        GROUP BY DATE_TRUNC('month', snapshot_time)
        ORDER BY snapshot_time ASC
      `;
    } else {
      // Default: Daily aggregation (group by date, take the latest score of each day)
      query = `
        SELECT 
          DATE(snapshot_time) as snapshot_date,
          MAX(total_score) as total_score,
          MAX(snapshot_time) as snapshot_time
        FROM user_score_history
        WHERE user_id = $1
        GROUP BY DATE(snapshot_time)
        ORDER BY snapshot_date ASC
      `;
    }

    const historyRes = await db.query(query, params);

    // Format response - return empty array if no history found
    const filteredData = historyRes.rows
  .filter(row => row.total_score > 0)  // Remove zero scores
  .map(row => ({
    total_score: row.total_score,
    snapshot_time: row.snapshot_time
  }));

    res.json(filteredData);
  } catch (err) {
    console.error("Error fetching score history:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/delink', async (req, res) => {
  const { uid, platform } = req.body;

  try {
    // Get user ID from UID
    const userRes = await db.query('SELECT id FROM users WHERE uid = $1', [uid]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userRes.rows[0].id;

    // Check if profile is linked
    const profileRes = await db.query(
      'SELECT * FROM user_profiles WHERE user_id = $1 AND platform = $2',
      [userId, platform]
    );

    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: `${platform} profile is not linked` });
    }

    // Begin transaction to ensure data consistency
    await db.query('BEGIN');

    try {
      // Delete from user_profiles
      await db.query(
        'DELETE FROM user_profiles WHERE user_id = $1 AND platform = $2',
        [userId, platform]
      );

      // Delete from user_platform_stats
      await db.query(
        'DELETE FROM user_platform_stats WHERE user_id = $1 AND platform = $2',
        [userId, platform]
      );

      // Fetch remaining stats to recalculate score
      const remainingStats = await db.query(
        'SELECT * FROM user_platform_stats WHERE user_id = $1',
        [userId]
      );

      // Recalculate total score
      let newTotalScore = 0;
      const weights = { codeforces: 0.4, leetcode: 0.3, codechef: 0.2, gfg: 0.1 };

      for (const row of remainingStats.rows) {
        const weight = weights[row.platform] || 0;
        if (row.platform === 'codeforces' || row.platform === 'codechef') {
          newTotalScore += (row.rating || 0) * weight;
        } else {
          newTotalScore += (row.problems_solved || 0) * weight;
        }
      }

      const roundedScore = Math.round(newTotalScore);

      // ✅ Insert score snapshot only if score > 0
      if (roundedScore > 0) {
        await db.query(
          'INSERT INTO user_score_history (user_id, total_score, snapshot_time) VALUES ($1, $2, NOW())',
          [userId, roundedScore]
        );
        console.log(`✅ New score snapshot created for user ${userId}: ${roundedScore}`);
      } else {
        console.log(`⚠️ Skipped snapshot insert — score is ${roundedScore}`);
      }

      await db.query('COMMIT');

      res.json({ 
        message: `${platform} profile delinked successfully`,
        platform
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (err) {
    console.error('Delink error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ✅ IMPROVED: Return empty stats array and 0 score for users with no platforms
router.get('/public-profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Get user by name
    const userRes = await db.query('SELECT id, name FROM users WHERE name = $1', [username]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userRes.rows[0].id;
    
    // Get their platform stats
    const statsRes = await db.query(`
      SELECT s.platform, s.problems_solved, s.rating, s.total_score, s.last_updated, p.handle
      FROM user_platform_stats s
      JOIN user_profiles p ON s.user_id = p.user_id AND s.platform = p.platform
      WHERE s.user_id = $1
    `, [userId]);
    
    // Calculate total score using the same logic as your existing score route
    const weights = {
      codeforces: 0.4,
      leetcode: 0.3,
      codechef: 0.2,
      gfg: 0.1,
    };

    let totalScore = 0;
    for (const row of statsRes.rows) {
      const platform = row.platform;
      const weight = weights[platform] || 0;

      if (platform === 'codeforces' || platform === 'codechef') {
        totalScore += (row.rating || 0) * weight;
      } else if (platform === 'leetcode' || platform === 'gfg') {
        totalScore += (row.problems_solved || 0) * weight;
      }
    }
    
    res.json({
      name: userRes.rows[0].name,
      platforms: statsRes.rows || [], // Return empty array if no platforms
      totalScore: Math.round(totalScore) // This will be 0 if no platforms
    });
    
  } catch (err) {
    console.error('Error fetching public profile:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;