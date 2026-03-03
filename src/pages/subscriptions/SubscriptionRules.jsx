import React from "react";
import { Container } from "react-bootstrap";

const SubscriptionRules = () => {
  return (
    <Container className="py-5" style={{ maxWidth: "950px" }}>
      <h1 className="mb-4 fw-bold">
        Subscription Terms & Conditions
      </h1>

      <p className="text-muted">
        Last Updated: {new Date().toLocaleDateString()}
      </p>

      <hr />

      {/* PART 1 */}
      <h3 className="mt-4 fw-bold">PART 1 — General Subscription Terms</h3>

      <h5 className="mt-3">1. Subscription Structure</h5>
      <ul>
        <li>Subscriptions are billed monthly or annually as selected.</li>
        <li>Subscriptions renew automatically unless canceled before renewal.</li>
        <li>Pricing may change for new users. Existing users will be notified in advance.</li>
      </ul>

      <h5 className="mt-3">2. Comic Generation Limits</h5>
      <ul>
        <li>Each plan includes a maximum number of AI-generated comics.</li>
        <li>Comics are distributed weekly (e.g., 5, 10, or 20 per week).</li>
        <li>Unused weekly limits do not roll over unless explicitly stated.</li>
        <li>Unused monthly allocations do not carry forward.</li>
        <li>Limits ensure fair and stable platform performance.</li>
      </ul>

      <h5 className="mt-3">3. Content Ownership & Commercial Rights</h5>
      <ul>
        <li>Subscribers retain commercial usage rights during active subscription.</li>
        <li>Commercial rights apply only while subscription remains active.</li>
        <li>The platform may use anonymized content for improvements & marketing.</li>
        <li>Users are responsible for complying with intellectual property laws.</li>
      </ul>

      <h5 className="mt-3">4. Student Access & Dashboard</h5>
      <ul>
        <li>Student limits depend on the selected subscription tier.</li>
        <li>A registered student means a unique student account linked to a teacher dashboard.</li>
        <li>Sharing login credentials is strictly prohibited.</li>
        <li>Students may access assigned content but do not receive ownership rights.</li>
      </ul>

      <h5 className="mt-3">5. Reports & Analytics</h5>
      <ul>
        <li>Reports are generated automatically based on student activity.</li>
        <li>Analytics are for educational support purposes only.</li>
        <li>No guarantee of academic outcomes is provided.</li>
        <li>Analytics features may evolve over time.</li>
      </ul>

      <h5 className="mt-3">6. Payments & Refunds</h5>
      <ul>
        <li>All payments are non-refundable unless required by law.</li>
        <li>Cancellations take effect at the end of the billing cycle.</li>
        <li>Failed payments may result in suspended access.</li>
      </ul>

      <h5 className="mt-3">7. Fair Usage & Abuse Policy</h5>
      <ul>
        <li>Automated scraping or system abuse is strictly prohibited.</li>
        <li>Excessive or suspicious usage may trigger review.</li>
        <li>Violation of terms may result in suspension without refund.</li>
      </ul>

      <h5 className="mt-3">8. Modifications to Service</h5>
      <ul>
        <li>The platform may modify or discontinue features at its discretion.</li>
        <li>Material changes affecting pricing or structure will be notified.</li>
      </ul>

      <hr />

      {/* PART 2 */}
      <h3 className="mt-4 fw-bold">PART 2 — Student Dashboard Add-On Terms</h3>

      <ul>
        <li>Student dashboard requires an active comic subscription.</li>
        <li>Student capacity limits are strictly enforced (e.g., 20, 50, 100).</li>
        <li>Removing students does not reset historical usage limits.</li>
        <li>Reports are generated only for active student accounts.</li>
        <li>No personally identifiable student data is stored.</li>
      </ul>

      <hr />

      {/* PART 3 */}
      <h3 className="mt-4 fw-bold">PART 3 — Founding Teacher Program</h3>

      <h5 className="mt-3">1. Eligibility</h5>
      <ul>
        <li>Limited to the first 100 eligible subscribers.</li>
        <li>Eligibility is determined at the time of confirmed subscription.</li>
        <li>Once filled, the program will permanently close.</li>
      </ul>

      <h5 className="mt-3">2. Founding Discount</h5>
      <ul>
        <li>Up to 80% lifetime discount while subscription remains uninterrupted.</li>
        <li>Canceling forfeits the Founding discount permanently.</li>
        <li>Discount applies only to qualifying subscription plans.</li>
      </ul>

      <h5 className="mt-3">3. Referral Revenue Share</h5>
      <ul>
        <li>20% revenue share on qualifying referred subscriptions.</li>
        <li>Valid for 24 months from referral start date.</li>
        <li>Excludes refunds, chargebacks, taxes, and fees.</li>
        <li>Requires official platform referral tracking.</li>
      </ul>

      <h5 className="mt-3">4. Program Integrity</h5>
      <ul>
        <li>Self-referrals or fraudulent activity will terminate Founding status.</li>
        <li>Founding status is non-transferable.</li>
      </ul>

      <h5 className="mt-3">5. Engagement</h5>
      <ul>
        <li>Founding members may be invited for feedback or beta testing.</li>
        <li>Benefits may require reasonable participation.</li>
      </ul>

      <hr />

      <p className="text-muted small">
        By subscribing, you acknowledge that you have read and agree to these
        Terms & Conditions.
      </p>
    </Container>
  );
};

export default SubscriptionRules;