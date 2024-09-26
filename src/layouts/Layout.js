// components/Layout.js
import { useRouter } from "next/router";
import Header from "@/layouts/Header";
import SidebarWithLocation from "@/layouts/Sidebar";

const Layout = ({ children }) => {
  const router = useRouter();

  const noHeaderSidebarRoutes = ["/login", "/signup"];
  const showHeaderAndSidebar = !noHeaderSidebarRoutes.includes(router.pathname);

  return (
    <>
      {showHeaderAndSidebar && <Header />}
      {showHeaderAndSidebar && <SidebarWithLocation />}
      <div>{children}</div>
    </>
  );
};

export default Layout;
