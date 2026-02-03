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

interface FaqItem extends Record<string, unknown> {
  id: number;
  question: string;
  answer: string;
}

const MAX_FAQ = 6;

const AdminFaqPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();

  const [faqData, setFaqData] = useState<FaqItem[]>([
    {
      id: 1,
      question: "Apa saja layanan copywriting yang ditawarkan?",
      answer:
        "Saya menawarkan berbagai layanan copywriting termasuk video script, brand storytelling, email campaigns, content marketing, social media copy, product description, landing page copy, ads copy, dan SEO content.",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const columns: Column[] = [
    { header: "Question", accessor: "question", type: "text" },
    { header: "Answer", accessor: "answer", type: "textarea" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "question",
        label: "Question",
        type: "text",
        placeholder: "Tulis pertanyaan di sini...",
      },
      {
        name: "answer",
        label: "Answer",
        type: "textarea",
        placeholder: "Tulis jawaban di sini...",
      },
    ],
    []
  );

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-24" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <AdminSidebar
          active={activeMenu}
          landingActiveKey="faq"
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
          <AdminHeader title="FAQ Management" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                onAddClick={() => {
                  if (faqData.length >= MAX_FAQ) {
                    return;
                  }
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
              />

              <AdminTable
                columns={columns}
                data={faqData}
                currentPage={1}
                itemsPerPage={6}
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
                    setFaqData((prev) => prev.filter((item) => item.id !== id));
                  }
                }}
              />
            </section>
          </div>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "Edit FAQ" : "Tambah FAQ"}
        fields={modalFields}
        initialData={
          editingId != null
            ? (faqData.find((item) => item.id === editingId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={(data) => {
          const question = (data.question as string) || "";
          const answer = (data.answer as string) || "";

          if (editingId != null) {
            setFaqData((prev) =>
              prev.map((item) =>
                item.id === editingId
                  ? {
                      ...item,
                      question: question || item.question,
                      answer: answer || item.answer,
                    }
                  : item
              )
            );
          } else {
            setFaqData((prev) => {
              if (prev.length >= MAX_FAQ) {
                return prev;
              }
              const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
              return [
                ...prev,
                {
                  id: nextId,
                  question,
                  answer,
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

export default AdminFaqPage;
