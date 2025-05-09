import React from 'react';

export default function Footer() {
  return (
    <footer className="text-center bg-light text-dark py-4 mt-auto">
      <div>
        <p>
          Kontakt: <a href="mailto:oleksandr.bohatyrov@gmail.com" className="text-dark">
            oleksandr.bohatyrov@gmail.com
          </a>
        </p>
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          Sait töötab testrežiimis!
        </p>
      </div>
    </footer>
  );
}
