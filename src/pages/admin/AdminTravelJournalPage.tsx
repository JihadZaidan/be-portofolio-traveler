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

interface TravelHighlight extends Record<string, unknown> {
  id: number;
  name: string;
  cover: string;
  images: string[];
}

const AdminTravelJournalPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();

  const [travelData, setTravelData] = useState<TravelHighlight[]>([
    {
      id: 1,
      name: "Bali",
      cover: "/foto 2.jpg",
      images: ["/foto 2.jpg", "/foto 5.jpg", "/foto 7.jpg"],
    },
    {
      id: 2,
      name: "Tokyo",
      cover: "/foto 1.jpg",
      images: ["/foto 1.jpg"],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const columns: Column[] = [
    { header: "Name Highlight", accessor: "name", type: "text" },
    { header: "Cover", accessor: "cover", type: "image" },
    {
      header: "Travel Image",
      accessor: "images",
      type: "text",
      render: (value) => {
        const urls = (value as string[]) || [];
        return (
          <div className="flex flex-wrap gap-2">
            {urls.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="Travel"
                className="h-8 w-8 rounded-lg border border-slate-200 object-cover"
              />
            ))}
          </div>
        );
      },
    },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Name Highlight",
        type: "text",
        placeholder: "Misal: Bali, Tokyo, Alps",
      },
      {
        name: "cover",
        label: "Cover Image",
        type: "image",
      },
      {
        name: "images",
        label: "Travel Images",
        type: "image",
      },
    ],
    []
  );

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-40" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <AdminSidebar
          active={activeMenu}
          landingActiveKey="travel"
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
          <AdminHeader title="Travel Journal Management" />

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
                data={travelData}
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
                    setTravelData((prev) => prev.filter((item) => item.id !== id));
                  }
                }}
              />
            </section>
          </div>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "Edit Travel Highlight" : "Tambah Travel Highlight"}
        fields={modalFields}
        initialData={
          editingId != null
            ? (travelData.find((item) => item.id === editingId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={(data) => {
          const name = (data.name as string) || "";
          const coverList = (data.cover as string[] | undefined) ?? [];
          const images = (data.images as string[] | undefined) ?? [];
          const cover = coverList[0] || "";

          if (editingId != null) {
            setTravelData((prev) =>
              prev.map((item) =>
                item.id === editingId
                  ? {
                      ...item,
                      name: name || item.name,
                      cover: cover || item.cover,
                      images: images.length ? images : item.images,
                    }
                  : item
              )
            );
          } else {
            setTravelData((prev) => {
              const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
              return [
                ...prev,
                {
                  id: nextId,
                  name,
                  cover,
                  images,
                },
              ];
            });
          }

          setIsModalOpen(false);
          setEditingId(null);
        }}
      />
    </InitialShimmer>
  );
};

export default AdminTravelJournalPage;
