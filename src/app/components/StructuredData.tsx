import Script from "next/script";

export default function StructuredData() {
     const websiteStructuredData = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          url: "https://danielyzhu.com/",
          name: "Daniel Zhu",
          alternateName: ["Daniel Y. Zhu", "Daniel Zhu's Homepage"],
          inLanguage: "en",
     };

     return (
          <>
               <Script
                    id="website-structured-data"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
               />
          </>
     );
}
