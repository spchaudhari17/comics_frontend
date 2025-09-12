import React from 'react';

const Privacy = () => {
    return (
        <>
            <div className="max-w-4xl mx-auto px-6 py-10 text-gray-800 leading-relaxed container">
                <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
                <p className="mb-4">Effective Date: 8th September 2025</p>

                <p className="mb-6">
                    At <strong>Kridemy</strong>, operated by Sham Insights LLC, we value your
                    privacy and are committed to protecting the personal information of our
                    users, especially students and children. This Privacy Policy explains
                    what information we collect, how we use it, and your rights regarding
                    your data.
                </p>

                {/* 1. Information We Collect */}
                <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>

                <h3 className="font-semibold mt-4">In the App</h3>
                <p><strong>Required:</strong></p>
                <ul className="list-disc pl-6 mb-2">
                    <li>Age (to provide age-appropriate content).</li>
                    <li>Username (a nickname chosen by the user, not their real name).</li>
                </ul>
                <p><strong>Optional / On Subscription:</strong></p>
                <ul className="list-disc pl-6 mb-2">
                    <li>Parent’s Email Address and Password (for creating and managing a subscription account).</li>
                </ul>
                <p><strong>Not Collected:</strong> We do not collect real names, phone numbers, home addresses, or behavioral tracking data.</p>

                <h3 className="font-semibold mt-4">On the Website</h3>
                <p><strong>Teacher/Partner Sign-up:</strong></p>
                <ul className="list-disc pl-6">
                    <li>Email Address (for communication and account setup).</li>
                </ul>

                {/* 2. How We Use Information */}
                <h2 className="text-xl font-semibold mt-8 mb-4">2. How We Use Information</h2>
                <ul className="list-disc pl-6">
                    <li>Delivering educational content and age-appropriate experiences.</li>
                    <li>Managing subscriptions and parental controls.</li>
                    <li>Allowing teachers to access and share educational resources.</li>
                    <li>Displaying contextual (non-personalized) advertisements through Google AdMob.</li>
                    <li>Improving app performance and security.</li>
                </ul>
                <p className="mt-2">
                    We do not sell, rent, or share personal information with third parties
                    for marketing or advertising.
                </p>

                {/* 3. Advertising & Google AdMob */}
                <h2 className="text-xl font-semibold mt-8 mb-4">3. Advertising & Google AdMob</h2>
                <p>Our app uses Google AdMob to serve ads. To protect children’s privacy:</p>
                <ul className="list-disc pl-6">
                    <li>All ads are set to non-personalized (context-based only).</li>
                    <li>AdMob’s child privacy settings are enabled (COPPA / GDPR-K compliant).</li>
                    <li>No behavioral targeting, remarketing, or tracking is used.</li>
                    <li>Ads are automatically filtered to be age-appropriate.</li>
                    <li>Parents may choose a subscription plan to remove ads entirely.</li>
                </ul>

                {/* 4. Children’s Privacy */}
                <h2 className="text-xl font-semibold mt-8 mb-4">4. Children’s Privacy</h2>
                <ul className="list-disc pl-6">
                    <li>Parental consent required for subscription features under age 13 (U.S.), 16 (EU), 18 (India).</li>
                    <li>Children can use the app with a nickname only, without providing personal info.</li>
                    <li>We comply with COPPA, FERPA, GDPR/GDPR-K, and India’s DPDP Act (2023).</li>
                </ul>

                {/* 5. Data Security */}
                <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Security</h2>
                <p>
                    We use encryption, secure servers, and limited access controls to
                    protect your information. In case of a data breach, we will notify
                    parents/teachers and relevant authorities as required by law.
                </p>

                {/* 6. Data Retention */}
                <h2 className="text-xl font-semibold mt-8 mb-4">6. Data Retention</h2>
                <ul className="list-disc pl-6">
                    <li><strong>Free users:</strong> Username and age stored locally, deleted by uninstalling the app.</li>
                    <li><strong>Subscribers:</strong> Parent email & subscription data kept while active, deleted within 30 days if canceled.</li>
                    <li><strong>Teachers:</strong> Email stored only while registered.</li>
                </ul>

                {/* 7. Your Rights */}
                <h2 className="text-xl font-semibold mt-8 mb-4">7. Your Rights</h2>
                <ul className="list-disc pl-6">
                    <li>Access your data.</li>
                    <li>Request corrections or deletions.</li>
                    <li>Withdraw consent anytime.</li>
                </ul>
                <p>Parents and teachers can contact us to manage or delete accounts.</p>

                {/* 8. Third-Party Services */}
                <h2 className="text-xl font-semibold mt-8 mb-4">8. Third-Party Services</h2>
                <p>
                    Aside from Google AdMob (ads) and payment processors (for subscriptions),
                    we do not share data with third parties. Any future integrations will
                    follow strict child privacy standards, and this policy will be updated.
                </p>

                {/* 9. Contact Us */}
                <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, contact us:</p>
                <p className="mt-2">
                    <strong>Sham Insights LLC</strong> <br />
                    App: Kridemy <br />
                    Website: <a href="https://kridemy.com" className="text-blue-600 underline">Kridemy.com</a> <br />
                    Email: <a href="mailto:customercare@kridemy.com" className="text-blue-600 underline">customercare@kridemy.com</a> <br />
                    Address: 156 Easton Ave, New Brunswick, NJ, USA 08901
                </p>
            </div>
        </>
    );
};

export default Privacy;
