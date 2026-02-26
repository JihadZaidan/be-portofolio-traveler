import React from "react";
import Skeleton from "../Skeleton";

export const NavbarSkeleton: React.FC = () => {
  return (
    <header className="w-full border-b border-gray-100 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9" rounded="rounded-full" />
          <Skeleton className="h-4 w-36" />
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden items-center gap-8 md:flex">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-14" />
          </div>

          <Skeleton className="h-9 w-24 rounded-xl" rounded="rounded-xl" />
        </div>
      </nav>
    </header>
  );
};

export const NavbarShopSkeleton: React.FC = () => {
  return (
    <header className="w-full bg-white">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 py-4">
        <Skeleton className="h-10 w-10" rounded="rounded-full" />

        <div className="relative flex-1">
          <Skeleton className="h-11 w-full" rounded="rounded-full" />
        </div>

        <div className="hidden items-center gap-7 md:flex">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-9 w-20" rounded="rounded-full" />
        </div>
      </nav>
    </header>
  );
};

export const FooterSkeleton: React.FC = () => {
  return (
    <footer className="w-full bg-[#e8f3fb]">
      <div className="mx-auto max-w-6xl py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_3fr] items-start">
          <div className="space-y-5">
            <div>
              <Skeleton className="h-6 w-32" />
              <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8" rounded="rounded-full" />
              <Skeleton className="h-8 w-8" rounded="rounded-full" />
              <Skeleton className="h-8 w-8" rounded="rounded-full" />
              <Skeleton className="h-8 w-8" rounded="rounded-full" />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-4 text-sm">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-5 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-4 w-56" />
          <div className="flex items-center gap-0">
            <Skeleton className="h-10 w-14" rounded="rounded-md" />
            <Skeleton className="h-10 w-14" rounded="rounded-md" />
            <Skeleton className="h-10 w-14" rounded="rounded-md" />
            <Skeleton className="h-10 w-14" rounded="rounded-md" />
            <Skeleton className="h-10 w-14" rounded="rounded-md" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export const SignUpNotificationSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-[#111c55] text-white text-[11px] md:text-xs">
      <div className="mx-auto max-w-7xl px-4 flex items-center justify-center py-2 relative">
        <Skeleton className="h-3 w-72 bg-white/20" rounded="rounded-md" />
        <Skeleton
          className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 bg-white/20"
          rounded="rounded-sm"
        />
      </div>
    </div>
  );
};

type BlogCardSkeletonProps = {
  size?: "default" | "sm";
};

export const BlogCardSkeleton: React.FC<BlogCardSkeletonProps> = ({ size = "default" }) => {
  const isSmall = size === "sm";

  return (
    <article
      className={`h-full overflow-hidden border border-slate-100 bg-white shadow-xs transition flex flex-col ${
        isSmall ? "rounded-xl h-[240px]" : "rounded-2xl h-[320px]"
      }`}
    >
      <div
        className={`w-full overflow-hidden bg-slate-100 shrink-0 ${
          isSmall ? "aspect-[16/11]" : "aspect-[16/10]"
        }`}
      >
        <Skeleton className="h-full w-full" rounded="rounded-none" />
      </div>

      <div className={`${isSmall ? "p-3" : "p-4"} flex flex-col flex-1 gap-2`}>
        <Skeleton className={`h-4 ${isSmall ? "w-4/5" : "w-5/6"}`} />
        <Skeleton className={`h-4 ${isSmall ? "w-3/5" : "w-2/3"}`} />
        <div className="mt-1 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </article>
  );
};

export const ShopCardSkeleton: React.FC = () => {
  return (
    <article className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden p-4">
      <div className="relative w-full aspect-[3/2]">
        <Skeleton className="absolute inset-0 h-full w-full" rounded="rounded-xl" />
      </div>

      <div className="flex-1 px-5 pt-4 pb-4 flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </article>
  );
};

export type BlogPageSkeletonProps = {
  variant?: "landing" | "shop";
};

export const BlogPageSkeleton: React.FC<BlogPageSkeletonProps> = ({ variant = "landing" }) => {
  const NavbarComponent = variant === "shop" ? NavbarShopSkeleton : NavbarSkeleton;
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarComponent />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-8 md:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Skeleton className="h-7 w-28" />
              <Skeleton className="mt-2 h-4 w-80" />
            </div>

            <div className="flex items-center justify-start md:justify-end relative">
              <Skeleton className="h-10 w-56" rounded="rounded-xl" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <BlogCardSkeleton key={idx} />
            ))}
          </div>
        </section>
      </main>

      <FooterSkeleton />
    </div>
  );
};

