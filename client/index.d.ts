declare var require: (path: string) => any;

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

declare enum PLAYER_STATUS{
  "PLAYING",
  "PAUSED",
  "STOPPED"
}

interface PlayerState{
  songs?: {};
  order?: string[];
  status?: PLAYER_STATUS;
  current_song_id?: string;
  current_song_start_date?: Date;
  current_song_offset?: number;
  seekTo?: number;
}

interface RoomState{
  player?: PlayerState;
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
