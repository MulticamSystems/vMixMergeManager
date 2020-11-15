const { app, BrowserWindow } = require('electron')
const express = require("express");
const rootPath = require('electron-root-path').rootPath;
const gui = express();
const path = require("path")
const http = require("http").createServer(gui);
const io = require("socket.io")(http);
const MergeManager = require("./MergeManager.js")
let mergeManager = new MergeManager(io);


function createWindow () {
  const win = new BrowserWindow({
    width: 420,
    height: 280,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
    fullscreen: false,
    resizable: false
  })

  win.loadFile('appindex.html')
  win.setMenu(null);
}


app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


gui.get("/gui", (req, res) => {
    res.sendFile(path.join(rootPath, "./index.html"));
});

gui.get("/common/css/style.css", (req, res) => {
    res.sendFile(path.join(rootPath, "./common/css/style.css"));
});
gui.get("/css/style.css", (req, res) => {
    res.sendFile(path.join(rootPath, "./css/style.css"));
});
gui.get("/common/bootstrap/css/bootstrap.css", (req, res) => {
    res.sendFile(path.join(rootPath, "./common/bootstrap/css/bootstrap.css"));
});
gui.get("/common/js/jquery.js", (req, res) => {
    res.sendFile(path.join(rootPath, "./common/js/jquery.js"));
});
gui.get("/common/js/socket.io.js", (req, res) => {
    res.sendFile(path.join(rootPath, "./common/js/socket.io.js"));
});
gui.get("/common/bootstrap/js/bootstrap.bundle.js", (req, res) => {
    res.sendFile(path.join(rootPath, "./common/bootstrap/js/bootstrap.bundle.js"));
});
gui.get("/script.js", (req, res) => {
    res.sendFile(path.join(rootPath, "./script.js"));
});

gui.post("/api/pairs/:pair/trigger", (req, res) => {
    mergeManager.triggerPair(req.params.pair);
    res.send("OK");
})
gui.post("/api/inputs/:input/add", (req, res) => {
    mergeManager.addInput(req.params.input);
    res.send("OK");
})
gui.post("/api/inputs/:input/remove", (req, res) => {
    mergeManager.removeInput(req.params.input);
    res.send("OK");
})

io.on("connection", (socket) => {
    socket.emit("state", mergeManager.state)
    socket.on("get-state", () => {
        socket.emit("state", mergeManager.state)
    })
    socket.on("set-state", (state) => {
        mergeManager.setState(JSON.parse(state));
    })
})


http.listen(1501)