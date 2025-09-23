import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
    return (
        <div className="privacy-policy-page pb-5">
            {/* Breadcrumb Banner Section */}
            <section className="breadcrumb-banner-section py-5">
                <div className="container-xl position-relative z-1">
                    <div className="page-header text-white text-uppercase text-center">
                        <div className="section-heading text-white mb-2">Privacy Policy</div>
                        {/* <div className="label-heading mb-3">Stay Informed. Stay Engaged. Support Smarter Learning</div> */}
                    </div>
                </div>
            </section>

            <div className="container-xl mt-5">
                <div className="content-wrapper">
                    <div className="wrapper mb-4">
                        <div className="description mb-2">
                            At <strong>Kridemy</strong>, operated by Sham Insights LLC, we value your
                            privacy and are committed to protecting the personal information of our
                            users, especially students and children. This Privacy Policy explains
                            what information we collect, how we use it, and your rights regarding
                            your data.
                        </div>
                        <div className="text-primary"><i className="bi bi-clock"></i> Effective Date: 8th September 2025</div>
                    </div>

                    <div className="all-sections-wrapper d-flex flex-column gap-3">
                        {/* 1. Information We Collect */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">1. Information We Collect</div>
                            <div className="cover-wrapper mb-4">
                                <div className="fs-16 fw-bold text-warning mb-2">In the App</div>
                                <div className="fs-14 fw-semibold text-theme4 mb-2">Required:</div>
                                <ul className="list-disc mb-3">
                                    <li className="mb-2">Age (to provide age-appropriate content).</li>
                                    <li>Username (a nickname chosen by the user, not their real name).</li>
                                </ul>
                                <div className="fs-14 fw-semibold text-theme4 mb-2">Optional / On Subscription:</div>
                                <ul className="list-disc mb-0">
                                    <li className="mb-2">Parent’s Email Address and Password (for creating and managing a subscription account).</li>
                                    <li>Not Collected: We do not collect real names, phone numbers, home addresses, or behavioral tracking data.</li>
                                </ul>
                            </div>

                            <div className="cover-wrapper">
                                <div className="fs-16 fw-bold text-warning mb-1">On the Website</div>
                                <div className="fs-14 fw-semibold text-theme4 mb-2">Teacher/Partner Sign-up:</div>
                                <ul className="list-disc m-0">
                                    <li>Email Address (for communication and account setup).</li>
                                </ul>
                            </div>
                        </div>

                        {/* 2. How We Use Information */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">2. How We Use Information</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Delivering educational content and age-appropriate experiences.</li>
                                <li>Managing subscriptions and parental controls.</li>
                                <li>Allowing teachers to access and share educational resources.</li>
                                <li>Displaying contextual (non-personalized) advertisements through Google AdMob.</li>
                                <li>Improving app performance and security.</li>
                            </ul>
                            <p className="mt-3 mb-0">
                                We do not sell, rent, or share personal information with third parties
                                for marketing or advertising.
                            </p>
                        </div>

                        {/* 3. Advertising & Google AdMob */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">3. Advertising & Google AdMob</div>
                            <p>Our app uses Google AdMob to serve ads. To protect children’s privacy:</p>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>All ads are set to non-personalized (context-based only).</li>
                                <li>AdMob’s child privacy settings are enabled (COPPA / GDPR-K compliant).</li>
                                <li>No behavioral targeting, remarketing, or tracking is used.</li>
                                <li>Ads are automatically filtered to be age-appropriate.</li>
                                <li>Parents may choose a subscription plan to remove ads entirely.</li>
                            </ul>
                        </div>

                        {/* 4. Children’s Privacy */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">4. Children’s Privacy</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Parental consent required for subscription features under age 13 (U.S.), 16 (EU), 18 (India).</li>
                                <li>Children can use the app with a nickname only, without providing personal info.</li>
                                <li>We comply with COPPA, FERPA, GDPR/GDPR-K, and India’s DPDP Act (2023).</li>
                            </ul>
                        </div>

                        {/* 5. Data Security */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">5. Data Security</div>
                            <p className="mb-0">
                                We use encryption, secure servers, and limited access controls to
                                protect your information. In case of a data breach, we will notify
                                parents/teachers and relevant authorities as required by law.
                            </p>
                        </div>

                        {/* 6. Data Retention */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">6. Data Retention</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li><strong>Free users:</strong> Username and age stored locally, deleted by uninstalling the app.</li>
                                <li><strong>Subscribers:</strong> Parent email & subscription data kept while active, deleted within 30 days if canceled.</li>
                                <li><strong>Teachers:</strong> Email stored only while registered.</li>
                            </ul>
                        </div>

                        {/* 7. Your Rights */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">7. Your Rights</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Access your data.</li>
                                <li>Request corrections or deletions.</li>
                                <li>Withdraw consent anytime.</li>
                            </ul>
                            <p className="mt-3 mb-0">Parents and teachers can contact us to manage or delete accounts.</p>
                        </div>

                        {/* 8. Third-Party Services */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">8. Third-Party Services</div>
                            <p className="mb-0">
                                Aside from Google AdMob (ads) and payment processors (for subscriptions),
                                we do not share data with third parties. Any future integrations will
                                follow strict child privacy standards, and this policy will be updated.
                            </p>
                        </div>

                        {/* 9. Contact Us */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">9. Contact Us</div>
                            <div className="mb-3">If you have any questions about this Privacy Policy, contact us:</div>
                            <p className="mb-0">
                                <strong>Sham Insights LLC</strong> <br />
                                App: Kridemy <br />
                                Website: <Link to={"https://kridemy.com"} className="text-blue-600 underline">Kridemy.com</Link> <br />
                                Email: <Link to={"mailto:customercare@kridemy.com"} className="text-blue-600 underline">customercare@kridemy.com</Link> <br />
                                Address: 156 Easton Ave, New Brunswick, NJ, USA 08901
                            </p>
                        </div>

                        <div className="img-wrapper text-center mb-3">
                            <img src={require('../../assets/images/activity-images/thankyou.png')} alt="Thankyou" className="img-fluid animate-bounce-effect" style={{ width: "250px" }} />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Privacy;
