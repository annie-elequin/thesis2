import { Template } from 'meteor/templating';
import { SeatList } from '/imports/api/SeatList';
import { Questions } from '/imports/api/Questions';
import { Log } from '/imports/api/Log';
import { HTTP } from 'meteor/http';
import { Meteor } from 'meteor/meteor';

import './thesis2.html';

if(Meteor.isClient){
    Meteor.subscribe('seats');
    Meteor.subscribe('questions');
    Meteor.subscribe('log');

    function rgb(r, g, b){
        return "rgb("+r+","+g+","+b+")";
    }

    setColor = function(seat, color){
        console.log("set color!");

        var c;
        if(color == "active"){
            c = rgb(204,255,204);
        }else if(color == "good"){
            c = rgb(50,200,50);
        }else if(color == "meh"){
            c = rgb(255,200,0);
        }else if(color == "bad"){
            c = rgb(255,0,0);
        }else{
            c = rgb(128,128,128)
        }

        console.log("color: "+color);
        document.getElementById(seat).style.backgroundColor = c;
    }

    // client code: ping heartbeat every 5 seconds
    Meteor.setInterval(function () {
        Meteor.call('keepalive', Session.get('seatID'));
    }, 5000);

    Meteor.setInterval(function () {
        var now = (new Date()).getTime();
        var seatNum = Session.get('curseat');
        SeatList.find({lastseen: {$lt: (now - 60 * 1000)}}).forEach(function (user) {
            Meteor.call('changeStatus', user._id, seatNum, "inactive");
        });
    }, 300000);

    Template.statusbuttons.helpers({
        'setActive': function(){
            console.log("setActive");
            
            var testip = "129.62.150.41";
        
            // set the current IP address
            Session.setPersistent('curip', testip);
            console.log("current IP: "+testip);
        
            if(SeatList){
                // find and set the current seat value
                var curSeat = SeatList.findOne({ IP: testip });
                console.log("found a seat with the current IP");
                console.log(curSeat);
        
                if(curSeat){
                    // set the current seat number
                    Session.setPersistent('curseat', curSeat.seat);
                    console.log("Seat session set: "+curSeat.seat);
        
                    // set the current mongo id
                    Session.setPersistent('seatid', curSeat._id);
                    console.log("Seat ID session set: "+curSeat._id);

                    console.log("calling changestatus");
                    // set the status of the current seat as "active"
                    Meteor.call('changeStatus', curSeat._id, curSeat.seat, "active");
                }
            }
        },
        'isInactive': function(){
            console.log("is active?");
            console.log("id: "+Session.get('seatid'));
            if(Session.get('seatid')){
                console.log("yes");
                return false;
            }else{
                console.log("no");
                return true;
            }
        }
    });

    Template.statusbuttons.events({
        'click .good': function(){
            Meteor.call('changeStatus', Session.get('seatid'), Session.get('curseat'), "good");
        },
        'click .meh': function(){
            Meteor.call('changeStatus', Session.get('seatid'), Session.get('curseat'), "meh");
        },
        'click .bad': function(){
            Meteor.call('changeStatus', Session.get('seatid'), Session.get('curseat'), "bad");
        }
    });

    Template.classroom.helpers({
        'loadColors': function(){
            console.log("load colors");
            var cur = SeatList.find({});
            console.log(cur);
            cur.forEach(function(doc){
                console.log("for each");
                // handle
                setColor(doc.seat, doc.status);
            });
        }
    
    });
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