export type BlogDetailPageSkeletonProps = {
  variant?: "landing" | "shop";
};

export const BlogDetailPageSkeleton: React.FC<BlogDetailPageSkeletonProps> = ({
  variant = "landing",
}) => {
  const NavbarComponent = variant === "shop" ? NavbarShopSkeleton : NavbarSkeleton;
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarComponent />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-8 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
            <article className="space-y-5">
              <div className="flex items-center gap-2 text-xs">
                <Skeleton className="h-4 w-40" />
              </div>

              <header>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-8 w-4/5" />
                <Skeleton className="mt-3 h-4 w-56" />
              </header>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                <div className="aspect-[16/9] w-full">
                  <Skeleton className="h-full w-full" rounded="rounded-none" />
                </div>
              </div>

              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-10/12" />
                <Skeleton className="h-4 w-9/12" />
              </div>
            </article>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-4 w-44" />

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <BlogCardSkeleton key={idx} size="sm" />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <FooterSkeleton />
    </div>
  );
};

export const ShopPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SignUpNotificationSkeleton />
      <NavbarShopSkeleton />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl py-10">
          <div className="flex items-center gap-2 text-xs">
            <Skeleton className="h-4 w-44" />
          </div>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-[420px]" rounded="rounded-2xl" />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ShopCardSkeleton key={idx} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Skeleton className="h-10 w-72" rounded="rounded-xl" />
          </div>
        </section>
      </main>

      <FooterSkeleton />
    </div>
  );
};

export const ShopDetailPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SignUpNotificationSkeleton />
      <NavbarShopSkeleton />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl py-8 px-4 md:px-0">
          <div className="flex items-center gap-2 text-xs">
            <Skeleton className="h-4 w-72" />
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] items-start">
            <div>
              <Skeleton className="mt-4 h-10 w-4/5" />

              <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16" rounded="rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <Skeleton className="h-9 w-28" rounded="rounded-full" />
              </div>

              <div className="mt-12 border-b border-slate-200 flex gap-0 text-lg md:text-base">
                <Skeleton className="h-8 w-40" rounded="rounded-none" />
                <Skeleton className="h-8 w-40" rounded="rounded-none" />
              </div>

              <div className="mt-6 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-10/12" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-10 w-full" rounded="rounded-xl" />
              <Skeleton className="h-10 w-full" rounded="rounded-xl" />
              <Skeleton className="h-10 w-full" rounded="rounded-xl" />
            </div>
          </div>
        </section>
      </main>

      <FooterSkeleton />
    </div>
  );
};

export const ShopPaymentPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarShopSkeleton />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 md:px-0 py-8 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
            <div className="space-y-6">
              <div>
                <Skeleton className="mb-3 h-5 w-32" />
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex gap-4 items-center">
                  <Skeleton className="h-20 w-32" rounded="rounded-xl" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
                <Skeleton className="h-5 w-40" />
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-10 w-full" rounded="rounded-xl" />
                  <Skeleton className="h-10 w-full" rounded="rounded-xl" />
                  <Skeleton className="h-10 w-full" rounded="rounded-xl" />
                </div>
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-full" rounded="rounded-xl" />
              </div>
            </aside>
          </div>
        </section>
      </main>

      <FooterSkeleton />
    </div>
  );
};

export const LandingPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavbarSkeleton />

      <main>
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="mt-3 h-10 w-3/5" />
              <Skeleton className="mt-6 h-4 w-11/12" />
              <Skeleton className="mt-2 h-4 w-10/12" />
              <div className="mt-7 flex gap-3">
                <Skeleton className="h-11 w-36" rounded="rounded-xl" />
                <Skeleton className="h-11 w-36" rounded="rounded-xl" />
              </div>
            </div>
            <div>
              <Skeleton className="h-[360px] w-full" rounded="rounded-3xl" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-80" />
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-44 w-full" rounded="rounded-3xl" />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-96" />
          <Skeleton className="mt-6 h-64 w-full" rounded="rounded-3xl" />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="mt-2 h-4 w-72" />
          <div className="mt-6 grid gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-64 w-full" rounded="rounded-3xl" />
            ))}
          </div>
        </section>
      </main>

      <FooterSkeleton />
    </div>
  );
};

