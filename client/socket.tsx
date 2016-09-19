import * as io from "socket.io-client";

interface CustomSocket{
  onevent?: Function;
}

const socket: typeof io.Socket & CustomSocket = io.connect("/public", {
  path: "/api/ws/"
});

//extends socket.io to add the "*" event
const onevent = socket.onevent;
socket.onevent = function(packet){
    var args = packet.data || [];
    onevent.call(this, packet);
    packet.data = ["*"].concat(args);
    onevent.call(this, packet);
};

export default socket;
