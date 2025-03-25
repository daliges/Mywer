import React, { useState } from "react";
import { fetchPlaylist, findTracks } from "../services/api";

const FindSongs = () => {
  const [query, setQuery] = useState("");
  const [trackData, setTrackData] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);

  const searchPlaylist = () => {
    fetch(`http://127.0.0.1:8000/get-playlist/?playlist_url=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
        setTrackData(data.tracks.items);
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Error: " + error.message);
      });
  };

  const handleCheckboxChange = (index) => {
    setSelectedTracks(prevSelected => {
      if (prevSelected.includes(index)) {
        return prevSelected.filter(i => i !== index);
      } else {
        return [...prevSelected, index];
      }
    });
  };

  const findSelectedTracks = () => {
    const selected = selectedTracks.map(index => trackData[index])
      .map(item => ({
        track: item.track.name,
        artist: item.track.artists.map(a => a.name).join(", ")
      }));

    if (selected.length === 0) {
      alert("No tracks selected.");
      return;
    }

    fetch("http://127.0.0.1:8000/find-tracks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tracks: selected })
    })
      .then(response => response.json())
      .then(data => {
        console.log("Found music:", data);
        alert("Found " + data.length + " matches.");
      })
      .catch(error => {
        console.error("Find error:", error);
        alert("Error finding tracks.");
      });
  };

  return (
    <div className="search-container">
      <h2>Enter Playlist URL</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Paste playlist URL..."
      />
      <button onClick={searchPlaylist}>Search</button>
      <button onClick={findSelectedTracks}>Find Selected Tracks</button>
      <div id="result">
        {trackData.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Track Name</th>
                <th>Album Name</th>
                <th>Artists</th>
              </tr>
            </thead>
            <tbody>
              {trackData.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      className="track-checkbox"
                      checked={selectedTracks.includes(index)}
                      onChange={() => handleCheckboxChange(index)}
                    />
                  </td>
                  <td>{item.track.name}</td>
                  <td>{item.track.album.name}</td>
                  <td>{item.track.artists.map(artist => artist.name).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FindSongs;