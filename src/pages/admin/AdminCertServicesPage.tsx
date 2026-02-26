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

interface CertificationItem extends Record<string, unknown> {
  id: number;
  logo: string;
  title: string;
  subtitle?: string;
  organization: string;
}

interface ServiceItem extends Record<string, unknown> {
  id: number;
  name: string;
}

const AdminCertServicesPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();

  const [certData, setCertData] = useState<CertificationItem[]>([
    {
      id: 1,
      logo: "/EF-Logo.png",
      title: "EF SET English Certification",
      subtitle: "C2 Proficient",
      organization: "EF Standard English Test",
    },
    {
      id: 2,
      logo: "/Google-Logo.png",
      title: "The Fundamentals of Digital Marketing",
      subtitle: "",
      organization: "Google",
    },
  ]);

  const [servicesData, setServicesData] = useState<ServiceItem[]>([
    { id: 1, name: "Video Script" },
    { id: 2, name: "Custom Copywriting" },
    { id: 3, name: "Brand Storytelling" },
  ]);

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState<number | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

  const certColumns: Column[] = [
    { header: "Logo", accessor: "logo", type: "image" },
    { header: "Title", accessor: "title", type: "text" },
    { header: "Subtitle", accessor: "subtitle", type: "text" },
    { header: "Organization", accessor: "organization", type: "text" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const serviceColumns: Column[] = [
    { header: "Service", accessor: "name", type: "text" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const certFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "logo",
        label: "Certification Logo",
        type: "image",
        multiple: false,
      },
      {
        name: "title",
        label: "Title",
        type: "text",
        placeholder: "Masukkan judul sertifikasi...",
      },
      {
        name: "subtitle",
        label: "Subtitle (opsional)",
        type: "text",
        placeholder: "Level atau keterangan lain...",
      },
      {
        name: "organization",
        label: "Organization / Company",
        type: "text",
        placeholder: "Nama organisasi / perusahaan...",
      },
    ],
    []
  );

  const serviceFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Service",
        type: "text",
        placeholder: "Masukkan nama layanan...",
      },
    ],
    []
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar
        active={activeMenu}
        landingActiveKey="certServices"
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
        <AdminHeader title="Certifications Management" />

        <div className="flex-1 overflow-y-auto space-y-10 pr-1">
          {/* Certifications table */}
          <section>

            <AdminTableHeader
              onAddClick={() => {
                setEditingCertId(null);
                setIsCertModalOpen(true);
              }}
            />

            <AdminTable
              columns={certColumns}
              data={certData}
              currentPage={1}
              itemsPerPage={5}
              totalPages={1}
              onPageChange={() => {}}
              onItemsPerPageChange={() => {}}
              onEdit={(id) => {
                if (typeof id === "number") {
                  setEditingCertId(id);
                  setIsCertModalOpen(true);
                }
              }}
              onDelete={(id) => {
                if (typeof id === "number") {
                  setCertData((prev) => prev.filter((item) => item.id !== id));
                }
              }}
            />
          </section>

          {/* Services table */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Services Management</h2>
            </div>

            <AdminTableHeader
              onAddClick={() => {
                setEditingServiceId(null);
                setIsServiceModalOpen(true);
              }}
            />

            <AdminTable
              columns={serviceColumns}
              data={servicesData}
              currentPage={1}
              itemsPerPage={5}
              totalPages={1}
              onPageChange={() => {}}
              onItemsPerPageChange={() => {}}
              onEdit={(id) => {
                if (typeof id === "number") {
                  setEditingServiceId(id);
                  setIsServiceModalOpen(true);
                }
              }}
              onDelete={(id) => {
                if (typeof id === "number") {
                  setServicesData((prev) => prev.filter((item) => item.id !== id));
                }
              }}
            />
          </section>
        </div>
      </div>

      {/* Certification modal */}
      <AdminModal
        isOpen={isCertModalOpen}
        title={editingCertId ? "Edit Certification" : "Tambah Certification"}
        fields={certFields}
        initialData={
          editingCertId != null
            ? (certData.find((item) => item.id === editingCertId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsCertModalOpen(false);
          setEditingCertId(null);
        }}
        onSubmit={(data) => {
          const logoList = (data.logo as string[] | undefined) ?? [];
          const logo = logoList[0] || "";
          const title = (data.title as string) || "";
          const subtitle = (data.subtitle as string) || "";
          const organization = (data.organization as string) || "";

          if (editingCertId != null) {
            setCertData((prev) =>
              prev.map((item) =>
                item.id === editingCertId
                  ? {
                      ...item,
                      logo: logo || item.logo,
                      title: title || item.title,
                      subtitle: subtitle || item.subtitle,
                      organization: organization || item.organization,
                    }
                  : item
              )
            );
          } else {
            setCertData((prev) => {
              const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
              return [
                ...prev,
                {
                  id: nextId,
                  logo,
                  title,
                  subtitle,
                  organization,
                },
              ];
            });
          }

          setIsCertModalOpen(false);
          setEditingCertId(null);
        }}
      />

      {/* Service modal */}
      <AdminModal
        isOpen={isServiceModalOpen}
        title={editingServiceId ? "Edit Service" : "Tambah Service"}
        fields={serviceFields}
        initialData={
          editingServiceId != null
            ? (servicesData.find((item) => item.id === editingServiceId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsServiceModalOpen(false);
          setEditingServiceId(null);
        }}
        onSubmit={(data) => {
          const name = (data.name as string) || "";

          if (editingServiceId != null) {
            setServicesData((prev) =>
              prev.map((item) =>
                item.id === editingServiceId
                  ? {
                      ...item,
                      name: name || item.name,
                    }
                  : item
              )
            );
          } else {
            setServicesData((prev) => {
              const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
              return [
                ...prev,
                {
                  id: nextId,
                  name,
                },
              ];
            });
          }

          setIsServiceModalOpen(false);
          setEditingServiceId(null);
        }}
      />
    </div>
  );
};

export default AdminCertServicesPage;
