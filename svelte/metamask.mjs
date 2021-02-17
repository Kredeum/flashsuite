import { writable } from 'svelte/store';

export const signer = writable("");
export const chainId = writable("");
export const addresses = writable([]);
