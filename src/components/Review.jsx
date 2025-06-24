/**
 * @copyright 2024 codewithsadee
 * @license Apache-2.0
 */


/**
 * Node modules
 */
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';


/**
 * Register gsap plugins
 */
gsap.registerPlugin(useGSAP, ScrollTrigger);


/**
 * Components
 */
import ReviewCard from "./ReviewCard";


const reviews = [
  {
    content: 'Eğitimlerim için aplikasyon oluşturmaya karar verdiğimde Kerim bey ile tanıştık. Süreç içerisinde göstermiş olduğu ilgi ve becerilerinden ötürü teşekkür ediyorum. Hayal ettiğim gibi bir aplikasyon oldu.',
    name: 'Zeynep',
    imgSrc: '/images/people-4.jpg',
    company: 'Eğitimci'
  },
  {
    content: 'Daha önceki yaptığı işlerden dolayı yakın çevrem bahsetmişti Kerim beyi, bende iş yaptırmak istedim ve çok memnun kaldım yaptığı işten. Tasarladığı site çok akıcı ve kullanışlı, tavsiye ederim.',
    name: 'Fatih',
    imgSrc: '/images/people-2.jpg',
    company: 'Tan Oto'
  },
  
  {
    content: 'Web sitesi kurmaya karar verdiğimizde aklımıza gelen ilk isimdi. Sitenin tasarımı tam istediğim sadelikte oldu. Kullanımı efektif ve çok hızlı. Teknik bir sorum olduğunda anında cevap alıyorum, daha ne olsun.',
    name: 'Azize',
    imgSrc: '/images/people-3.jpg',
    company: 'Gola Atölye'
  },
  {
    content: 'Kafamda tasarladığım ve hayal ettiğim siteyi bu şekilde özenli ve düzenli yapan Kerim beye teşekkür ediyorum. ',
    name: 'deney',
    imgSrc: '/images/people-1.jpg',
    company: 'PixelForge'
  },
  {
    content: 'Professional work! Delivered on time, with a polished design and smooth user experience. Top-notch developer.',
    name: 'Ava Thompson',
    imgSrc: '/images/people-5.jpg',
    company: 'TechMosaic'
  },
  {
    content: 'Excellent project execution! High-quality code, responsive design, and exceptional problem-solving skills.',
    name: 'Jonathan',
    imgSrc: '/images/people-6.jpg',
    company: 'Skyline Digital'
  }
];


const Review = () => {
  const scrollRef = useRef(null);

  return (
    <section
      id="reviews"
      className="section overflow-hidden relative"
    >
      <div className="container">
        <h2 className="headline-2 mb-8 reveal-up">
          Yorumlar 
        </h2>

        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex items-stretch gap-3 overflow-x-auto hide-scrollbar scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
          >
            {reviews.map(({ content, name, imgSrc, company }, key) => (
              <ReviewCard
                key={key}
                name={name}
                imgSrc={imgSrc}
                company={company}
                content={content}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Review