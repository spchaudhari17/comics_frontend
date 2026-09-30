import React, { useState } from "react";
import MySubscription from "./MySubscription";
import SubscriptionHistory from "./SubscriptionHistory";
import Invoices from "./Invoices";
import ProfileDetails from "../authentication/ProfileDetails";
import MycardsDetails from "./MycardsDetails";
import MyPurchases from "./MyPurchases";
import TransactionHistory from "./TransactionHistory";
import MySales from "./MySales";
import { trackClick } from "../../utility/analytics";

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("subscription");

  // GA: my profile tab buttons
  const openTab = (tab) => {
    trackClick("my_profile_tab_click", { tab_name: tab });
    trackClick(`my_profile_${tab}_click`);
    setActiveTab(tab);
  };

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
              onClick={() => openTab("subscription")}
            >
              My Subscription
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "history" ? "active" : ""}`}
              onClick={() => openTab("history")}
            >
              Subscription History
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "invoices" ? "active" : ""}`}
              onClick={() => openTab("invoices")}
            >
              Invoices
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "manage" ? "active" : ""}`}
              onClick={() => openTab("manage")}
            >
              Manage Cards
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "purchases" ? "active" : ""}`}
              onClick={() => openTab("purchases")}
            >
              My Purchases
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "transactions" ? "active" : ""}`}
              onClick={() => openTab("transactions")}
            >
              Transactions
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "sales" ? "active" : ""}`}
              onClick={() => openTab("sales")}
            >
              My Sales
            </button>
          </li>

        </ul>

        {/* ===== TAB CONTENT ===== */}
        {activeTab === "subscription" && <MySubscription />}
        {activeTab === "history" && <SubscriptionHistory />}
        {activeTab === "invoices" && <Invoices />}
        {activeTab === "manage" && <MycardsDetails />}

        {activeTab === "purchases" && <MyPurchases />}
        {activeTab === "transactions" && <TransactionHistory />}
        {activeTab === "sales" && <MySales />}
      </div>
    </div>
  );
};

export default MyAccount;
