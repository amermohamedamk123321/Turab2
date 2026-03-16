import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardOverview from "./dashboard/DashboardOverview";
import SecuritySection from "./dashboard/SecuritySection";
import ProjectsSection from "./dashboard/ProjectsSection";
import MessagesSection from "./dashboard/MessagesSection";
import ProjectRequestsSection from "./dashboard/ProjectRequestsSection";
import SocialMediaSection from "./dashboard/SocialMediaSection";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardOverview />} />
        <Route path="security" element={<SecuritySection />} />
        <Route path="projects" element={<ProjectsSection />} />
        <Route path="messages" element={<MessagesSection />} />
        <Route path="project-requests" element={<ProjectRequestsSection />} />
        <Route path="social-media" element={<SocialMediaSection />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
