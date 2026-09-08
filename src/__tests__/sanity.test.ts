import { describe, it, expect } from 'vitest';

describe('Sanity test', () => {
  it('verifies testing environment is functional', () => {
    expect(1 + 1).toBe(2);
  });

  it('verifies DOM rendering in jsdom', () => {
    const div = document.createElement('div');
    div.textContent = 'KantoPrep';
    expect(div.textContent).toBe('KantoPrep');
  });
});
