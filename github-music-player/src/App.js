import React, { useState, useEffect } from "react";
import { FaPlay, FaStepBackward, FaStepForward } from "react-icons/fa";

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
  const [playlists, setPlaylists] = useState({}); // Stores playlists categorized by directories
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch list of directories (playlists) from the GitHub repository
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/songs?ref=${BRANCH}`
    // , {
      // headers: { Authorization: `token ${AUTH_TOKEN}` },
    // }
  )
      .then((response) => response.json())
      .then((data) => {
        const directories = data.filter((item) => item.type === "dir");
        const playlistsData = {};

        // Fetch songs from each directory
        Promise.all(
          directories.map((dir) =>
            fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${dir.path}?ref=${BRANCH}`
            // , {
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
          if (Object.keys(playlistsData).length > 0) {
            setCurrentPlaylist(Object.keys(playlistsData)[0]);
          }
        });
      })
      .catch((error) => console.error("Error fetching playlists:", error));
  }, []);

  // Play selected song
  const playSong = (index) => {
    if (currentPlaylist && playlists[currentPlaylist].length > 0) {
      setCurrentIndex(index);
    }
  };

  // Play next song
  const nextSong = () => {
    if (currentPlaylist && playlists[currentPlaylist].length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % playlists[currentPlaylist].length);
    }
  };

  // Play previous song
  const prevSong = () => {
    if (currentPlaylist && playlists[currentPlaylist].length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + playlists[currentPlaylist].length) % playlists[currentPlaylist].length);
    }
  };

  return (
    <div style={{ fontFamily: "Arial", backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0,0,0,0.1)", maxWidth: "800px", margin: "auto" }}>
      <h2 style={{ textAlign: "center", color: "#007bff" }}>Music Player</h2>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginBottom: "20px" }}>
        {Object.keys(playlists).map((playlist) => (
          <button key={playlist} onClick={() => setCurrentPlaylist(playlist)} style={{ margin: "5px", padding: "10px", backgroundColor: currentPlaylist === playlist ? "#007bff" : "#ccc", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            {formatSongName(playlist)}
          </button>
        ))}
      </div>
      {currentPlaylist && playlists[currentPlaylist] && (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {playlists[currentPlaylist].map((song, index) => (
            <li key={song.name} style={{ display: "flex", alignItems: "center", marginBottom: "10px", padding: "10px", backgroundColor: "#ffffff", borderRadius: "5px", boxShadow: "0px 2px 4px rgba(0,0,0,0.1)", fontWeight: index === currentIndex ? "bold" : "normal" }}>
              <button
                style={{ marginRight: "10px", padding: "5px 10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                onClick={() => playSong(index)}
              >
                <FaPlay />
              </button>
              {formatSongName(song.name)}
            </li>
          ))}
        </ul>
      )}
      {currentPlaylist && playlists[currentPlaylist]?.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", backgroundColor: "#343a40", color: "white", padding: "10px", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <button onClick={prevSong} style={{ margin: "5px", padding: "10px", backgroundColor: "#28a745", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            <FaStepBackward />
          </button>
          <span style={{ margin: "0 15px", fontSize: "16px" }}>{formatSongName(playlists[currentPlaylist][currentIndex]?.name)}</span>
          <audio key={playlists[currentPlaylist][currentIndex]?.download_url} controls autoPlay style={{ margin: "0 10px" }}>
            <source src={playlists[currentPlaylist][currentIndex]?.download_url} type="audio/mpeg" />
          </audio>
          <button onClick={nextSong} style={{ margin: "5px", padding: "10px", backgroundColor: "#dc3545", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            <FaStepForward />
          </button>
        </div>
      )}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <h3 style={{ color: "#007bff" }}>Check my Spotify!</h3>
        <iframe 
          src="https://open.spotify.com/embed/artist/5xfp9phqz9IEuAnHDASQwl?utm_source=generator&theme=0"
          width="100%" 
          height="352" 
          frameBorder="0" 
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy">
        </iframe>
      </div>
    </div>
  );
};

export default MusicPlayer;
