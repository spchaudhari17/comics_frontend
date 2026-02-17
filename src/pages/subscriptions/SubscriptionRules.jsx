import React from "react";
import { Container } from "react-bootstrap";

const SubscriptionRules = () => {
  return (
    <Container className="py-5" style={{ maxWidth: "900px" }}>
      <h1 className="mb-4 fw-bold">Subscription Terms & Conditions</h1>

      <p className="text-muted">
        Last Updated: {new Date().toLocaleDateString()}
      </p>

      <hr />

      <h4>1. Subscription Overview</h4>
      <p>
        Our subscription provides access to educational comic creation tools
        and student dashboard features. Subscription benefits are available
        only during the active billing period.
      </p>

      <ul>
        <li>Access to comic generation tools</li>
        <li>Weekly comic creation limits based on plan</li>
        <li>Student dashboard access with student limits</li>
        <li>Access to saved comics and downloads</li>
      </ul>

      <h4>2. Billing & Payments</h4>
      <ul>
        <li>Subscription is billed monthly.</li>
        <li>Payment is charged automatically every billing cycle.</li>
        <li>Failure of payment may suspend account access.</li>
        <li>All prices are subject to applicable taxes.</li>
      </ul>

      <h4>3. Usage Limits</h4>
      <ul>
        <li>Comic creation is limited per week as per your plan.</li>
        <li>Student additions are limited based on your plan.</li>
        <li>Limits reset automatically each week.</li>
        <li>Unused credits do not roll over to the next cycle.</li>
      </ul>

      <h4>4. Free Access Policy</h4>
      <p>
        Free users may generate a limited number of comics. Advanced features,
        additional parts, and student management require an active subscription.
      </p>

      <h4>5. Upgrades & Downgrades</h4>
      <ul>
        <li>Users may upgrade at any time.</li>
        <li>Upgrades take effect immediately after payment confirmation.</li>
        <li>Downgrades apply at the next billing cycle.</li>
      </ul>

      <h4>6. Cancellation Policy</h4>
      <ul>
        <li>You may cancel your subscription at any time.</li>
        <li>Access remains active until the end of the current billing period.</li>
        <li>No refunds are provided for partial billing cycles.</li>
      </ul>

      <h4>7. Fair Usage Policy</h4>
      <ul>
        <li>Accounts are intended for educational use only.</li>
        <li>Misuse, abuse, or automated scraping is strictly prohibited.</li>
        <li>We reserve the right to suspend accounts violating our policies.</li>
      </ul>

      <h4>8. Data & Content</h4>
      <ul>
        <li>Users retain ownership of generated educational content.</li>
        <li>We store content securely but do not guarantee permanent storage.</li>
        <li>Users are responsible for backing up downloaded content.</li>
      </ul>

      <h4>9. Modifications</h4>
      <p>
        We may update subscription pricing, features, or terms at any time.
        Continued use of the service implies acceptance of updated terms.
      </p>

      <h4>10. Contact</h4>
      <p>
        For any subscription-related queries, please contact our support team
        via the Contact page.
      </p>

      <hr />

      <p className="text-muted small">
        By subscribing, you agree to these terms and conditions.
      </p>
    </Container>
  );
};

export default SubscriptionRules;
