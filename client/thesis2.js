import { Template } from 'meteor/templating';
import { SeatList } from '/imports/api/SeatList';
import { Questions } from '/imports/api/Questions';
import { Log } from '/imports/api/Log';
import { HTTP } from 'meteor/http';
import { Meteor } from 'meteor/meteor';

import './thesis2.html';

setActive = function(){

}

if(Meteor.isServer){
    Meteor.onConnection(function(conn) {
        console.log(conn.clientAddress);
        Session.set('ip', conn.clientAddress);
    });
}