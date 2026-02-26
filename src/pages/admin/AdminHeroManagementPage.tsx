import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminTableHeader from "../../components/admin/AdminTableHeader";
import AdminTable from "../../components/admin/AdminTable";
import type { Column } from "../../components/admin/AdminTable";
import AdminModal, {
  type AdminModalField,
} from "../../components/admin/AdminModal";
import InitialShimmer from "../../components/ui/InitialShimmer";
import { AdminTablePageSkeleton } from "../../components/ui/skeletons";

const AdminHeroManagementPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();

  // State for hero text/brands table
  const [heroBrandsData, setHeroBrandsData] = useState<
    Array<{
      id: number;
      description: string;
      badge: string;
      brands: string[];
    }>
  >([
    {
      id: 1,
      description:
        "Bridging the gap between global marketing strategy and authentic storytelling. Based in Bali, working globally.",
      badge: "Digital Nomad & Creative Strategist",
      brands: [
        "/Amazon-Logo 1.png",
        "/Amazon-Logo 1.png",
        "/Amazon-Logo 1.png",
        "/Amazon-Logo 1.png",
      ],
    },
  ]);

  // State for hero image table
  const [heroImageData, setHeroImageData] = useState<
    Array<{
      id: number;
      mainImage: string;
    }>
  >([
    {
      id: 1,
      mainImage: "/foto 2.jpg",
    },
    {
      id: 2,
      mainImage: "/foto 1.jpg",
    },
  ]);

  // Modal state for hero text/brands
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHeroId, setEditingHeroId] = useState<number | null>(null);

  // Modal state for hero image
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);

  const heroTextColumns: Column[] = [
    { header: "Description", accessor: "description", type: "textarea" },
    { header: "Badge", accessor: "badge", type: "text" },
    {
      header: "Featured Brands",
      accessor: "brands",
      type: "text",
      render: (value) => {
        const brands = (value as string[]) || [];
        return (
          <div className="flex flex-wrap items-center gap-2">
            {brands.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="Brand logo"
                className="h-4 md:h-5 object-contain"
              />
            ))}
          </div>
        );
      },
    },
    { header: "Action", accessor: "action", type: "action" },
  ];

  // Columns for Hero image management
  const heroImageColumns: Column[] = [
    { header: "Main Image", accessor: "mainImage", type: "image" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  // Modal field configs
  const heroFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Masukkan teks hero...",
      },
      {
        name: "badge",
        label: "Badge",
        type: "text",
        placeholder: "Misal: Digital Nomad & Creative Strategist",
      },
      {
        name: "brands",
        label: "Featured Brands Images",
        type: "image",
      },
    ],
    []
  );

  const heroImageFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "mainImage",
        label: "Main Image URL",
        type: "image",
        placeholder: "/foto-hero.jpg",
      },
    ],
    []
  );

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-44" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar
          active={activeMenu}
          landingActiveKey="hero"
          onNavigate={(key) => {
            setActiveMenu(key);
            if (key === "chat") {
              navigate("/admin/chat");
            } else if (key === "landing") {
              navigate("/admin/landing/hero");
            } else if (key === "users") {
              navigate("/admin/users");
            } else if (key === "shop") {
              navigate("/admin/shop");
            } else if (key === "transactions") {
              navigate("/admin/transactions");
            } else if (key === "blog") {
              navigate("/admin/blog");
            }
          }}
          onNavigateLandingSub={(subKey) => {
            if (subKey === "hero") {
              setActiveMenu("landing");
              navigate("/admin/landing/hero");
            } else if (subKey === "travel") {
              setActiveMenu("landing");
              navigate("/admin/landing/travel-journal");
            } else if (subKey === "about") {
              setActiveMenu("landing");
              navigate("/admin/landing/about");
            } else if (subKey === "portfolio") {
              setActiveMenu("landing");
              navigate("/admin/landing/portfolio");
            } else if (subKey === "certServices") {
              setActiveMenu("landing");
              navigate("/admin/landing/cert-services");
            } else if (subKey === "experience") {
              setActiveMenu("landing");
              navigate("/admin/landing/experience");
            } else if (subKey === "faq") {
              setActiveMenu("landing");
              navigate("/admin/landing/faq");
            }
          }}
        />

        {/* Main content */}
        <div className="flex flex-1 flex-col px-8 py-6 overflow-hidden">
          <AdminHeader title="Hero Management" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            {/* Top: Hero text management */}
            <section>
              <AdminTableHeader
                onAddClick={() => {
                  if (heroBrandsData.length >= 1) {
                    return;
                  }
                  setEditingHeroId(null);
                  setIsHeroModalOpen(true);
                }}
              />

              {/* Table */}
              <AdminTable
                columns={heroTextColumns}
                data={heroBrandsData}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                onEdit={(id) => {
                  if (typeof id === "number") {
                    setEditingHeroId(id);
                    setIsHeroModalOpen(true);
                  }
                }}
                onDelete={(id) => {
                  if (typeof id === "number") {
                    setHeroBrandsData((prev) => prev.filter((item) => item.id !== id));
                  }
                }}
              />
            </section>

            {/* Bottom: Hero image management */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Hero Image Management</h2>
              </div>

              <AdminTableHeader
                onAddClick={() => {
                  if (heroImageData.length >= 7) {
                    return;
                  }
                  setEditingImageId(null);
                  setIsImageModalOpen(true);
                }}
              />

              {/* Table */}
              <AdminTable
                columns={heroImageColumns}
                data={heroImageData}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                onEdit={(id) => {
                  if (typeof id === "number") {
                    setEditingImageId(id);
                    setIsImageModalOpen(true);
                  }
                }}
                onDelete={(id) => {
                  if (typeof id === "number") {
                    setHeroImageData((prev) => prev.filter((item) => item.id !== id));
                  }
                }}
              />
            </section>
          </div>
        </div>

        {/* Hero text / brands modal */}
        <AdminModal
          isOpen={isHeroModalOpen}
          title={editingHeroId ? "Edit Hero" : "Tambah Hero"}
          fields={heroFields}
          initialData={
            editingHeroId != null
              ? (heroBrandsData.find((item) => item.id === editingHeroId) as
                  | Record<string, unknown>
                  | undefined)
              : undefined
          }
          onClose={() => {
            setIsHeroModalOpen(false);
            setEditingHeroId(null);
          }}
          onSubmit={(data) => {
            const brands = (data.brands as string[] | undefined) ?? [];

            if (editingHeroId != null) {
              // update existing
              setHeroBrandsData((prev) =>
                prev.map((item) =>
                  item.id === editingHeroId
                    ? {
                        ...item,
                        description: (data.description as string) || item.description,
                        badge: (data.badge as string) || item.badge,
                        brands: brands.length > 0 ? brands : item.brands,
                      }
                    : item
                )
              );
            } else {
              // add new
              setHeroBrandsData((prev) => {
                if (prev.length >= 1) {
                  return prev;
                }
                const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
                return [
                  ...prev,
                  {
                    id: nextId,
                    description: (data.description as string) || "",
                    badge: (data.badge as string) || "",
                    brands,
                  },
                ];
              });
            }

            setIsHeroModalOpen(false);
            setEditingHeroId(null);
          }}
        />

        {/* Hero image modal */}
        <AdminModal
          isOpen={isImageModalOpen}
          title={editingImageId ? "Edit Hero Image" : "Tambah Hero Image"}
          fields={heroImageFields}
          initialData={
            editingImageId != null
              ? (heroImageData.find((item) => item.id === editingImageId) as
                  | Record<string, unknown>
                  | undefined)
              : undefined
          }
          onClose={() => {
            setIsImageModalOpen(false);
            setEditingImageId(null);
          }}
          onSubmit={(data) => {
            const mainImage = (data.mainImage as string) || "";

            if (editingImageId != null) {
              setHeroImageData((prev) =>
                prev.map((item) =>
                  item.id === editingImageId
                    ? {
                        ...item,
                        mainImage: mainImage || item.mainImage,
                      }
                    : item
                )
              );
            } else {
              setHeroImageData((prev) => {
                if (prev.length >= 7) {
                  return prev;
                }
                const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
                return [
                  ...prev,
                  {
                    id: nextId,
                    mainImage,
                  },
                ];
              });
            }

            setIsImageModalOpen(false);
            setEditingImageId(null);
          }}
        />
      </div>
    </InitialShimmer>
  );
};

export default AdminHeroManagementPage;
