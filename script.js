console.log("Let's start JS");

let songs = []; // Global songs for the active playlist
let currentAudio = null; // Currently playing Audio object
let currentSongIndex = null; // Index of the current song in the active playlist
let activePlaylistId = null; // ID of the currently active playlist
let playAudioCallId = 0; // Global counter for playAudio cancellation
const backendUrl = "https://cloudflare-music-service.vercel.app";
// const backendUrl = "http://localhost:3000";

// Select elements
const playlistContainer = document.getElementById("playlistContainer");
const songList = document.querySelector("#songListing ul");
const seekBar = document.getElementById("seekBar");
const currentTimeDisplay = document.getElementById("currentTime");
const durationDisplay = document.getElementById("duration");
const playPauseBtn = document.querySelector("#playPauseBtn img");
const libraryName = document.getElementById("library-name");

// Volume control elements
const volumeControl = document.getElementById("volumeControl");
const volumePercentage = document.getElementById("volumePercentage");
const muteBtn = document.getElementById("muteBtn");
const muteIcon = muteBtn.querySelector("img");

let lastVolume = 1; // For volume control
// ---------------------------------
// FETCH AND LOAD PLAYLISTS
// ---------------------------------
async function loadPlaylists() {
  try {
    const response = await fetch(`${backendUrl}/playlists`);
    const playlists = await response.json();
    // playlistContainer.innerHTML = "";
    playlists.forEach((playlist, index) => {
      const card = document.createElement("div");
      card.className = "playlist-card";
      card.innerHTML = `
        <div class="card">
          <div class="play">
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" fill="#3be477" stroke="none" />
              <polygon points="18,14 34,24 18,34" fill="#000000" />
            </svg>
          </div>
          <div class="imgContainer">
            <img src="./images/${index}.jpeg" alt="">
          </div>
          <div class="flex playlistInfo">
            <div><h2>${playlist.name}</h2></div>
            <div> A.R. Rahman, Atif Aslam, Shankar-Ehsaan-Loy and more </div>
          </div>
        </div>`;
      // When a playlist card is clicked, load its songs and auto-play its first song.
      card.addEventListener("click", () => {
        activePlaylistId = playlist.id;
        loadSongsFromPlaylist(playlist.id, true, playlist.name); // When user clicks, auto-play the first song
        document.querySelector(".left").style.left = 0;
      });
      playlistContainer.appendChild(card);

      // On page load, load the first playlist but do not auto-play.
      if (index === 0 && !activePlaylistId) {
        activePlaylistId = playlist.id;
        loadSongsFromPlaylist(playlist.id, false, playlist.name); // false => no auto-play on page load
      }
    });
  } catch (error) {
    console.error("Error fetching playlists:", error);
  }
}

