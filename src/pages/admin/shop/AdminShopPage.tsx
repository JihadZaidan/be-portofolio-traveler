import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminTableHeader from "../../../components/admin/AdminTableHeader";
import AdminTable from "../../../components/admin/AdminTable";
import type { Column } from "../../../components/admin/AdminTable";
import AdminModal, { type AdminModalField } from "../../../components/admin/AdminModal";
import type { ShopItem } from "../../../components/ui/shopCards";

type AdminShopItem = ShopItem & {
  status: "active" | "inactive";
};

type ProductDetail = {
  id: number;
  fullText: string;
};

type ProductAdvantage = {
  id: number;
  title: string;
  subtitle: string;
};

type ProductPackage = {
  id: number;
  packageKey: "basic" | "standard" | "premium";
  badge: string;
  description: string;
  features: string[];
  defaultWords: number;
  basePrice: number;
};

const AdminShopPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("shop");
  const navigate = useNavigate();

  const [items, setItems] = useState<AdminShopItem[]>([
    {
      id: 1,
      title: "I will be SEO content writer for article writing or blog writing",
      imageSrc: "/bg-shopCards.jpg",
      price: "$20",
      deliveryTime: "2 Days Delivery",
      serviceCategory: "SEO Content",
      status: "active",
    },
    {
      id: 2,
      title: "I will write human SEO blogs and articles",
      imageSrc: "/bg-shopCards.jpg",
      price: "$100",
      deliveryTime: "3 Days Delivery",
      serviceCategory: "Blog Writing",
      status: "active",
    },
    {
      id: 3,
      title: "I will write SEO blog posts and articles as your content writer",
      imageSrc: "/bg-shopCards.jpg",
      price: "$100",
      deliveryTime: "7 Days Delivery",
      serviceCategory: "Product Description",
      status: "inactive",
    },
  ]);

  const [search, setSearch] = useState("");
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const [detailsByProductId, setDetailsByProductId] = useState<Record<number, ProductDetail[]>>({
    1: [
      {
        id: 1,
        fullText:
          "Hello, I'm Rizqi, a professional SEO content writer with 7 years of industry experience. I hold an MBA degree and specialize in creating content that not only informs but drives results.",
      },
    ],
  });

  const [advantagesByProductId, setAdvantagesByProductId] = useState<
    Record<number, ProductAdvantage[]>
  >({
    1: [
      { id: 1, title: "Highly Responsive", subtitle: "Known for exceptionally quick replies" },
      { id: 2, title: "SEO Optimized", subtitle: "Content crafted to rank better on search engines" },
    ],
  });

  const [packagesByProductId, setPackagesByProductId] = useState<Record<number, ProductPackage[]>>({
    1: [
      {
        id: 1,
        packageKey: "basic",
        badge: "Starter",
        description: "Short-form SEO content for quick tasks and smaller projects.",
        features: ["1 Article", "SEO-optimized title", "Proofreading"],
        defaultWords: 500,
        basePrice: 20,
      },
      {
        id: 2,
        packageKey: "standard",
        badge: "Advance",
        description: "SEO-Friendly Website Content, Blog Posts, Web Pages, Product Descriptions & More.",
        features: ["1 Article", "Plagiarism check", "References & citations", "Include keyword research"],
        defaultWords: 1000,
        basePrice: 20,
      },
      {
        id: 3,
        packageKey: "premium",
        badge: "Premium Plus",
        description: "Long-form content package with advanced research and multiple revisions.",
        features: [
          "2 Long-form articles",
          "In-depth keyword research",
          "SEO content strategy outline",
          "2 rounds of revisions",
        ],
        defaultWords: 1500,
        basePrice: 20,
      },
    ],
  });

  const [selectedId, setSelectedId] = useState<number | null>(items[0]?.id ?? null);
  const selectedItem = useMemo(
    () => items.find((x) => x.id === selectedId) ?? null,
    [items, selectedId]
  );

  const selectedProductId = selectedItem?.id ?? null;

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (!q) return true;
      const haystack = `${item.title} ${item.serviceCategory ?? ""} ${item.price} ${item.deliveryTime ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search]);

  const columns: Column[] = useMemo(
    () => [
      {
        header: "Image",
        accessor: "imageSrc",
        type: "image",
      },
      {
        header: "Title",
        accessor: "title",
        type: "text",
        render: (value, row) => (
          <button
            type="button"
            onClick={() => setSelectedId(row.id as number)}
            className="text-left text-[11px] text-slate-700 hover:text-blue-600"
          >
            {String(value)}
          </button>
        ),
      },
      { header: "Category", accessor: "serviceCategory", type: "text" },
      { header: "Price", accessor: "price", type: "text" },
      { header: "Delivery", accessor: "deliveryTime", type: "text" },
      {
        header: "Status",
        accessor: "status",
        type: "text",
        render: (value) => {
          const v = String(value);
          const isActive = v === "active";
          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      { header: "Action", accessor: "action", type: "action" },
    ],
    []
  );

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "imageSrc",
        label: "Product Image",
        type: "image",
        multiple: false,
      },
      {
        name: "title",
        label: "Title",
        type: "text",
        placeholder: "Product title",
      },
      {
        name: "serviceCategory",
        label: "Category",
        type: "text",
        placeholder: "SEO Content / Blog Writing / ...",
      },
      {
        name: "price",
        label: "Base Price (e.g. $20)",
        type: "text",
        placeholder: "$20",
      },
      {
        name: "deliveryTime",
        label: "Delivery Time",
        type: "text",
        placeholder: "2 Days Delivery",
      },
      {
        name: "status",
        label: "Status (active / inactive)",
        type: "select",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    ],
    []
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editingDetailId, setEditingDetailId] = useState<number | null>(null);

  const [advModalOpen, setAdvModalOpen] = useState(false);
  const [editingAdvId, setEditingAdvId] = useState<number | null>(null);

  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState<number | null>(null);

  const editingItem = useMemo(
    () => (editingId === null ? null : items.find((x) => x.id === editingId) ?? null),
    [editingId, items]
  );

  const detailsColumns: Column[] = useMemo(
    () => [
      { header: "Content", accessor: "fullText", type: "textarea" },
      { header: "Action", accessor: "action", type: "action" },
    ],
    []
  );

  const advantagesColumns: Column[] = useMemo(
    () => [
      { header: "Title", accessor: "title", type: "text" },
      { header: "Subtitle", accessor: "subtitle", type: "text" },
      { header: "Action", accessor: "action", type: "action" },
    ],
    []
  );

  const packagesColumns: Column[] = useMemo(
    () => [
      { header: "Key", accessor: "packageKey", type: "text" },
      { header: "Badge", accessor: "badge", type: "text" },
      { header: "Description", accessor: "description", type: "textarea" },
      {
        header: "Features",
        accessor: "features",
        type: "text",
        render: (value) => {
          const feats = (value as string[]) ?? [];
          return (
            <div className="flex flex-wrap gap-1">
              {feats.slice(0, 3).map((x) => (
                <span
                  key={x}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
                >
                  {x}
                </span>
              ))}
              {feats.length > 3 ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                  +{feats.length - 3}
                </span>
              ) : null}
            </div>
          );
        },
      },
      { header: "Words", accessor: "defaultWords", type: "text" },
      { header: "Base Price", accessor: "basePrice", type: "text" },
      { header: "Action", accessor: "action", type: "action" },
    ],
    []
  );

  const detailFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "fullText",
        label: "Product Details",
        type: "textarea",
        placeholder: "Write product details here...",
      },
    ],
    []
  );

  const advantageFields: AdminModalField[] = useMemo(
    () => [
      { name: "title", label: "Title", type: "text", placeholder: "Highly Responsive" },
      {
        name: "subtitle",
        label: "Subtitle",
        type: "text",
        placeholder: "Known for exceptionally quick replies",
      },
    ],
    []
  );

  const packageFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "packageKey",
        label: "Package Key (basic / standard / premium)",
        type: "text",
        placeholder: "standard",
      },
      { name: "badge", label: "Badge", type: "text", placeholder: "Advance" },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "features",
        label: "Features",
        type: "tags",
        placeholder: "Type feature then press Enter",
      },
      { name: "defaultWords", label: "Default Words", type: "number", placeholder: "1000" },
      { name: "basePrice", label: "Base Price", type: "number", placeholder: "20" },
    ],
    []
  );

  const normalizeImageValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      const first = value[0];
      return typeof first === "string" ? first : "/placeholder-image.png";
    }
    if (typeof value === "string" && value) return value;
    return "/placeholder-image.png";
  };

  const handleSubmit = (data: Record<string, unknown>) => {
    const next: AdminShopItem = {
      id: editingItem?.id ?? Date.now(),
      title: String(data.title ?? ""),
      imageSrc: normalizeImageValue(data.imageSrc),
      price: String(data.price ?? ""),
      deliveryTime: String(data.deliveryTime ?? ""),
      serviceCategory: String(data.serviceCategory ?? ""),
      status:
        String(data.status ?? "active") === "inactive" ? "inactive" : "active",
    };

    setItems((prev) => {
      if (editingItem) {
        return prev.map((x) => (x.id === editingItem.id ? next : x));
      }
      return [next, ...prev];
    });

    setSelectedId(next.id);
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar
        active={activeMenu}
        onNavigate={(key) => {
          setActiveMenu(key);
          if (key === "chat") {
            navigate("/admin/chat");
          } else if (key === "landing") {
            navigate("/admin/landing/hero");
          } else if (key === "users") {
            navigate("/admin/users");
          } else if (key === "transactions") {
            navigate("/admin/transactions");
          } else if (key === "blog") {
            navigate("/admin/blog");
          } else if (key === "shop") {
            navigate("/admin/shop");
          }
        }}
      />

      <div className="flex flex-1 flex-col px-6 py-6 md:px-8 overflow-hidden">
        <AdminHeader title="Shop Management" />

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Products</p>
                  <p className="mt-1 text-xs text-slate-500">Pilih produk lalu lanjutkan CRUD per langkah.</p>
                </div>
              </div>
              <AdminTableHeader
                placeholder="Search product..."
                addLabel="Add Product"
                onSearchChange={(value) => setSearch(value)}
                onAddClick={() => {
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
              />

              <AdminTable
                columns={columns}
                data={filteredItems}
                currentPage={1}
                itemsPerPage={7}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                onEdit={(id) => {
                  if (!id) return;
                  setEditingId(id);
                  setIsModalOpen(true);
                }}
                onDelete={(id) => {
                  if (!id) return;
                  const ok = window.confirm("Delete this product?");
                  if (!ok) return;

                  setItems((prev) => prev.filter((x) => x.id !== id));
                  setSelectedId((prev) => (prev === id ? null : prev));
                }}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-4">
                <div className="h-full rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Selected Product</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Meta produk di-edit melalui table produk (atas).
                    </p>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                    {selectedItem ? (
                      <div>
                        <div className="relative">
                          <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
                            <img
                              src={selectedItem.imageSrc}
                              alt={selectedItem.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="pointer-events-none absolute inset-0">
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                            <div className="absolute inset-0 shadow-[inset_0_-90px_60px_-60px_rgba(0,0,0,0.95)]" />
                          </div>
                          <div className="absolute inset-x-0 bottom-0 p-4">
                            <p className="text-sm font-semibold text-white drop-shadow line-clamp-2">
                              {selectedItem.title}
                            </p>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <p className="text-[11px] text-slate-500">Category</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {selectedItem.serviceCategory ?? "-"}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <p className="text-[11px] text-slate-500">Status</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {selectedItem.status === "active" ? "Active" : "Inactive"}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <p className="text-[11px] text-slate-500">Price</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {selectedItem.price ?? "-"}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <p className="text-[11px] text-slate-500">Delivery</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {selectedItem.deliveryTime ?? "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 px-4 py-10 text-center">
                        <p className="text-sm text-slate-600">Pilih produk dari table di atas.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="h-full rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                  {!selectedProductId ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                      <p className="text-sm font-semibold text-slate-900">Belum ada produk dipilih</p>
                      <p className="mt-2 text-sm text-slate-600">Pilih produk dari tabel, lalu mulai isi data step-by-step.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="relative">
                          <div className="absolute left-0 right-0 top-[18px] h-0.5 bg-slate-200" />
                          <div
                            className="absolute left-0 top-[18px] h-0.5 bg-blue-600 transition-all"
                            style={{ width: `${((activeStep - 1) / 2) * 100}%` }}
                          />

                          <div className="relative grid gap-3 md:grid-cols-3">
                            <button
                              type="button"
                              onClick={() => setActiveStep(1)}
                              className={`group relative rounded-2xl border bg-white p-4 text-left shadow-xs transition ${
                                activeStep === 1
                                  ? "border-blue-600"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="absolute -top-3 left-4">
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                                    activeStep >= 1
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-slate-300 bg-white text-slate-600"
                                  }`}
                                >
                                  1
                                </div>
                              </div>
                              <p className="mt-2 text-sm font-semibold text-slate-900">Product Details</p>
                              <p className="mt-1 text-xs text-slate-500">Kelola deskripsi lengkap produk.</p>
                            </button>

                            <button
                              type="button"
                              disabled={!selectedItem}
                              onClick={() => setActiveStep(2)}
                              className={`group relative rounded-2xl border bg-white p-4 text-left shadow-xs transition ${
                                activeStep === 2
                                  ? "border-blue-600"
                                  : "border-slate-200 hover:border-slate-300"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              <div className="absolute -top-3 left-4">
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                                    activeStep > 2
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : activeStep === 2
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-slate-300 bg-white text-slate-600"
                                  }`}
                                >
                                  {activeStep > 2 ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      className="h-4 w-4"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    2
                                  )}
                                </div>
                              </div>
                              <p className="mt-2 text-sm font-semibold text-slate-900">Advantages</p>
                              <p className="mt-1 text-xs text-slate-500">Kelola keunggulan produk.</p>
                            </button>

                            <button
                              type="button"
                              disabled={!selectedItem}
                              onClick={() => setActiveStep(3)}
                              className={`group relative rounded-2xl border bg-white p-4 text-left shadow-xs transition ${
                                activeStep === 3
                                  ? "border-blue-600"
                                  : "border-slate-200 hover:border-slate-300"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              <div className="absolute -top-3 left-4">
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                                    activeStep === 3
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-slate-300 bg-white text-slate-600"
                                  }`}
                                >
                                  3
                                </div>
                              </div>
                              <p className="mt-2 text-sm font-semibold text-slate-900">Packages</p>
                              <p className="mt-1 text-xs text-slate-500">Kelola paket dan harga.</p>
                            </button>
                          </div>
                        </div>
                      </div>

                      {activeStep === 1 && (
                        <div>
                          <div className="flex items-start justify-between gap-3 flex-wrap border-b border-slate-100 pb-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Product Details</p>
                              <p className="mt-1 text-xs text-slate-500">Kelola konten deskripsi produk.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDetailId(null);
                                setDetailsModalOpen(true);
                              }}
                              className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                            >
                              Add Details
                            </button>
                          </div>

                          <div className="mt-4">
                            <AdminTable
                              columns={detailsColumns}
                              data={detailsByProductId[selectedProductId] ?? []}
                              currentPage={1}
                              itemsPerPage={5}
                              totalPages={1}
                              onPageChange={() => {}}
                              onItemsPerPageChange={() => {}}
                              onEdit={(id) => {
                                if (!id) return;
                                setEditingDetailId(id);
                                setDetailsModalOpen(true);
                              }}
                              onDelete={(id) => {
                                if (!id) return;
                                const ok = window.confirm("Delete this details entry?");
                                if (!ok) return;
                                setDetailsByProductId((prev) => {
                                  const existing = prev[selectedProductId] ?? [];
                                  return {
                                    ...prev,
                                    [selectedProductId]: existing.filter((x) => x.id !== id),
                                  };
                                });
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {activeStep === 2 && (
                        <div>
                          <div className="flex items-start justify-between gap-3 flex-wrap border-b border-slate-100 pb-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Advantages</p>
                              <p className="mt-1 text-xs text-slate-500">Kelola keunggulan produk.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAdvId(null);
                                setAdvModalOpen(true);
                              }}
                              className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                            >
                              Add Advantage
                            </button>
                          </div>

                          <div className="mt-4">
                            <AdminTable
                              columns={advantagesColumns}
                              data={advantagesByProductId[selectedProductId] ?? []}
                              currentPage={1}
                              itemsPerPage={7}
                              totalPages={1}
                              onPageChange={() => {}}
                              onItemsPerPageChange={() => {}}
                              onEdit={(id) => {
                                if (!id) return;
                                setEditingAdvId(id);
                                setAdvModalOpen(true);
                              }}
                              onDelete={(id) => {
                                if (!id) return;
                                const ok = window.confirm("Delete this advantage?");
                                if (!ok) return;
                                setAdvantagesByProductId((prev) => {
                                  const existing = prev[selectedProductId] ?? [];
                                  return {
                                    ...prev,
                                    [selectedProductId]: existing.filter((x) => x.id !== id),
                                  };
                                });
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {activeStep === 3 && (
                        <div>
                          <div className="flex items-start justify-between gap-3 flex-wrap border-b border-slate-100 pb-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Packages</p>
                              <p className="mt-1 text-xs text-slate-500">Kelola paket dan harga.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPkgId(null);
                                setPkgModalOpen(true);
                              }}
                              className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                            >
                              Add Package
                            </button>
                          </div>

                          <div className="mt-4">
                            <AdminTable
                              columns={packagesColumns}
                              data={packagesByProductId[selectedProductId] ?? []}
                              currentPage={1}
                              itemsPerPage={7}
                              totalPages={1}
                              onPageChange={() => {}}
                              onItemsPerPageChange={() => {}}
                              onEdit={(id) => {
                                if (!id) return;
                                setEditingPkgId(id);
                                setPkgModalOpen(true);
                              }}
                              onDelete={(id) => {
                                if (!id) return;
                                const ok = window.confirm("Delete this package?");
                                if (!ok) return;
                                setPackagesByProductId((prev) => {
                                  const existing = prev[selectedProductId] ?? [];
                                  return {
                                    ...prev,
                                    [selectedProductId]: existing.filter((x) => x.id !== id),
                                  };
                                });
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingItem ? "Edit Product" : "Add Product"}
        fields={modalFields}
        initialData={
          editingItem
            ? {
                ...editingItem,
                imageSrc: editingItem.imageSrc,
              }
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={handleSubmit}
      />

      <AdminModal
        isOpen={detailsModalOpen}
        title={editingDetailId ? "Edit Details" : "Add Details"}
        fields={detailFields}
        initialData={
          selectedProductId
            ? (detailsByProductId[selectedProductId] ?? []).find((x) => x.id === editingDetailId) ?? undefined
            : undefined
        }
        onClose={() => {
          setDetailsModalOpen(false);
          setEditingDetailId(null);
        }}
        onSubmit={(data) => {
          if (!selectedProductId) return;
          const next: ProductDetail = {
            id: editingDetailId ?? Date.now(),
            fullText: String(data.fullText ?? ""),
          };
          setDetailsByProductId((prev) => {
            const existing = prev[selectedProductId] ?? [];
            if (editingDetailId) {
              return {
                ...prev,
                [selectedProductId]: existing.map((x) => (x.id === editingDetailId ? next : x)),
              };
            }
            return {
              ...prev,
              [selectedProductId]: [next, ...existing],
            };
          });
          setDetailsModalOpen(false);
          setEditingDetailId(null);
        }}
      />

      <AdminModal
        isOpen={advModalOpen}
        title={editingAdvId ? "Edit Advantage" : "Add Advantage"}
        fields={advantageFields}
        initialData={
          selectedProductId
            ? (advantagesByProductId[selectedProductId] ?? []).find((x) => x.id === editingAdvId) ?? undefined
            : undefined
        }
        onClose={() => {
          setAdvModalOpen(false);
          setEditingAdvId(null);
        }}
        onSubmit={(data) => {
          if (!selectedProductId) return;
          const next: ProductAdvantage = {
            id: editingAdvId ?? Date.now(),
            title: String(data.title ?? ""),
            subtitle: String(data.subtitle ?? ""),
          };
          setAdvantagesByProductId((prev) => {
            const existing = prev[selectedProductId] ?? [];
            if (editingAdvId) {
              return {
                ...prev,
                [selectedProductId]: existing.map((x) => (x.id === editingAdvId ? next : x)),
              };
            }
            return {
              ...prev,
              [selectedProductId]: [next, ...existing],
            };
          });
          setAdvModalOpen(false);
          setEditingAdvId(null);
        }}
      />

      <AdminModal
        isOpen={pkgModalOpen}
        title={editingPkgId ? "Edit Package" : "Add Package"}
        fields={packageFields}
        initialData={
          selectedProductId
            ? (packagesByProductId[selectedProductId] ?? []).find((x) => x.id === editingPkgId) ?? undefined
            : undefined
        }
        onClose={() => {
          setPkgModalOpen(false);
          setEditingPkgId(null);
        }}
        onSubmit={(data) => {
          if (!selectedProductId) return;
          const keyRaw = String(data.packageKey ?? "standard");
          const packageKey: ProductPackage["packageKey"] =
            keyRaw === "basic" || keyRaw === "premium" ? keyRaw : "standard";
          const next: ProductPackage = {
            id: editingPkgId ?? Date.now(),
            packageKey,
            badge: String(data.badge ?? ""),
            description: String(data.description ?? ""),
            features: Array.isArray(data.features) ? (data.features as string[]) : [],
            defaultWords: Number(data.defaultWords ?? 0) || 0,
            basePrice: Number(data.basePrice ?? 0) || 0,
          };
          setPackagesByProductId((prev) => {
            const existing = prev[selectedProductId] ?? [];
            if (editingPkgId) {
              return {
                ...prev,
                [selectedProductId]: existing.map((x) => (x.id === editingPkgId ? next : x)),
              };
            }
            return {
              ...prev,
              [selectedProductId]: [next, ...existing],
            };
          });
          setPkgModalOpen(false);
          setEditingPkgId(null);
        }}
      />
    </div>
  );
};

export default AdminShopPage;
