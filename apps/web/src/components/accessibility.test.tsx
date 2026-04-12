// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';


describe('WCAG 2.1 AA — Accessibility', () => {
  it('renders a button with accessible name (no violations)', async () => {
    const { container } = render(
      <button type="button" aria-label="Submit form">Submit</button>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('renders an image with alt text (no violations)', async () => {
    const { container } = render(
      <img src="test.png" alt="A descriptive label" />
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('detects missing aria-label on icon button (violation)', async () => {
    const { container } = render(
      <button type="button"><span aria-hidden="true">×</span></button>
    );
    const results = await axe(container);
    expect(results.violations.length).toBeGreaterThan(0);
  });

  it('renders a nav landmark (no violations)', async () => {
    const { container } = render(
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('renders a form with associated labels (no violations)', async () => {
    const { container } = render(
      <form>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="user@example.com"
          aria-required="true"
        />
        <button type="submit">Submit</button>
      </form>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('renders a heading hierarchy (no violations)', async () => {
    const { container } = render(
      <main>
        <h1>Page Title</h1>
        <section>
          <h2>Section Heading</h2>
          <p>Content here.</p>
        </section>
      </main>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('renders a table with headers (no violations)', async () => {
    const { container } = render(
      <table>
        <caption>User data</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Alice</td>
            <td>Admin</td>
          </tr>
        </tbody>
      </table>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
