import React from "react";
import { Dropdown } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import BellIcon from "../assets/images/icons/bell.svg";
import UserIcon from "../assets/images/icons/user.svg";
import LogoutIcon from "../assets/images/icons/log-out.svg";
import { logoutUser } from "../redux/actions/userActions";
import { useDispatch } from "react-redux";

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userInfo = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;


  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="top-header sticky-top shadow-sm">
      <div className="announcement-bar bg-primary py-2">
        <div className="container-xxl">
          <div className="discription fs-12 text-white text-center">You're exploring the <span className="fw-semibold text-danger">Beta version</span>. Some features may be handled manually.</div>
        </div>
      </div>
      <nav className="navbar navbar-light bg-white border-bottom navbar-expand-lg py-1" data-bs-theme="light" style={{ minHeight: "61px" }}>
        <div className="container-xxl">
          {/* Logo */}
          <Link className="navbar-brand logo-wrapper text-center" to={"/"}>
            <img src={require("../assets/images/logo2.png")} alt="Logo" className="img-fluid" />
          </Link>

          {/* Mobile toggle (targets offcanvas) */}
          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasTopHeader" aria-controls="offcanvasTopHeader">
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Offcanvas menu with overlay */}
          <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasTopHeader" aria-labelledby="offcanvasTopHeaderLabel">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title">Menu</h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>

            <div className="offcanvas-body">
              <ul className="navbar-nav menu-link-nav align-items-center justify-content-end flex-grow-1 gap-3">
                {!userInfo && (
                  <>
                    <li className="nav-item">
                      <Link to={'/'} className="nav-link p-0">About Us</Link>
                    </li>
                    <li className="nav-item">
                      <Link to={'/'} className="nav-link p-0">Library</Link>
                    </li>

                    <li className="nav-item">
                      <Link to={'/'} className="nav-link p-0">For Teachers</Link>
                    </li>
                    <li className="nav-item">
                      <Link to={'/'} className="nav-link p-0">For Students</Link>
                    </li>
                    <li className="nav-item">
                      <Link to={'/'} className="nav-link p-0">For Parents</Link>
                    </li>
                    <li className="nav-item">
                      <Link to={'/'} className="nav-link p-0">Contact</Link>
                    </li>
                  </>
                )
                }

                {
                  userInfo && (
                    <>
                      <li className="nav-item">
                        <Link to={'/create-comic'} className="nav-link p-0">Create Comics</Link>
                      </li>
                    </>
                  )
                }
              </ul>

              <ul className="navbar-nav icons-nav align-items-center justify-content-end flex-grow-1 gap-3">



                {userInfo && userInfo.userType === "admin" && (
                  <li className="nav-item">
                    <Link to={'/super-admin'} className="nav-link p-0">
                      <i className="bi bi-grid-fill"></i>
                    </Link>
                  </li>
                )}



                {userInfo && (userInfo.userType === "admin" || userInfo.userType === "user") && (
                  <li className="nav-item">
                    <Link to={'/my-comics'} className="nav-link p-0">
                      <i className="bi bi-book-half"></i>
                    </Link>
                  </li>
                )}

                {/* <div className="divider vr d-none d-md-block me-2"></div> */}
                {userInfo && (userInfo.userType === "admin" || userInfo.userType === "user") ? (
                  <Dropdown align="end" className="account-menu">
                    <Dropdown.Toggle variant="white" className="bg-transparent border-0 p-0">
                      <div className="chip-wrapper">
                        <div className="chip-img bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center rounded-circle overflow-hidden">
                          {/* <div className="user-shortname fs-16 fw-medium text-black text-opacity-75 text-uppercase">K</div> */}
                          <img className="w-100 h-100" src={require("../assets/images/avatar.png")} alt="User" />
                        </div>
                      </div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="text-theme3 shadow-sm rounded-3">
                      <div className="user-info text-theme3 pb-1 px-3">
                        <div className="user-info text-start text-truncate">
                          <div className="username fs-14 fw-semibold text-black text-opacity-75 text-capitalize">Test User</div>
                          <div className="user-email fs-12 text-muted text-lowercase text-truncate">testuser@virtualemployee.com</div>
                        </div>
                      </div>
                      <Dropdown.Divider className="my-1" />
                      <Dropdown.Item className="text-theme3">
                        <img src={UserIcon} alt="User Icon" className="img-fluid" /> Profile
                      </Dropdown.Item>
                      <Dropdown.Divider className="my-1" />
                      <Dropdown.Item onClick={handleLogout} className="text-theme3">
                        <img src={LogoutIcon} alt="Logout Icon" className="img-fluid" /> Log out
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <li className="nav-item">
                    <Link to={'/login'} className="nav-link p-0">
                      <img src={UserIcon} alt="User Icon" className="img-fluid" />
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};
