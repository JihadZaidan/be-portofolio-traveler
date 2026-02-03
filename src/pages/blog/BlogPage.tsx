import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Navbar from "../../components/ui/navbar";
import NavbarShop from "../../components/ui/navbarShop";
import FooterSection from "../../components/ui/footer";
import BlogCard from "../../components/blog/BlogCard";
import { getBlogPosts } from "./blogPosts";
import InitialShimmer from "../../components/ui/InitialShimmer";
import { BlogPageSkeleton } from "../../components/ui/skeletons";

const BlogPage: React.FC = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const from = params.get("from");

  const posts = useMemo(() => getBlogPosts(), []);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const filterRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(posts.map((b) => b.category)));
    return unique;
  }, [posts]);

  const filteredBlogs = useMemo(() => {
    if (selectedCategory === "All Categories") return posts;
    return posts.filter((b) => b.category === selectedCategory);
  }, [posts, selectedCategory]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!filterRef.current) return;
      if (!filterRef.current.contains(target)) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const NavbarComponent = from === "shop" ? NavbarShop : Navbar;
  const querySuffix = location.search || "";

  return (
    <InitialShimmer
      delayMs={850}
      skeleton={<BlogPageSkeleton variant={from === "shop" ? "shop" : "landing"} />}
    >
      <div className="min-h-screen flex flex-col bg-white">
        <NavbarComponent />

        <main className="flex-1">
          <section className="mx-auto max-w-7xl px-4 py-8 md:py-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-2xl font-semibold text-slate-900">Blog</p>
                <p className="mt-1 text-sm text-slate-600">
                  Latest articles about travel, tips, food, and lifestyle.
                </p>
              </div>

              <div ref={filterRef} className="flex items-center justify-start md:justify-end relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((v) => !v)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                >
                  <span className="whitespace-nowrap">{selectedCategory}</span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
                {categoryOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg p-2 z-30">
                    {["All Categories", ...categories].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(opt);
                          setCategoryOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                          selectedCategory === opt
                            ? "bg-sky-50 text-sky-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  href={`/blog/${blog.id}${querySuffix}`}
                  imageSrc={blog.imageSrc}
                  title={blog.title}
                  description={blog.description}
                />
              ))}
            </div>
          </section>
        </main>

        <FooterSection />
      </div>
    </InitialShimmer>
  );
};

export default BlogPage;
