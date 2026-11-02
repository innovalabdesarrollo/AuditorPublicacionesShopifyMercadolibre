import { Router } from 'express';
import {
  clearAuthCookie,
  loginUser,
  registerUser,
  setAuthCookie,
  signToken
} from '../services/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { ensureDefaultRoles } from '../services/roles.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    await ensureDefaultRoles();
    const user = await registerUser({
      email: req.body?.email,
      password: req.body?.password,
      name: req.body?.name
    });
    const token = signToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    await ensureDefaultRoles();
    const user = await loginUser({
      email: req.body?.email,
      password: req.body?.password
    });
    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ user, token });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
