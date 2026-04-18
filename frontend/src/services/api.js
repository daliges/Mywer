import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export function getPlaylist(url) {
  return axios.get(`${BASE}/get-playlist/`, { params: { playlist_url: url } });
}
export function findTracks(data) {
  return axios.post(`${BASE}/find-tracks/`, data);
}
export function getRecommendations(data) {
  // Accepts either playlist or { ...playlist, count }
  return axios.post(`${BASE}/recommend/`, data);
}
export function downloadTracks(tracks) {
  return axios.post(`${BASE}/download-tracks/`, tracks, {
    responseType: 'blob'
  });
}