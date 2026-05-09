const express = require('express');
const router = express.Router();
const UserPost = require('../models/post');
const Worker = require('../models/worker');
const User = require('../models/user');

const fetch = require("node-fetch");

// -------------------------------------------
// Distance Calculator
// -------------------------------------------
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// -------------------------------------------
// DASHBOARD ROUTE (unchanged)
// -------------------------------------------
router.get('/dashboard', async (req, res) => {
  try {
    const posts = await UserPost.find()
      .populate('user')
      .lean();

    const postsWithWorkers = await Promise.all(
      posts.map(async (post) => {
        const userLat = post.user?.latitude || 0;
        const userLon = post.user?.longitude || 0;
        const formattedAddress = post.user?.formattedAddress || 'Location Unknown';

        let workers = await Worker.find({ job: post.worker }).lean();

        workers.sort((a, b) => {
          const distA = getDistance(userLat, userLon, a.latitude, a.longitude);
          const distB = getDistance(userLat, userLon, b.latitude, b.longitude);
          return distA - distB;
        });

        return { ...post, formattedAddress, workers };
      })
    );

    res.render('company_dashboard', { posts: postsWithWorkers });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


router.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const feedbackmodel = require("../models/feedback");
    await feedbackmodel.create({ name, email, message });

    return res.json({ success: true });
  } catch (err) {
    console.error("Contact API Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;