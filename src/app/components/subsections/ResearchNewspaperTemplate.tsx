import React from 'react';

interface NewsArticleLayoutProps {
  title?: string;
  date?: string;
  mainImage?: React.ReactNode;
  mainContent?: string;
  secondaryContent?: string;
  article1Title?: string;
  article1Content?: string;
  article2Title?: string;
  article2Content?: string;
}

const NewsArticleLayout: React.FC<NewsArticleLayoutProps> = ({
  title = "Title",
  date = "Date",
  mainImage = "Image",
  mainContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel justo eu nibh vestibulum tincidunt. Praesent faucibus, nisl in lobortis tincidunt, magna lacus pulvinar mauris, nec accumsan odio metus et dolor. Cras non nisi ut augue pulvinar luctus. Curabitur eget augue ut turpis feugiat finibus eget sed nibh. Duis fermentum, tortor vel dictum lobortis, arcu nisi condimentum eros, vel ullamcorper risus dolor eget nisl. Praesent sodales nibh at euismod mattis. Sed dignissim, tortor sed finibus pellentesque, felis dolor scelerisque massa, eget tincidunt libero magna sit amet risus.",
  secondaryContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel justo eu nibh vestibulum tincidunt. Praesent faucibus, nisl in lobortis tincidunt, magna lacus pulvinar mauris, nec accumsan odio metus et dolor. Cras non nisi ut augue pulvinar luctus. Curabitur eget augue ut turpis feugiat finibus eget sed nibh. Duis fermentum, tortor vel dictum lobortis, arcu nisi condimentum eros, vel ullamcorper risus dolor eget nisl. Praesent sodales nibh at euismod mattis. Sed dignissim, tortor sed finibus pellentesque, felis dolor scelerisque massa, eget tincidunt libero magna sit amet risus.",
  article1Title = "Title",
  article1Content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel justo eu nibh vestibulum tincidunt. Praesent faucibus, nisl in lobortis tincidunt, magna lacus pulvinar mauris.",
  article2Title = "Title",
  article2Content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel justo eu nibh vestibulum tincidunt. Praesent faucibus, nisl in lobortis tincidunt, magna lacus pulvinar mauris."
}) => {
  // Get the first letter of the main content for the drop cap
  const firstLetter = mainContent.charAt(0);
  const restOfContent = mainContent.substring(1);
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Title */}
      <div className="mb-4 p-2">
        <h1 className="text-5xl font-bold">{title}</h1>
      </div>
      
      {/* Date and Share */}
      <div className="flex items-center mb-6">
        <span className="text-xl mr-auto">{date}</span>
        <span className="mr-2">Share:</span>
        <div className="flex space-x-2">
          {/* Three circular SVG icons */}
          <div className="w-10 h-10 rounded-full bg-blue-800"></div>
          <div className="w-10 h-10 rounded-full bg-blue-800"></div>
          <div className="w-10 h-10 rounded-full bg-blue-800"></div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-wrap mb-6">
        {/* Image container */}
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <div className="bg-blue-800 h-96 flex items-center justify-center text-white">
            {mainImage}
          </div>
        </div>
        
        {/* Text columns */}
        <div className="w-full md:w-2/3 md:pl-6">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Left column with drop cap */}
            <div className="p-2">
              <p>
                <span className="float-left text-7xl font-serif mr-2 mt-1 leading-none">{firstLetter}</span>
                <span className="text-base">
                  {restOfContent}
                </span>
              </p>
            </div>
            
            {/* Right column */}
            <div className="p-2">
              <p className="text-base">
                {secondaryContent}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom text boxes */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left text box */}
        <div>
          <div className="p-2 mb-2">
            <h2 className="text-2xl font-bold">{article1Title}</h2>
          </div>
          <div className="p-2">
            <p className="text-base">
              {article1Content}
            </p>
          </div>
        </div>
        
        {/* Right text box */}
        <div>
          <div className="p-2 mb-2">
            <h2 className="text-2xl font-bold">{article2Title}</h2>
          </div>
          <div className="p-2">
            <p className="text-base">
              {article2Content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsArticleLayout;