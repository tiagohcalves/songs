import React, { useState, useEffect } from "react";
import { FaPlay, FaStepBackward, FaStepForward, FaShare } from "react-icons/fa";
import "./index.css";

const GITHUB_REPO = "tiagohcalves/songs"; // GitHub repository containing songs
const BRANCH = "main"; // Branch to fetch from

// Function to format song names (remove .mp3, replace hyphens, capitalize words)
const formatSongName = (name) => {
  return name
    .replace(".mp3", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const MusicPlayer = () => {
  const [playlists, setPlaylists] = useState({});
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const playlistParam = urlParams.get("playlist");
    const songParam = urlParams.get("song");

    fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/songs/?ref=${BRANCH}`
    // , {
      // headers: { Authorization: `token ${AUTH_TOKEN}` },
    // }
    )
      .then((response) => response.json())
      .then((data) => {
        const directories = data.filter((item) => item.type === "dir");
        const playlistsData = {};

        Promise.all(
          directories.map((dir) =>
            fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${dir.path}?ref=${BRANCH}` 
            //, {
              // headers: { Authorization: `token ${AUTH_TOKEN}` },
            // }
          )
              .then((response) => response.json())
              .then((songs) => {
                playlistsData[dir.name] = songs.filter((song) => song.name.endsWith(".mp3"));
              })
          )
        ).then(() => {
          setPlaylists(playlistsData);
          if (playlistParam && playlistsData[playlistParam]) {
            setCurrentPlaylist(playlistParam);
            const songIndex = playlistsData[playlistParam].findIndex(song => song.name === songParam);
            if (songIndex !== -1) {
              setCurrentIndex(songIndex);
            }
          } else if (Object.keys(playlistsData).length > 0) {
            setCurrentPlaylist(Object.keys(playlistsData)[0]);
          }
        });
      })
      .catch((error) => console.error("Error fetching playlists:", error));
  }, []);

  useEffect(() => {
    if (currentIndex >= 0 && currentPlaylist != null) {
      const url = `${window.location.origin}?playlist=${currentPlaylist}&song=${playlists[currentPlaylist][currentIndex]?.name}`;
      window.history.replaceState(null, playlists[currentPlaylist][currentIndex]?.name, url)  
    }
  }, [currentIndex, currentPlaylist, playlists])

  const playSong = (index) => {
    if (currentPlaylist && playlists[currentPlaylist].length > 0) {
      setCurrentIndex(index);
    }
  };

  const nextSong = () => {
    if (currentPlaylist && playlists[currentPlaylist].length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % playlists[currentPlaylist].length);
    }
  };

  const prevSong = () => {
    if (currentPlaylist && playlists[currentPlaylist].length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + playlists[currentPlaylist].length) % playlists[currentPlaylist].length);
    }
  };

  const shareSong = () => {
    const url = `${window.location.origin}?playlist=${currentPlaylist}&song=${playlists[currentPlaylist][currentIndex]?.name}`;
    navigator.clipboard.writeText(url);
    alert("Song URL copied to clipboard!");
  };

  return (
    <div className="container" >
      <div className="playlist-buttons">
        {Object.keys(playlists).map((playlist) => (
          <button key={playlist} onClick={() => setCurrentPlaylist(playlist)} className={currentPlaylist === playlist ? "active" : ""}>
            {formatSongName(playlist)}
          </button>
        ))}
      </div>
      {currentPlaylist && playlists[currentPlaylist] && (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {playlists[currentPlaylist].map((song, index) => (
            <li onClick={() => playSong(index)} key={song.name} className={`song-item ${index === currentIndex ? "active" : ""}`}>
              <FaPlay style={{ marginRight: "10px"}}/>
               {formatSongName(song.name)}
            </li>
          ))}
        </ul>
      )}
      {currentPlaylist && playlists[currentPlaylist]?.length > 0 && (
        <div className="bottom-bar">
          <button onClick={prevSong} className="control-button"><FaStepBackward /></button>
          <span style={{ margin: "0 15px", fontSize: "16px" }}>{formatSongName(playlists[currentPlaylist][currentIndex]?.name)}</span>
          <audio key={playlists[currentPlaylist][currentIndex]?.download_url} controls autoPlay style={{ margin: "0 10px" }}>
            <source src={playlists[currentPlaylist][currentIndex]?.download_url} type="audio/mpeg" />
          </audio>
          <button onClick={nextSong}><FaStepForward /></button>
          <button onClick={shareSong}><FaShare /></button>
        </div>
      )}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <iframe 
          title="Spotify Player"
          src="https://open.spotify.com/embed/artist/5xfp9phqz9IEuAnHDASQwl?utm_source=generator&theme=0"
          width="100%" 
          height="352" 
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy">
        </iframe>
      </div>

    </div>
    
  );
};

export default MusicPlayer;