export const WorkPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="relative z-10">
        <section className="px-4 py-10">
          <div className="mx-auto max-w-7xl grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="mt-3 h-10 w-3/5" />
              <Skeleton className="mt-6 h-4 w-11/12" />
              <Skeleton className="mt-2 h-4 w-10/12" />
              <div className="mt-7 flex gap-3">
                <Skeleton className="h-11 w-40" rounded="rounded-xl" />
                <Skeleton className="h-11 w-40" rounded="rounded-xl" />
              </div>
            </div>
            <Skeleton className="h-[360px] w-full" rounded="rounded-3xl" />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="mt-2 h-4 w-80" />
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-44 w-full" rounded="rounded-3xl" />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="mt-2 h-4 w-96" />
          <div className="mt-6 grid gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-64 w-full" rounded="rounded-3xl" />
            ))}
          </div>
        </section>

        <Skeleton className="h-[420px] w-full" rounded="rounded-none" />
      </div>
    </div>
  );
};

export const UserProfilePageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarSkeleton />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 md:px-0 py-10">
          <div className="grid gap-6 lg:grid-cols-[56px_360px_1fr] items-start lg:items-stretch lg:h-[calc(100vh-220px)]">
            <div className="lg:col-start-1 lg:flex lg:justify-center">
              <Skeleton className="h-10 w-24 lg:w-10" rounded="rounded-xl" />
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col lg:h-full lg:col-start-2">
              <div className="p-7">
                <div className="flex flex-col items-center text-center">
                  <div className="relative h-24 w-24">
                    <Skeleton className="h-24 w-24" rounded="rounded-full" />
                    <Skeleton className="absolute -bottom-1 -right-1 h-8 w-8" rounded="rounded-full" />
                  </div>
                  <Skeleton className="mt-4 h-5 w-40" />
                </div>
              </div>
              <div className="h-px w-full bg-slate-200" />
              <div className="p-7 pt-6 flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <Skeleton className="mt-0.5 h-9 w-9" rounded="rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-44" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Skeleton className="mt-0.5 h-9 w-9" rounded="rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full" rounded="rounded-xl" />
                </div>
              </div>
            </aside>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col lg:h-full lg:col-start-3">
              <div className="grid grid-cols-2 border-b border-slate-200 flex-shrink-0">
                <Skeleton className="h-[56px] w-full" rounded="rounded-none" />
                <Skeleton className="h-[56px] w-full" rounded="rounded-none" />
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-7">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="mt-2 h-4 w-80" />
                <div className="mt-6 grid gap-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx}>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="mt-2 h-12 w-full" rounded="rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <FooterSkeleton />
    </div>
  );
};

export type AdminTablePageSkeletonProps = {
  titleWidthClassName?: string;
  rows?: number;
};

export const AdminTablePageSkeleton: React.FC<AdminTablePageSkeletonProps> = ({
  titleWidthClassName = "w-56",
  rows = 6,
}) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="relative h-screen bg-white border-r border-slate-100 flex flex-col py-6 w-60">
        <div className="mt-2 flex-1 space-y-2 px-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="px-3 py-2">
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </aside>

      <div className="flex flex-1 flex-col px-8 py-6 overflow-hidden">
        <header className="mb-6 flex items-center justify-between">
          <Skeleton className={`h-7 ${titleWidthClassName}`} />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8" rounded="rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto space-y-10 pr-1">
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <Skeleton className="h-10 w-full md:w-[420px]" rounded="rounded-xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-28" rounded="rounded-xl" />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
              <div className="max-h-[calc(100vh-225px)] overflow-y-auto md:overflow-x-hidden">
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <th key={idx} className="px-4 py-3">
                              <Skeleton className="h-3 w-16" />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {Array.from({ length: rows }).map((_, rIdx) => (
                          <tr key={rIdx}>
                            {Array.from({ length: 5 }).map((__, cIdx) => (
                              <td key={cIdx} className="px-4 py-3">
                                <Skeleton className="h-4 w-24" />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-8 w-40" rounded="rounded-lg" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export const AIChatbotPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-10" rounded="rounded-full" />
          <Skeleton className="h-6 w-44" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10" rounded="rounded-full" />
            <Skeleton className="h-10 w-10" rounded="rounded-full" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[340px_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <Skeleton className="h-10 w-full" rounded="rounded-2xl" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-14 w-full" rounded="rounded-2xl" />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white flex flex-col min-h-[560px] overflow-hidden">
            <div className="border-b border-slate-100 p-4">
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex-1 p-4 space-y-3">
              <Skeleton className="h-16 w-3/4" rounded="rounded-2xl" />
              <Skeleton className="h-20 w-2/3 ml-auto" rounded="rounded-2xl" />
              <Skeleton className="h-16 w-3/5" rounded="rounded-2xl" />
            </div>
            <div className="border-t border-slate-100 p-4">
              <Skeleton className="h-11 w-full" rounded="rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
