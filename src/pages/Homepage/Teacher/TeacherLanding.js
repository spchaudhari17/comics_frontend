import React from 'react';

const TeacherLanding = () => {
    return (
        <div className="ForTeachers-Page py-4">
            <div className="container-xl">
                <div className="heading-wrapper text-center mx-auto mb-4" style={{ maxWidth: '600px' }}>
                    <div className="section-heading mb-2">For Teachers</div>
                    <div className="label-heading">Empower Your Classrooms with AI-Backed Creativity</div>
                </div>

                <div className="product-offerings-wrapper mb-4">
                    <div className="fs-4 fw-bold text-warning mb-2">Product Offerings -</div>
                    <div className="d-flex flex-column gap-3">
                        <div className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="fs-16 fw-bold text-theme4 mb-2">1. AI Comic Builder</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Teachers can input a concept and generate a comic lesson.</li>
                                <li>Script, voice narration, panels, quizzes auto-generated (editable).</li>
                                <li>Multilingual and voice-over support for inclusivity.</li>
                            </ul>
                        </div>
                        <div className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="fs-16 fw-bold text-theme4 mb-2">2. Curriculum-Aligned Content</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Comics and quizzes designed by grade, subject, and topic.</li>
                                <li>Aligned to CBSE, ICSE, U.S. Common Core, or custom curriculum.</li>
                            </ul>
                        </div>
                        <div className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="fs-16 fw-bold text-theme4 mb-2">3. Classroom & Group Management</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Assign lessons tstudent batches.</li>
                                <li>Monitor completion and quiz performance.</li>
                                <li>Push challenges and discussion prompts.</li>
                            </ul>
                        </div>
                        <div className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="fs-16 fw-bold text-theme4 mb-2">4. Progress Dashboard</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Track individual and group performance.</li>
                                <li>Metrics: quiz accuracy, concept mastery, time spent, reward history.</li>
                            </ul>
                        </div>
                        <div className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="fs-16 fw-bold text-theme4 mb-2">5. Revenue Sharing Model</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Teachers whcreate comics earn a share when reused or shared.</li>
                                <li>Build a portfolio of educational IP.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="phase-wise-details-wrapper">
                    <div className="fs-4 fw-bold text-warning mb-2">Phase-wise Details -</div>
                    <div className="d-flex flex-column gap-3">
                        <div className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="fs-16 fw-bold text-theme4 mb-2">Phase 1: Beta Launch (Live Soon)</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Access to student comics and quizzes</li>
                                <li>Dashboard with sample metrics</li>
                                <li>Teacher pilot users get content creation previews</li>
                            </ul>
                        </div>
                        <div className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="fs-16 fw-bold text-theme4 mb-2">Phase 2: Near-Term Additions</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>AI Comic Builder full access with editor tools</li>
                                <li>Group creation, assignment scheduling, auto-grade tracking</li>
                                <li>School-specific curriculum upload for content matching</li>
                                <li>Real-time question performance analytics</li>
                            </ul>
                        </div>
                        <div className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                            <div className="fs-16 fw-bold text-theme4 mb-2">Phase 3: Long-Term Vision</div>
                            <ul className="list-disc d-flex flex-column gap-2 m-0">
                                <li>Teacher community marketplace (buy/sell content)</li>
                                <li>AI assistant for lesson planning & differentiated instruction</li>
                                <li>Smart grading, feedback generation, and predictive analysis</li>
                                <li>Export reports for school ERP systems</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherLanding;