// ---------------------------------
// LOAD SONGS FROM A PLAYLIST
// ---------------------------------
async function loadSongsFromPlaylist(
  playlistId,
  autoPlayFirst = false,
  playlistName = "Your Library"
) {
  try {
    const response = await fetch(`${backendUrl}/${playlistId}`);
    const fetchedSongs = await response.json();

    // Update global songs and active playlist
    songs = fetchedSongs;
    activePlaylistId = playlistId;
    songList.innerHTML = "";

    // ✅ Update the playlist name in the Library
    document.getElementById("library-name").textContent = playlistName;
    fetchedSongs.forEach((song, idx) => {
      const li = document.createElement("li");
      if (song.cover != "default-cover.jpg") {
        coverImgUrl = song.cover;
        console.log(song.cover);
      } else {
        coverImgUrl = "imgs/default-cover.jpeg";
      }
      li.innerHTML = `
        <div class="songName">
        <img id="li-song-cover" src=${coverImgUrl} height="40" alt="cover">
          <div class="info flex">
            <div class="songName scrolling-container">
              <div class="scrolling-text">
                <span>${song.name} 🎵</span>
                <span>${song.name} 🎵</span>
              </div>
            </div>
            <div class="artist">${song.artist}</div>
          </div>
          <div class="playButtonCard">
            <img src="imgs/playButtoncard.svg" alt="Play">
          </div>
        </div>`;

      // Clicking a song updates active playlist and plays that song.
      li.addEventListener("click", () => {
        activePlaylistId = playlistId;
        songs = fetchedSongs;
        playAudio(idx);
      });

      songList.appendChild(li);
    });

    // If autoPlayFirst is true (only when user clicks a playlist), start playing the first song.
    if (autoPlayFirst && songs.length > 0) {
      playAudio(0);
    }
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

// ---------------------------------
// PLAY AUDIO WITH BUFFERING & CANCELLATION
// ---------------------------------
async function playAudio(idx) {
  playAudioCallId++;
  const thisCallId = playAudioCallId;

  // Stop any currently playing audio.
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    if (currentAudio.src && currentAudio.src.startsWith("blob:")) {
      URL.revokeObjectURL(currentAudio.src);
    }
    toggleSidebarPlayButton(currentSongIndex, false);
    currentAudio = null;
  }

  currentSongIndex = idx;
  const originalUrl = songs[idx].url;
  console.log("🎵 Original Song URL:", originalUrl);

  try {
    const response = await fetch(originalUrl);
    if (thisCallId !== playAudioCallId) return;
    const arrayBuffer = await response.arrayBuffer();
    if (thisCallId !== playAudioCallId) return;
    const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    const bufferedUrl = URL.createObjectURL(audioBlob);
    console.log("🎵 Buffered URL created.");

    currentAudio = new Audio(bufferedUrl);
    currentAudio.preload = "auto";

    // Update UI for the current song.
    playPauseBtn.src = "imgs/pauseButton.svg";
    updateScrollingEffect(idx, true);
    document.querySelector("#playingSongName").textContent = songs[idx].name;
    document.querySelector("#playbar-artist").textContent = songs[idx].artist;
    toggleSidebarPlayButton(idx, true);

    if (songs[idx].cover != "default-cover.jpg") {
      document.querySelector("#musiccover").src = songs[idx].cover;
    } else {
      document.querySelector("#musiccover").src = "imgs/default-cover.jpeg";
    }

    currentAudio
      .play()
      .then(() => console.log("✅ Playback started"))
      .catch((err) => console.error("❌ Playback error:", err));

    currentAudio.addEventListener("timeupdate", updateSeekBar);
    currentAudio.addEventListener("loadedmetadata", displayDuration);
    currentAudio.addEventListener("ended", () => {
      toggleSidebarPlayButton(idx, false);
      playNextSong();
    });
  } catch (error) {
    console.error("Error in playAudio:", error);
  }
}

// ---------------------------------
// NEXT / PREVIOUS CONTROLS
// ---------------------------------
function playNextSong() {
  if (currentSongIndex === null || songs.length === 0) return;
  const nextIndex = (currentSongIndex + 1) % songs.length;
  playAudio(nextIndex);
}

function playPreviousSong() {
  if (currentSongIndex === null || songs.length === 0) return;
  const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playAudio(prevIndex);
}

function togglePlayPause() {
  if (!currentAudio) {
    playAudio(currentSongIndex !== null ? currentSongIndex : 0);
  } else {
    if (currentAudio.paused) {
      currentAudio.play();
      playPauseBtn.src = "imgs/pauseButton.svg";
      updateScrollingEffect(currentSongIndex, true);
      toggleSidebarPlayButton(currentSongIndex, true);
    } else {
      currentAudio.pause();
      playPauseBtn.src = "imgs/playButton.svg";
      updateScrollingEffect(currentSongIndex, false);
      toggleSidebarPlayButton(currentSongIndex, false);
    }
  }
}

// ---------------------------------
// UI UPDATES: SEEK BAR, TIME, SCROLLING ANIMATION
// ---------------------------------
function updateSeekBar() {
  if (currentAudio) {
    const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
    seekBar.value = progress;
    seekBar.style.background = `linear-gradient(to right, #1db954 ${progress}%, #535353 ${progress}%)`;
    seekBar.style.setProperty("--progress", `${progress}%`);
    currentTimeDisplay.textContent = formatTime(currentAudio.currentTime);
  }
}

function displayDuration() {
  if (currentAudio && currentAudio.duration) {
    durationDisplay.textContent = formatTime(currentAudio.duration);
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

seekBar.addEventListener("input", () => {
  if (!currentAudio) {
    currentSongIndex = currentSongIndex !== null ? currentSongIndex : 0;
    playAudio(currentSongIndex);
  }
  const newTime = (seekBar.value / 100) * currentAudio.duration;
  currentAudio.currentTime = newTime;
  updateSeekBar();
});

function updateScrollingEffect(idx, shouldScroll) {
  const allItems = document.querySelectorAll("#songListing ul li");
  allItems.forEach((li, i) => {
    const scrollingText = li.querySelector(".scrolling-text");
    if (scrollingText) {
      if (i === idx && shouldScroll) {
        scrollingText.classList.remove("scrolling-active");
        void scrollingText.offsetWidth; // Force reflow to restart animation
        scrollingText.classList.add("scrolling-active");
      } else {
        scrollingText.classList.remove("scrolling-active");
      }
    }
  });
}

function toggleSidebarPlayButton(idx, isPlaying) {
  const allButtons = document.querySelectorAll(
    "#songListing ul li .playButtonCard"
  );
  allButtons.forEach((btn, i) => {
    if (i === idx) {
      btn.innerHTML = isPlaying
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="30" viewBox="0 0 14 14" fill="none" class="equalizer">
             <rect x="4" width="2" height="14" fill="#1DB954" class="bar bar-1" />
             <rect x="0" width="2" height="10" fill="#1DB954" class="bar bar-2" />
             <rect x="12" y="7" width="2" height="7" fill="#1DB954" class="bar bar-3" />
             <rect x="8" y="10" width="2" height="4" fill="#1DB954" class="bar bar-4" />
           </svg>`
        : `<img src="imgs/playButtoncard.svg" alt="Play">`;
    } else {
      btn.innerHTML = `<img src="imgs/playButtoncard.svg" alt="Play">`;
    }
  });
}

// ---------------------------------
// EVENT LISTENERS FOR CONTROLS
// ---------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadPlaylists();
  document
    .querySelector("#prevBtn")
    .addEventListener("click", playPreviousSong);
  document
    .querySelector("#playPauseBtn")
    .addEventListener("click", togglePlayPause);
  document.querySelector("#nextBtn").addEventListener("click", playNextSong);
});

document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = 0;
});

document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-100%";
});

// ----------------------------
// VOLUME CONTROL
// ----------------------------
volumeControl.addEventListener("input", () => {
  if (currentAudio) {
    currentAudio.volume = volumeControl.value;
  }
  volumePercentage.innerText = Math.round(volumeControl.value * 100) + "%";
});

muteBtn.addEventListener("click", () => {
  if (volumeControl.value > 0) {
    lastVolume = volumeControl.value;
    volumeControl.value = 0;
  } else {
    volumeControl.value = lastVolume || 0.5;
  }
  if (currentAudio) {
    currentAudio.volume = volumeControl.value;
  }
  volumePercentage.innerText = Math.round(volumeControl.value * 100) + "%";
  muteIcon.src = volumeControl.value == 0 ? "imgs/mute.svg" : "imgs/volume.svg";
});

document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowUp") {
    volumeControl.value = Math.min(1, parseFloat(volumeControl.value) + 0.1);
  } else if (event.code === "ArrowDown") {
    volumeControl.value = Math.max(0, parseFloat(volumeControl.value) - 0.1);
  } else if (event.code === "KeyM") {
    muteBtn.click();
  }
  if (currentAudio) {
    currentAudio.volume = volumeControl.value;
  }
  volumePercentage.innerText = Math.round(volumeControl.value * 100) + "%";
  muteIcon.src = volumeControl.value == 0 ? "imgs/mute.svg" : "imgs/volume.svg";
});
