const {
    app,
    BrowserWindow,
    Menu,
    Tray
} = require('electron')

const express = require("express");
const gui = express();
const path = require("path")
const http = require("http").createServer(gui);
const io = require("socket.io")(http);
const MergeManager = require("./MergeManager.js")
let mergeManager = new MergeManager(io);






function createWindow() {
    const win = new BrowserWindow({
        width: 420,
        height: 280,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        frame: false,
        fullscreen: false,
        resizable: false,
        icon: "./icon.png"
    })

    win.loadFile('appindex.html')
    win.setMenu(null);
    var appIcon = null;
    appIcon = new Tray(path.join(__dirname,'./icon.png'));
    appIcon.setToolTip('vMix Merge Manager');
    appIcon.on("click", () => {
        win.show();
    })
    
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
    res.sendFile(path.join(__dirname, "./index.html"));
});

gui.get("/common/css/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "./common/css/style.css"));
});
gui.get("/css/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "./css/style.css"));
});
gui.get("/common/bootstrap/css/bootstrap.css", (req, res) => {
    res.sendFile(path.join(__dirname, "./common/bootstrap/css/bootstrap.css"));
});
gui.get("/common/js/jquery.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./common/js/jquery.js"));
});
gui.get("/common/js/socket.io.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./common/js/socket.io.js"));
});
gui.get("/common/bootstrap/js/bootstrap.bundle.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./common/bootstrap/js/bootstrap.bundle.js"));
});
gui.get("/script.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./script.js"));
});
gui.get("/mmlogolang.png", (req, res) => {
    res.sendFile(path.join(__dirname, "./mmlogolang.png"));
});
gui.get("/vmixpresets.zip", (req, res) => {
    res.sendFile(path.join(__dirname, "./vmixpresets.zip"));
})

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