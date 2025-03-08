console.log("Let's start JS");

let songs = [
  "Yun Hi Chala Chal Swades 320 Kbps.mp3",
  "Kal Ho Naa Ho - Kal Ho Naa Ho 320 Kbps.mp3",
  "Main Hoon Na - Main Hoon Na 320 Kbps.mp3",
  "Main Yahaan Hoon Veer Zaara 320 Kbps.mp3",
  "Mann Ki Lagan Paap 320 Kbps.mp3",
  "Mitwa Kabhi Alvida Naa Kehna 320 Kbps.mp3",
  "The-Night-We-Met.mp3",
  "Tum Agar Saath Dene Ka Vada Karo Hamraaz 320 Kbps.mp3",
  "Calle Calor - Quincas Moreira.mp3",
];

let currentAudio = null;
let currentSongIndex = null;

// Select elements for seek bar and time display
const seekBar = document.querySelector("#seekBar");
const currentTimeDisplay = document.querySelector("#currentTime");
const durationDisplay = document.querySelector("#duration");

// Play a song (always restarts when clicked from sidebar)
// function playAudio(idx) {
//   if (currentAudio) {
//     currentAudio.pause();
//     currentAudio.currentTime = 0;
//   }

//   currentAudio = new Audio(`songs/${songs[idx]}`);
//   currentSongIndex = idx;

//   currentAudio
//     .play()
//     .then(() => {
//       console.log("Playing song: " + songs[idx]);
//       updateScrollingEffect(idx, true);
//       updateSeekBar(); // Start updating seek bar
//     })
//     .catch((err) => console.error("Playback failed:", err));

//   currentAudio.addEventListener("timeupdate", updateSeekBar);
//   currentAudio.addEventListener("loadedmetadata", displayDuration);
//   currentAudio.addEventListener("ended", () => {
//     updateScrollingEffect(idx, false);
//     currentSongIndex = null;
//   });
// }

// Ensure button updates correctly when switching songs
function playAudio(idx) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentAudio = new Audio(`songs/${songs[idx]}`);
  currentSongIndex = idx;

  // Update play button in playbar
  const playPauseBtn = document.querySelector("#playPauseBtn img");
  playPauseBtn.src = "./pauseButton.svg";
  playPauseBtn.alt = "PauseSong";

  // 🎵 Ensure scrolling effect works when playing from anywhere 🎵
  updateScrollingEffect(idx, true);

  // Update song name in the playbar
  let songNameElement = document.querySelector("#playingSongName");
  songNameElement.textContent = songs[idx].replace(/.mp3$/, "");

  currentAudio
    .play()
    .then(() => {
      console.log("Playing song: " + songs[idx]);
      updateSeekBar();
    })
    .catch((err) => console.error("Playback failed:", err));

  currentAudio.addEventListener("timeupdate", updateSeekBar);
  currentAudio.addEventListener("loadedmetadata", displayDuration);
  currentAudio.addEventListener("ended", () => {
    currentSongIndex = null;

    // Reset play button when song ends
    playPauseBtn.src = "./playButton.svg";
    playPauseBtn.alt = "PlaySong";

    // 🎵 Ensure scrolling stops when song ends 🎵
    updateScrollingEffect(idx, false);
  });
}

// Play Previous Song
function playPrevious() {
  if (currentSongIndex === null) return;
  let prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playAudio(prevIndex);
}

// Play Next Song
function playNext() {
  if (currentSongIndex === null) return;
  let nextIndex = (currentSongIndex + 1) % songs.length;
  playAudio(nextIndex);
}

function togglePlayPause() {
  const playPauseBtn = document.querySelector("#playPauseBtn img");

  if (!currentAudio) {
    if (currentSongIndex !== null) {
      playAudio(currentSongIndex);
    } else {
      playAudio(0);
    }
  } else {
    if (currentAudio.paused) {
      currentAudio.play();
      console.log("Resumed: " + songs[currentSongIndex]);
      playPauseBtn.src = "./pauseButton.svg";
      playPauseBtn.alt = "PauseSong";

      // 🎵 Ensure scrolling resumes when resuming song 🎵
      updateScrollingEffect(currentSongIndex, true);
    } else {
      currentAudio.pause();
      console.log("Paused: " + songs[currentSongIndex]);
      playPauseBtn.src = "./playButton.svg";
      playPauseBtn.alt = "PlaySong";

      // 🎵 Ensure scrolling stops when song is paused 🎵
      updateScrollingEffect(currentSongIndex, false);
    }
  }
}

// Update seek bar position
function updateSeekBar() {
  if (currentAudio) {
    const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
    seekBar.value = progress;
    currentTimeDisplay.textContent = formatTime(currentAudio.currentTime);

    // Update the CSS variable dynamically
    seekBar.style.setProperty("--progress", `${progress}%`);
  }
}

// Display total duration of song
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

// Allow user to seek
seekBar.addEventListener("input", () => {
  if (!currentAudio) {
    // If no song has been played, start playing from seek position
    currentSongIndex = currentSongIndex !== null ? currentSongIndex : 0; // Use last played or default to first song
    playAudio(currentSongIndex);
  }

  // Set the new time based on the seek position
  const newTime = (seekBar.value / 100) * currentAudio.duration;
  currentAudio.currentTime = newTime;
});

// Update scrolling effect
function updateScrollingEffect(idx, shouldScroll) {
  const allSongs = document.querySelectorAll("#songListing ul li");
  allSongs.forEach((li, i) => {
    const scrollingText = li.querySelector(".scrolling-text");
    if (scrollingText) {
      if (i === idx && shouldScroll) {
        scrollingText.classList.add("scrolling-active");
      } else {
        scrollingText.classList.remove("scrolling-active");
      }
    }
  });
}

// Load songs into sidebar
function loadSongs(songs) {
  const songList = document.querySelector("#songListing ul");
  songList.innerHTML = "";

  songs.forEach((songName, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="songName">
        <img src="music.svg" alt="play"> 
        <div class="info"> 
            <div class="songName scrolling-container">
                <div class="scrolling-text">
                    <span>${songName} 🎵</span>
                    <span>${songName} 🎵</span>
                </div>
            </div>
            <div class="artist">Abhay Tiwari</div>
        </div>
        <div class="playButtonCard invert">
            <img src="playButtoncard.svg" alt="">
        </div>
      </div>`;

    li.addEventListener("click", () => playAudio(idx));

    songList.appendChild(li);
  });
}

// Add Event Listeners for Controls
document.addEventListener("DOMContentLoaded", () => {
  loadSongs(songs);
  document.querySelector("#prevBtn").addEventListener("click", playPrevious);
  document
    .querySelector("#playPauseBtn")
    .addEventListener("click", togglePlayPause);
  document.querySelector("#nextBtn").addEventListener("click", playNext);
});
