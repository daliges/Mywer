export async function fetchPlaylist(playlistUrl) {
    const res = await fetch(`http://127.0.0.1:8000/get-playlist/?playlist_url=${encodeURIComponent(playlistUrl)}`);
    return await res.json();
  }
  
  export async function findTracks(selectedTracks) {
    const res = await fetch("http://127.0.0.1:8000/find-tracks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tracks: selectedTracks }),
    });
    return await res.json();
  }

  export async function getRecommendations(playlistObj) {
    const resp = await fetch('http://127.0.0.1:8000/recommend/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playlistObj)
    });
    if (!resp.ok) throw new Error("AI recommend error");
    return await resp.json();
  }