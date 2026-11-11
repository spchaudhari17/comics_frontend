import React from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./SubscriptionRules.scss";

// Terms ka content - part -> sections -> points
const PARTS = [
  {
    id: "general",
    icon: "bi-file-earmark-text-fill",
    label: "PART 1",
    title: "General Subscription Terms",
    sections: [
      {
        title: "Subscription Structure",
        points: [
          "Subscriptions are billed monthly or annually as selected.",
          "Subscriptions renew automatically unless canceled before renewal.",
          "Pricing may change for new users. Existing users will be notified in advance.",
        ],
      },
      {
        title: "Comic Generation Limits",
        points: [
          "Each plan includes a maximum number of AI-generated comics.",
          "Comics are distributed weekly (e.g., 5, 10, or 20 per week).",
          "Unused weekly limits do not roll over unless explicitly stated.",
          "Unused monthly allocations do not carry forward.",
          "Limits ensure fair and stable platform performance.",
        ],
      },
      {
        title: "Content Ownership & Commercial Rights",
        points: [
          "Subscribers retain commercial usage rights during active subscription.",
          "Commercial rights apply only while subscription remains active.",
          "The platform may use anonymized content for improvements & marketing.",
          "Users are responsible for complying with intellectual property laws.",
        ],
      },
      {
        title: "Student Access & Dashboard",
        points: [
          "Student limits depend on the selected subscription tier.",
          "A registered student means a unique student account linked to a teacher dashboard.",
          "Sharing login credentials is strictly prohibited.",
          "Students may access assigned content but do not receive ownership rights.",
        ],
      },
      {
        title: "Reports & Analytics",
        points: [
          "Reports are generated automatically based on student activity.",
          "Analytics are for educational support purposes only.",
          "No guarantee of academic outcomes is provided.",
          "Analytics features may evolve over time.",
        ],
      },
      {
        title: "Payments & Refunds",
        points: [
          "All payments are non-refundable unless required by law.",
          "Cancellations take effect at the end of the billing cycle.",
          "Failed payments may result in suspended access.",
        ],
      },
      {
        title: "Fair Usage & Abuse Policy",
        points: [
          "Automated scraping or system abuse is strictly prohibited.",
          "Excessive or suspicious usage may trigger review.",
          "Violation of terms may result in suspension without refund.",
        ],
      },
      {
        title: "Modifications to Service",
        points: [
          "The platform may modify or discontinue features at its discretion.",
          "Material changes affecting pricing or structure will be notified.",
        ],
      },
    ],
  },
  {
    id: "dashboard",
    icon: "bi-bar-chart-line-fill",
    label: "PART 2",
    title: "Student Dashboard Add-On Terms",
    sections: [
      {
        points: [
          "Student dashboard requires an active comic subscription.",
          "Student capacity limits are strictly enforced (e.g., 20, 50, 100).",
          "Removing students does not reset historical usage limits.",
          "Reports are generated only for active student accounts.",
          "No personally identifiable student data is stored.",
        ],
      },
    ],
  },
  {
    id: "founding",
    icon: "bi-star-fill",
    label: "PART 3",
    title: "Founding Teacher Program",
    sections: [
      {
        title: "Eligibility",
        points: [
          "Limited to the first 100 eligible subscribers.",
          "Eligibility is determined at the time of confirmed subscription.",
          "Once filled, the program will permanently close.",
        ],
      },
      {
        title: "Founding Discount",
        points: [
          "Up to 80% lifetime discount while subscription remains uninterrupted.",
          "Canceling forfeits the Founding discount permanently.",
          "Discount applies only to qualifying subscription plans.",
        ],
      },
      {
        title: "Referral Revenue Share",
        points: [
          "20% revenue share on qualifying referred subscriptions.",
          "Valid for 24 months from referral start date.",
          "Excludes refunds, chargebacks, taxes, and fees.",
          "Requires official platform referral tracking.",
        ],
      },
      {
        title: "Program Integrity",
        points: [
          "Self-referrals or fraudulent activity will terminate Founding status.",
          "Founding status is non-transferable.",
        ],
      },
      {
        title: "Engagement",
        points: [
          "Founding members may be invited for feedback or beta testing.",
          "Benefits may require reasonable participation.",
        ],
      },
    ],
  },
];

const SubscriptionRules = () => {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    document.getElementById(`sr-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sr-page">
      {/* ===== HERO ===== */}
      <section className="sr-hero">
        <Container className="position-relative">
          <button type="button" className="sr-back" onClick={() => navigate("/subscriptions-plan")}>
            <i className="bi bi-arrow-left"></i> Back to Plans
          </button>
          <span className="sr-eyebrow"><i className="bi bi-shield-check"></i> Legal</span>
          <h1 className="sr-hero-title">
            Subscription <span>Terms & Conditions</span>
          </h1>
          <p className="sr-hero-sub">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </Container>
      </section>

      <section className="sr-body">
        <Container>
          <div className="sr-layout">
            {/* ===== TOC (desktop) ===== */}
            <aside className="sr-toc d-none d-lg-block">
              <div className="sr-toc-card">
                <div className="sr-toc-title">On this page</div>
                {PARTS.map((part) => (
                  <button type="button" key={part.id} className="sr-toc-link" onClick={() => scrollTo(part.id)}>
                    <i className={`bi ${part.icon}`}></i>
                    <span>
                      <small>{part.label}</small>
                      {part.title}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {/* ===== CONTENT ===== */}
            <div className="sr-content">
              {PARTS.map((part) => (
                <article className="sr-part" id={`sr-${part.id}`} key={part.id}>
                  <header className="sr-part-head">
                    <span className="sr-part-icon"><i className={`bi ${part.icon}`}></i></span>
                    <div>
                      <small>{part.label}</small>
                      <h2>{part.title}</h2>
                    </div>
                  </header>

                  <div className="sr-sections">
                    {part.sections.map((section, i) => (
                      <div className="sr-section" key={section.title || i}>
                        {section.title && (
                          <h3>
                            <span className="sr-num">{i + 1}</span>
                            {section.title}
                          </h3>
                        )}
                        <ul>
                          {section.points.map((point) => (
                            <li key={point}>
                              <i className="bi bi-check-lg"></i>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </article>
              ))}

              <div className="sr-ack">
                <i className="bi bi-info-circle-fill"></i>
                <p>
                  By subscribing, you acknowledge that you have read and agree to these
                  Terms & Conditions.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default SubscriptionRules;
