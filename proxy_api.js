module.exports = {
  '/api':
  {
    target: 'http://localhost:8888/',
    //target: 'http://optimize.oneegg.com.au',
    changeOrigin: true,
    secure: false,
    pathRewrite:
    {
      //'^\./api': '/api'
    }
  },
}
