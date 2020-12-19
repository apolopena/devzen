import { useState } from 'react';
import Fuse from 'fuse.js';

const defaultOptions = {
  keys: ['data.description', 'data.title', 'data.genre'], /* todo: move this out )*/
  shouldSort: true,
  threshold: 0.4,
  location: 0,
  distance: 50,
  maxPatternLength: 12,
  minMatchCharLength: 1
};

function search({ fuse, data, term }) {
  const results = fuse.search(term).map(({ item }) => item);
  return term ? results : data;
}

function useSearch({ data = [], options }) {
  options || (options = defaultOptions)
  const [searchTerm, setSearchTerm] = useState('');
  const fuse = new Fuse(data, options);
  const results = search({ fuse, data, term: searchTerm });
  const reset = () => setSearchTerm('');
  return { results, search: setSearchTerm, searchTerm, reset };
}

export default useSearch;