import type { ApiResponse } from './types';

const BASE_URL = 'https://api.artic.edu/api/v1/artworks';
const ROWS_PER_PAGE = 12;

export async function fetchArtworks(page: number): Promise<ApiResponse> {
  const url = `${BASE_URL}?page=${page}&limit=${ROWS_PER_PAGE}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch artworks: ${response.status}`);
  }
  return response.json();
}

export { ROWS_PER_PAGE };
