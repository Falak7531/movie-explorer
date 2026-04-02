const movieBaseUrl = "https://api.themoviedb.org/3"
const api_key = "3db25ba94a07b4d65948e3ad06fd6339"
const movieByGenreBaseURL = "https://api.themoviedb.org/3/discover/movie?api_key=2ec0d66f5bdf1dd12eefa0723f1479cf"

const searchInput = document.getElementById("search")
const genreSelect = document.getElementById("genre")
const ratingSelect = document.getElementById("rating")
const statusText = document.getElementById("status")
const moviesBox = document.getElementById("movies")

let allMovies = []
let genres = []

function setStatus(message) {
  statusText.textContent = message
}

async function loadGenres() {
  const response = await fetch(`${movieBaseUrl}/genre/movie/list?api_key=${api_key}`)
  const data = await response.json()
  genres = data.genres || []

  genres.forEach(function (genre) {
    const option = document.createElement("option")
    option.value = genre.id
    option.textContent = genre.name
    genreSelect.appendChild(option)
  })
}

async function loadMovies() {
  setStatus("Loading movies...")

  const response = await fetch(`${movieBaseUrl}/movie/popular?api_key=${api_key}`)
  const data = await response.json()
  allMovies = data.results || []

  renderMovies(allMovies)
}

function getGenreName(movie) {
  const match = genres.find(function (genre) {
    return movie.genre_ids && movie.genre_ids.includes(genre.id)
  })

  return match ? match.name : "Unknown"
}

function getYear(dateText) {
  if (!dateText) {
    return "N/A"
  }

  return dateText.split("-")[0]
}

function renderMovies(movieList) {
  moviesBox.innerHTML = ""

  if (!movieList.length) {
    setStatus("No movies found.")
    return
  }

  setStatus(`${movieList.length} movies found`)

  movieList.forEach(function (movie) {
    const card = document.createElement("article")
    card.className = "card"

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Image"

    card.innerHTML = `
      <img class="poster" src="${poster}" alt="${movie.title}">
      <div class="info">
        <h2 class="title">${movie.title}</h2>
        <div class="meta">
          <span>${getYear(movie.release_date)}</span>
          <span>${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
          <span>${getGenreName(movie)}</span>
        </div>
      </div>
    `

    moviesBox.appendChild(card)
  })
}

async function filterMovies() {
  const searchValue = searchInput.value.trim().toLowerCase()
  const genreValue = genreSelect.value
  const ratingValue = Number(ratingSelect.value)

  let filteredMovies = allMovies

  if (genreValue) {
    const response = await fetch(`${movieByGenreBaseURL}&with_genres=${genreValue}`)
    const data = await response.json()
    filteredMovies = data.results || []
  }

  if (searchValue) {
    filteredMovies = filteredMovies.filter(function (movie) {
      return movie.title.toLowerCase().includes(searchValue)
    })
  }

  if (ratingValue) {
    filteredMovies = filteredMovies.filter(function (movie) {
      return movie.vote_average >= ratingValue
    })
  }

  renderMovies(filteredMovies)
}

searchInput.addEventListener("input", filterMovies)
genreSelect.addEventListener("change", filterMovies)
ratingSelect.addEventListener("change", filterMovies)

async function startApp() {
  try {
    await loadGenres()
    await loadMovies()
  } catch (error) {
    setStatus("Could not load movies right now.")
  }
}

startApp()
