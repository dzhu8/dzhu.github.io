'use client';
import HandwrittenText from '../hero/HandwrittenText';

export default function Hero() {
  return (
    <section className="hero-section">
      {/* Add circular image container in the middle of the hero section */}
      <div className="hero-image-container">
        <img 
          src="/daniel_zhu.jpeg" 
          alt="Daniel Zhu" 
          className="hero-image"
        />
      </div>
      
      <div className="container hero-content text-center">
        <div className="name-sticker">
          <img 
            src="/Hello_my_name_is_sticker.png" 
            alt="Hello my name is sticker" 
            className="sticker-image"
          />
          <div className="sticker-content">
            <h1 className="text-4xl md:text-5xl font-bold mb-1 handwritten">
              Daniel Zhu
            </h1>
            <div className="handwritten-subtitle">
              <HandwrittenText phrases={['Software Developer', 'Web Designer', 'Molecular Biologist', 'PhD Candidate, MIT']} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
