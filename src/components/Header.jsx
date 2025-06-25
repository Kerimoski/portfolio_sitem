/**
 * @copyright 2024 codewithsadee
 * @license Apache-2.0
 */


/**
 * Node modules
 */
import { useState, useEffect } from "react";


/**
 * Components
 */
import Navbar from "./Navbar";
import ThemeSelector from "./ThemeSelector";


const Header = () => {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full h-20 flex items-center z-40 bg-gradient-to-b from-zinc-900 to-zinc-900/0 backdrop-blur-md">
      <div className="max-w-screen-2xl w-full mx-auto px-4 flex justify-between items-center md:px-6 md:grid md:grid-cols-[1fr,3fr,1fr]">

        <h1>
          <a
            href="/"
            className="logo"
          >
            <img
              src="/images/logo.png"
              width={90}
              height={90}
              alt="Abdulkerim Erdurun"
            />
          </a>
        </h1>

        <div className="relative md:justify-self-center">
          <Navbar navOpen={navOpen} />
        </div>

        <div className="flex items-center gap-2 md:justify-self-end">
          {/* Mobilde tema seçici */}
          <div className="md:hidden">
            <ThemeSelector />
          </div>
          
          {/* Hamburger Menu */}
          <button
            className="menu-btn md:hidden"
            onClick={() => setNavOpen((prev) => !prev)}
          >
            {navOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop tema seçici ve buton */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeSelector />
            <a
              href="#contact"
              className="btn btn-secondary"
            >
              Benimle İletişime Geç
            </a>
          </div>
        </div>

      </div>
    </header>
  )
}

export default Header;
