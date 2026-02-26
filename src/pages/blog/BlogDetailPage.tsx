import React, { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Home } from "lucide-react";
import Navbar from "../../components/ui/navbar";
import NavbarShop from "../../components/ui/navbarShop";
import FooterSection from "../../components/ui/footer";
import BlogCard from "../../components/blog/BlogCard";
import { getBlogPosts } from "./blogPosts";
import InitialShimmer from "../../components/ui/InitialShimmer";
import { BlogDetailPageSkeleton } from "../../components/ui/skeletons";

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const from = params.get("from");

  const posts = useMemo(() => getBlogPosts(), []);

  const postId = Number(id);
  const post = useMemo(() => posts.find((p) => p.id === postId) ?? null, [posts, postId]);

  const recommendations = useMemo(() => {
    const base = posts.filter((p) => p.id !== postId);
    if (!post) return base.slice(0, 4);
    const sameCategory = base.filter((p) => p.category === post.category);
    const others = base.filter((p) => p.category !== post.category);
    return [...sameCategory, ...others].slice(0, 4);
  }, [post, postId, posts]);

  const NavbarComponent = from === "shop" ? NavbarShop : Navbar;

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavbarComponent />
        <main className="flex-1">
          <section className="mx-auto max-w-7xl px-4 py-10">
            <div className="rounded-2xl border border-slate-100 bg-white p-6">
              <p className="text-sm font-semibold text-slate-900">Blog not found</p>
              <p className="mt-2 text-sm text-slate-600">
                The blog you are looking for doesn&apos;t exist.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <Link
                  to="/"
                  className="hover:text-slate-800 transition-colors flex items-center gap-1"
                >
                  <Home className="w-4 h-4" />
                </Link>
                <span>/</span>
                <Link
                  to={`/blog${location.search}`}
                  className="hover:text-slate-800 transition-colors"
                >
                  Blog
                </Link>
                <span>/</span>
                <span className="text-slate-800 truncate max-w-[160px] md:max-w-xs" title="Not found">
                  Not found
                </span>
              </div>
            </div>
          </section>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <InitialShimmer
      delayMs={850}
      skeleton={<BlogDetailPageSkeleton variant={from === "shop" ? "shop" : "landing"} />}
    >
      <div className="min-h-screen flex flex-col bg-white">
        <NavbarComponent />

        <main className="flex-1">
          <section className="mx-auto max-w-7xl px-4 py-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
              <article className="space-y-5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Link
                    to="/"
                    className="hover:text-slate-800 transition-colors flex items-center gap-1"
                  >
                    <Home className="w-4 h-4" />
                  </Link>
                  <span>/</span>
                  <Link
                    to={`/blog${location.search}`}
                    className="hover:text-slate-800 transition-colors"
                  >
                    Blog
                  </Link>
                  <span>/</span>
                  <span
                    className="text-slate-800 truncate max-w-[160px] md:max-w-xs"
                    title={post.title}
                  >
                    {post.title}
                  </span>
                </div>

                <header>
                  <p className="text-xs font-medium text-sky-700">{post.category}</p>
                  <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-slate-900">
                    {post.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>{post.author}</span>
                    <span className="text-slate-300">|</span>
                    <span>{post.date}</span>
                  </div>
                </header>

                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                  <div className="aspect-[16/9] w-full">
                    <img src={post.imageSrc} alt={post.title} className="h-full w-full object-cover" />
                  </div>
                </div>

                {Array.isArray(post.content) ? (
                  <div className="prose prose-slate max-w-none">
                    {post.content.map((paragraph: string, idx: number) => (
                      <p key={idx} className="text-sm leading-relaxed text-slate-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div
                    className="prose prose-slate max-w-none prose-img:rounded-xl prose-img:shadow-sm prose-img:border prose-img:border-slate-100"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                )}
              </article>

              <aside className="space-y-4 lg:sticky lg:top-24">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                  <p className="text-sm font-semibold text-slate-900">Recommended</p>
                  <p className="mt-1 text-xs text-slate-500">More posts you may like</p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {recommendations.map((rec) => (
                      <BlogCard
                        key={rec.id}
                        href={`/blog/${rec.id}${location.search}`}
                        size="sm"
                        imageSrc={rec.imageSrc}
                        title={rec.title}
                        description={rec.description}
                      />
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </main>

        <FooterSection />
      </div>
    </InitialShimmer>
  );
};

export default BlogDetailPage;
