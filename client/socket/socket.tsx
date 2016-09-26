import * as io from "socket.io-client";

type Socket = typeof io.Socket;
interface ICustomSocket{onevent?: Function};
type CustomSocket = Socket & ICustomSocket;

module SocketContainer{
  export const ns: Map<string, CustomSocket> = new Map();

  function addWildcard(ns: Socket): CustomSocket{
    const onevent = ns["onevent"];
    (ns as CustomSocket).onevent = function(packet){
      var args = packet.data || [];
      onevent.call(this, packet);
      packet.data = ["*"].concat(args);
      onevent.call(this, packet);
    };
    return ns;
  }

  export function createNs(name: string): CustomSocket{
    if(ns.has(name)){
      return ns.get(name);
    }
    ns.set(name, addWildcard(
      io.connect(`/${name}`, {
        path: "/api/ws/"
      })
    ));
    return ns.get(name);
  }
}

export default SocketContainer;
