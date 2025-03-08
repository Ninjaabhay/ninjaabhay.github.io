console.log("Let's start JS");

let songs = [
  "Calle Calor - Quincas Moreira.mp3",
  "Kal Ho Naa Ho - Kal Ho Naa Ho 320 Kbps.mp3",
  "Main Hoon Na - Main Hoon Na 320 Kbps.mp3",
  "Main Yahaan Hoon Veer Zaara 320 Kbps.mp3",
  "Mann Ki Lagan Paap 320 Kbps.mp3",
  "Mitwa Kabhi Alvida Naa Kehna 320 Kbps.mp3",
  "The-Night-We-Met.mp3",
  "Tum Agar Saath Dene Ka Vada Karo Hamraaz 320 Kbps.mp3",
  "Yun Hi Chala Chal Swades 320 Kbps.mp3",
];

let currentAudio = null; // Track currently playing audio
let currentlyPlayingIndex = null; // Track currently playing song index

function playAudio(idx) {
  // Stop the currently playing audio (if any)
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0; // Reset song
  }

  // Play new audio
  currentAudio = new Audio(`songs/${songs[idx]}`);
  currentAudio
    .play()
    .then(() => {
      console.log("Playing song: " + songs[idx]);
      currentlyPlayingIndex = idx; // Update the currently playing song index
      updateScrollingEffect(idx, true); // Start scrolling effect
    })
    .catch((err) => console.error("Playback failed:", err));

  // Stop scrolling effect when song ends
  currentAudio.addEventListener("ended", () => {
    updateScrollingEffect(idx, false);
    currentlyPlayingIndex = null;
  });
}

// Function to enable or disable scrolling effect
function updateScrollingEffect(idx, shouldScroll) {
  const allSongs = document.querySelectorAll("#songListing ul li");
  allSongs.forEach((li, i) => {
    const scrollingText = li.querySelector(".scrolling-text");
    if (scrollingText) {
      if (i === idx && shouldScroll) {
        scrollingText.classList.add("scrolling-active"); // Start scrolling
      } else {
        scrollingText.classList.remove("scrolling-active"); // Stop scrolling
      }
    }
  });
}

function loadSongs(songs) {
  const songList = document.querySelector("#songListing ul");
  songList.innerHTML = ""; // Clear previous content

  songs.forEach((songName, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="songName">
        <img src="music.svg" alt="play"> 
        <div class="info"> 
            <div class="songName scrolling-container">
                <div class="scrolling-text">
                    <span>${songName}</span>
                    <span>${songName}</span> <!-- Duplicate for seamless scrolling -->
                </div>
            </div>
            <div class="artist">Abhay Tiwari</div>
        </div>
        <div class="playButtonCard invert">
            <img src="playButtoncard.svg" alt="">
        </div>
      </div>`;

    // Play song when clicked
    li.addEventListener("click", () => playAudio(idx));

    songList.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadSongs(songs); // Load songs after DOM is ready
});
