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
      
      {/* Social media stickers section */}
      <div className="social-stickers-container">
        <h2 className="social-stickers-title">
          My links
        </h2>
        <div className="social-stickers-grid">
          {/* GitHub */}
          <a href="https://github.com/dzhu8" className="social-sticker" target="_blank" rel="noopener noreferrer">
            <img 
              src="/Octicons-mark-github.svg" 
              alt="GitHub" 
            />
          </a>
          
          {/* LinkedIn */}
          <a href="https://www.linkedin.com/in/daniel-zhu-449681175/" className="social-sticker" target="_blank" rel="noopener noreferrer">
            <img 
              src="/LinkedIn_icon.svg" 
              alt="LinkedIn" 
            />
          </a>
          
          {/* Google Scholar */}
          <a href="https://scholar.google.com/citations?user=2Q_Wq7AAAAAJ&hl=en" className="social-sticker" target="_blank" rel="noopener noreferrer">
            <img 
              src="/google-scholar-svgrepo-com.svg" 
              alt="Google Scholar" 
            />
          </a>
          
          {/* Email */}
          <a href="mailto:danielyumengzhu@gmail.com" className="social-sticker">
            <img 
              src="/Gmail_icon_(2020).svg" 
              alt="Email" 
            />
          </a>
        </div>
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
