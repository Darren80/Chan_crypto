const express = require('express');
const router = express.Router();

const auth = require('./routes/auth');
const findUser = require('./../utils/findUser');
const shell = require('shelljs');

router.post('/server-control', auth.required, async (req, res, next) => {
    const { payload } = req;
  
    let account = await findUser(payload.email);
  
    if (!account) {
      return res.status(400).send('Account does not exist');
    }
  
    let noPerms = (action) => {
      return `Permissions needed to: ${action} the server.`;
    }
  
    let intendedAction = req.body.action;
  
    switch (intendedAction) {
      case 'restart':
        if (account.permissions.restart) {
          res.send('Server restarted.');
          restartServer();
        } else {
          res.send(noPerms('restart'));
        }
        break;
  
      case 'stop':
        if (account.permissions.stop) {
          res.send('Server stopped.');
          stopServer();
        } else {
          res.send(noPerms('stop'));
        }
        break;
  
      default:
        res.send('Choose an action to perform.');
        break;
    }
  });
  
  function restartServer() {
    console.log("Server Restarted");
  
    shell.exec('pm2 restart "Express Server"');
  }
  
  function stopServer() {
    console.log("Server Stopped");
  
    shell.exec('pm2 delete "Express Server"');
  }

  module.exports = router;