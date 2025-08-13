import React from "react";
import { Dropdown } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import BellIcon from "../assets/images/icons/bell.svg";
import BookIcon from "../assets/images/icons/book.svg";
import UserIcon from "../assets/images/icons/user.svg";
import CreditCardIcon from "../assets/images/icons/credit-card.svg";
import LogoutIcon from "../assets/images/icons/log-out.svg";
import { logoutUser } from "../redux/actions/userActions";
import { useDispatch } from "react-redux";

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-light bg-white border-bottom navbar-expand-lgg top-header sticky-top py-2" data-bs-theme="light" style={{ minHeight: "61px" }}>
      <div className="container-xl gap-2 flex-nowrap">
        <div className="left-sec d-flex align-items-center justify-content-start gap-3">
          <div className="logo-wrapper text-center">
            <img src={require('../assets/images/logo.png')} alt="Logo" className="img-fluid" style={{ width: '136px' }} />
          </div>
        </div>

        <ul className="right-sec d-flex align-items-center justify-content-end gap-1 m-0 p-0">
          <li className="nav-item dropdown">
            <NavLink to={'/'} className="nav-link p-2">
              <img src={BellIcon} alt="Bell Icon" className="img-fluid" style={{ minWidth: '24px' }} />
            </NavLink>
          </li>
          <li className="nav-item dropdown">
            <NavLink to={'/'} className="nav-link wactive p-2">
              <img src={BookIcon} alt="Book Icon" className="img-fluid" style={{ minWidth: '24px' }} />
            </NavLink>
          </li>
          <div className="divider vr d-none d-md-block me-2"></div>
          <Dropdown align="end" className="account-menu">
            <Dropdown.Toggle variant="white" className="bg-transparent border-0 p-0" id="dropdown-basic">
              <div className="chip-wrapper d-flex align-items-center gap-2 text-truncate">
                <div className="chip-img bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center rounded-circle overflow-hidden">
                  {/* <div className="user-shortname fs-16 fw-medium text-black text-opacity-75 text-uppercase">K</div> */}
                  <img className="w-100 h-100" src={require("../assets/images/dummy-user.jpeg")} alt="User" />
                </div>
                {/* <div className="user-info text-start text-truncate">
                  <div className="username fs-14 fw-medium text-black text-opacity-75 text-capitalize">Test User</div>
                  <div className="user-email fs-12 text-muted text-lowercase text-truncate">testuser@virtualemployee.com</div>
                </div> */}
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="text-theme3 shadow-sm rounded-3">
              <Dropdown.Item className="text-theme3">
                <img src={UserIcon} alt="User Icon" className="img-fluid" /> Profile
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-theme3">
                <img src={CreditCardIcon} alt="Credit Card Icon" className="img-fluid" /> History
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-theme3">
                <img src={LogoutIcon} alt="Logout Icon" className="img-fluid" /> Log out
              </Dropdown.Item>
              <Dropdown.Divider />
              <div className="fs-12 d-flex align-items-center px-3">
                <Link to={'#'} className="text-theme3 text-decoration-none p-0">Terms of Service</Link>
                <span><i className="bi bi-dot fs-4 lh-1"></i></span>
                <Link to={'#'} className="text-theme3 text-decoration-none p-0">Privacy</Link>
              </div>
            </Dropdown.Menu>
          </Dropdown>
        </ul>
      </div>
    </nav>
  );
};
