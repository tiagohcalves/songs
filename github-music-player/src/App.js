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
  const [songs, setSongs] = useState([]); // State to store song list
  const [currentIndex, setCurrentIndex] = useState(0); // State to track current song index

  useEffect(() => {
    // Fetch the list of files from the GitHub repository
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/?ref=${BRANCH}`)
      .then((response) => response.json())
      .then((data) => {
        // Filter out only .mp3 files
        const mp3Files = data.filter((file) => file.name.endsWith(".mp3"));
        setSongs(mp3Files);
      })
      .catch((error) => console.error("Error fetching songs:", error));
  }, []);

  const playSong = (index) => {
    if (songs.length > 0) {
      setCurrentIndex(index);
    }
  };

  const nextSong = () => {
    if (songs.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % songs.length);
    }
  };

  const prevSong = () => {
    if (songs.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
    }
  };

  return (
    <div style={{ marginTop: "20px", padding: "20px", fontFamily: "Arial", maxWidth: "600px", margin: "auto", textAlign: "center", backgroundColor: "#f8f9fa", borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" }}>
      <h2 style={{ color: "#007bff" }}>My Songs</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {songs.map((song, index) => (
          <li key={song.name} style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#ffffff", borderRadius: "5px", boxShadow: "0px 2px 4px rgba(0,0,0,0.1)" }}>
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
      {songs.length > 0 && (
        <div>
          <audio key={songs[currentIndex]?.download_url} controls autoPlay style={{ width: "100%", marginTop: "20px", borderRadius: "5px" }}>
            <source src={songs[currentIndex]?.download_url} type="audio/mpeg" />
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