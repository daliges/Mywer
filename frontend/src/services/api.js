import axios from 'axios';

const BASE = "http://localhost:8000";

export function getPlaylist(url) {
  return axios.get(`${BASE}/get-playlist/`, { params: { playlist_url: url } });
}
export function findTracks(data) {
  return axios.post(`${BASE}/find-tracks/`, data);
}
export function getRecommendations(data) {
  return axios.post(`${BASE}/recommend/`, data);
}
export function downloadTracks(tracks) {
  return axios.post(`${BASE}/download-tracks/`, tracks, {
    responseType: 'blob'
  });
}