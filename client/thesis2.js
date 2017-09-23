import { Template } from 'meteor/templating';
import { SeatList } from '/imports/api/SeatList';
import { Questions } from '/imports/api/Questions';
import { Log } from '/imports/api/Log';
import { HTTP } from 'meteor/http';
import { Meteor } from 'meteor/meteor';

import './thesis2.html';

setActive = function(){
    console.log("hi");
}

if(Meteor.isClient){
    Meteor.subscribe('seats');
    Meteor.subscribe('questions');
    Meteor.subscribe('log');


}


if(Meteor.isServer){
    Meteor.publish('seats', function(){
        return SeatList.find();
    });
    Meteor.publish('questions', function(){
        return Questions.find();
    });
    Meteor.publish('log', function(){
        return Log.find();
    });  

    // Listen to incoming HTTP requests, can only be used on the server
WebApp.rawConnectHandlers.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
  });

  Meteor.onConnection(function(conn) {
    console.log(conn.clientAddress);
    Session.set('ip', conn.clientAddress);
});
}
