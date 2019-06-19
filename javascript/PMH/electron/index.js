const electron = require('electron')
const app = electron.app
let mainWindow

app.on('ready', () => {
  createMainWindow()
})

app.on('activate', () => {
  createMainWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function createMainWindow () {
  mainWindow = new electron.BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    autoHideMenuBar: true
  })
  mainWindow.loadFile('./src/index.html')
  mainWindow.on('close', () => {
    mainWindow = null
  })
}
