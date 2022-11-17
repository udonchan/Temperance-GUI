"use strict";

const {app, BrowserWindow, Menu} = require('electron');
const isMac = process.platform === 'darwin'

Menu.setApplicationMenu(null);

const createWindow = () => {
    const win = new BrowserWindow({
	width: 480,
	height: 340,
	resizable: false
    });
    win.loadFile("html/index.html");
    // デベロッパーツールを開く場合
    //win.webContents.openDevTools();
};

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
	// for Mac OSX
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
