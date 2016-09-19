declare var require: any;

interface ChatUserProps{
  id?: number;
  nick: string;
}

interface ChatUserListProps{
  users: ChatUserProps[];
}

interface ChatMessageProps{
  id?: number;
  nick?: string;
  text: string;
  timestamp: Date;
}

interface ChatLogProps{
  messages: ChatMessageProps[];
}

interface ChatBoxProps{
  dispatch?: Function;
  messages?: ChatMessageProps[];
  users?: ChatUserProps[];
}

interface ChatState{
  messages?: ChatMessageProps[];
  users?: ChatUserProps[];
  ownNick?: string;
}

interface RoomProps{
  dispatch?: Function;
  params?: {roomName: string};
  messages?: ChatMessageProps[];
  users?: ChatUserProps[];
  name?: string;
}

interface RoomState{
  playlist?: any[];
  chat?: ChatState;
  name?: string;
  lastRoom?: string;
}

interface AccountState{
  name: string;
  isInRoom?: boolean;
}

interface AppState{
  room: RoomState;
  account: AccountState;
}
