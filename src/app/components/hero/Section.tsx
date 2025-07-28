"use client";

interface SectionProps {
     id: string;
     title: string;
     children?: React.ReactNode;
}

export default function Section({ id, title, children }: SectionProps) {
     return (
          <section id={id} className="content-section">
               <div className="container text-center">
                    <h2 className="text-6xl font-bold mb-6">{title}</h2>
                    <div>{children}</div>
               </div>
          </section>
     );
}
