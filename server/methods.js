import { SeatList } from '/imports/api/SeatList';
import { Questions } from '/imports/api/Questions';
import { Log } from '/imports/api/Log';
import { Sessions } from '/imports/api/Sessions';

var clientIP;
Meteor.onConnection(function(conn) {
    clientIP = conn.clientAddress;
  });

Meteor.methods({
    'getValues': function() {  
        var ret = {id: this.connection.id, ip: clientIP};   
        return ret;
    },
    'ipaddr': function(){
        return clientIP;
    },
    'changeStatus': function(name, seatID, stat) {
        SeatList.update({_id:seatID}, {$set:{status:stat}});

        var today = Date();
        var statchange = name+" changed status to "+stat;
        Log.insert({date:today, stud:name, change:statchange});
    },
    'submitQuestion': function(name, curip, q, scr, stat, d){
        Questions.insert({IP:curip, content:q, score:scr, status:stat, date:d});

        var today = Date();
        var statchange = name+" submitted question: "+q;
        Log.insert({date:today, stud:name, change:statchange});
    },
    'setScore': function(name, questionID, scr){
        Questions.update({ _id: questionID }, { $inc:{score:scr} });

        var today = Date();
        var statchange = name+" voted ";
        if(scr > 0){
            statchange+="up";
        }else{
            statchange+="down";
        }
        Log.insert({date:today, stud:name, change:statchange});
    },
    'changeQuestionStatus': function(id, stat){
        Questions.update({_id: id}, {$set:{status:stat}});
    },
    'keepalive': function(seatID) {    
        SeatList.update({_id: seatID}, {$set: {lastseen: (new Date()).getTime()}});
    }
});