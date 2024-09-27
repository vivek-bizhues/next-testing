import React, {
  forwardRef,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Dropdown from "react-bootstrap/Dropdown";
import Image from "next/image";
import { UserContext } from "../context/UserContext";
import { getCurrentEntityIMVs } from "@/helpers/entitiyHelpers";
import IMScenariosDropDown from "@/components/scenarios/IMScenarios";

export default function Header() {
  const router = useRouter();
  const { logout } = useContext(UserContext);
  const Imvs = getCurrentEntityIMVs();

  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(null);

  // Define handleLogout with useCallback
  const handleLogout = useCallback(() => {
    logout(); // Call the context logout function
    router.push("/login");
  }, [logout, router]); // Added logout and router to dependencies

  // Use useEffect to access localStorage on the client side
  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem("userProfile"));
    const storedToken = localStorage.getItem("authToken");

    if (storedProfile && storedToken) {
      setProfile(storedProfile);
      setToken(storedToken);
    } else {
      handleLogout();
    }
  }, [handleLogout]); // Now handleLogout is stable and won't change on every render

  const CustomToggle = forwardRef(({ children, onClick }, ref) => {
    return (
      <a
        href="#"
        ref={ref}
        onClick={(e) => {
          e.preventDefault();
          onClick(e);
        }}
        className="dropdown-link"
      >
        {children}
      </a>
    );
  });

  // Set display name for better debugging
  CustomToggle.displayName = "CustomToggle";

  const toggleSidebar = (e) => {
    e.preventDefault();
    let isOffset = document.body.classList.contains("sidebar-offset");
    if (isOffset) {
      document.body.classList.toggle("sidebar-show");
    } else {
      if (window.matchMedia("(max-width: 991px)").matches) {
        document.body.classList.toggle("sidebar-show");
      } else {
        document.body.classList.toggle("sidebar-hide");
      }
    }
  };

  if (!profile || !token) {
    return null;
  }

  return (
    <div className="header-main px-3 px-lg-4">
      <Link href="#" onClick={toggleSidebar} className="menu-link me-3 me-lg-4">
        <i className="ri-menu-2-fill"></i>
      </Link>

      <div className="form-search me-auto">
        <input type="text" className="form-control" placeholder="Search" />
        <i className="ri-search-line"></i>
      </div>

      <IMScenariosDropDown scenarios={Imvs} />

      <Dropdown className="dropdown-profile ms-3 ms-xl-4" align="end">
        <Dropdown.Toggle as={CustomToggle}>
          <div className="avatar online">
            <Image
              src={
                profile.avatar_url ||
                "https://st3.depositphotos.com/9998432/13335/v/450/depositphotos_133351928-stock-illustration-default-placeholder-man-and-woman.jpg"
              }
              alt="Profile Picture"
              width={40}
              height={40}
            />
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className="mt-10-f">
          <div className="dropdown-menu-body">
            <div className="avatar avatar-xl online mb-3">
              <Image
                src={
                  "https://st3.depositphotos.com/9998432/13335/v/450/depositphotos_133351928-stock-illustration-default-placeholder-man-and-woman.jpg"
                }
                alt="User Avatar"
                width={80}
                height={80}
              />
            </div>
            <h5 className="mb-1 text-dark fw-semibold">{`${profile.first_name} ${profile.last_name}`}</h5>
            <p className="fs-sm text-secondary">{profile.email}</p>

            <nav className="nav">
              <Link href="/edit-profile">
                <i className="ri-edit-2-line"></i> Edit Profile
              </Link>
              <Link href="/view-profile">
                <i className="ri-profile-line"></i> View Profile
              </Link>
            </nav>
            <hr />
            <nav className="nav">
              <Link href="/help-center">
                <i className="ri-question-line"></i> Help Center
              </Link>
              <Link href="/privacy-settings">
                <i className="ri-lock-line"></i> Privacy Settings
              </Link>
              <Link href="/account-settings">
                <i className="ri-user-settings-line"></i> Account Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-link"
              >
                <i className="ri-logout-box-r-line"></i> Log Out
              </button>
            </nav>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
