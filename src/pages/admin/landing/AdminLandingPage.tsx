import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminTable from "../../../components/admin/AdminTable";
import type { Column } from "../../../components/admin/AdminTable";
import AdminTableHeader from "../../../components/admin/AdminTableHeader";
import InitialShimmer from "../../../components/ui/InitialShimmer";
import { AdminTablePageSkeleton } from "../../../components/ui/skeletons";

interface LandingPageItem extends Record<string, unknown> {
  id: number;
  section: string;
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  orderIndex: number;
  isActive: boolean;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

const AdminLandingPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const [landingData, setLandingData] = useState<LandingPageItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch landing pages from backend API
  const fetchLandingPages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/landing-pages?includeUser=true');
      const result = await response.json();
      
      if (result.success) {
        setLandingData(result.data.pages.map((page: LandingPageItem) => ({
          ...page,
          id: parseInt(String(page.id)) || 0
        })));
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch landing pages');
      }
    } catch (err) {
      setError('Error connecting to backend API');
      console.error('Error fetching landing pages:', err);
    }
  };

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const columns: Column[] = [
    { header: "Section", accessor: "section", type: "text" },
    { header: "Title", accessor: "title", type: "text" },
    { header: "Subtitle", accessor: "subtitle", type: "text" },
    { header: "Button Text", accessor: "buttonText", type: "text" },
    { header: "Order", accessor: "orderIndex", type: "number" },
    { header: "Active", accessor: "isActive", type: "text" },
    { header: "Created", accessor: "createdAt", type: "text" },
  ];

  const handleDeleteLandingPage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this landing page?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/landing-pages/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchLandingPages(); // Refresh the list
      } else {
        setError(result.message || 'Failed to delete landing page');
      }
    } catch (err) {
      setError('Error deleting landing page');
      console.error('Error deleting landing page:', err);
    }
  };

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-28" rows={6} />}>
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
            } else if (key === "portfolio") {
              navigate("/admin/portfolio");
            } else if (key === "blog") {
              navigate("/admin/blog");
            }
          }}
          onNavigateLandingSub={(subKey) => {
            setActiveMenu("landing");
            if (subKey === "hero") {
              navigate("/admin/landing/hero");
            } else if (subKey === "about") {
              navigate("/admin/landing/about");
            } else if (subKey === "services") {
              navigate("/admin/landing/services");
            } else if (subKey === "portfolio") {
              navigate("/admin/landing/portfolio");
            } else if (subKey === "testimonials") {
              navigate("/admin/landing/testimonials");
            } else if (subKey === "contact") {
              navigate("/admin/landing/contact");
            } else if (subKey === "footer") {
              navigate("/admin/landing/footer");
            }
          }}
        />

        <div className="flex flex-1 flex-col px-8 py-6 overflow-hidden">
          <AdminHeader title="Landing Page Management" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                placeholder="Search landing page..."
                addLabel=""
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <AdminTable
                columns={columns}
                data={landingData}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                onDelete={(id?: number) => id && handleDeleteLandingPage(id)}
              />
            </section>
          </div>
        </div>
      </div>
    </InitialShimmer>
  );
};

export default AdminLandingPage;
