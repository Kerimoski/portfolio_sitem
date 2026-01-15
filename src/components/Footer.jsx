/**
 * @copyright 2024 codewithsadee
 * @license Apache-2.0
 */


/**
 * Components
 */
import { ButtonPrimary } from "./Button";


const sitemap = [
  {
    label: 'Ana Sayfa',
    href: '#home'
  },
  {
    label: 'Hakkımda',
    href: '#about'
  },
  {
    label: 'Çalışmalar',
    href: '#work'
  },
  {
    label: 'Değerlendirmeler',
    href: '#reviews'
  },
  {
    label: 'İletişim',
    href: '#contact'
  }
];

const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com/kerimerdurun'
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/abdulkerim-erdurun-b5ba73239/'
  },
  {
    label: 'Twitter X',
    href: 'https://twitter.com/Kerimoskii'
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/kerimerdurun'
  },
  /* {
    label: '  kerim',
    href: 'https://codepen.io/KERİM'
  } */
];


const Footer = () => {
  return (
    <footer className="section">
      <div className="container">

        <div className="lg:grid lg:grid-cols-2">

          <div className="mb-10">
            <h2 className="headline-1 mb-8 lg:max-w-[12ch] reveal-up">
            Bugün birlikte çalışalım!
            </h2>

            <ButtonPrimary
              href="mailto:erdurunabdulkerim@gmail.com"
              label="Projeye başla"
              icon="chevron_right"
              classes="reveal-up"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:pl-20">

            <div>
              <p className="mb-2 reveal-up">Site Haritası</p>

              <ul>
                {sitemap.map(({ label, href }, key) => (
                  <li key={key}>
                    <a
                      href={href}
                      className="block text-sm text-zinc-400 py-1 transition-colors hover:text-zinc-200 reveal-up"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 reveal-up">Sosyal Medya</p>

              <ul>
                {socials.map(({ label, href }, key) => (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      className="block text-sm text-zinc-400 py-1 transition-colors hover:text-zinc-200 reveal-up"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        <div className="flex items-center justify-between pt-10 mb-8">
          <a
            href="/"
            className="logo reveal-up"
          >
            <img
              src="/images/logo.png"
              width={70}
              height={70}
              alt="Logo"
            />
          </a>

          <p className="text-zinc-500 text-sm reveal-up">
            &copy; 2024 <span className="text-zinc-200">Abdulkerim Erdurun</span>
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer