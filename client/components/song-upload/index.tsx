import * as React from "react";

const SongUpload = ({onSongSubmit}) => (
  <form onSubmit={onSongSubmit}>
    <input type="file" />
    <button type="submit">Upload</button>
  </form>
);

export default SongUpload;
