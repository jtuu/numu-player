const {
	ACTION_TYPE,
	FILE_PROCESS_STATUS,
	FILE_STATUS,
	PLAYER_STATUS
} = require("../../common/constants.json");
import initialStates from "./initial-states";

const song = (state = initialStates.song, action) => {
	switch(action.type){
		case ACTION_TYPE.SONG_UPLOAD_PROGRESS:
		case ACTION_TYPE.SONG_TRANSCODE_PROGRESS: {
			return Object.assign({}, state, {progress: action.song.progress}, {status: action.song.status});
		}
		case ACTION_TYPE.SONG_METADATA:
		case ACTION_TYPE.SONG_UPLOAD_BEGIN: {
			return Object.assign({}, state, action.song);
		}
		case ACTION_TYPE.SONG_UPLOAD_END:
		case ACTION_TYPE.SONG_TRANSCODE_BEGIN:
		case ACTION_TYPE.SONG_TRANSCODE_END: {
			return Object.assign({}, state, {status: action.song.status});
		}
		default: {
			return state;
		}
	}
}

const playlist = (state = initialStates.songs, action) => {
	switch(action.type){
		case ACTION_TYPE.ROOM_STATE: {
			return Object.assign({}, state, action.state.player.songs.reduce((p, c) => (p[c.id] = c, p), {}));
		}
		case ACTION_TYPE.SONG_UPLOAD_BEGIN: {
			return Object.assign({}, state, {[action.song.id]: song(initialStates.song, action)});
		}
		case ACTION_TYPE.SONG_TRANSCODE_BEGIN:
		case ACTION_TYPE.SONG_UPLOAD_PROGRESS:
		case ACTION_TYPE.SONG_TRANSCODE_PROGRESS:
		case ACTION_TYPE.SONG_METADATA: {
			return Object.assign({}, state, {[action.song.id]: song(state[action.song.id], action)});
		}
		case ACTION_TYPE.SONG_UPLOAD_END:
		case ACTION_TYPE.SONG_TRANSCODE_END: {
			if(action.result === FILE_PROCESS_STATUS.FAILED){
				const newState = Object.assign({}, state);
				delete newState[action.song.id];
				return newState;
			}else if(action.result === FILE_PROCESS_STATUS.SUCCESS){
				return Object.assign({}, state, {[action.song.id]: song(state[action.song.id], action)});
			}
		}
		default: {
			return state;
		}
	}
};


const player = (state: PlayerState = initialStates.player, action) => {
  switch(action.type){
		case ACTION_TYPE.ROOM_STATE: {
			const {
				status,
				current_song_id,
				current_song_start_date,
				current_song_offset
			} = action.state.player;
			return Object.assign({}, state, {
				songs: playlist(state.songs, action),
				order: state.order.concat(action.state.player.order),
				status,
				current_song_id,
				current_song_start_date,
				current_song_offset
			});
		}
		case ACTION_TYPE.PLAY_SONG: {
			return Object.assign({}, state, {
				status: PLAYER_STATUS.PLAYING,
				current_song_id: action.song.id
			});
		}
		case ACTION_TYPE.PAUSE_PLAYER: {
			return Object.assign({}, state, {
				status: PLAYER_STATUS.PAUSED
			});
		}
		case ACTION_TYPE.RESUME_PLAYER: {
			return Object.assign({}, state, {
				status: PLAYER_STATUS.PLAYING
			});
		}
		case ACTION_TYPE.STOP_PLAYER: {
			return Object.assign({}, state, {
				status: PLAYER_STATUS.STOPPED
			});
		}
		case ACTION_TYPE.RESET_PLAYER: {
			const newState = Object.assign({}, state);
			delete newState.current_song_id;
			delete newState.current_song_start_date;
			delete newState.current_song_offset;
			return newState;
		}
		case ACTION_TYPE.SEEK_SONG: {
			return Object.assign({}, state, {
				seekTo: action.seconds
			});
		}
		case ACTION_TYPE.SONG_UPLOAD_BEGIN:
		case ACTION_TYPE.SONG_TRANSCODE_BEGIN:
		case ACTION_TYPE.SONG_UPLOAD_END:
		case ACTION_TYPE.SONG_TRANSCODE_END:
		case ACTION_TYPE.SONG_UPLOAD_PROGRESS:
		case ACTION_TYPE.SONG_TRANSCODE_PROGRESS:
		case ACTION_TYPE.SONG_METADATA: {
			return Object.assign({}, state, {songs: playlist(state.songs, action)});
		}
    default: {
      return state;
    }
  }
}

export default player;
