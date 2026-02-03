import React from "react";

interface AdminHeaderProps {
  title: string;
  adminName?: string;
  adminAvatarUrl?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  adminName = "Rizqi Maulana",
  adminAvatarUrl = "/rizwords-nomad.jpg",
}) => {
  return (
    <header className="mb-6 flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-slate-300 overflow-hidden">
            {adminAvatarUrl ? (
              <img
                src={adminAvatarUrl}
                alt={adminName}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <span className="text-slate-700 font-medium">{adminName}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
