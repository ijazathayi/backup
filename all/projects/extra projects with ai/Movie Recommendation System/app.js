'use strict';

const GENRES = ['Action','Comedy','Drama','Sci-Fi','Horror','Romance','Thriller','Animation'];

const SEED_MOVIES = [
  { id:1, title:'The Dark Knight', year:2008, genres:['Action','Thriller'], poster:'🦇' },
  { id:2, title:'Inception', year:2010, genres:['Sci-Fi','Thriller'], poster:'🌀' },
  { id:3, title:'The Avengers', year:2012, genres:['Action'], poster:'⚡' },
  { id:4, title:'Interstellar', year:2014, genres:['Sci-Fi','Drama'], poster:'🚀' },
  { id:5, title:'Titanic', year:1997, genres:['Romance','Drama'], poster:'🚢' },
];

const ALL_MOVIES = [
  { id:101, title:'John Wick', year:2014, genres:['Action','Thriller'], poster:'🔫' },
  { id:102, title:'Mad Max: Fury Road', year:2015, genres:['Action','Sci-Fi'], poster:'🚗' },
  { id:103, title:'Die Hard', year:1988, genres:['Action','Thriller'], poster:'💥' },
  { id:104, title:'Top Gun: Maverick', year:2022, genres:['Action'], poster:'✈️' },
  { id:105, title:'The Matrix', year:1999, genres:['Sci-Fi','Action'], poster:'💊' },
  { id:106, title:'Blade Runner 2049', year:2017, genres:['Sci-Fi','Drama'], poster:'🤖' },
  { id:107, title:'Alien', year:1979, genres:['Sci-Fi','Horror'], poster:'👽' },
  { id:108, title:'Gravity', year:2013, genres:['Sci-Fi','Drama'], poster:'🌍' },
  { id:109, title:'Dune', year:2021, genres:['Sci-Fi','Drama'], poster:'🏜️' },
  { id:110, title:'The Shawshank Redemption', year:1994, genres:['Drama'], poster:'🏛️' },
  { id:111, title:'Forrest Gump', year:1994, genres:['Drama','Romance'], poster:'🏃' },
  { id:112, title:'Schindler\'s List', year:1993, genres:['Drama'], poster:'📜' },
  { id:113, title:'The Godfather', year:1972, genres:['Drama','Thriller'], poster:'🌹' },
  { id:114, title:'Fight Club', year:1999, genres:['Drama','Thriller'], poster:'👊' },
  { id:115, title:'Parasite', year:2019, genres:['Drama','Thriller'], poster:'🏠' },
  { id:116, title:'The Hangover', year:2009, genres:['Comedy'], poster:'🍺' },
  { id:117, title:'Superbad', year:2007, genres:['Comedy'], poster:'😂' },
  { id:118, title:'Bridesmaids', year:2011, genres:['Comedy','Romance'], poster:'👰' },
  { id:119, title:'Home Alone', year:1990, genres:['Comedy'], poster:'🏡' },
  { id:120, title:'The Grand Budapest Hotel', year:2014, genres:['Comedy','Drama'], poster:'🏨' },
  { id:121, title:'Get Out', year:2017, genres:['Horror','Thriller'], poster:'😱' },
  { id:122, title:'It', year:2017, genres:['Horror'], poster:'🤡' },
  { id:123, title:'A Quiet Place', year:2018, genres:['Horror','Sci-Fi'], poster:'🤫' },
  { id:124, title:'Hereditary', year:2018, genres:['Horror','Drama'], poster:'🪤' },
  { id:125, title:'The Conjuring', year:2013, genres:['Horror'], poster:'👻' },
  { id:126, title:'La La Land', year:2016, genres:['Romance','Drama'], poster:'🎶' },
  { id:127, title:'The Notebook', year:2004, genres:['Romance','Drama'], poster:'📔' },
  { id:128, title:'Crazy Rich Asians', year:2018, genres:['Romance','Comedy'], poster:'💎' },
  { id:129, title:'Pride & Prejudice', year:2005, genres:['Romance','Drama'], poster:'🌺' },
  { id:130, title:'Silver Linings Playbook', year:2012, genres:['Romance','Drama'], poster:'🏈' },
  { id:131, title:'Zodiac', year:2007, genres:['Thriller','Drama'], poster:'♓' },
  { id:132, title:'Prisoners', year:2013, genres:['Thriller','Drama'], poster:'🔦' },
  { id:133, title:'Gone Girl', year:2014, genres:['Thriller','Drama'], poster:'🔪' },
  { id:134, title:'Knives Out', year:2019, genres:['Thriller','Comedy'], poster:'🗡️' },
  { id:135, title:'Se7en', year:1995, genres:['Thriller','Drama'], poster:'📦' },
  { id:136, title:'Spider-Man: Into the Spider-Verse', year:2018, genres:['Animation','Action'], poster:'🕷️' },
  { id:137, title:'Up', year:2009, genres:['Animation','Drama'], poster:'🎈' },
  { id:138, title:'Coco', year:2017, genres:['Animation','Drama'], poster:'💀' },
  { id:139, title:'The Lion King', year:1994, genres:['Animation','Drama'], poster:'🦁' },
  { id:140, title:'Spirited Away', year:2001, genres:['Animation','Drama'], poster:'🌊' },
];

