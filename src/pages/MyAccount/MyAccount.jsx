import React from "react";
import { useSearchParams } from "react-router-dom";
import MySubscription from "./MySubscription";
import SubscriptionHistory from "./SubscriptionHistory";
import Invoices from "./Invoices";
import { useProfile, ProfileBanner, ProfileInfo } from "../authentication/ProfileDetails";
import MycardsDetails from "./MycardsDetails";
import MyPurchases from "./MyPurchases";
import TransactionHistory from "./TransactionHistory";
import MySales from "./MySales";
import { trackClick } from "../../utility/analytics";
import "./MyAccount.scss";

// Left menu ke tabs (order = menu ka order)
const TABS = [
  { id: "profile", label: "Profile", icon: "bi-person" },
  { id: "subscription", label: "My Subscription", icon: "bi-stars" },
  { id: "history", label: "Subscription History", icon: "bi-clock-history" },
  { id: "invoices", label: "Invoices", icon: "bi-receipt" },
  { id: "manage", label: "Manage Cards", icon: "bi-credit-card" },
  { id: "purchases", label: "My Purchases", icon: "bi-bag-check" },
  { id: "transactions", label: "Transactions", icon: "bi-arrow-left-right" },
  { id: "sales", label: "My Sales", icon: "bi-graph-up-arrow" },
];

const DEFAULT_TAB = "subscription";

const MyAccount = () => {
  const profile = useProfile();

  // Tab URL me (?tab=invoices) -> refresh / Stripe / mail se seedha sahi tab
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = TABS.some((t) => t.id === requestedTab) ? requestedTab : DEFAULT_TAB;

  // GA: my profile tab buttons
  const openTab = (tab) => {
    trackClick("my_profile_tab_click", { tab_name: tab });
    trackClick(`my_profile_${tab}_click`);
    setSearchParams({ tab }, { replace: true });
  };

  if (!profile.userInfo) {
    return <h3 className="text-center mt-5">No user data found.</h3>;
  }

  return (
    <div className="ma-page">
      <div className="container my-4 my-lg-5">

        {/* ===== TOP PROFILE BANNER ===== */}
        <ProfileBanner profile={profile} />

        <div className="ma-layout">
          {/* ===== LEFT MENU (mobile pe upar scroll hone wale pills) ===== */}
          <nav className="ma-nav" aria-label="My account sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`ma-nav-item ${activeTab === tab.id ? "active" : ""}`}
                aria-current={activeTab === tab.id ? "page" : undefined}
                onClick={() => openTab(tab.id)}
              >
                <i className={`bi ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* ===== TAB CONTENT ===== */}
          <section className="ma-content" key={activeTab}>
            {activeTab === "profile" && <ProfileInfo profile={profile} />}
            {activeTab === "subscription" && <MySubscription />}
            {activeTab === "history" && <SubscriptionHistory />}
            {activeTab === "invoices" && <Invoices />}
            {activeTab === "manage" && <MycardsDetails />}

            {activeTab === "purchases" && <MyPurchases />}
            {activeTab === "transactions" && <TransactionHistory />}
            {activeTab === "sales" && <MySales />}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
