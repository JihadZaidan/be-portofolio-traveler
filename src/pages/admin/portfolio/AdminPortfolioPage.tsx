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

interface PortfolioItem extends Record<string, unknown> {
  id: number;
  title: string;
  description?: string;
  category: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies?: string[];
  tags?: string[];
  featured: boolean;
  published: boolean;
  orderIndex: number;
  clientName?: string;
  completionDate?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

const AdminPortfolioPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("portfolio");
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch portfolios from backend API
  const fetchPortfolios = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/portfolios?includeUser=true');
      const result = await response.json();
      
      if (result.success) {
        setPortfolioData(result.data.portfolios.map((portfolio: PortfolioItem) => ({
          ...portfolio,
          id: parseInt(String(portfolio.id)) || 0
        })));
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch portfolios');
      }
    } catch (err) {
      setError('Error connecting to backend API');
      console.error('Error fetching portfolios:', err);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const columns: Column[] = [
    { header: "Title", accessor: "title", type: "text" },
    { header: "Category", accessor: "category", type: "text" },
    { header: "Client", accessor: "clientName", type: "text" },
    { header: "Featured", accessor: "featured", type: "text" },
    { header: "Published", accessor: "published", type: "text" },
    { header: "Order", accessor: "orderIndex", type: "number" },
    { header: "Created", accessor: "createdAt", type: "text" },
  ];

  const handleDeletePortfolio = async (id: number) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/portfolios/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchPortfolios(); // Refresh the list
      } else {
        setError(result.message || 'Failed to delete portfolio');
      }
    } catch (err) {
      setError('Error deleting portfolio');
      console.error('Error deleting portfolio:', err);
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
        />

        <div className="flex flex-1 flex-col px-8 py-6 overflow-hidden">
          <AdminHeader title="Portfolio Management" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                placeholder="Search portfolio..."
                addLabel=""
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <AdminTable
                columns={columns}
                data={portfolioData}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                onDelete={(id?: number) => id && handleDeletePortfolio(id)}
              />
            </section>
          </div>
        </div>
      </div>
    </InitialShimmer>
  );
};

export default AdminPortfolioPage;
