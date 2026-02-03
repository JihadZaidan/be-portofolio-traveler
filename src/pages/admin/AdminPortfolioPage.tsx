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

interface PortfolioAdminItem extends Record<string, unknown> {
  id: number;
  images: string[];
  tags: string[];
  description: string;
}

const AdminPortfolioPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();

  const [portfolioData, setPortfolioData] = useState<PortfolioAdminItem[]>([
    {
      id: 1,
      images: ["/Williams-Sonoma-Lunar.png", "/Dr-Bronners-Pure.png"],
      tags: ["Product Description", "Ecommerce"],
      description:
        "Example portfolio item for product description copy. You can edit this content from the admin panel.",
    },
    {
      id: 2,
      images: ["/Sudio-K2.png"],
      tags: ["Social Media"],
      description:
        "Example portfolio item for social media content. You can add your own projects here.",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const columns: Column[] = [
    {
      header: "Images",
      accessor: "images",
      type: "text",
      render: (value) => {
        const imgs = (value as string[]) || [];
        return (
          <div className="flex gap-2">
            {imgs.slice(0, 2).map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="Portfolio"
                className="h-8 w-8 rounded-lg border border-slate-200 object-cover"
              />
            ))}
          </div>
        );
      },
    },
    {
      header: "Tags",
      accessor: "tags",
      type: "text",
      render: (value) => {
        const tags = (value as string[]) || [];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        );
      },
    },
    { header: "Description", accessor: "description", type: "textarea" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "images",
        label: "Portfolio Images (max 2)",
        type: "image",
        multiple: true,
      },
      {
        name: "tags",
        label: "Tags",
        type: "tags",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Tuliskan deskripsi singkat project...",
      },
    ],
    []
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar
        active={activeMenu}
        landingActiveKey="portfolio"
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

      <div className="flex flex-1 flex-col px-8 py-6 overflow-hidden">
        <AdminHeader title="Portfolio Management" />

        <div className="flex-1 overflow-y-auto space-y-10 pr-1">
          <section>
            <AdminTableHeader
              onAddClick={() => {
                setEditingId(null);
                setIsModalOpen(true);
              }}
            />

            <AdminTable
              columns={columns}
              data={portfolioData}
              currentPage={1}
              itemsPerPage={5}
              totalPages={1}
              onPageChange={() => {}}
              onItemsPerPageChange={() => {}}
              onEdit={(id) => {
                if (typeof id === "number") {
                  setEditingId(id);
                  setIsModalOpen(true);
                }
              }}
              onDelete={(id) => {
                if (typeof id === "number") {
                  setPortfolioData((prev) => prev.filter((item) => item.id !== id));
                }
              }}
            />
          </section>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "Edit Portfolio" : "Tambah Portfolio"}
        fields={modalFields}
        initialData={
          editingId != null
            ? (portfolioData.find((item) => item.id === editingId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={(data) => {
          const imagesRaw = (data.images as string[] | undefined) ?? [];
          const images = imagesRaw.slice(0, 2); // batasi max 2 foto
          const tags = (data.tags as string[] | undefined) ?? [];
          const description = (data.description as string) || "";

          if (editingId != null) {
            setPortfolioData((prev) =>
              prev.map((item) =>
                item.id === editingId
                  ? {
                      ...item,
                      images: images.length ? images : item.images,
                      tags: tags.length ? tags : item.tags,
                      description: description || item.description,
                    }
                  : item
              )
            );
          } else {
            setPortfolioData((prev) => {
              const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
              return [
                ...prev,
                {
                  id: nextId,
                  images,
                  tags,
                  description,
                },
              ];
            });
          }

          setIsModalOpen(false);
          setEditingId(null);
        }}
      />
    </div>
  );
};

export default AdminPortfolioPage;
