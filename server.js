const express = require('express');
const WebSocket = require('ws');
const { spawn } = require('child_process');


const path = require('path');
const os = require('os');



// 获取当前 IP 地址
function getIpAddress() {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = '';
  
  for (let interface in networkInterfaces) {
    const interfaces = networkInterfaces[interface];
    for (let i = 0; i < interfaces.length; i++) {
      const address = interfaces[i].address;
      if (interfaces[i].family === 'IPv4' && !interfaces[i].internal) {
        ipAddress = address;
        break;
      }
    }
  }
  
  return ipAddress;
}


const app = express();

const host = '0.0.0.0';  // 指定绑定的 IP 地址

const PORT = 3000;
const cors = require('cors');
app.use(cors({
  origin: "*", // 允许所有来源，或设置为特定的IP或域名
}));



app.use(express.static('public'));

// 获取音频设备列表的 API
app.get('/audio-devices', (req, res) => {
  const ffmpeg = spawn('ffmpeg', ['-list_devices', 'true', '-f', 'dshow', '-i', 'dummy']);

  let output = '';
  ffmpeg.stderr.on('data', (data) => {
    output += data.toString();
  });

  ffmpeg.on('close', () => {
    // 解析音频设备列表
    const deviceList = [];
    const regex = /"([^"]+)"/g;
    let match;
    while ((match = regex.exec(output)) !== null) {
      deviceList.push(match[1]);
    }
    res.json(deviceList);
  });
});

// 返回当前 IP 地址
app.get('/get-ip', (req, res) => {
  const ipAddress = getIpAddress();
  res.json({ ip: ipAddress });
});


// 路由提供音频文件
app.get('/output', (req, res) => {
  res.sendFile(path.join(__dirname, 'output.wav'));
});

// WebSocket 服务器，用于实时传输音频
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
  const selectedDevice = req.url.replace('/?device=', '');
  
  // 使用用户选择的设备启动 FFmpeg 子进程捕获音频
  const ffmpeg = spawn('ffmpeg', [
    '-f', 'dshow',
    '-i', `audio=${decodeURIComponent(selectedDevice)}`, // 使用选定的设备
    '-f', 'wav',
    'pipe:1'
  ]);

  ffmpeg.stdout.on('data', (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data); // 将音频数据发送到 WebSocket 客户端
    }
  });

  ffmpeg.stderr.on('data', (data) => {
    console.error(`FFmpeg error: ${data}`);
  });

  ws.on('close', () => {
    ffmpeg.kill(); // 关闭 FFmpeg 进程
  });
});

// 启动 HTTP 服务器并升级到 WebSocket
const server = app.listen(PORT,host, () => {
  console.log(`Server is running on http://${getIpAddress()}:${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
