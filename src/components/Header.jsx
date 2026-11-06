import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../redux/actions/userActions";
import { useDispatch } from "react-redux";
import { Offcanvas } from "bootstrap";
import API from "../API";
import { trackClick, trackClickWithUser } from "../utility/analytics";
import { CART_UPDATED_EVENT } from "../utility/cartEvents";
import { SHOP_PAGES, SOCIAL_LINKS } from "../utility/shopLinks";
import "./Header.scss";

// Shop (website) ke pages - shop.kridemy.com header jaisa order
const SHOP_NAV = [
  { label: "Home", url: SHOP_PAGES.home, track: "home" },
  { label: "For Teachers", url: SHOP_PAGES.forTeachers, track: "for_teachers" },
  { label: "Students & Parents", url: SHOP_PAGES.studentsParents, track: "students_parents" },
  { label: "Creators", url: SHOP_PAGES.forCreators, track: "creators" },
  { label: "Marketplace", url: SHOP_PAGES.marketplace, track: "marketplace" },
];

// Role ke hisaab se profile dropdown ke links
const CREATOR_ROLES = ["admin", "user"];
const ADMIN_ROLES = ["admin", "moderator"];

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  const userInfo = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const role = userInfo?.userType;
  const isLoggedIn = !!userInfo;
  const canCreate = !userInfo || CREATOR_ROLES.includes(role);
  const isAdminPanel = ADMIN_ROLES.includes(role);

  const handleLogout = () => {
    dispatch(logoutUser());
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("currentSeries");
    localStorage.removeItem("persist:root");
    navigate("/login");
  };

  const fetchCartCount = async () => {
    try {
      const res = await API.get("/user/cart");
      setCartCount(res.data.data.length || 0);
    } catch (err) {
      console.log(err);
    }
  };

  // 🛒 Cart count: page badalne pe + cart me add/remove hone pe refresh
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, location.pathname]);

  useEffect(() => {
    const onCartUpdated = () => {
      if (localStorage.getItem("token")) fetchCartCount();
    };
    window.addEventListener(CART_UPDATED_EVENT, onCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mobile menu: page badalte hi band
  useEffect(() => {
    const el = document.getElementById("kridemyMobileMenu");
    if (el) Offcanvas.getInstance(el)?.hide();
  }, [location.pathname]);

  const goCreate = () => {
    trackClickWithUser("create_comics_click", { location: "header" });
    navigate("/create-comic");
  };

  const avatar = userInfo?.profile_pic || require("../assets/images/avatar.png");
  const displayName = userInfo?.firstname || userInfo?.username || "User";

  const navLinks = (
    <>
      {SHOP_NAV.map((item) => (
        <a
          key={item.label}
          href={item.url}
          className="kh-nav-link"
          onClick={() => trackClick("header_shop_link_click", { link_name: item.track, location: "header" })}
        >
          {item.label}
        </a>
      ))}
      {(!userInfo || role === "admin" || role === "user") && (
        <NavLink
          to="/subscriptions-plan"
          className={({ isActive }) => `kh-nav-link ${isActive ? "active" : ""}`}
          onClick={() => trackClick("header_subscription_plan_click", { location: "header" })}
        >
          Pricing
        </NavLink>
      )}
    </>
  );

  return (
    <>
    <div className="kridemy-header sticky-top">
      {/* ===== Top bar: social (shop jaisa) ===== */}
      <div className="kh-top-bar">
        <div className="container-xl d-flex align-items-center justify-content-end">
          <div className="kh-social">
            {SOCIAL_LINKS.filter((s) => s.id !== "tiktok").map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <i className={`bi ${s.icon}`}></i>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Main header ===== */}
      <header className="kh-main">
        <div className="container-xl d-flex align-items-center gap-3">
          <a href={SHOP_PAGES.home} className="kh-logo" aria-label="Kridemy home">
            <img src={require("../assets/images/kridemy-logo-dark.png")} alt="Kridemy" />
          </a>

          {/* Desktop nav */}
          <nav className="kh-nav d-none d-xl-flex">{navLinks}</nav>

          <div className="kh-actions ms-auto">
            {canCreate && (
              <button type="button" className="kh-btn kh-btn-outline d-none d-sm-inline-flex" onClick={goCreate}>
                Create Comics
              </button>
            )}

            {/* Cart */}
            {isLoggedIn && (
              <Link
                to="/cart"
                className={`kh-icon-btn ${location.pathname === "/cart" ? "active" : ""}`}
                title="Cart"
                aria-label={`Cart (${cartCount})`}
                onClick={() => trackClick("my_cart_click", { location: "header", cart_count: cartCount })}
              >
                <i className="bi bi-cart3"></i>
                {cartCount > 0 && <span className="kh-badge">{cartCount}</span>}
              </Link>
            )}

            {/* Profile / Login */}
            {isLoggedIn ? (
              <Dropdown align="end" className="kh-account">
                <Dropdown.Toggle as="button" className="kh-avatar-btn" aria-label="Account menu">
                  <img src={avatar} alt="" />
                  <span className="d-none d-md-inline text-capitalize">{displayName}</span>
                  <i className="bi bi-chevron-down small"></i>
                </Dropdown.Toggle>

                <Dropdown.Menu className="kh-menu shadow">
                  <div className="kh-menu-user">
                    <img src={avatar} alt="" />
                    <div className="min-w-0">
                      <div className="fw-semibold text-capitalize text-truncate">{displayName}</div>
                      <div className="small text-muted text-truncate">{userInfo?.email || userInfo?.username}</div>
                    </div>
                  </div>

                  <Dropdown.Item as={Link} to="/my-account"><i className="bi bi-person"></i>My Account</Dropdown.Item>

                  {CREATOR_ROLES.includes(role) && (
                    <>
                      <Dropdown.Item as={Link} to="/my-comics" onClick={() => trackClick("header_my_comics_click", { location: "header" })}>
                        <i className="bi bi-book-half"></i>My Comics
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/mybundleList"><i className="bi bi-collection"></i>My Bundles</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/institute-dashboard"><i className="bi bi-speedometer2"></i>Class Dashboard</Dropdown.Item>
                    </>
                  )}

                  {role === "parent" && (
                    <Dropdown.Item as={Link} to="/parent/manage-children"><i className="bi bi-people"></i>My Children</Dropdown.Item>
                  )}

                  {isAdminPanel && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Header>Admin</Dropdown.Header>
                      <Dropdown.Item as={Link} to="/super-admin"><i className="bi bi-grid"></i>Comics Panel</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/allUsers"><i className="bi bi-people"></i>All Users</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/contactList"><i className="bi bi-envelope"></i>Contacts</Dropdown.Item>
                      {role === "admin" && (
                        <>
                          <Dropdown.Item as={Link} to="/subjectlist"><i className="bi bi-list-ul"></i>Subjects</Dropdown.Item>
                          <Dropdown.Item as={Link} to="/adUnitManager"><i className="bi bi-graph-up-arrow"></i>Ad Revenue</Dropdown.Item>
                          <Dropdown.Item as={Link} to="/coupon"><i className="bi bi-ticket-perforated"></i>Coupons</Dropdown.Item>
                        </>
                      )}
                    </>
                  )}

                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/changepassword"><i className="bi bi-key"></i>Change Password</Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout} className="text-danger"><i className="bi bi-box-arrow-right"></i>Log out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Link to="/login" className="kh-btn kh-btn-orange">
                <i className="bi bi-person-circle"></i>
                <span>Login</span>
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              className="kh-hamburger d-xl-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#kridemyMobileMenu"
              aria-controls="kridemyMobileMenu"
              aria-label="Open menu"
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>
    </div>

      {/* ===== Mobile menu (header ke bahar, warna backdrop ke neeche chala jata) ===== */}
      <div className="offcanvas offcanvas-end kh-offcanvas" tabIndex="-1" id="kridemyMobileMenu" aria-labelledby="kridemyMobileMenuLabel">
        <div className="offcanvas-header">
          <img id="kridemyMobileMenuLabel" src={require("../assets/images/kridemy-logo-dark.png")} alt="Kridemy" style={{ height: 44 }} />
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body d-flex flex-column gap-1">
          {navLinks}
          {canCreate && (
            <button type="button" className="kh-btn kh-btn-outline mt-3" data-bs-dismiss="offcanvas" onClick={goCreate}>
              Create Comics
            </button>
          )}
          <div className="kh-social justify-content-center mt-4">
            {SOCIAL_LINKS.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <i className={`bi ${s.icon}`}></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
