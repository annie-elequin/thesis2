import { SeatList } from '/imports/api/SeatList';
import { Questions } from '/imports/api/Questions';
import { Log } from '/imports/api/Log';

Meteor.methods({
    'changeStatus': function(seatID, seatNum, stat) {
        SeatList.update({_id:seatID}, {$set:{status:stat}});
    },
    'keepalive': function(seatID) {    
        SeatList.update({_id: seatID}, {$set: {lastseen: (new Date()).getTime()}});
    }
});