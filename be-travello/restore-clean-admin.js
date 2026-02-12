const fs = require('fs');

// Create clean working version
const cleanContent = `import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminTableHeader from "../../../components/admin/AdminTableHeader";
import AdminTable from "../../../components/admin/AdminTable";
import type { Column } from "../../../components/admin/AdminTable";
import AdminModal, { type AdminModalField } from "../../../components/admin/AdminModal";
import type { ShopItem } from "../../../components/ui/shopCards";
import { useAdminToast } from "../../../hooks/useAdminToast";

type AdminShopItem = ShopItem & {
  status: "active" | "inactive";
};

const AdminShopPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("shop");
  const navigate = useNavigate();
  const toast = useAdminToast();

  const [items, setItems] = useState<AdminShopItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Try port 5000 first (MySQL backend), then fallback to 5001 (file-based)
      let response;
      try {
        response = await fetch('http://localhost:5000/api/shops');
      } catch (error) {
        console.log('⚠️ Port 5000 failed, trying port 5001...');
        response = await fetch('http://localhost:5001/api/shops');
      }
      
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const products = await response.json();
      const transformedItems: AdminShopItem[] = products.map((product: any) => ({
        id: product.id,
        title: product.title,
        imageSrc: product.image_src || "/bg-shopCards.jpg",
        price: \`$\${product.price}\`,
        deliveryTime: product.delivery_time || "2 Days Delivery",
        serviceCategory: product.service_category,
        status: product.status as "active" | "inactive",
      }));
      
      setItems(transformedItems);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const [search, setSearch] = useState("");
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const [selectedId, setSelectedId] = useState<number | null>(items[0]?.id ?? null);
  const selectedItem = useMemo(
    () => items.find((x) => x.id === selectedId) ?? null,
    [items, selectedId]
  );

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (!q) return true;
      const haystack = \`\${item.title} \${item.serviceCategory ?? ""} \${item.price} \${item.deliveryTime ?? ""}\`.toLowerCase();
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
              className={\`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium \${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }\`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        header: "Preview",
        accessor: "preview",
        type: "action",
        render: (value, row) => (
          <button
            onClick={() => window.open(\`http://localhost:5173/work/shop\`, '_blank')}
            className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </button>
        ),
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
        type: "radio",
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

  const editingItem = useMemo(
    () => (editingId === null ? null : items.find((x) => x.id === editingId) ?? null),
    [editingId, items]
  );

  const normalizeImageValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      const first = value[0];
      return typeof first === "string" ? first : "/placeholder-image.png";
    }
    if (typeof value === "string" && value) return value;
    return "/placeholder-image.png";
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      const productData = {
        title: String(data.title ?? ""),
        description: String(data.title ?? ""),
        image_src: normalizeImageValue(data.imageSrc),
        price: parseFloat(String(data.price ?? "0").replace(/[^0-9.]/g, "")),
        delivery_time: String(data.deliveryTime ?? "2 Days Delivery"),
        service_category: String(data.serviceCategory ?? ""),
        status: String(data.status ?? "active") === "inactive" ? "inactive" : "active",
      };

      console.log('📝 Submitting product data:', productData);

      let response;
      if (editingItem) {
        try {
          response = await fetch(\`http://localhost:5000/api/shops/\${editingItem.id}\`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
          });
        } catch (error) {
          response = await fetch(\`http://localhost:5001/api/shops/\${editingItem.id}\`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
          });
        }
      } else {
        try {
          response = await fetch('http://localhost:5000/api/shops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
          });
        } catch (error) {
          response = await fetch('http://localhost:5001/api/shops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
          });
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || \`HTTP \${response.status}: \${response.statusText}\`);
      }

      const result = await response.json();
      console.log('✅ Product saved successfully:', result);

      await fetchProducts();
      setIsModalOpen(false);
      setEditingId(null);

      toast.success("Success", editingItem ? "Product updated successfully" : "Product added successfully");
    } catch (error) {
      console.error('❌ Error saving product:', error);
      toast.error("Error", \`Failed to save product: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar
        active={activeMenu}
        onNavigate={(key) => {
          setActiveMenu(key);
          if (key === "dashboard") navigate("/admin/dashboard");
          else if (key === "chat") navigate("/admin/chat");
          else if (key === "landing") navigate("/admin/landing/hero");
          else if (key === "users") navigate("/admin/users");
          else if (key === "transactions") navigate("/admin/transactions");
          else if (key === "blog") navigate("/admin/blog");
          else if (key === "shop") navigate("/admin/shop");
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-8 md:py-6 overflow-hidden">
        <AdminHeader title="Shop Management" />

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Products</p>
                  <p className="mt-1 text-xs text-slate-500">Select a product, then manage it step by step.</p>
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
                onDelete={async (id) => {
                  if (!id) return;
                  const ok = window.confirm("Delete this product?");
                  if (!ok) return;

                  try {
                    let response;
                    try {
                      response = await fetch(\`http://localhost:5000/api/shops/\${id}\`, {
                        method: 'DELETE',
                      });
                    } catch (error) {
                      response = await fetch(\`http://localhost:5001/api/shops/\${id}\`, {
                        method: 'DELETE',
                      });
                    }

                    if (!response.ok) throw new Error('Failed to delete product');

                    await fetchProducts();
                    setSelectedId((prev) => (prev === id ? null : prev));
                    toast.success("Success", "Product deleted successfully");
                  } catch (error) {
                    console.error('Error deleting product:', error);
                    toast.error("Error", "Failed to delete product");
                  }
                }}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-12 items-stretch max-w-full">
              <div className="lg:col-span-4 min-w-0">
                <div className="h-full rounded-2xl border border-slate-100 bg-white p-5 shadow-xs min-w-0 max-w-full overflow-hidden">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Selected Product</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Product metadata is edited via product table (above).
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

                        <div className="p-4 min-w-0">
                          <div className="grid grid-cols-2 gap-3 min-w-0">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 min-w-0">
                              <p className="text-[11px] text-slate-500">Category</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                                {selectedItem.serviceCategory ?? "-"}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 min-w-0">
                              <p className="text-[11px] text-slate-500">Status</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                                {selectedItem.status === "active" ? "Active" : "Inactive"}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 min-w-0">
                              <p className="text-[11px] text-slate-500">Price</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                                {selectedItem.price ?? "-"}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 min-w-0">
                              <p className="text-[11px] text-slate-500">Delivery</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                                {selectedItem.deliveryTime ?? "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 px-4 py-10 text-center">
                        <p className="text-sm text-slate-600">Select a product from table above.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 min-w-0">
                <div className="h-full rounded-2xl border border-slate-100 bg-white p-5 shadow-xs min-w-0 max-w-full overflow-hidden">
                  {!selectedItem ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                      <p className="text-sm font-semibold text-slate-900">No product selected</p>
                      <p className="mt-2 text-sm text-slate-600">Select a product from table, then start filling in data step by step.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 min-w-0 max-w-full">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="relative">
                          <div className="absolute left-0 right-0 top-[18px] h-0.5 bg-slate-200" />
                          <div
                            className="absolute left-0 top-[18px] h-0.5 bg-blue-600 transition-all"
                            style={{ width: \`\${((activeStep - 1) / 2) * 100}%\` }}
                          />

                          <div className="relative grid gap-3 md:grid-cols-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => setActiveStep(1)}
                              className={\`group relative rounded-2xl border bg-white p-4 text-left shadow-xs transition \${
                                activeStep === 1
                                  ? "border-blue-600"
                                  : "border-slate-200 hover:border-slate-300"
                              }\`}
                            >
                              <div className="absolute -top-3 left-4">
                                <div
                                  className={\`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold \${
                                    activeStep >= 1
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-slate-300 bg-white text-slate-600"
                                  }\`}
                                >
                                  1
                                </div>
                              </div>
                              <p className="mt-2 text-sm font-semibold text-slate-900 truncate">Product Details</p>
                              <p className="mt-1 text-xs text-slate-500">Manage full product description.</p>
                            </button>

                            <button
                              type="button"
                              disabled={!selectedItem}
                              onClick={() => setActiveStep(2)}
                              className={\`group relative rounded-2xl border bg-white p-4 text-left shadow-xs transition \${
                                activeStep === 2
                                  ? "border-blue-600"
                                  : "border-slate-200 hover:border-slate-300"
                              } disabled:cursor-not-allowed disabled:opacity-60\`}
                            >
                              <div className="absolute -top-3 left-4">
                                <div
                                  className={\`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold \${
                                    activeStep > 2
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : activeStep === 2
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-slate-300 bg-white text-slate-600"
                                  }\`}
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
                              <p className="mt-2 text-sm font-semibold text-slate-900 truncate">Advantages</p>
                              <p className="mt-1 text-xs text-slate-500">Manage product advantages.</p>
                            </button>

                            <button
                              type="button"
                              disabled={!selectedItem}
                              onClick={() => setActiveStep(3)}
                              className={\`group relative rounded-2xl border bg-white p-4 text-left shadow-xs transition \${
                                activeStep === 3
                                  ? "border-blue-600"
                                  : "border-slate-200 hover:border-slate-300"
                              } disabled:cursor-not-allowed disabled:opacity-60\`}
                            >
                              <div className="absolute -top-3 left-4">
                                <div
                                  className={\`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold \${
                                    activeStep > 3
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : activeStep === 3
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-slate-300 bg-white text-slate-600"
                                  }\`}
                                >
                                  {activeStep > 3 ? (
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
                                    3
                                  )}
                                </div>
                              </div>
                              <p className="mt-2 text-sm font-semibold text-slate-900 truncate">Packages</p>
                              <p className="mt-1 text-xs text-slate-500">Manage product packages.</p>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900">
                            {activeStep === 1 && "Product Details"}
                            {activeStep === 2 && "Advantages"}
                            {activeStep === 3 && "Packages"}
                          </p>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setIsModalOpen(true);
                            }}
                            className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add
                          </button>
                        </div>

                        <div className="text-center text-xs text-slate-500">
                          {activeStep === 1 && "Edit product details"}
                          {activeStep === 2 && "Edit product advantages"}
                          {activeStep === 3 && "Edit product packages"}
                        </div>
                      </div>
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        title={editingItem ? "Edit Product" : "Add New Product"}
        fields={modalFields}
        initialData={editingItem || {
          imageSrc: "",
          title: "",
          serviceCategory: "",
          price: "",
          deliveryTime: "2 Days Delivery",
          status: "active" as const,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminShopPage;`;

// Write the clean file
fs.writeFileSync('../fe-travello/src/pages/admin/shop/AdminShopPage.tsx', cleanContent, 'utf8');
console.log('✅ AdminShopPage.tsx has been restored to clean working version!');
