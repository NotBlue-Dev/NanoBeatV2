const { app, BrowserWindow, ipcMain } = require('electron')
const nano = require('./lib')

const start = (webContents) => {
  // Init nano lib
  const sendEvent = (channel, args) => {
    if ((typeof webContents.send) === 'function') {
      webContents.send(channel, args)
    } else {
      console.log('can not send event')
    }
  }

  const listenEvent = (channel, callable) => {
    ipcMain.on(channel, function (event, arg) {
      callable(arg, event)
    })
  }

  const nanoleaf = new nano.nanoManager(
    new nano.IpFinder(),
    new nano.ConfigLoader(__dirname),
    new nano.beatsaberAdaptater(),
    sendEvent,
    listenEvent,
  )
  // temp
  setTimeout(() => {
    nanoleaf.start()
  }, 500);

}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
      width:1400,
      height:900,
      resizable:false,
      minimizable : false,
      maximizable : false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      },
      frame:false,
      title:'nanoleaf',
    })
    mainWindow.loadFile('./view/main/index.html')
        .then(() => {
          mainWindow.webContents.openDevTools()
          start(mainWindow.webContents)
        })
    .catch((err) => console.error(err))
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    BrowserWindow.getAllWindows().length === 0 && createWindow()
  })
})

app.on('window-all-closed', function () {
  process.platform !== 'darwin' && app.quit()
})