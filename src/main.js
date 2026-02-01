import { getImagesByQuery } from './js/pixabay-api.js';
import { 
  createGallery, 
  clearGallery, 
  showLoader, 
  hideLoader, 
  showLoadMoreButton, 
  hideLoadMoreButton 
} from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const input = form.querySelector('input[name="search-text"]');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalHits = 0;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  query = input.value.trim();

  if (!query) return;

  page = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.error({ title: 'No results', message: 'No images found for your query' });
      hideLoader();
      return;
    }

    createGallery(data.hits);
    hideLoader();

    if (totalHits > 15) {
      showLoadMoreButton();
    }

    iziToast.success({ title: 'Success', message: `Found ${totalHits} images!` });
  } catch (error) {
    hideLoader();
    iziToast.error({ title: 'Error', message: 'Something went wrong!' });
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);
    hideLoader();

    const firstCard = document.querySelector('.gallery .photo-card');
    if (firstCard) {
      const { height: cardHeight } = firstCard.getBoundingClientRect();
      window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
    }

    if (page * 15 >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({ title: 'End', message: "We're sorry, but you've reached the end of search results." });
    } else {
      showLoadMoreButton();
    }

  } catch (error) {
    hideLoader();
    iziToast.error({ title: 'Error', message: 'Failed to load more images!' });
  }
});
