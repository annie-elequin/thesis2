import { Template } from 'meteor/templating';
import { SeatList } from '/imports/api/SeatList';
import { Questions } from '/imports/api/Questions';
import { Log } from '/imports/api/Log';
import { HTTP } from 'meteor/http';
import { Meteor } from 'meteor/meteor';

import './thesis2.html';

// if it's "Bill_Booth", he should have access to ANY ip
// fix the name of who's logged in
// add the log statements



if(Meteor.isClient){
    Meteor.subscribe('seats');
    Meteor.subscribe('questions');
    Meteor.subscribe('log');

    const sesh = Meteor.default_connection._lastSessionId;
    console.log("id thing: "+Meteor.default_connection._lastSessionId);

    function rgb(r, g, b){
        return "rgb("+r+","+g+","+b+")";
    }

    setColor = function(seat, color){
        // console.log("set color!");

        if(seat && color){
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

            // console.log("color: "+color);
            document.getElementById(seat).style.backgroundColor = c;
        }  
    }

    inactiveFunction = function(){
        var ip = Session.get('curip');
        console.log("ON BEFORE UNLOAD");
        var name = Session.get('studentName'+ip);
        // console.log("seatid: "+seatID);
        var seatID = Session.get('seatid'+ip);
        if(seatID){
            Meteor.call('changeStatus', name, 
                Session.get('seatid'+ip), "inactive");
        }
        Object.keys(Session.keys).forEach(function(key){ Session.set(key, undefined); })
        Session.keys = {}
        Session.clear();
    }

    // client code: ping heartbeat every 5 seconds
    Meteor.setInterval(function () {
        console.log("KEEP ALIVE");
        var ip = Session.get('curip');
        Meteor.call('keepalive', Session.get('seatid'+ip));
    }, 5000);

    Meteor.setInterval(function () {
        console.log("CLEAR SESH");
        var now = (new Date()).getTime();
        SeatList.find({lastseen: {$lt: (now - 60 * 1000)}}).forEach(function (doc) {
            Meteor.call('changeStatus', "TIMEOUT", doc._id, "inactive");
        });
        Session.clear();
    }, 36000000);

    Template.statusbuttons.helpers({
        'setActive': function(){
            console.log("setActive");
            console.log("HEY LOOK A THING");
            Meteor.call('ipaddr', function(e,r){
                Session.set('curip', r);
            }); 
            console.log("ip: "+Session.get('curip'));
            var curip = Session.get('curip');
            console.log("***************");
        
            if(SeatList){
                // find and set the current seat value
                console.log("seatlist exists");
                var curSeat = SeatList.findOne({ IP: curip });
                console.log("found a seat with the current IP");
                console.log(curSeat);

                // SET NAME SESH
                var url = "https://csi-info.baylor.edu/upload/getUserID.php?IP_Address='"+curip+"'";
                
                if(curip){
                    console.log(url);
                    HTTP.get(url,
                        function( error, response ) {
                        if ( error ) {
                            console.log("super didn't work");
                        console.log( error );
                        } else {
                            console.log("worked! "+response.content);
                            Session.setPersistent('studentName'+curip, response.content);
                            // Session.setPersistent('studentName', "Annie_Mathis");
                            if(curSeat.status == "inactive"){
                                // set the status of the current seat as "active"
                                Meteor.call('changeStatus', response.content,
                                    curSeat._id, "active");
                            }
                        }
                    });
                }
        
                // if(curSeat){
                //     // set the current seat number
                //     Session.setPersistent('curseat', curSeat.seat);
                //     console.log("Seat session set: "+curSeat.seat);
        
                //     // set the current mongo id
                //     Session.setPersistent('seatid', curSeat._id);
                //     console.log("Seat ID session set: "+curSeat._id);                                    
                // }

                if(curSeat){
                    // set the current seat number
                    Session.set('curseat'+curip, curSeat.seat);
                    console.log("Seat session set: "+curSeat.seat);
        
                    // set the current mongo id
                    Session.set('seatid'+curip, curSeat._id);
                    console.log("Seat ID session set: "+curSeat._id);                                    
                }

            }             
        },
        'name': function(){
            var ip = Session.get('curip');
            console.log("WELCOME");
            var name = Session.get('studentName'+ip);
            console.log("name: "+name);
            var res = name.split("_");
            // console.log("res: "+res[0]);
            return res[0];
        },
        'isInactive': function(){
            console.log("is active?");
            var curip = Session.get('curip');
            var derp = true;

            Meteor.call('ipaddr', function(e,r){
                Session.set('curip', r);
            }); 

            if(curip != Session.get('curip')){
                console.log("calling setActive from inActive function");
                setActive();
            }
            var id = Session.get('seatid'+curip);            

            if(id){
                console.log("yo, there's a seat id");
                var thing = SeatList.findOne({_id:Session.get('seatid'+curip)});
                console.log(thing);
                if(thing.status != "inactive"){
                    console.log("you're not inactive");
                    derp = false;
                }
            }

            var name = Session.get('studentName'+curip);
            console.log("STUD NAME: "+name);
            if(name == "Bill_Booth" || name == "Annie_Mathis"){
                console.log("you're either booth or annie");
                derp = false;
            }
            return derp;
        },
        'dev': function(){
            var ip = Session.get('curip');
            var name = Session.get('studentName'+ip);
            if(name == "Annie_Mathis" || name == "Bill_Booth"){
                return true;
            }else{
                return false;
            }
        }
    });

    Template.statusbuttons.events({
        'click .good': function(){
            var ip = Session.get('curip');
            Meteor.call('changeStatus', Session.get('studentName'+ip),
                Session.get('seatid'), "good");
        },
        'click .meh': function(){
            var ip = Session.get('curip');
            Meteor.call('changeStatus', Session.get('studentName'+ip),
                Session.get('seatid'), "meh");
        },
        'click .bad': function(){
            var ip = Session.get('curip');
            Meteor.call('changeStatus', Session.get('studentName'+ip),
                Session.get('seatid'), "bad");
        },
        'click .sessions': function(){
            Session.clear();
        },
        'click .inactive': function(){
            // set everyone in the class to inactive
            SeatList.find({}).forEach(function(doc){
                Meteor.call('changeStatus', "DEV MODE ANNIE",
                    doc._id, "inactive");
            });
        },
        'click .whois': function(){
            // display ip
            console.log("YOUR IP ADDRESS");
            var i = Session.get('curip');
            console.log(i);
            console.log(Meteor.default_connection._lastSessionId);
        }
    });

    Template.classroom.helpers({
        'loadColors': function(){
            // console.log("load colors");
            SeatList.find().forEach(function(doc){
                // console.log("for each");
                // handle
                setColor(doc.seat, doc.status);
            });
        },
        'isInactive': function(){
            console.log("is active?");
            var curip = Session.get('curip');
            var derp = true;

            Meteor.call('ipaddr', function(e,r){
                Session.set('curip', r);
            }); 

            if(curip != Session.get('curip')){
                console.log("calling setActive from inActive function");
                setActive();
            }
            var id = Session.get('seatid'+curip);            

            if(id){
                console.log("yo, there's a seat id");
                var thing = SeatList.findOne({_id:Session.get('seatid'+curip)});
                console.log(thing);
                if(thing.status != "inactive"){
                    console.log("you're not inactive");
                    derp = false;
                }
            }

            var name = Session.get('studentName'+curip);
            console.log("STUD NAME: "+name);
            if(name == "Bill_Booth" || name == "Annie_Mathis"){
                console.log("you're either booth or annie");
                derp = false;
            }
            return derp;
        }
    });

    Template.submitquestion.helpers({
        'isInactive': function(){
            console.log("is active?");
            var curip = Session.get('curip');
            var derp = true;

            Meteor.call('ipaddr', function(e,r){
                Session.set('curip', r);
            }); 

            if(curip != Session.get('curip')){
                console.log("calling setActive from inActive function");                
                setActive();
            }
            var id = Session.get('seatid'+curip);            

            if(id){
                console.log("yo, there's a seat id");
                var thing = SeatList.findOne({_id:Session.get('seatid'+curip)});
                console.log(thing);
                if(thing.status != "inactive"){
                    console.log("you're not inactive");
                    derp = false;
                }
            }

            var name = Session.get('studentName'+curip);
            console.log("STUD NAME: "+name);
            if(name == "Bill_Booth" || name == "Annie_Mathis"){
                console.log("you're either booth or annie");
                derp = false;
            }
            return derp;
        }
    });

    Template.submitquestion.events({
        'submit form': function(event){
            var ip = Session.get('curip');
            event.preventDefault();
            var question = event.target.question.value;
            console.log("your question is: "+question);
            var seatID = Session.get('seatid'+ip);
            var name = Session.get('studentName'+ip);
            console.log("seatID: "+seatID);
            // console.log("name: "+name);
            if(seatID){
                var curSeat = SeatList.findOne({ _id: seatID });
                var d = new Date();
                console.log("calling the meteor call to submit the question");
                Meteor.call('submitQuestion',name, curSeat.IP, question, 0, "active", d);
            }
            event.target.question.value = "";
        }
    });

    Template.questions.helpers({
        'question': function(){
            var today = new Date();
            today.setHours(0,0,0,0);
            return Questions.find({ status: "active", date: {$gt: today} }, { sort: {score:-1} });
        },
        'isInactive': function(){
            console.log("is active?");
            var curip = Session.get('curip');
            var derp = true;

            Meteor.call('ipaddr', function(e,r){
                Session.set('curip', r);
            }); 

            if(curip != Session.get('curip')){
                console.log("calling setActive from inActive function");                
                setActive();
            }
            var id = Session.get('seatid'+curip);            

            if(id){
                console.log("yo, there's a seat id");
                var thing = SeatList.findOne({_id:Session.get('seatid'+curip)});
                console.log(thing);
                if(thing.status != "inactive"){
                    console.log("you're not inactive");
                    derp = false;
                }
            }

            var name = Session.get('studentName'+curip);
            console.log("STUD NAME: "+name);
            if(name == "Bill_Booth" || name == "Annie_Mathis"){
                console.log("you're either booth or annie");
                derp = false;
            }
            return derp;
        },
        'prof': function(){
            var ip = Session.get('curip');
            console.log("is this the prof?");
            var name = Session.get('studentName'+ip);
            if(name == "Bill_Booth" || name == "Annie_Mathis"){
                return true;
            }else{
                return false;
            }
        },
        'colorize': function(){
            var scr = this.score;
            var id = this._id;
            if(scr > 0){
                document.getElementById("content"+id).style.backgroundColor = rgb(45, (scr*8)+140, 0);
            }else if(scr < 0){
                document.getElementById("content"+id).style.backgroundColor = rgb((scr*(8))+255,130,180);
            }else{
                document.getElementById("content"+id).style.backgroundColor = lightgray;               
            }

            var sesh = Session.get(id+"vote");
            if(sesh == -1){
                document.getElementById("vote"+id).style.backgroundColor = rgb(220, 0, 0);
            }else if(sesh == 1){
                document.getElementById("vote"+id).style.backgroundColor = rgb(50, 200, 50);
            }
        }
    });

    Template.questions.events({
        'click .activebut': function(){
            // console.log("hide the question");
            // var seatID = Session.get('selectedSeat');
            // var name = Session.get('studentName');
            Meteor.call('changeQuestionStatus', this._id, "inactive");
        },
        'click .up': function(){
            var ip = Session.get('curip');
            var vote = Session.get(this._id+"vote");
            var name = Session.get('studentName'+ip);
            if(!vote){
                // they haven't voted, and they voted up
                Session.setPersistent(this._id+"vote", 1);
                Meteor.call('setScore', name, this._id, 1);
            }else if(vote == -1){
                // they had voted down, and now they're voting up
                Session.update(this._id+"vote", 1);
                Meteor.call('setScore', name, this._id, 2);
            }            
        }, 
        'click .down': function(){
            var ip = Session.get('curip');
            var vote = Session.get(this._id+"vote");
            var name = Session.get('studentName'+ip);
            if(!vote){

                // they haven't voted, and they voted up
                Session.setPersistent(this._id+"vote", -1);
                Meteor.call('setScore', name, this._id, -1);
            }else if(vote == 1){

                // they had voted up, and now they're voting down
                Session.update(this._id+"vote", -1);
                Meteor.call('setScore', name, this._id, -2);
            }            
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
}
