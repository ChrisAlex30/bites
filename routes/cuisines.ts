import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('List of cuisines');
});

export default router;