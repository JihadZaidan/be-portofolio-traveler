import React from "react";
import { Link } from "react-router-dom";

type BlogCardProps = {
  href?: string;
  size?: "default" | "sm";
  imageSrc: string;
  title: string;
  description: string;
};

const BlogCard: React.FC<BlogCardProps> = ({ href, size = "default", imageSrc, title, description }) => {
  const isSmall = size === "sm";

  const Content = (
    <article
      className={`group h-full overflow-hidden border border-slate-100 bg-white shadow-xs hover:shadow-sm transition flex flex-col ${
        isSmall ? "rounded-xl h-[240px]" : "rounded-2xl h-[320px]"
      }`}
    >
      <div
        className={`w-full overflow-hidden bg-slate-100 shrink-0 ${
          isSmall ? "aspect-[16/11]" : "aspect-[16/10]"
        }`}
      >
        <img
          src={imageSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className={`${isSmall ? "p-3" : "p-4"} flex flex-col flex-1`}>
        <h3
          className={`font-semibold text-slate-900 line-clamp-2 transition-colors group-hover:text-blue-600 ${
            isSmall ? "text-[13px]" : "text-sm"
          }`}
        >
          {title}
        </h3>
        <p
          className={`leading-relaxed text-slate-600 line-clamp-4 ${
            isSmall ? "mt-1 text-[11px]" : "mt-2 text-xs"
          }`}
        >
          {description}
        </p>
      </div>
    </article>
  );

  return (
    href ? (
      <Link to={href} className="block h-full">
        {Content}
      </Link>
    ) : (
      Content
    )
  );
};

export default BlogCard;
