import React, { useState } from "react";

const FindSongs = () => {
  const [query, setQuery] = useState("");
  const [trackData, setTrackData] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [foundTracks, setFoundTracks] = useState([]);
  const [downloadSelections, setDownloadSelections] = useState([]);

  const searchPlaylist = () => {
    fetch(
      `http://127.0.0.1:8000/get-playlist/?playlist_url=${encodeURIComponent(
        query
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        setTrackData(data.tracks.items);
        setSelectedTracks([]);
        setFoundTracks([]);
        setDownloadSelections([]);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error: " + error.message);
      });
  };

  const handleCheckboxChange = (index) => {
    setSelectedTracks((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const findSelectedTracks = () => {
    if (selectedTracks.length === 0) {
      alert("No tracks selected.");
      return;
    }

    const selectedItems = selectedTracks.map((i) => trackData[i]);

    const body = {
      id: query.startsWith("http")
        ? query
        : `https://open.spotify.com/playlist/${query}`,
      tracks: {
        items: selectedItems.map((item) => ({
          track: {
            name: item.track.name,
            album: { name: item.track.album.name },
            artists: item.track.artists.map((a) => ({ name: a.name })),
          },
        })),
      },
    };

    console.log("Sending to backend:", body);

    fetch("http://127.0.0.1:8000/find-tracks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        setFoundTracks(data);
        setDownloadSelections([]);
        alert("Found " + (Array.isArray(data) ? data.length : 0) + " matches.");
      })
      .catch((error) => {
        console.error("Find error:", error);
        alert("Error finding tracks.");
      });
  };

  const handleDownloadCheckboxChange = (index) => {
    setDownloadSelections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDownloadSelected = () => {
    if (downloadSelections.length === 0) {
      alert("No tracks selected for download.");
      return;
    }

    downloadSelections.forEach((idx) => {
      const jam = foundTracks[idx]?.found_on_jamendo;
      if (jam?.audio) {
        // ← fetch the remote file as a blob, then download
        fetch(jam.audio)
          .then((res) => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.blob();
          })
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${jam.name}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          })
          .catch((err) => {
            console.error("Download failed:", err);
            alert(`Failed to download ${jam.name}`);
          });
      }
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
                      checked={selectedTracks.includes(index)}
                      onChange={() => handleCheckboxChange(index)}
                    />
                  </td>
                  <td>{item.track.name}</td>
                  <td>{item.track.album.name}</td>
                  <td>
                    {item.track.artists.map((a) => a.name).join(", ")}
                  </td>
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
                <th>Select</th>
                <th>Song</th>
                <th>Artist</th>
                <th>Jamendo Link</th>
              </tr>
            </thead>
            <tbody>
              {foundTracks.map(
                (item, index) =>
                  item.found_on_jamendo && (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          checked={downloadSelections.includes(index)}
                          onChange={() =>
                            handleDownloadCheckboxChange(index)
                          }
                        />
                      </td>
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
                  )
              )}
            </tbody>
          </table>
          <button onClick={handleDownloadSelected}>
            Download Selected
          </button>
        </div>
      )}
    </div>
  );
};

export default FindSongs;
