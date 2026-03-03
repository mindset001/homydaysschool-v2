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
  <section className="w-full py-8 px-4 flex flex-col gap-4">
    <div className="flex gap-4">
      {news.map((item, idx) => (
        <div
          key={idx}
          className={`rounded-lg shadow p-4 flex flex-col justify-between ${item.highlight ? "bg-black text-white w-64" : "bg-white text-black w-64"}`}
        >
          {item.image && (
            <img src={item.image} alt="News Logo" className="w-16 h-16 mb-2" />
          )}
          <div className="font-bold mb-2">{item.title}</div>
          <div className="text-sm mb-2">{item.description}</div>
          <div className="text-xs opacity-70">{item.date}</div>
        </div>
      ))}
    </div>
  </section>
);

export default NewsEvents;
