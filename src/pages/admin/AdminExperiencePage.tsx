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

interface ExperienceItem extends Record<string, unknown> {
  id: number;
  logo: string;
  logoAlt: string;
  title: string;
  company: string;
  period: string;
  duration: string;
}

const AdminExperiencePage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();

  const [experienceData, setExperienceData] = useState<ExperienceItem[]>([
    {
      id: 1,
      logo: "/welocalize_logo.jpeg",
      logoAlt: "Welocalize",
      title: "Ads Quality Rater",
      company: "Welocalize",
      period: "Mar 2023 hingga Mei 2025",
      duration: "2 thn 3 bln",
    },
    {
      id: 2,
      logo: "/ginitalent.jpeg",
      logoAlt: "Gini Talent",
      title: "Search Quality Improvement Lead",
      company: "Gini Talent",
      period: "Jun 2025 hingga Saat ini",
      duration: "8 bln",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const columns: Column[] = [
    { header: "Logo", accessor: "logo", type: "image" },
    { header: "Position", accessor: "title", type: "text" },
    {
      header: "Date",
      accessor: "period",
      type: "text",
      render: (_, row) => {
        const period = (row.period as string) ?? "";
        const duration = (row.duration as string) ?? "";
        return (
          <span>{period && duration ? `${period} · ${duration}` : period || duration}</span>
        );
      },
    },
    { header: "Company", accessor: "company", type: "text" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "logo",
        label: "Company Logo",
        type: "image",
        multiple: false,
      },
      {
        name: "title",
        label: "Position / Title",
        type: "text",
        placeholder: "Misal: Ads Quality Rater",
      },
      {
        name: "startDate",
        label: "Tanggal mulai*",
        type: "monthYear",
      },
      {
        name: "endDate",
        label: "Tanggal berakhir*",
        type: "monthYear",
      },
      {
        name: "duration",
        label: "Durasi",
        type: "text",
        placeholder: "Misal: 2 thn 3 bln",
      },
      {
        name: "company",
        label: "Company",
        type: "text",
        placeholder: "Nama perusahaan",
      },
    ],
    []
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar
        active={activeMenu}
        landingActiveKey="experience"
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
        <AdminHeader title="Experience Management" />

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
              data={experienceData}
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
                  setExperienceData((prev) => prev.filter((item) => item.id !== id));
                }
              }}
            />
          </section>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "Edit Experience" : "Tambah Experience"}
        fields={modalFields}
        initialData={
          editingId != null
            ? (experienceData.find((item) => item.id === editingId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={(data) => {
          const logoList = (data.logo as string[] | undefined) ?? [];
          const logo = logoList[0] || "";
          const title = (data.title as string) || "";
          const startDate = (data.startDate as string) || "";
          const endDate = (data.endDate as string) || "";
          const period =
            startDate && endDate
              ? `${startDate} hingga ${endDate}`
              : startDate || endDate;
          const duration = (data.duration as string) || "";
          const company = (data.company as string) || "";

          if (editingId != null) {
            setExperienceData((prev) =>
              prev.map((item) =>
                item.id === editingId
                  ? {
                      ...item,
                      logo: logo || item.logo,
                      title: title || item.title,
                      period: period || item.period,
                      duration: duration || item.duration,
                      company: company || item.company,
                    }
                  : item
              )
            );
          } else {
            setExperienceData((prev) => {
              const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
              return [
                ...prev,
                {
                  id: nextId,
                  logo,
                  logoAlt: "",
                  title,
                  company,
                  period,
                  duration,
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

export default AdminExperiencePage;
