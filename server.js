const express = require('express');
const path = require('path');
const open = require('open');

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// 处理所有路由，返回 index.html（用于 SPA）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // 自动打开浏览器
  if (process.env.NODE_ENV !== 'development') {
    open(`http://localhost:${PORT}`);
  }
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});