import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminTableHeader from "../../../components/admin/AdminTableHeader";
import AdminTable from "../../../components/admin/AdminTable";
import type { Column } from "../../../components/admin/AdminTable";
import AdminModal, {
  type AdminModalField,
} from "../../../components/admin/AdminModal";
import SummernoteEditor from "../../../components/ui/SummernoteEditor";
import InitialShimmer from "../../../components/ui/InitialShimmer";
import { AdminTablePageSkeleton } from "../../../components/ui/skeletons";

interface BlogArticleItem extends Record<string, unknown> {
  id: number;
  cover: string;
  title: string;
  category: string;
  status: "publish" | "draft";
  content: string;
}

const BLOG_ARTICLES_STORAGE_KEY = "admin_blog_articles";

interface EditorModalProps {
  isOpen: boolean;
  initialTitle?: string;
  initialContent?: string;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

const BlogEditorModal: React.FC<EditorModalProps> = ({
  isOpen,
  initialTitle,
  initialContent,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState(initialContent ?? "");

  useEffect(() => {
    if (!isOpen) return;
    const next = initialContent ?? "";
    const t = window.setTimeout(() => {
      setContent(next);
    }, 0);
    return () => window.clearTimeout(t);
  }, [initialContent, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tulis Artikel</h2>
            {initialTitle && (
              <p className="mt-0.5 text-xs text-slate-500">{initialTitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>

        {/* Editor content area */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <SummernoteEditor value={content} onChange={setContent} height={420} />
          </div>
        </div>

        {/* Footer buttons inside the card */}
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onSubmit(content)}
            className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-600"
          >
            Simpan Artikel
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminBlogArticlesPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("blog");
  const navigate = useNavigate();

  const [articles, setArticles] = useState<BlogArticleItem[]>(() => {
    try {
      const raw = localStorage.getItem(BLOG_ARTICLES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          return parsed as BlogArticleItem[];
        }
      }
    } catch {
      // ignore
    }

    return [
      {
        id: 1,
        cover: "/placeholder-image.png",
        title: "Tips Menyiapkan Liburan ke Bali",
        category: "Travel Tips",
        status: "publish",
        content: "Konten artikel contoh tentang liburan ke Bali.",
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(BLOG_ARTICLES_STORAGE_KEY, JSON.stringify(articles));
    } catch {
      // ignore
    }
  }, [articles]);

  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pendingMeta, setPendingMeta] = useState<
    | {
        cover: string;
        title: string;
        category: string;
        status: "publish" | "draft";
      }
    | null
  >(null);

  const [editorTitle, setEditorTitle] = useState<string | undefined>(undefined);
  const [editorContent, setEditorContent] = useState<string>("");

  const columns: Column[] = [
    { header: "Cover", accessor: "cover", type: "image" },
    { header: "Title", accessor: "title", type: "text" },
    { header: "Category", accessor: "category", type: "text" },
    { header: "Status", accessor: "status", type: "text" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const metaFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "cover",
        label: "Image Cover",
        type: "image",
        multiple: false,
      },
      {
        name: "title",
        label: "Title",
        type: "text",
        placeholder: "Judul artikel",
      },
      {
        name: "category",
        label: "Category",
        type: "text",
        placeholder: "Misal: Travel, Tips, Story",
      },
      {
        name: "status",
        label: "Status (publish / draft)",
        type: "text",
        placeholder: "publish atau draft",
      },
    ],
    []
  );

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-36" rows={6} />}>
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
            } else if (key === "shop") {
              navigate("/admin/shop");
            } else if (key === "transactions") {
              navigate("/admin/transactions");
            } else if (key === "blog") {
              navigate("/admin/blog");
            }
          }}
        />

        <div className="flex flex-1 flex-col px-8 py-6 overflow-hidden">
          <AdminHeader title="Blog Articles" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                placeholder="Search article..."
                onAddClick={() => {
                  setEditingId(null);
                  setPendingMeta(null);
                  setEditorContent("");
                  setEditorTitle(undefined);
                  setIsMetaModalOpen(true);
                }}
              />

              <AdminTable
                columns={columns}
                data={articles}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                onEdit={(id) => {
                  if (typeof id === "number") {
                    const item = articles.find((a) => a.id === id);
                    if (!item) return;
                    setEditingId(id);
                    setPendingMeta({
                      cover: item.cover,
                      title: item.title,
                      category: item.category,
                      status: item.status,
                    });
                    setEditorTitle(item.title);
                    setEditorContent(item.content);
                    setIsMetaModalOpen(true);
                  }
                }}
                onDelete={(id) => {
                  if (typeof id === "number") {
                    setArticles((prev) => prev.filter((a) => a.id !== id));
                  }
                }}
              />
            </section>
          </div>
        </div>

        {/* Modal 1: metadata artikel */}
        <AdminModal
          isOpen={isMetaModalOpen}
          title={editingId ? "Edit Artikel" : "Tambah Artikel"}
          fields={metaFields}
          initialData={
            editingId != null && pendingMeta
              ? {
                  cover: [pendingMeta.cover],
                  title: pendingMeta.title,
                  category: pendingMeta.category,
                  status: pendingMeta.status,
                }
              : undefined
          }
          onClose={() => {
            setIsMetaModalOpen(false);
            setEditingId(null);
            setPendingMeta(null);
          }}
          onSubmit={(data) => {
            const coverList = (data.cover as string[] | undefined) ?? [];
            const cover = coverList[0] || "";
            const title = (data.title as string) || "";
            const category = (data.category as string) || "";
            const rawStatus = ((data.status as string) || "draft").toLowerCase();
            const status: "publish" | "draft" =
              rawStatus === "publish" ? "publish" : "draft";

            setPendingMeta({ cover, title, category, status });
            setEditorTitle(title);
            setIsMetaModalOpen(false);
            setIsEditorOpen(true);
          }}
        />

        {/* Modal 2: editor konten artikel */}
        <BlogEditorModal
          isOpen={isEditorOpen}
          initialTitle={editorTitle}
          initialContent={editorContent}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingId(null);
            setPendingMeta(null);
            setEditorContent("");
            setEditorTitle(undefined);
          }}
          onSubmit={(content) => {
            if (!pendingMeta) {
              setIsEditorOpen(false);
              return;
            }

            if (editingId != null) {
              setArticles((prev) =>
                prev.map((item) =>
                  item.id === editingId
                    ? {
                        ...item,
                        cover: pendingMeta.cover || item.cover,
                        title: pendingMeta.title || item.title,
                        category: pendingMeta.category || item.category,
                        status: pendingMeta.status || item.status,
                        content,
                      }
                    : item
                )
              );
            } else {
              setArticles((prev) => {
                const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
                return [
                  ...prev,
                  {
                    id: nextId,
                    cover: pendingMeta.cover,
                    title: pendingMeta.title,
                    category: pendingMeta.category,
                    status: pendingMeta.status,
                    content,
                  },
                ];
              });
            }

            setIsEditorOpen(false);
            setEditingId(null);
            setPendingMeta(null);
            setEditorContent("");
            setEditorTitle(undefined);
            
            // Show success message and navigate to blog page if published
            if (pendingMeta.status === 'publish') {
              alert('🎉 Artikel berhasil dipublikasikan! Mengalihkan ke halaman blog...');
              setTimeout(() => {
                navigate('/blog');
              }, 1500);
            } else {
              alert('✅ Artikel berhasil disimpan sebagai draft.');
            }
          }}
        />
      </div>
    </InitialShimmer>
  );
};

export default AdminBlogArticlesPage;