// State
const state = {
  selectedGenres: new Set(),
  ratings: {},
  activeFilter: 'All',
};

// Init DOM
const genreGrid = document.getElementById('genreGrid');
const ratingList = document.getElementById('ratingList');
const recommendBtn = document.getElementById('recommendBtn');
const moviesGrid = document.getElementById('moviesGrid');
const filterRow = document.getElementById('filterRow');

// Build genre chips
GENRES.forEach(g => {
  const chip = document.createElement('button');
  chip.className = 'genre-chip';
  chip.textContent = g;
  chip.addEventListener('click', () => {
    chip.classList.toggle('active');
    state.selectedGenres.has(g) ? state.selectedGenres.delete(g) : state.selectedGenres.add(g);
  });
  genreGrid.appendChild(chip);
});

// Build rating list
SEED_MOVIES.forEach(movie => {
  state.ratings[movie.id] = 0;
  const item = document.createElement('div');
  item.className = 'rating-item';
  item.innerHTML = `
    <div class="rating-movie-title">${movie.poster} ${movie.title}</div>
    <div class="rating-movie-genre">${movie.genres.join(', ')} · ${movie.year}</div>
    <div class="stars" data-id="${movie.id}">
      ${[1,2,3,4,5].map(n => `<span class="star" data-val="${n}">★</span>`).join('')}
    </div>`;
  const starsContainer = item.querySelector('.stars');
  starsContainer.addEventListener('click', e => {
    if (!e.target.classList.contains('star')) return;
    const val = +e.target.dataset.val;
    const id = +starsContainer.dataset.id;
    state.ratings[id] = val;
    starsContainer.querySelectorAll('.star').forEach((s, i) => {
      s.classList.toggle('lit', i < val);
    });
  });
  starsContainer.addEventListener('mouseover', e => {
    if (!e.target.classList.contains('star')) return;
    const val = +e.target.dataset.val;
    starsContainer.querySelectorAll('.star').forEach((s, i) => {
      s.style.filter = i < val ? 'none' : 'grayscale(1) opacity(0.4)';
    });
  });
  starsContainer.addEventListener('mouseleave', () => {
    const id = +starsContainer.dataset.id;
    const rated = state.ratings[id];
    starsContainer.querySelectorAll('.star').forEach((s, i) => {
      s.style.filter = i < rated ? 'none' : 'grayscale(1) opacity(0.4)';
    });
  });
  ratingList.appendChild(item);
});

function computeScore(movie) {
  let score = 50;
  // Genre match boost
  const selectedArr = [...state.selectedGenres];
  const genreMatches = movie.genres.filter(g => selectedArr.includes(g)).length;
  score += genreMatches * 18;

  // Rating signal: find seed movies sharing genres with this movie
  SEED_MOVIES.forEach(sm => {
    const rating = state.ratings[sm.id] || 0;
    const shared = sm.genres.filter(g => movie.genres.includes(g)).length;
    score += shared * (rating - 2.5) * 4;
  });

  // Small randomness for variety
  score += (Math.random() - 0.5) * 8;
  return Math.min(99, Math.max(55, Math.round(score)));
}

function buildFilterRow(movies) {
  filterRow.innerHTML = '';
  const allBtn = createFilterChip('All');
  filterRow.appendChild(allBtn);
  const genres = new Set();
  movies.forEach(m => m.genres.forEach(g => genres.add(g)));
  genres.forEach(g => filterRow.appendChild(createFilterChip(g)));
}

function createFilterChip(label) {
  const chip = document.createElement('button');
  chip.className = 'filter-chip' + (label === state.activeFilter ? ' active' : '');
  chip.textContent = label;
  chip.addEventListener('click', () => {
    state.activeFilter = label;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    renderMovies(window._lastRecommendations || []);
  });
  return chip;
}

function renderMovies(movies) {
  const filtered = state.activeFilter === 'All'
    ? movies
    : movies.filter(m => m.genres.includes(state.activeFilter));

  moviesGrid.innerHTML = '';
  if (!filtered.length) {
    moviesGrid.innerHTML = '<div class="empty-state"><div class="empty-icon">🎬</div><p>No movies match this filter.</p></div>';
    return;
  }
  filtered.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = `${i * 60}ms`;
    card.innerHTML = `
      <div class="movie-rank">#${i+1}</div>
      <div class="movie-poster">${m.poster}</div>
      <div class="movie-title">${m.title}</div>
      <div class="movie-year">${m.year}</div>
      <div class="genre-tags">${m.genres.map(g => `<span class="genre-tag">${g}</span>`).join('')}</div>
      <div class="match-bar-wrap">
        <div class="match-label"><span>Match</span><span class="match-pct">${m.score}%</span></div>
        <div class="match-bar-bg"><div class="match-bar-fill" style="width:${m.score}%"></div></div>
      </div>`;
    moviesGrid.appendChild(card);
  });
}

recommendBtn.addEventListener('click', () => {
  const scored = ALL_MOVIES.map(m => ({ ...m, score: computeScore(m) }));
  scored.sort((a, b) => b.score - a.score);
  const top10 = scored.slice(0, 10);
  window._lastRecommendations = top10;
  state.activeFilter = 'All';
  buildFilterRow(top10);
  renderMovies(top10);
});
