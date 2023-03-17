const { app, BrowserWindow } = require('electron');

app.whenReady().then(function() {
	const window = new BrowserWindow({
		title: 'Kyjos',
		simpleFullscreen: true
	});
	
	window.setMenu(null);
	
	window.loadFile('build/index.html');
});
