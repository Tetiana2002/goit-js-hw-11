import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
  brtMoreEl: document.querySelector('.load-more'),
  endOfListEL: document.querySelector('.end-message'),
};

axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '38434178-c96f30a1336c663c47dd17ca9';
const IMAGE_TYPE = 'photo';
const IMAGE_ORIENTATION = 'horizontal';
const IMAGE_SAFESEARCH = 'true';
const NUMBER_OF_IMAGE = 40;
const gallery = new SimpleLightbox('.gallery .photo-card a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

let countOfPage = 1;
let qValue = null;
let totalHits = null;

refs.brtMoreEl.classList.toggle('hidden');
refs.formEl.addEventListener('submit', formHandler);
refs.brtMoreEl.addEventListener('click', moreImageOnClick);

async function moreImageOnClick() {
  countOfPage += 1;
  try {
    const data = await searchImage(qValue, countOfPage);
    refs.brtMoreEl.classList.toggle('hidden');
    totalHits -= NUMBER_OF_IMAGE;
    if (totalHits <= NUMBER_OF_IMAGE) {
      refs.brtMoreEl.classList.add('hidden');
      refs.endOfListEL.classList.remove('hidden');
    }
    const markupArr = data.hits.map(item => {
      return renderMarkup(
        item.webformatURL,
        item.largeImageURL,
        item.tags,
        item.views,
        item.likes,
        item.comments,
        item.downloads
      );
    });
    refs.galleryEl.insertAdjacentHTML('beforeend', markupArr.join(''));
    gallery.refresh();
    smoothScroll(0.55);
    Notiflix.Notify.success(`"Hooray! We found ${totalHits} images."`);
    refs.brtMoreEl.classList.toggle('hidden');
  } catch (error) {
    Notiflix.Notify.failure(`Sorry, ${error.message}`);
  }
}

async function formHandler(evt) {
  evt.preventDefault();
  countOfPage = 1;
  qValue = evt.target.elements[0].value.trim();
  if (qValue === '') {
    return Notiflix.Notify.failure('Sorry, the search must not be empty');
  }
  try {
    const data = await searchImage(qValue, countOfPage);
    totalHits = data.totalHits;
    if (!data.hits.length) {
      refs.galleryEl.innerHTML = '';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      refs.brtMoreEl.classList.remove('hidden');
      refs.endOfListEL.classList.add('hidden');
      Notiflix.Notify.success(`"Hooray! We found ${totalHits} images."`);
      refs.galleryEl.innerHTML = '';
      const markupArr = data.hits.map(item => {
        return renderMarkup(
          item.webformatURL,
          item.largeImageURL,
          item.tags,
          item.views,
          item.likes,
          item.comments,
          item.downloads
        );
      });
      refs.galleryEl.innerHTML = markupArr.join('');
      smoothScroll(0.15);
      if (totalHits <= NUMBER_OF_IMAGE) {
        refs.brtMoreEl.classList.add('hidden');
        refs.endOfListEL.classList.remove('hidden');
      }
    }
    gallery.refresh();
  } catch (error) {
    Notiflix.Notify.failure(`Sorry, ${error.message}`);
  }
}

async function searchImage(qValue, countOfPage) {
  const response = await axios.get(`?key=${API_KEY}&q=
  ${qValue}&image_type=${IMAGE_TYPE}&orientation=${IMAGE_ORIENTATION}&
  safesearch=${IMAGE_SAFESEARCH}&per_page=${NUMBER_OF_IMAGE}&page=${countOfPage}`);
  const imagesInfo = await response.data;
  return imagesInfo;
}

function renderMarkup(
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads
) {
  refs.brtMoreEl.classList.toggle('hidden');
  return `<div class="photo-card">
  <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" width="100%" height="300"/></a>
  <div class="info">
    <p class="info-item">
      <b>Likes: ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${downloads}</b>
    </p>
  </div>
</div>`;
}

function smoothScroll(value) {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * value,
    behavior: 'smooth',
  });
}
