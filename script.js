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
    const response = await fetch("https://sangeet-backend.vercel.app/playlists");
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
                        <div class="imgContainer">
                        <img src="./images/${index}.jpeg" alt="">
                        </div>
                        <div class="flex playlistInfo">
                            <div><h2>${playlist}</h2></div>
                            <div> A.R. Rahman, Atif Aslam, Shankar-Ehsaan-Loy and more </div>
                        </div>
                    </div>`;

      card.addEventListener("click", () => loadSongsFromPlaylist(playlist));
      card.addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
      });
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
          
          <div class="info flex">
            <div class="songName scrolling-container">
              <div class="scrolling-text">
                <span>${song.name} 🎵</span>
                <span>${song.name} 🎵</span>
              </div>
            </div>
            <div class="artist">Abhay Tiwari</div>
          </div>
          <div class="playButtonCard">
            <img src="imgs/playButtoncard.svg" alt="Play">
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
    toggleSidebarPlayButton(currentSongIndex, false); // Reset previous button
  }

  currentAudio = new Audio(songs[idx].url);
  currentSongIndex = idx;

  playPauseBtn.src = "imgs/pauseButton.svg";
  updateScrollingEffect(idx, true);
  document.querySelector("#playingSongName").textContent = songs[idx].name;

  toggleSidebarPlayButton(idx, true); // Activate equalizer for this song

  currentAudio
    .play()
    .then(updateSeekBar)
    .catch((err) => console.error("Playback error:", err));

  currentAudio.addEventListener("timeupdate", updateSeekBar);
  currentAudio.addEventListener("loadedmetadata", displayDuration);
  currentAudio.addEventListener("ended", () => {
    toggleSidebarPlayButton(idx, false); // Reset button when song ends
    playNextSong();
  });
}

function toggleSidebarPlayButton(idx, isPlaying) {
  const allSongs = document.querySelectorAll(
    "#songListing ul li .playButtonCard"
  );

  allSongs.forEach((playButton, i) => {
    if (i === idx) {
      if (isPlaying) {
        playButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="30" viewBox="0 0 14 14" fill="none" class="equalizer">
            <rect x="4" width="2" height="14" fill="#1DB954" class="bar bar-1" />
            <rect x="0" width="2" height="10" fill="#1DB954" class="bar bar-2" />
            <rect x="12" y="7" width="2" height="7" fill="#1DB954" class="bar bar-3" />
            <rect x="8" y="10" width="2" height="4" fill="#1DB954" class="bar bar-4" />
          </svg>`;
      } else {
        playButton.innerHTML = `<img src="imgs/playButtoncard.svg" alt="Play">`;
      }
    } else {
      playButton.innerHTML = `<img src="imgs/playButtoncard.svg" alt="Play">`; // Reset others
    }
  });
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
      playPauseBtn.src = "imgs/pauseButton.svg";
      updateScrollingEffect(currentSongIndex, true);
      toggleSidebarPlayButton(currentSongIndex, true); // Keep equalizer on resume
    } else {
      currentAudio.pause();
      playPauseBtn.src = "imgs/playButton.svg";
      updateScrollingEffect(currentSongIndex, false);
      toggleSidebarPlayButton(currentSongIndex, false); // Reset equalizer on pause
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

//hamburger event listener
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = 0;
});

//close eveent listener
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-130%";
});

//volume control
const volumeControl = document.getElementById("volumeControl");
const volumePercentage = document.getElementById("volumePercentage");
const muteBtn = document.getElementById("muteBtn");
const muteIcon = muteBtn.querySelector("img");

let lastVolume = 1; // Store last volume before muting

// Volume control (Keeps old working functionality)
volumeControl.addEventListener("input", () => {
  if (currentAudio) {
    currentAudio.volume = volumeControl.value;
  }
  volumePercentage.innerText = Math.round(volumeControl.value * 100) + "%";

  // Update mute/unmute icon based on volume level
  if (volumeControl.value == 0) {
    muteIcon.src = "imgs/mute.svg";
    muteIcon.alt = "Muted";
  } else {
    muteIcon.src = "imgs/volume.svg";
    muteIcon.alt = "Unmute";
  }
});

// Mute/Unmute Button Functionality
muteBtn.addEventListener("click", () => {
  if (volumeControl.value > 0) {
    lastVolume = volumeControl.value; // Save last volume level
    volumeControl.value = 0; // Mute
  } else {
    volumeControl.value = lastVolume || 0.5; // Restore last volume or default 50%
  }

  if (currentAudio) {
    currentAudio.volume = volumeControl.value;
  }
  volumePercentage.innerText = Math.round(volumeControl.value * 100) + "%";

  // Update mute/unmute icon
  muteIcon.src = volumeControl.value == 0 ? "imgs/mute.svg" : "imgs/volume.svg";
});

//  Keyboard Shortcuts for Volume Control
document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowUp") {
    volumeControl.value = Math.min(1, parseFloat(volumeControl.value) + 0.1);
  } else if (event.code === "ArrowDown") {
    volumeControl.value = Math.max(0, parseFloat(volumeControl.value) - 0.1);
  } else if (event.code === "KeyM") {
    muteBtn.click(); // Simulate mute button click
  }

  if (currentAudio) {
    currentAudio.volume = volumeControl.value;
  }
  volumePercentage.innerText = Math.round(volumeControl.value * 100) + "%";

  // Update mute/unmute icon
  muteIcon.src = volumeControl.value == 0 ? "imgs/mute.svg" : "imgs/volume.svg";
});
