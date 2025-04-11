import React, { useState } from "react";

const FindSongs = () => {
  const [query, setQuery] = useState("");
  const [trackData, setTrackData] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [foundTracks, setFoundTracks] = useState([]);

  const searchPlaylist = () => {
    fetch(`http://127.0.0.1:8000/get-playlist/?playlist_url=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
        setTrackData(data.tracks.items);
        setSelectedTracks([]);
        setFoundTracks([]);
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
    if (selectedTracks.length === 0) {
      alert("No tracks selected.");
      return;
    }

    const selectedItems = selectedTracks.map(index => trackData[index]);

    const body = {
      id: query.startsWith("http") ? query : `https://open.spotify.com/playlist/${query}`,
      tracks: {
        items: selectedItems.map(item => ({
          track: {
            name: item.track.name,
            album: { name: item.track.album.name },
            artists: item.track.artists.map(artist => ({ name: artist.name }))
          }
        }))
      }
    };

    console.log("Sending to backend:", body);

    fetch("http://127.0.0.1:8000/find-tracks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(data => {
        const count = Array.isArray(data) ? data.length : 0;
        setFoundTracks(data);
        alert("Found " + count + " matches.");
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

      {foundTracks.length > 0 && (
        <div className="found-tracks">
          <h3>Matched Tracks on Jamendo</h3>
          <table>
            <thead>
              <tr>
                <th>Song</th>
                <th>Artist</th>
                <th>Jamendo Link</th>
              </tr>
            </thead>
            <tbody>
              {foundTracks.map((item, index) =>
                item.found_on_jamendo ? (
                  <tr key={index}>
                    <td>{item.song}</td>
                    <td>{item.artists.join(", ")}</td>
                    <td>
                      <a
                        href={item.found_on_jamendo.shareurl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Listen
                      </a>
                    </td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FindSongs;
