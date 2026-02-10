import React, { useState } from "react";
import MySubscription from "./MySubscription";
import SubscriptionHistory from "./SubscriptionHistory";
import Invoices from "./Invoices";
import ProfileDetails from "../authentication/ProfileDetails";

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("subscription");

  return (
    <div className="container my-5">

      {/* ===== TOP PROFILE SECTION ===== */}
      <ProfileDetails />

      {/* ===== TABS ===== */}
      <div className="content-wrapper bg-theme1 border rounded p-4 mt-4">
        <ul className="nav nav-tabs border-0 mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "subscription" ? "active" : ""}`}
              onClick={() => setActiveTab("subscription")}
            >
              My Subscription
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              Subscription History
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "invoices" ? "active" : ""}`}
              onClick={() => setActiveTab("invoices")}
            >
              Invoices
            </button>
          </li>
        </ul>

        {/* ===== TAB CONTENT ===== */}
        {activeTab === "subscription" && <MySubscription />}
        {activeTab === "history" && <SubscriptionHistory />}
        {activeTab === "invoices" && <Invoices />}
      </div>
    </div>
  );
};

export default MyAccount;
