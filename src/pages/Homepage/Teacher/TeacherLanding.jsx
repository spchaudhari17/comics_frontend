import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const TeacherLanding = () => {
    return (
        <div className="ForTeachers-Page pb-5">

            {/* Breadcrumb Banner Section */}
            <section className="breadcrumb-banner-section py-5">
                <div className="container-xl position-relative z-1">
                    <div className="page-header text-white text-uppercase text-center">
                        <div className="section-heading text-white mb-2">For Teachers</div>
                        <div className="label-heading mb-3">Empower Your Classrooms with AI-Backed Creativity</div>
                    </div>
                </div>
            </section>

            <div className="container-xl mt-5">
                <div className="product-offerings-wrapper mb-5">
                    <div className="fs-4 fw-bold text-warning mb-3">Product Offerings -</div>
                    <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4">
                        <div className="col">
                            <div data-aos="slide-right" className="info-wrapper d-flex flex-column justify-content-between h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                                <div className="content-wrapper mb-4">
                                    <div className="fs-16 fw-bold text-theme4 mb-2">1. AI Comic Builder</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0">
                                        <li>Teachers can input a concept and generate a comic lesson.</li>
                                        <li>Script, voice narration, panels, quizzes auto-generated (editable).</li>
                                        <li>Multilingual and voice-over support for inclusivity.</li>
                                    </ul>
                                </div>
                                <div className="activity-img">
                                    <img src={require('../../../assets/images/activity-images/activity-img19.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div data-aos="slide-left" className="info-wrapper d-flex flex-column justify-content-between h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                                <div className="content-wrapper mb-4">
                                    <div className="fs-16 fw-bold text-theme4 mb-2">2. Curriculum-Aligned Content</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0">
                                        <li>Comics and quizzes designed by grade, subject, and topic.</li>
                                        <li>Aligned to CBSE, ICSE, U.S. Common Core, or custom curriculum.</li>
                                    </ul>
                                </div>
                                <div className="activity-img">
                                    <img src={require('../../../assets/images/activity-images/activity-img6.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div data-aos="slide-right" className="info-wrapper d-flex flex-column justify-content-between h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                                <div className="content-wrapper mb-4">
                                    <div className="fs-16 fw-bold text-theme4 mb-2">3. Classroom & Group Management</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0">
                                        <li>Assign lessons tstudent batches.</li>
                                        <li>Monitor completion and quiz performance.</li>
                                        <li>Push challenges and discussion prompts.</li>
                                    </ul>
                                </div>
                                <div className="activity-img">
                                    <img src={require('../../../assets/images/activity-images/activity-img12.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div data-aos="slide-left" className="info-wrapper d-flex flex-column justify-content-between h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                                <div className="content-wrapper mb-4">
                                    <div className="fs-16 fw-bold text-theme4 mb-2">4. Progress Dashboard</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0">
                                        <li>Track individual and group performance.</li>
                                        <li>Metrics: quiz accuracy, concept mastery, time spent, reward history.</li>
                                    </ul>
                                </div>
                                <div className="activity-img">
                                    <img src={require('../../../assets/images/activity-images/activity-img15.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-12">
                            <div data-aos="slide-right" className="info-wrapper d-flex flex-column justify-content-between h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                                <div className="content-wrapper mb-4">
                                    <div className="fs-16 fw-bold text-theme4 mb-2">5. Revenue Sharing Model</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0">
                                        <li>Teachers whcreate comics earn a share when reused or shared.</li>
                                        <li>Build a portfolio of educational IP.</li>
                                    </ul>
                                </div>
                                <div className="activity-img">
                                    <img src={require('../../../assets/images/activity-images/activity-img2.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="phase-wise-details-wrapper">
                    <div className="fs-4 fw-bold text-warning mb-3">Phase-wise Details -</div>
                    <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4">
                        <div className="col">
                            <div data-aos="slide-right" className="info-wrapper d-flex flex-column justify-content-between h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                                <div className="content-wrapper mb-4">
                                    <div className="fs-16 fw-bold text-theme4 mb-2">Phase 1: Beta Launch (Live Soon)</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0">
                                        <li>Access to student comics and quizzes</li>
                                        <li>Dashboard with sample metrics</li>
                                        <li>Teacher pilot users get content creation previews</li>
                                    </ul>
                                </div>
                                <div className="activity-img">
                                    <img src={require('../../../assets/images/activity-images/activity-img18.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div data-aos="slide-left" className="info-wrapper d-flex flex-column justify-content-between h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                                <div className="content-wrapper mb-4">
                                    <div className="fs-16 fw-bold text-theme4 mb-2">Phase 2: Near-Term Additions</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0">
                                        <li>AI Comic Builder full access with editor tools</li>
                                        <li>Group creation, assignment scheduling, auto-grade tracking</li>
                                        <li>School-specific curriculum upload for content matching</li>
                                        <li>Real-time question performance analytics</li>
                                    </ul>
                                </div>
                                <div className="activity-img">
                                    <img src={require('../../../assets/images/activity-images/activity-img5.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-12">
                            <div data-aos="slide-right" className="info-wrapper d-flex flex-column justify-content-between h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                                <div className="content-wrapper mb-4">
                                    <div className="fs-16 fw-bold text-theme4 mb-2">Phase 3: Long-Term Vision</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0">
                                        <li>Teacher community marketplace (buy/sell content)</li>
                                        <li>AI assistant for lesson planning & differentiated instruction</li>
                                        <li>Smart grading, feedback generation, and predictive analysis</li>
                                        <li>Export reports for school ERP systems</li>
                                    </ul>
                                </div>
                                <div className="activity-img">
                                    <img src={require('../../../assets/images/activity-images/activity-img10.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherLanding;
