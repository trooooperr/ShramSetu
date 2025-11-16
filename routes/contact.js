import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config();
const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.post('/send-email', async (req, res) => {
  try {
    const formData = new FormData();
    for (const key in req.body) {
      formData.append(key, req.body[key]);
    }

    const response = await fetch(process.env.FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' }
    });

    if (response.ok) {
      res.status(200).json({ message: 'Success' });
    } else {
      res.status(500).json({ message: 'Formspree error' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;