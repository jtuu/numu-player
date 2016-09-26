import * as React from "react";
import SongUpload from "../../components/song-upload";
import Playlist from "../../components/playlist";
import PlayerControls from "../../components/player-controls";
import {connect} from "react-redux";
const {PLAYER_STATUS, FILE_STATUS} = require("../../../common/constants.json");
import {
  uploadSong,
  playSong,
  pausePlayer,
  resumePlayer,
  stopPlayer,
  resetPlayer,
  seekSong
} from "../../actions";
const styles = require("./styles.scss");

interface PlayerProps{
  onSongSubmit?: Function;
  onSongPlayClick?: Function;
  playNext?: Function;
  onPause?: Function;
  onResume?: Function;
  onSeek?: Function;
  ownNick?: string;
  roomName?: string;
  songs?: {};
  order?: string[];
  status?: PLAYER_STATUS;
  current_song_id?: string;
  current_song_start_date?: string;
  current_song_offset?: number;
  seekTo?: number;
}

const mapStateToProps = ({account, room}): PlayerProps => {
  const {
    songs,
    order,
    status,
    current_song_id,
    current_song_start_date,
    current_song_offset,
    seekTo
  } = room.player;
  return {
    ownNick: account.name,
    roomName: room.name,
    songs,
    order,
    status,
    current_song_id,
    current_song_start_date,
    current_song_offset,
    seekTo
  };
}

const mergeProps = (stateProps: PlayerProps, {dispatch}): PlayerProps => {
  return Object.assign(stateProps,{
    onSongSubmit: ev => {
      ev.preventDefault();
      const fileInput = ev.target.querySelector("input[type='file']");
      if(fileInput){
        const files = fileInput.files;
        if(files && files.length){
          dispatch(uploadSong(stateProps.roomName, stateProps.ownNick, files[0]));
        }
      }
    },
    onSongPlayClick: song => {
      dispatch(resetPlayer());
      dispatch(playSong(song));
    },
    playNext: () => {
      const cur_idx = stateProps.order.indexOf(stateProps.current_song_id);
      if(cur_idx === -1){
        return;
      }
      if(cur_idx + 1 >= stateProps.order.length){
        return dispatch(stopPlayer());
      }
      for(let i = cur_idx + 1; i < Object.keys(stateProps.songs).length; i++){
        if(stateProps.songs[stateProps.order[i]].status === FILE_STATUS.DONE){
          return dispatch(playSong(stateProps.songs[stateProps.order[i]]));
        }
      }
      return dispatch(stopPlayer());
    },
    onPause: () => {
      dispatch(pausePlayer());
    },
    onResume: () => {
      dispatch(resumePlayer());
    },
    onSeek: (seconds: number) => {
      dispatch(seekSong(seconds));
    }
  });
}

const decorate = connect<PlayerProps, {}, PlayerProps>(
  mapStateToProps,
  null,
  mergeProps
);

class Player extends React.Component<PlayerProps, {currentTime: number}>{
  private audio: HTMLAudioElement;

  constructor(props){
    super(props);

    this.state = {
      currentTime: 0
    };
    this.audio = new Audio();
    this.audio.autoplay = true;
  }

  componentDidMount(){
    this.audio.volume = 0.5;
    this.audio.addEventListener("ended", this.playNext);
    this.audio.addEventListener("timeupdate", this.onTimeupdate);
  }

  componentWillUnmount(){
    this.audio.removeEventListener("timeupdate", this.onTimeupdate);
    this.audio.removeEventListener("ended", this.playNext);
    this.audio.pause();
  }

  onTimeupdate = (e) => {
    this.setState({currentTime: e.target.currentTime});
  }

  playNext = () => {
    this.props.playNext();
  }

  onPlayPauseClick = () => {
    if(this.audio.paused){
      this.props.onResume();
    }else{
      this.props.onPause();
    }
  }

  onSeekbarChange = (e) => {
    this.props.onSeek(e.target.value);
  }

  onVolumebarChange = (e) => {
    this.audio.volume = e.target.value;
  }

  play(id: string){
    this.audio.src = `/transcoded/${id}.mp3`;
    this.audio.play();
  }

  pause(){
    this.audio.pause();
  }

  resume(){
    this.audio.play();
  }

  seek(seconds: number){
    this.audio.currentTime = seconds;
  }

  componentWillReceiveProps(nextProps: PlayerProps){
    if(nextProps.seekTo !== this.props.seekTo){
      console.log(nextProps.seekTo)
      this.seek(nextProps.seekTo);
    }
    if(
      nextProps.status !== this.props.status ||
      nextProps.current_song_id !== this.props.current_song_id ||
      nextProps.current_song_offset > this.props.current_song_offset + 1000 ||
      nextProps.current_song_offset < this.props.current_song_offset - 1000
    ){
      switch(nextProps.status){
        case PLAYER_STATUS.PLAYING: {
          if(
            nextProps.current_song_id in this.props.songs
            || nextProps.current_song_id in nextProps.songs
          ){
            if(nextProps.current_song_id !== this.props.current_song_id){
              this.play(nextProps.current_song_id);
              this.seek(
                ((new Date()).getTime() - (new Date(nextProps.current_song_start_date)).getTime() - nextProps.current_song_offset) / 1000 | 0
              );
            }else if(nextProps.current_song_offset !== this.props.current_song_offset){
              this.resume();
              this.seek(
                ((new Date()).getTime() - (new Date(nextProps.current_song_start_date)).getTime() - nextProps.current_song_offset) / 1000 | 0
              );
            }else{
              this.resume();
            }
          }
          break;
        }
        case PLAYER_STATUS.PAUSED: {
          this.pause();
          break;
        }
        case PLAYER_STATUS.STOPPED: {
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  render(){
    return (
      <div className={styles.player}>
        <PlayerControls
          onPlayPauseClick={this.onPlayPauseClick}
          onSeekbarChange={this.onSeekbarChange}
          onVolumebarChange={this.onVolumebarChange}
          currentSeconds={this.state.currentTime}
          totalSeconds={
            this.props.current_song_id ?
            this.props.songs[this.props.current_song_id].duration :
            null
          }
          volume={this.audio.volume}
          paused={this.audio.paused}
        />
        <Playlist
          songs={Object.keys(this.props.songs).map(key => this.props.songs[key])}
          onSongPlayClick={this.props.onSongPlayClick}
          current_song_id={this.props.current_song_id}
        />
        <SongUpload onSongSubmit={this.props.onSongSubmit} />
      </div>
    );
  }
}

export default decorate(Player);
