import card from './templates/card.hbs';
const loader = document.querySelector('[alt="loading"]');
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
const gallery = document.querySelector('.gallery');
const axios = require('axios').default;
const form = document.querySelector('.search-form');
let page = 1;
const MAIN_URL_WITH_KEY =
  'https://pixabay.com/api/?key=30629726-597c78df0089c177162f75c58';

async function getUser() {
  return await axios.get(`${MAIN_URL_WITH_KEY}`, {
    params: {
      q: form.elements.searchQuery.value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: `${page}`,
      per_page: '40',
    },
  });
}

function createElements(response) {
  gallery.insertAdjacentHTML(
    'beforeend',
    response.data.hits.map(card).join('')
  );
  lightbox.refresh();
  if (
    (response.data.hits.length < 40 && response.data.hits.length !== 0) ||
    page === 13
  ) {
    loader.classList.replace('load-more', 'visually-hidden');
    setTimeout(() => {
      Notiflix.Notify.info(
        "Were sorry, but you've reached the end of search results."
      );
    }, 1000);
  }
}
function addElafterScroll() {
  if (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight
  ) {
    plusPage();
  }
}
function auditAndBuild(response) {
  if (response.data.totalHits === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    Notiflix.Notify.success(
      `SHooray! We found ${response.data.totalHits} images.`
    );
    loader.classList.replace('visually-hidden', 'load-more');
  }
  createElements(response);
}
function moreBuild(response) {
  createElements(response);
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onSubmitClick(event) {
  event.preventDefault();
  gallery.innerHTML = '';
  loader.classList.replace('load-more', 'visually-hidden');
  page = 1;
  if (form.elements.searchQuery.value.trim() === '') {
    return;
  }
  getUser()
    .then(res => auditAndBuild(res))
    .catch(err => console.log(err));
}

function plusPage() {
  page += 1;
  getUser()
    .then(res => moreBuild(res))
    .catch(err => console.log(err));
  if (page === 13) {
    window.removeEventListener('scroll', addElafterScroll);
  }
}

window.addEventListener('scroll', addElafterScroll);
form.addEventListener('submit', onSubmitClick);
