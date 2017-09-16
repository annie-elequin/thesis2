import { Meteor } from 'meteor/meteor';
import { SeatList } from '/imports/api/SeatList';
import { Questions } from '/imports/api/Questions';
import { Log } from '/imports/api/Log';

Meteor.startup(() => {
  // code to run on server at startup

  // Listen to incoming HTTP requests, can only be used on the server
  WebApp.rawConnectHandlers.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
  });
});
