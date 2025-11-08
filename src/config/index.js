module.exports = {
  port: process.env.PORT || 3000,
  db: {
    uri: process.env.DB_URI || 'mongodb://localhost:27017/mydatabase',
  },
  env: process.env.NODE_ENV || 'development',
};