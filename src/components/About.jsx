/**
 * @copyright 2024 codewithsadee
 * @license Apache-2.0
 */


const aboutItems = [
  {
    label: 'Tamamlanan Projeler',
    number: 10
  },
  {
    label: 'Deneyimlenen Yıllar',
    number: 2
  }
];


const About = () => {
  return (
    <section
      id="about"
      className="section"
    >
      <div className="container">

        <div className="bg-zinc-800/50 p-7 rounded-2xl md:p-12 reveal-up">
          <p className="text-zinc-300 mb-4 md:mb-8 md:text-xl md:max-w-[60ch]">
            Merhaba! Ben Kerim, son derece işlevsel web siteleri oluşturma yeteneğine sahip bir web geliştiricisiyim. Yaratıcılık ve teknik uzmanlığı bir araya getirerek, vizyonunuzu hem görünüm hem de performans açısından mükemmel bir dijital başyapıta dönüştürüyorum.
          </p>

          <div className="flex flex-wrap items-center gap-4 md:gap-7">
            {
              aboutItems.map(({ label, number }, key) => (
                <div key={key}>
                  <div className="flex items-center md:mb-2">
                    <span className="text-2xl font-semibold md:text-4xl">{number}</span>
                    <span className="text-sky-400 font-semibold md:text-3xl">+</span>
                  </div>

                  <p className="text-sm text-zinc-400">{label}</p>
                </div>
              ))
            }

            <img
              src="/images/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="ml-auto md:w-[90px] md:h-[90px]"
            />
          </div>
        </div>

      </div>
    </section>
  )
}

export default About