import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  // Simple check as requested
  if (username && password) {
    return res.status(200).json({ 
      success: true, 
      user: { username } 
    });
  } else {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid credentials" 
    });
  }
}
