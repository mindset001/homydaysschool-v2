import React from "react";

const news = [
  {
    title: "News and Events",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    date: "09/09/2024",
    image: "/assets/images/news-logo.png",
    highlight: true,
  },
  {
    title: "",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    date: "09/09/2024",
    image: "",
    highlight: false,
  },
  {
    title: "",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    date: "09/09/2024",
    image: "",
    highlight: false,
  },
  {
    title: "",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    date: "09/09/2024",
    image: "",
    highlight: false,
  },
];


const NewsEvents: React.FC = () => (
  <section className="w-full py-8 px-2 sm:px-4">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {news.map((item, idx) => (
          <div
            key={idx}
            className={`rounded-lg shadow p-4 flex flex-col justify-between transition-all duration-200
              ${item.highlight
                ? "bg-black text-white sm:col-span-2 md:col-span-1 lg:col-span-1 row-span-2 min-h-[220px]"
                : "bg-white text-black"}
            `}
          >
            {item.image && (
              <img src={item.image} alt="News Logo" className="w-16 h-16 mb-2 object-contain" />
            )}
            <div className={`font-bold mb-2 ${item.highlight ? "text-lg" : "text-base"}`}>{item.title}</div>
            <div className="text-sm mb-2 line-clamp-3">{item.description}</div>
            <div className="text-xs opacity-70 mt-auto">{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default NewsEvents;
