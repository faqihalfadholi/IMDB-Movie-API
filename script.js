const apiKey = '04110e28014965996aff8048eca89279';

const genreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en`;
const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&page=`;
const trendingUrl = `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&language=en-US`;
const tvPopularUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=`;



let currentPage = 1;
let isFetching = false;
let selectedGenre = null;
let lastSelectedGenre = null;
let lastMoviesData = [];

async function fetchGenres() {
    try {
        const response = await fetch(genreUrl);
        const data = await response.json();

        const genreDropdown = document.getElementById('genre-dropdown');
        data.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}


document.getElementById('genre-dropdown').addEventListener('change', function(event) {
    const genreId = event.target.value;
    lastSelectedGenre = genreId;
    selectedGenre = genreId;

    if (genreId) {
        currentPage = 1; 
        const moviesContainer = document.getElementById('movies-container');
        moviesContainer.innerHTML = ''; 
        fetchMoviesByGenre(genreId);
    }
});


async function fetchMoviesByGenre(genreId) {
    try {
        if (isFetching) return;

        isFetching = true;
        const response = await fetch(`${movieUrl}${currentPage}&with_genres=${genreId}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        lastMoviesData = data.results; 
        displayMovies(data.results);

        isFetching = false;
        currentPage++;
    } catch (error) {
        console.error('Error fetching movies:', error);
        isFetching = false;
    }
}


function displayMovies(movies) {
    const moviesContainer = document.getElementById('movies-container');

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');
        movieElement.setAttribute('data-id', movie.id); 

        movieElement.innerHTML = `
            <div class="movie-rating">
                <p>${movie.vote_average.toFixed(1)}</p> 
            </div>
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
        `;

        movieElement.onclick = function() {
            console.log('Clicked on movie:', movie);
            fetchMovieDetails(movie.id);
        };

        moviesContainer.appendChild(movieElement);
    });

    window.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

        if (scrollTop + clientHeight >= scrollHeight) {
            if (selectedGenre !== null) {
                fetchMoviesByGenre(selectedGenre);
            }
        }
    });
}

async function fetchMovieDetails(movieId) {
    const movieDetailUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`;

    try {
        const response = await fetch(movieDetailUrl);
        const movie = await response.json();

        const modal = document.getElementById('movieModal');
        const movieDetail = document.getElementById('movieDetail');

        movieDetail.innerHTML = `
            <h2 class="modal-header text-black text-center">${movie.title}</h2>
            <div class="modal-img">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            </div>
            <p><strong>Overview:</strong> ${movie.overview}</p>
            <p><strong>Release Date:</strong> ${movie.release_date}</p>
            <p><strong>Rating:</strong> ${movie.vote_average.toFixed(1)}</p>
            <p><strong>Genres:</strong> ${movie.genres.map(genre => genre.name).join(', ')}</p>
        `;

        modal.classList.add('show');
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}


document.getElementById('home').addEventListener('click', function() {
    showHomeSection();
});



function showHomeSection() {
    document.getElementById('home-section').style.display = 'block';
    document.getElementById('movie-nav').style.display = 'none';
    document.getElementById('movies-container').style.display = 'none'; 
    document.getElementById('tv-section').style.display = 'none';
    fetchTrending();
}


document.addEventListener('DOMContentLoaded', function() {
    showHomeSection();
});


async function fetchTrending() {
    try {
        const response = await fetch(trendingUrl);
        const data = await response.json();

        const trendingMoviesContainer = document.getElementById('trending-movies-container');
        const trendingTvContainer = document.getElementById('trending-tv-container');

        trendingMoviesContainer.innerHTML = '';
        trendingTvContainer.innerHTML = '';

        data.results.filter(item => item.media_type === 'movie').forEach(movie => {
            const movieElement = createTrendingMovieElement(movie);
            trendingMoviesContainer.appendChild(movieElement);
        });

        data.results.filter(item => item.media_type === 'tv').forEach(tvShow => {
            const tvElement = createTrendingMovieElement(tvShow);
            trendingTvContainer.appendChild(tvElement);
        });

    } catch (error) {
        console.error('Error fetching trending movies and TV shows:', error);
    }
}


function createTrendingMovieElement(item) {
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie');
    movieElement.setAttribute('data-id', item.id);

    movieElement.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" alt="${item.title || item.name}">
        <h3>${item.title || item.name}</h3>
    `;

    movieElement.onclick = function() {
        fetchMovieDetails(item.id);
    };

    return movieElement;
}

