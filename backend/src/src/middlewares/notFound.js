function notFound(req, res, next) {
  if (req.method === 'GET' && (req.path === '/' || req.path === '/api' || req.path === '/api/')) {
    return res.status(200).json({
      success: true,
      message: 'API found',
      data: {
        health: '/api/health',
        test: '/api/test'
      }
    });
  }

  res.status(404).json({ success: false, message: 'API endpoint not found', error: 'Not Found' });
}

module.exports = notFound;
