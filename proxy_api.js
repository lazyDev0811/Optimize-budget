module.exports = {
  '/api':
  {
    target: 'http://localhost',
    //target: 'http://optimize.oneegg.com.au',
    changeOrigin: true,
    secure: false,
    pathRewrite:
    {
      //'^\./api': '/api'
    }
  },
}
