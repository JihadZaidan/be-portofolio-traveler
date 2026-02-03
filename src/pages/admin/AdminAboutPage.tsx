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

interface AboutContent extends Record<string, unknown> {
  id: number;
  image: string;
  description: string;
}

const AdminAboutPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();

  const [aboutData, setAboutData] = useState<AboutContent[]>([
    {
      id: 1,
      image: "/rizwords-nomad.jpg",
      description:
        "With over 5 years of experience and a deep understanding of copywriting psychology, marketing funnel, stages of awareness, and market sophistication I'll connect your brand with your target audience's pain points through ads and content. Then present your product as the perfect solution for their problems.",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const columns: Column[] = [
    { header: "Image", accessor: "image", type: "image" },
    { header: "Description", accessor: "description", type: "textarea" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "image",
        label: "About Image",
        type: "image",
        multiple: false,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Masukkan deskripsi tentang kamu...",
      },
    ],
    []
  );

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-28" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <AdminSidebar
          active={activeMenu}
          landingActiveKey="about"
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
          <AdminHeader title="About Management" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                onAddClick={() => {
                  if (aboutData.length >= 1) {
                    return;
                  }
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
              />

              <AdminTable
                columns={columns}
                data={aboutData}
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
                    setAboutData((prev) => prev.filter((item) => item.id !== id));
                  }
                }}
              />
            </section>
          </div>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "Edit About" : "Tambah About"}
        fields={modalFields}
        initialData={
          editingId != null
            ? (aboutData.find((item) => item.id === editingId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={(data) => {
          const imageList = (data.image as string[] | undefined) ?? [];
          const image = imageList[0] || "";
          const description = (data.description as string) || "";

          if (editingId != null) {
            setAboutData((prev) =>
              prev.map((item) =>
                item.id === editingId
                  ? {
                      ...item,
                      image: image || item.image,
                      description: description || item.description,
                    }
                  : item
              )
            );
          } else {
            setAboutData((prev) => {
              if (prev.length >= 1) {
                return prev;
              }
              const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
              return [
                ...prev,
                {
                  id: nextId,
                  image,
                  description,
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

export default AdminAboutPage;
