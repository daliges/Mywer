import React, { useState } from "react";

const FindSongs = () => {
  const [query, setQuery] = useState("");
  const [trackData, setTrackData] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [foundTracks, setFoundTracks] = useState([]);
  const [downloadSelections, setDownloadSelections] = useState([]);
  const [playlistId, setPlaylistId] = useState("");

  // --- Gemini AI state ---
  const [aiRec, setAiRec] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const searchPlaylist = () => {
    fetch(
      `http://127.0.0.1:8000/get-playlist/?playlist_url=${encodeURIComponent(
        query
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        setTrackData(data.tracks.items);
        setPlaylistId(data.id);
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

  // inside FindSongs component
  const handleDownloadSelected = () => {
    if (downloadSelections.length === 0) {
      alert("No tracks selected for download.");
      return;
    }
  
    // grab the FoundTrack objects you got back from /find-tracks/
    const selectedItems = downloadSelections.map(i => foundTracks[i]);
  
    const payload = selectedItems.map((item) => ({
        name:  item.song,                         // required
        artists: item.artists,                    // required (list[str])
        audio: item.found_on_jamendo?.audio || null,          // optional
        audiodownload: item.found_on_jamendo?.audiodownload || null, // optional
        }));
      
        fetch("http://127.0.0.1:8000/download-tracks/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),          // <- send the mapped array
        })
          .then(async (res) => {
            if (!res.ok) {
              // server sent an error (e.g. 400 “No valid tracks”)
              const msg = await res.text();          // JSON or plain text
              throw new Error(
                `Download failed (${res.status}): ${msg || res.statusText}`
              );
            }
            return res.blob();                        // success → get ZIP bytes
          })
          .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "selected_tracks.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
            console.error(error);
            alert(error.message);                     // show the real reason
          });
  };
  
  // --- Gemini AI Recommendation handler ---
  async function getRecommendations() {
    setAiLoading(true); setAiError(""); setAiRec(null);
    try {
      // Send the same track data the backend expects (as {tracks: {items: [...]}})
      const resp = await fetch("http://127.0.0.1:8000/recommend/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: playlistId || "https://open.spotify.com/playlist/unknown", // fallback if not set
          tracks: { items: trackData }
        })
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      setAiRec(data);
    } catch (err) {
      setAiError("Gemini AI request failed: " + err.message);
    } finally {
      setAiLoading(false);
    }
  }

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

        {/* Gemini Recommendations Button */}
      {trackData && trackData.length > 0 && (
        <div style={{ marginBottom: "1em" }}>
          <button onClick={getRecommendations} disabled={aiLoading}>
            {aiLoading ? "Getting AI Recommendations..." : "Get AI Recommendations"}
          </button>
        </div>
      )}

      {/* AI Error */}
      {aiError && <div style={{ color: "red" }}>{aiError}</div>}

      {/* Gemini AI Output */}
      {aiRec && (
        <div style={{
          background: "#f0f7fa",
          borderRadius: 10,
          padding: 20,
          marginTop: 16
        }}>
          <h3>🎧 Gemini's Personality Profile</h3>
          <p>{aiRec.character}</p>

          <h4>🎵 Gemini's Music Recommendations</h4>
          <ol>
            {aiRec.suggestions.map((s, i) =>
              <li key={i}>{typeof s === "string" ? s : JSON.stringify(s)}</li>
            )}
          </ol>

          {aiRec.stats && (
            <div>
              <h4>📊 Playlist Stats</h4>
              <ul>
                {Object.entries(aiRec.stats).map(([k, v]) =>
                  <li key={k}><b>{k}</b>: {String(v)}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

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
