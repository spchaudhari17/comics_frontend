import React, { useState } from "react";
import MySubscription from "./MySubscription";
import SubscriptionHistory from "./SubscriptionHistory";
import Invoices from "./Invoices";
import ProfileDetails from "../authentication/ProfileDetails";
import MycardsDetails from "./MycardsDetails";
import MyPurchases from "./MyPurchases";
import TransactionHistory from "./TransactionHistory";
import MySales from "./MySales";

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

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "manage" ? "active" : ""}`}
              onClick={() => setActiveTab("manage")}
            >
              Manage Cards
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "purchases" ? "active" : ""}`}
              onClick={() => setActiveTab("purchases")}
            >
              My Purchases
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "transactions" ? "active" : ""}`}
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "sales" ? "active" : ""}`}
              onClick={() => setActiveTab("sales")}
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
