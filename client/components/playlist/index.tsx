import * as React from "react";
import Song from "../song";
const styles = require("./styles.scss");

const Playlist = ({songs, current_song_id, onSongPlayClick}) => (
  <ul className={styles.playlist}>
    {
      songs.map(song => (
        <li key={song.id}>
          <Song info={song} onPlayClick={onSongPlayClick} isPlaying={song.id === current_song_id}/>
        </li>
      ))
    }
  </ul>
);

export default Playlist;
