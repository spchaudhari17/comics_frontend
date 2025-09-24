import React from 'react';
import { Link } from 'react-router-dom';

const TermsAndCondition = () => {
    return (
        <div className="privacy-policy-page pb-5">
            {/* Breadcrumb Banner Section */}
            <section className="breadcrumb-banner-section py-5">
                <div className="container-xl position-relative z-1">
                    <div className="page-header text-white text-uppercase text-center">
                        <div className="section-heading text-white mb-2">Terms And Condition</div>
                        {/* <div className="label-heading mb-3">Stay Informed. Stay Engaged. Support Smarter Learning</div> */}
                    </div>
                </div>
            </section>

            <div className="container-xl mt-5">
                <div className="content-wrapper">
                    <div className="wrapper mb-4">
                        <div className="description mb-2">
                            Welcome to <strong>Kridemy</strong> (“Company,” “we,” “our,” or “us”). These Terms and Conditions (“Terms”) govern your access to and use of our website,
                            mobile application, and related services (collectively, the “Platform”). By accessing or using the Platform, you agree to these Terms.
                            If you do not agree, please stop using the Platform.
                        </div>
                        <div className="text-primary"><i className="bi bi-clock"></i> Effective Date: 23th September 2025</div>
                        <div className="text-primary"><i className="bi bi-clock"></i> Last Update: 23th September 2025</div>
                    </div>

                    <div className="all-sections-wrapper d-flex flex-column gap-3">
                        {/* 1. Eligibility */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">1. Eligibility</div>
                            <div className="cover-wrapper mb-4">
                                <ul className="list-disc d-flex flex-column gap-2 mb-0">
                                    <li>The Platform is available to users aged <span className="text-theme4 fw-bold">6 years and older</span>.</li>
                                    <li>Users under 18 must use the Platform with the guidance and consent of a parent, guardian, or authorized teacher.</li>
                                    <li>By using the Platform, you confirm that you meet these requirements.</li>
                                </ul>
                            </div>
                        </div>

                        {/* 2. Use of the Platform */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">2. Use of the Platform</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>The Platform is designed for <span className="text-theme4 fw-bold">educational and entertainment purposes</span>.</li>
                                <li>You agree <span className="text-theme4 fw-bold"></span> not to misuse the Platform, including but not limited to:</li>
                                <li>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0">
                                        <li>Uploading or sharing <span className="text-theme4 fw-bold">copyrighted material</span> or <span className="text-theme4 fw-bold">third-party trademarks/names</span> without explicit permission.</li>
                                        <li>Using company, brand, or product names unless strictly necessary for educational purposes.</li>
                                        <li>Engaging in fraudulent, harmful, offensive, or unlawful activity.</li>
                                        <li>Attempting to hack, disrupt, or overload our systems.</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>

                        {/* 3. User Accounts */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">3. User Accounts</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Certain features require an account. You agree to provide accurate details and keep your credentials secure.</li>
                                <li>You are responsible for all activities under your account.</li>
                                <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
                            </ul>
                        </div>

                        {/* 4. Educational Content & Creator Responsibilities */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">4. Educational Content & Creator Responsibilities</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>The Platform provides comics, quizzes, videos, and other learning tools.</li>
                                <li>Teachers and creators may submit educational content for use on the Platform.</li>
                                <li><span className="text-theme4 fw-bold">Creators are solely responsible</span> for ensuring their content:
                                    <ul>
                                        <li>Does not include third-party copyrighted material (text, images, music, or characters).</li>
                                        <li>Does not misuse brand, product, or company names.</li>
                                        <li>Is factually correct, age-appropriate, and compliant with all applicable laws.</li>
                                    </ul>
                                </li>
                                <li>By submitting content, creators grant <span className="text-theme4 fw-bold">Kridemy full ownership rights</span> (including rights to reproduce, adapt, and distribute).</li>
                                <li>Creators may be eligible for <span className="text-theme4 fw-bold">revenue sharing</span>, but this does not transfer any ownership of intellectual property to them.</li>
                            </ul>
                        </div>

                        {/* 5. Rewards & Virtual Items */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">5. Rewards & Virtual Items</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Users may earn <span className="text-theme4 fw-bold">coins, gems, badges, or power-ups</span> through engagement.</li>
                                <li>These rewards are <span className="text-theme4 fw-bold">virtual items</span> with <span className="text-theme4 fw-bold">no real-world monetary value</span>, except where explicitly stated in a creator revenue-sharing agreement.</li>
                                <li>We may modify or discontinue rewards, leaderboards, or game features at any time.</li>
                            </ul>
                        </div>

                        {/* 6. Advertising & Third-Party Content */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">6. Advertising & Third-Party Content</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>The Platform uses <span className="text-theme4 fw-bold">Google AdMob</span> to serve ads.</li>
                                <li>Kridemy does not control or endorse the content of these ads and is <span className="text-theme4 fw-bold">not responsible</span> for their accuracy, legality, or quality.</li>
                                <li>Clicking ads may redirect you to third-party sites governed by their own terms and policies.</li>
                            </ul>
                        </div>

                        {/* 7. Intellectual Property */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">7. Intellectual Property</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>All logos, mascots, text, graphics, scripts, comics, software, and other content on the Platform are owned or licensed by Kridemy and protected under intellectual property laws.</li>
                                <li>Users and creators may not copy, modify, distribute, or resell any Platform content without prior written consent.</li>
                                <li>By submitting content, you grant Kridemy a <span className="text-theme4 fw-bold">perpetual, worldwide, royalty-free license</span> to use, modify, distribute, and monetize your content in any form.</li>
                            </ul>
                        </div>

                        {/* 8. Privacy & Data Protection */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">8. Privacy & Data Protection</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>We care about your privacy. Please read our <span className="text-theme4 fw-bold">Privacy Policy</span> (separate document) for details on how we collect, use, and protect your data.</li>
                                <li>By using the Platform, you consent to our data practices.</li>
                                <li>Students, parents, and teachers acknowledge that usage may fall under student data protection laws (e.g., COPPA, FERPA, GDPR).</li>
                            </ul>
                        </div>

                        {/* 9. Payments & Subscriptions */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">9. Payments & Subscriptions</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Certain features may require paid access (subscriptions or premium upgrades).</li>
                                <li>Prices, billing cycles, and cancellation terms will be displayed before purchase.</li>
                                <li>Payments are final unless otherwise required by law.</li>
                            </ul>
                        </div>

                        {/* 10. Limitation of Liability */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">10. Limitation of Liability</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>The Platform is provided on an <span className="text-theme4 fw-bold">“as is” and “as available”</span> basis.</li>
                                <li>We make no guarantees of uninterrupted service, complete accuracy, or error-free operation.</li>
                                <li>To the maximum extent permitted by law, Kridemy will not be liable for damages related to:
                                    <ul>
                                        <li>Platform downtime, bugs, or errors.</li>
                                        <li>Loss of rewards, coins, or user progress.</li>
                                        <li>Third-party ads, websites, or content accessed through the Platform.</li>
                                        <li>Unauthorized account access or data breaches outside our reasonable control.</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>

                        {/* 11. Indemnification */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">11. Indemnification</div>
                            <div className="mb-3">You agree to indemnify and hold harmless Kridemy, its affiliates, employees, and partners from claims, damages, or expenses arising out of:</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Your use of the Platform.</li>
                                <li>Your violation of these Terms.</li>
                                <li>Your submitted content.</li>
                            </ul>
                        </div>

                        {/* 12. Changes to Terms */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">12. Changes to Terms</div>
                            <div>We may revise these Terms periodically. Updated versions will be posted with a new “Last Updated” date. Continued use of the Platform means you accept the changes.</div>
                        </div>

                        {/* 13. Termination */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">13. Termination</div>
                            <div>We may suspend or terminate your account or access to the Platform at our discretion, without notice, if you violate these Terms or for other operational reasons.</div>
                        </div>

                        {/* 14. Governing Law */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">14. Governing Law</div>
                            <div>These Terms are governed by the laws of the <span className="text-theme4 fw-bold">State of New Jersey, United States</span>, without regard to conflict-of-law principles.</div>
                        </div>

                        {/* 15. Contact Us */}
                        <div data-aos="flip-up" className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="main-heading mb-3">15. Contact Us</div>
                            <div className="mb-2">For questions or support, please contact us:</div>
                            <div className="mb-1"><i className="bi bi-envelope-fill text-primary"></i> customercare@kridemy.com</div>
                            <div className=""><i className="bi bi-geo-alt-fill text-primary"></i> Sham Insights LLC, New Brunswick, New Jersey, USA, 08901</div>
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

export default TermsAndCondition;
