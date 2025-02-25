import React, { useState, useEffect } from "react";
import { FaPlay, FaStepBackward, FaStepForward } from "react-icons/fa";

const GITHUB_REPO = "tiagohcalves/songs"; // Replace with your GitHub repo
const BRANCH = "main"; // Change if needed

const formatSongName = (name) => {
  return name
    .replace(".mp3", "") // Remove .mp3 extension
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};

const MusicPlayer = () => {
  const [playlists, setPlaylists] = useState({}); // State to store playlists
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch the list of directories (playlists) from the GitHub repository
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/songs/?ref=${BRANCH}`)
      .then((response) => response.json())
      .then((data) => {
        const directories = data.filter((item) => item.type === "dir");
        const playlistsData = {};

        // Fetch songs from each directory
        Promise.all(
          directories.map((dir) =>
            fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${dir.path}?ref=${BRANCH}`)
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

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "600px", margin: "auto", textAlign: "center", backgroundColor: "#f8f9fa", borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" }}>
      <h2 style={{ color: "#007bff" }}>GitHub Music Player</h2>
      <div>
        {Object.keys(playlists).map((playlist) => (
          <button key={playlist} onClick={() => setCurrentPlaylist(playlist)} style={{ margin: "5px", padding: "10px", backgroundColor: currentPlaylist === playlist ? "#007bff" : "#ccc", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            {playlist.toUpperCase()}
          </button>
        ))}
      </div>
      {currentPlaylist && playlists[currentPlaylist] && (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {playlists[currentPlaylist].map((song, index) => (
            <li key={song.name} style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#ffffff", borderRadius: "5px", boxShadow: "0px 2px 4px rgba(0,0,0,0.1)" }}>
              {formatSongName(song.name)}
              <button
                style={{ marginLeft: "10px", padding: "5px 10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                onClick={() => playSong(index)}
              >
                <FaPlay />
              </button>
            </li>
          ))}
        </ul>
      )}
      {currentPlaylist && playlists[currentPlaylist]?.length > 0 && (
        <div>
          <audio key={playlists[currentPlaylist][currentIndex]?.download_url} controls autoPlay style={{ width: "100%", marginTop: "20px", borderRadius: "5px" }}>
            <source src={playlists[currentPlaylist][currentIndex]?.download_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <div style={{ marginTop: "10px" }}>
            <button onClick={prevSong} style={{ margin: "5px", padding: "5px 15px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              <FaStepBackward />
            </button>
            <button onClick={nextSong} style={{ margin: "5px", padding: "5px 15px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              <FaStepForward />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
