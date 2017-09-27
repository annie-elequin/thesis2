import { SeatList } from '/imports/api/SeatList';
import { Questions } from '/imports/api/Questions';
import { Log } from '/imports/api/Log';

Meteor.methods({
    'changeStatus': function(name, seatID, seatNum, stat) {
        SeatList.update({_id:seatID}, {$set:{status:stat}});

        Log.insert({})
    },
    'submitQuestion': function(name, curip, q, scr, stat, d){
        Questions.insert({IP:curip, content:q, score:scr, status:stat, date:d});
    },
    'setScore': function(name, questionID, scr){
        Questions.update({ _id: questionID }, { $inc:{score:scr} });
    },
    'changeQuestionStatus': function(id, stat){
        Questions.update({_id: id}, {$set:{status:stat}});
    },
    'keepalive': function(seatID) {    
        SeatList.update({_id: seatID}, {$set: {lastseen: (new Date()).getTime()}});
    }
});