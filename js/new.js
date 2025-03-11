console.log("Let's start JS");

let songs = [];
let currentAudio = null;
let currentSongIndex = null;

// Select elements
const playlistContainer = document.getElementById("playlistContainer");
const songList = document.querySelector("#songListing ul");
const seekBar = document.querySelector("#seekBar");
const currentTimeDisplay = document.querySelector("#currentTime");
const durationDisplay = document.querySelector("#duration");
const playPauseBtn = document.querySelector("#playPauseBtn img");

// Fetch and display playlists
async function loadPlaylists() {
  try {
    const response = await fetch("http://localhost:3000/playlists");
    const playlists = await response.json();
    playlistContainer.innerHTML = "";
    playlists.forEach((playlist, index) => {
      const card = document.createElement("div");
      card.className = "playlist-card";
      card.innerHTML = `
                    <div class="card">
                        <div class="play ">
                            <svg id='Play_Button_Circled_24' width='48' height='48' viewBox='0 0 48 48'
                                xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>
                                <rect width='48' height='48' stroke='none' fill='none' opacity='0' />

                                <!-- Outer Circle (Filled with #3be477) -->
                                <circle cx="24" cy="24" r="22" fill="#3be477" stroke="none" />

                                <!-- Centered Play Triangle -->
                                <polygon points="18,14 34,24 18,34" fill="#000000" />
                            </svg>
                        </div>

                        <img src="./images/˖ _ ᝢ ʾ ִֶָ ꕤ 🥛 ⁾⁾.jpeg" alt="">


                        <h2>${playlist}</h2>

                        <p>A.R. Rahman, Atif Aslam, Shankar-Ehsaan-Loy and more</p>
                    </div>`;

      card.addEventListener("click", () => loadSongsFromPlaylist(playlist));
      playlistContainer.appendChild(card);

      // Automatically load the first playlist
      if (index === 0) {
        loadSongsFromPlaylist(playlist);
      }
    });
  } catch (error) {
    console.error("Error fetching playlists:", error);
  }
}

// Fetch and display songs when a playlist is selected
async function loadSongsFromPlaylist(playlistName) {
  try {
    const response = await fetch(
      `http://localhost:3000/playlist/${playlistName}`
    );
    songs = await response.json();
    songList.innerHTML = "";
    songs.forEach((song, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="songName">
          <img src="music.svg" alt="play"> 
          <div class="info"> 
            <div class="songName scrolling-container">
              <div class="scrolling-text">
                <span>${song.name} 🎵</span>
                <span>${song.name} 🎵</span>
              </div>
            </div>
            <div class="artist">Abhay Tiwari</div>
          </div>
          <div class="playButtonCard invert">
            <img src="playButtoncard.svg" alt="Play">
          </div>
        </div>`;
      li.addEventListener("click", () => playAudio(idx));
      songList.appendChild(li);
    });
    currentSongIndex = null;
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

// Play audio function
function playAudio(idx) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = new Audio(songs[idx].url);
  currentSongIndex = idx;
  playPauseBtn.src = "./pauseButton.svg";
  updateScrollingEffect(idx, true);
  document.querySelector("#playingSongName").textContent = songs[idx].name;
  currentAudio
    .play()
    .then(updateSeekBar)
    .catch((err) => console.error("Playback error:", err));
  currentAudio.addEventListener("timeupdate", updateSeekBar);
  currentAudio.addEventListener("loadedmetadata", displayDuration);
  currentAudio.addEventListener("ended", playNextSong);
}

// Play next song
function playNextSong() {
  if (currentSongIndex === null || songs.length === 0) return;
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  playAudio(currentSongIndex);
}

// Play previous song
function playPreviousSong() {
  if (currentSongIndex === null || songs.length === 0) return;
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playAudio(currentSongIndex);
}

// Toggle play/pause
function togglePlayPause() {
  if (!currentAudio) {
    playAudio(currentSongIndex !== null ? currentSongIndex : 0);
  } else {
    if (currentAudio.paused) {
      currentAudio.play();
      playPauseBtn.src = "./pauseButton.svg";
      updateScrollingEffect(currentSongIndex, true);
    } else {
      currentAudio.pause();
      playPauseBtn.src = "./playButton.svg";
      updateScrollingEffect(currentSongIndex, false);
    }
  }
}

// Update seek bar
function updateSeekBar() {
  if (currentAudio) {
    const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
    seekBar.value = progress;
    seekBar.style.background = `linear-gradient(to right, #1db954 ${progress}%, #535353 ${progress}%)`;
    seekBar.style.setProperty("--progress", `${progress}%`);
    currentTimeDisplay.textContent = formatTime(currentAudio.currentTime);
  }
}

// Display total song duration
function displayDuration() {
  if (currentAudio && currentAudio.duration) {
    durationDisplay.textContent = formatTime(currentAudio.duration);
  }
}

// Convert time to mm:ss format
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Seek functionality
seekBar.addEventListener("input", () => {
  if (!currentAudio) {
    currentSongIndex = currentSongIndex !== null ? currentSongIndex : 0;
    playAudio(currentSongIndex);
  }
  const newTime = (seekBar.value / 100) * currentAudio.duration;
  currentAudio.currentTime = newTime;
  updateSeekBar();
});

// Update scrolling effect
function updateScrollingEffect(idx, shouldScroll) {
  const allSongs = document.querySelectorAll("#songListing ul li");
  allSongs.forEach((li, i) => {
    const scrollingText = li.querySelector(".scrolling-text");
    if (scrollingText) {
      scrollingText.classList.toggle(
        "scrolling-active",
        i === idx && shouldScroll
      );
    }
  });
}

// Load playlists on page load
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
