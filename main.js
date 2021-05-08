const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let win;

async function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.maximize();
  win.removeMenu();

  win.loadFile("index.html");
  // win.webContents.openDevTools();
}

function readDirectory() {
  let directoryPath = process.argv[1];

  directoryPath = directoryPath.split("/");
  let firstFileName = directoryPath.pop();
  directoryPath = directoryPath.join("/");

  let fileNames = fs.readdirSync(directoryPath);
  let mp4Files = [];
  fileNames.forEach(function (file) {
    if (file.split(".").pop() == "mp4") {
      mp4Files.push(file);
    }
  });

  let firstFileIndex = mp4Files.indexOf(firstFileName);

  return [directoryPath, mp4Files, firstFileIndex];
}

app.on("ready", createWindow);

ipcMain.on("toMain", (event, args) => {
  [directoryPath, fileNames, firstFileIndex] = readDirectory();

  JSONdata = {
    args: process.argv,
    directoryPath: directoryPath,
    fileNames: fileNames,
    firstFileIndex: firstFileIndex,
  };

  win.webContents.send("fromMain", JSON.stringify(JSONdata));
});
