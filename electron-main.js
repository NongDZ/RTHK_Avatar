const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');

let mainWindow;
let server;
let isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
    show: false,
    // icon: path.join(__dirname, 'public/icon.ico') // 如果有图标的话
  });

  // 启动 Express 服务器
  const expressApp = express();
  const PORT = 3000;
  
  // 设置静态文件服务，优先级很重要
  
  // 1. 服务 Next.js 静态资源（_next 文件夹）
  expressApp.use('/_next', express.static(path.join(__dirname, '.next')));
  
  // 2. 服务公共资源
  expressApp.use(express.static(path.join(__dirname, 'public')));
  
  // 3. 服务 3D Avatar 构建文件
  expressApp.use('/3d_avatar', express.static(path.join(__dirname, 'packages/3d_avatar/dist')));
  
  // 4. 服务 Next.js 生成的静态文件
  expressApp.use(express.static(path.join(__dirname, '.next')));
  
  // 处理所有路由，返回 index.html（SPA 模式）
  expressApp.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '.next/index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        console.error('Tried to serve:', indexPath);
        res.status(500).send('Internal Server Error');
      }
    });
  });
  
  server = expressApp.listen(PORT, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
      return;
    }
    console.log(`Electron server running on port ${PORT}`);
    mainWindow.loadURL(`http://localhost:${PORT}`);
    
    // 页面加载完成后显示窗口
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      console.log('Application window is now visible');
    });
  });

  // 开发工具
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 处理导航错误
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log('Failed to load:', errorDescription, validatedURL);
  });

  // 添加控制台日志输出
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log('Renderer console:', message);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (server) {
      server.close();
    }
  });
}

// 应用就绪时创建窗口
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (server) {
      server.close();
    }
    app.quit();
  }
});

// 安全性：阻止新窗口创建
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    navigationEvent.preventDefault();
  });
});