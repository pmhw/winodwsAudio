##  windows电脑本地音频导流到局域网


最近思考 windows 环境 必须要用耳机 或者蓝牙链接音频吗？答案显然易见，否则也不会有该项目的诞生。





## 环境

nodejs

ffmpeg （已提供）

​device设备采集音视频数据（已提供）

- 运行 Setup.Screen.Capturer.Recorder.v0.13.3.exe 即可安装device

安装后自动虚拟出 screen-capture-recorder 和 virtual-audio-capturer 设备 可通过 ```ffmpeg -list_devices true -f dshow -i dummy``` 指令查看

screen-capture-recorder 获取的是电脑视频流

virtual-audio-capturer 获取的是播放扬声器音频流

<img src="./img/288c94395e942580b3306472166adf0.png" width="120px">

## 使用教程


### 1.下载ffmpeg 解压根目录命名为ffmpeg

[FFmpeg 成品](https://github.com/BtbN/FFmpeg-Builds/releases)

<img src="./img/9b65ea77d3aa2e633b981023f2cb507.png" width="220px">

<img src="./img/dcd36d179999bbdfe0b001e99f8f731.png" width="220px">

### 2.安装 device

运行 Setup.Screen.Capturer.Recorder.v0.13.3.exe  自动安装虚拟设备

### 3.启动服务

```shell

cnpm i

npm run dev

```

### 4.手机访问 ip:3000


ws 实时传送音频流

<img src="./img/0d66bac18fc45c26169e8a6565c91a9.png" width="120px">



## 补充

```shell

cd ffmpeg/bin

# 录制视频
ffmpeg -f dshow -i video="screen-capture-recorder" output.flv

# 录制音频
ffmpeg -f dshow -i audio="virtual-audio-capturer" output.wav


ffmpeg -i output.wav


# 查看设备列表

ffmpeg -list_devices true -f dshow -i dummy


```

```Windows PowerShell

Test-NetConnection -ComputerName 192.168.0.104 -Port 3000

```


FFmpeg解码出来的音频数据是PCM格式，可以使用H5的Web Audio Api来播放

[WasmVideoPlayer](https://github.com/sonysuqin/WasmVideoPlayer)

[Desktop中文版本](https://trac.ffmpeg.org/wiki/Capture/Capture/Desktop%E4%B8%AD%E6%96%87%E7%89%88%E6%9C%AC)

[​device - 屏幕捕获录像机到视频 windows](https://github.com/rdp/screen-capture-recorder-to-video-windows-free?tab=readme-ov-file) 

[网络音频 API 支持浏览器可视图](https://caniuse.com/?search=web%20audio)
