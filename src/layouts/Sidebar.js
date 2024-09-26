import React, { Component } from "react";
import Link from "next/link"; // Use next/link for routing
import PerfectScrollbar from "react-perfect-scrollbar";
import { entitiesMenu } from "../data/Menu";

class Sidebar extends Component {
  toggleFooterMenu = (e) => {
    e.preventDefault();
    let parent = e.target.closest(".sidebar");
    parent.classList.toggle("footer-menu-show");
  };

  render() {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <Link href="/entities" className="sidebar-logo">
            profitlever
          </Link>
        </div>
        <PerfectScrollbar
          className="sidebar-body"
          ref={(ref) => (this._scrollBarRef = ref)}
        >
          <SidebarMenu
            onUpdateSize={() => this._scrollBarRef.updateScroll()}
            location={this.props.location} // Pass location to SidebarMenu
          />
        </PerfectScrollbar>
      </div>
    );
  }
}

class SidebarMenu extends Component {
  populateMenu = (menuData) => {
    return (
      <ul className="nav nav-sidebar">
        {menuData.map((menuItem, key) => {
          const submenuItems = menuItem.submenu?.map((submenuItem, subKey) => (
            <Link
              href={submenuItem.link}
              className="nav-sub-link"
              key={subKey}
            >
              {submenuItem.label}
            </Link>
          ));

          return (
            <li key={key} className="nav-item">
              {!submenuItems ? (
                <Link href={menuItem.link} className="nav-link">
                  <i className={menuItem.icon}></i>{" "}
                  <span>{menuItem.label}</span>
                </Link>
              ) : (
                <div onClick={this.toggleSubMenu} className="nav-link has-sub">
                  <i className={menuItem.icon}></i>{" "}
                  <span>{menuItem.label}</span>
                </div>
              )}
              {menuItem.submenu && (
                <nav className="nav nav-sub">{submenuItems}</nav>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  toggleMenu = (e) => {
    e.preventDefault();
    let parent = e.target.closest(".nav-group");
    parent.classList.toggle("show");
    this.props.onUpdateSize();
  };

  toggleSubMenu = (e) => {
    e.preventDefault();
    let parent = e.target.closest(".nav-item");
    let node = parent.parentNode.firstChild;

    while (node) {
      if (node !== parent && node.nodeType === Node.ELEMENT_NODE) {
        node.classList.remove("show");
      }
      node = node.nextElementSibling || node.nextSibling;
    }

    parent.classList.toggle("show");
    this.props.onUpdateSize();
  };

  render() {
    const { location } = this.props;

    // Use the Next.js router pathname
    const pathname = location.pathname;
    const id = pathname.split("/")[2];

    const dashboardMenu = [
      {
        label: "Dashboard",
        link: `/entities/${id}/dashboard`,
        icon: "ri-pie-chart-2-line",
      },
      // Add other menu items...
    ];

    return (
      <React.Fragment>
        {location.pathname === "/entities" ? (
          <div className="nav-group show">
            <div className="nav-label" onClick={this.toggleMenu}>
              Entities
            </div>
            {this.populateMenu(entitiesMenu)}
          </div>
        ) : (
          <div>
            <div className="nav-group show">
              <div style={{ marginTop: "20px" }}></div>
              {this.populateMenu(dashboardMenu)}
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

// Sidebar with router props
const SidebarWithLocation = (props) => {
  return <Sidebar {...props} location={typeof window !== 'undefined' ? window.location : { pathname: '' }} />;
};

export default SidebarWithLocation;