document.getElementById('movie').addEventListener('click', function() {
    document.getElementById('movie-nav').style.display = 'block';
    document.getElementById('home-section').style.display = 'none';
    document.getElementById('movies-container').style.display = 'grid';
    document.getElementById('tv-section').style.display = 'none';

    if (lastSelectedGenre) {
        document.getElementById('genre-dropdown').value = lastSelectedGenre;
        if (lastMoviesData.length > 0) {
            displayMovies(lastMoviesData);
        } else {
            fetchMoviesByGenre(lastSelectedGenre);
        }
    } else {
        fetchGenres();
    }
});

document.getElementById('tv').addEventListener('click', function() {
    showTvSection();
});

function showTvSection() {
    document.getElementById('home-section').style.display = 'none';
    document.getElementById('movie-nav').style.display = 'none';
    document.getElementById('movies-container').style.display = 'none';
    document.getElementById('tv-section').style.display = 'block';
    document.getElementById('tv-shows-container').style.display = 'grid';
    document.getElementById('tv-shows-container').style.flexWrap = 'wrap';
    document.getElementById('tv-shows-container').style.justifyContent = 'space-around';
    currentPage = 1;
    fetchPopularTvShows();
}


async function fetchPopularTvShows() {
    try {
        const response = await fetch(`${tvPopularUrl}${currentPage}`);
        const data = await response.json();

        const tvShowsContainer = document.getElementById('tv-shows-container');

        if (currentPage === 1) {
            tvShowsContainer.innerHTML = '';
        }

        displayTvShows(data.results);

        currentPage++;
        isFetching = false;

    } catch (error) {
        console.error('Error fetching popular TV shows:', error);
        isFetching = false;
    }
}

function displayTvShows(tvShows) {
    const tvShowsContainer = document.getElementById('tv-shows-container');

    tvShows.forEach(tvShow => {
        const tvShowElement = document.createElement('div');
        tvShowElement.classList.add('movie');
        tvShowElement.setAttribute('data-id', tvShow.id);

        tvShowElement.innerHTML = `
            <div class="movie-rating">
                <p>${tvShow.vote_average.toFixed(1)}</p> 
            </div>
            <img src="https://image.tmdb.org/t/p/w200${tvShow.poster_path}" alt="${tvShow.name}">
            <h3>${tvShow.name}</h3>
        `;

        tvShowElement.onclick = function() {
            fetchTvShowDetails(tvShow.id);
        };

        tvShowsContainer.appendChild(tvShowElement);
    });
}





async function fetchTvShowDetails(tvShowId) {
    const tvShowDetailUrl = `https://api.themoviedb.org/3/tv/${tvShowId}?api_key=${apiKey}&language=en-US`;

    try {
        const response = await fetch(tvShowDetailUrl);
        const tvShow = await response.json();

        const modal = document.getElementById('movieModal');
        const tvShowDetail = document.getElementById('movieDetail');

        tvShowDetail.innerHTML = `
            <h2 class="modal-header">${tvShow.name}</h2>
            <div class="modal-img">
            <img src="https://image.tmdb.org/t/p/w500${tvShow.poster_path}" alt="${tvShow.name}">
            </div>
            <p><strong>Overview:</strong> ${tvShow.overview}</p>
            <p><strong>First Air Date:</strong> ${tvShow.first_air_date}</p>
            <p><strong>Rating:</strong> ${tvShow.vote_average.toFixed(1)}</p>
            <p><strong>Genres:</strong> ${tvShow.genres.map(genre => genre.name).join(', ')}</p>
        `;

        modal.classList.add('show');
    } catch (error) {
        console.error('Error fetching TV show details:', error);
    }
}


window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 5 && !isFetching) {
        if (document.getElementById('tv-section').style.display === 'block') {
            isFetching = true;
            fetchPopularTvShows();
        }
    }
});


document.getElementById('closeModal').onclick = function() {
    const modal = document.getElementById('movieModal');
    modal.classList.remove('show'); 
}


window.onclick = function(event) {
    const modal = document.getElementById('movieModal');
    if (event.target === modal) {
        modal.classList.remove('show');
    }
}


