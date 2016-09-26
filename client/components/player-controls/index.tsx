import * as React from "react";
const styles = require("./styles.scss");

function formatDuration(seconds = 0){
  return ("00" +  Number(seconds / 60 | 0)).slice(-2) + ":" + ("00" + Number(seconds % 60 | 0)).slice(-2);
}

interface PlayerControlsProps{
  onPlayPauseClick?: Function;
  onSeekbarChange?: Function;
  onVolumebarChange?: Function;
  currentSeconds?: number;
  totalSeconds?: number;
  volume?: number;
  paused?: boolean;
}

class PlayerControls extends React.Component<PlayerControlsProps, {}>{

  /*
  shouldComponentUpdate(nextProps: PlayerControlsProps){
    return (
      nextProps.currentSeconds !== this.props.currentSeconds ||
      nextProps.volume !== this.props.volume ||
      nextProps.paused !== this.props.paused
    );
  }
  */

  render(){
    return (
      <div className={styles.controls}>
        <div className={styles.main_button}>
          <div
            className={[styles.icon, (this.props.paused ? styles.play : styles.pause), "fa"].join(" ")}
            onClick={this.props.onPlayPauseClick}
          ></div>
        </div>
        <div className={styles.seekbar_container}>
          <input
            className={styles.seekbar}
            type="range" step="1"
            min="0" value={this.props.currentSeconds || 0}
            max={this.props.totalSeconds || 0}
            onChange={this.props.onSeekbarChange} />
        </div>
        <div className={styles.time_container}>
          <div className={styles.time}>
            {formatDuration(this.props.currentSeconds)}
          </div>
        </div>
        <div className={styles.volumebar_container}>
          <div className={[styles.icon, "fa"].join(" ")}></div>
          <input
            type="range" step="0.01"
            min="0" max="1" value={this.props.volume || 0.5}
            onChange={this.props.onVolumebarChange}
          />
        </div>
      </div>
    )
  }
}

export default PlayerControls;
