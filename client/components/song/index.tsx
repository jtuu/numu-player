import * as React from "react";
const styles = require("./styles.scss");
const {nbsp} = require("../../../common/constants.json");

function formatDuration(seconds = 0){
  return ("00" +  Number(seconds / 60 | 0)).slice(-2) + ":" + ("00" + Number(seconds % 60 | 0)).slice(-2);
}

const Song = ({info, isPlaying, onPlayClick}) => (
  <div className={styles.song + (isPlaying ? " " + styles.playing : "")}>
    <div className={styles.left}>
      <div className={[styles.row, styles.top].join(" ")}>
        <div className={styles.artist}>
          {info.tags.artist}
        </div>
        <div className={styles.delim}></div>
        <div className={styles.title}>
          {info.tags.title}
        </div>
        <div className={styles.duration}>
          {formatDuration(info.duration)}
        </div>
      </div>
      <div className={[styles.row, styles.middle].join(" ")}>
        <div className={styles.uploader}>
          {"Added by " + info.uploader}
        </div>
      </div>
      <div className={[styles.row, styles.bottom].join(" ")}>
        <div className={styles.status}>
          {info.status}
        </div>
        <div className={styles.progress}>
          {info.progress}
        </div>
      </div>
    </div>
    <div className={styles.right}>
      <div className={styles.controls}>
        <div className={styles.play} onClick={ev => {
          ev.preventDefault();
          onPlayClick(info);
        }}>
        </div>
        <div className={styles.drag}>
        </div>
      </div>
    </div>
  </div>
);

export default Song;
