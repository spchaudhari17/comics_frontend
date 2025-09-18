import React from 'react';
import { Accordion } from "react-bootstrap";

const FAQLanding = () => {
    return (
        <div className="ForTeachers-Page py-4">
            <div className="container-xl">
                <div className="heading-wrapper text-center mx-auto mb-4 pb-md-3">
                    <div className="section-heading mb-2">Kridemy – Frequently Asked Questions (FAQ)</div>
                    <div className="label-heading">Stay Informed. Stay Engaged. Support Smarter Learning</div>
                </div>

                {/* For Students */}
                <div className="info-wrapper bg-theme1 border rounded-4 mb-4 px-3 px-md-4 py-4">
                    <div className="fs-4 fw-bold text-warning mb-2">For Students -</div>
                    <Accordion defaultActiveKey="0" alwaysOpen flush className="d-flex flex-column gap-3">
                        <Accordion.Item eventKey="0" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">1. What is Kridemy?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Kridemy is a gamified learning platform that transforms school subjects into interactive
                                comics, quizzes, and real-time challenges. You learn while earning coins, badges, gems,
                                and avatars — making education as fun as a game.
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="1" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">2. Do I need the internet to use Kridemy?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Yes. Kridemy is a cloud-based platform. A{" "}
                                <span className="fw-semibold text-theme4">stable internet connection is required at all times</span>{" "}
                                for reading comics, attempting quizzes, watching videos, and tracking rewards.
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="2" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">3. What can I do on the platform as a student?</span>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="wrapper mb-3 ps-3">
                                    <div className="fs-14 fw-semibold text-primary mb-2">Phase 1: Beta Launch (Live Soon)</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3">
                                        <li>Learn through comic-based story lessons</li>
                                        <li>Take quizzes and earn coins, badges, and rewards</li>
                                        <li>Play in structured campaign mode</li>
                                    </ul>
                                </div>
                                <hr />
                                <div className="wrapper mb-3 ps-3">
                                    <div className="fs-14 fw-semibold text-primary mb-2">Phase 2: Coming Soon</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3">
                                        <li>Compete in real-time 1v1 quiz battles using energy points</li>
                                        <li>Watch short-form educational videos with interactive questions</li>
                                    </ul>
                                </div>
                                <hr />
                                <div className="wrapper mb-3 ps-3">
                                    <div className="fs-14 fw-semibold text-primary mb-2">Phase 3: Future Features</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3">
                                        <li>Adaptive AI-based tutoring based on your performance</li>
                                        <li>Unlock boss battles, cross-topic missions, and AI-generated comics</li>
                                    </ul>
                                </div>
                                <hr />
                                <div className="wrapper mb-3 ps-3">
                                    <div className="fs-14 fw-semibold text-primary mb-2">4. What rewards do I get as I learn?</div>
                                    <div className="fs-16 fw-semibold text-theme4 mb-2">You earn:</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3">
                                        <li>
                                            <span className="text-theme4 fw-semibold">Coins & Gems</span> – Used to unlock cosmetics and boosters
                                        </li>
                                        <li>
                                            <span className="text-theme4 fw-semibold">Ranked Cards</span> – Bronze to Diamond to mythic levels for top performance
                                        </li>
                                        <li>
                                            <span className="text-theme4 fw-semibold">Avatars & Badges</span> – Customize your in-app identity
                                        </li>
                                    </ul>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="3" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">5. Are the quizzes difficult?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Quizzes range in difficulty and adjust based on your performance. You can try regular
                                questions, “Double-or-Nothing” challenges, and advanced Hardcore Quiz Modes.
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="4" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">6. Can I play with friends?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Yes! Phase 2 introduces <span className="fw-semibold text-theme4">1v1 Quiz Battles</span> where you can challenge friends using your energy
                                points and earn additional coins based on performance.
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>

                {/* For Teachers */}
                <div className="info-wrapper bg-theme1 border rounded-4 px-3 mb-4 px-md-4 py-4">
                    <div className="fs-4 fw-bold text-warning mb-3">For Teachers -</div>

                    <Accordion defaultActiveKey="0" flush className="d-flex flex-column gap-3">
                        <Accordion.Item eventKey="7" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">7. What can teachers do on Kridemy?</span>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="wrapper mb-3 ps-3">
                                    <div className="fs-14 fw-semibold text-primary mb-2">Phase 1: Beta Launch</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3">
                                        <li>Access student-facing comics and quizzes</li>
                                        <li>Explore sample dashboards and student analytics</li>
                                    </ul>
                                </div>
                                <hr />
                                <div className="wrapper mb-3 ps-3">
                                    <div className="fs-14 fw-semibold text-primary mb-2">Phase 2: Coming Soon</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3">
                                        <li>Use the <span className="fw-semibold text-theme4">AI Comic Builder</span> to create curriculum-aligned comics with editable narration, quizzes, and illustrations</li>
                                        <li>Assign lessons to specific student groups and track completion</li>
                                        <li>Customize content to match internal syllabus</li>
                                    </ul>
                                </div>
                                <hr />
                                <div className="wrapper mb-3 ps-3">
                                    <div className="fs-14 fw-semibold text-primary mb-2">Phase 3: Future Vision</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3">
                                        <li>Monetize original educational content through Kridemy’s Creator Economy</li>
                                        <li>Use AI lesson planners, auto-grading, and learning insights</li>
                                        <li>Join a global marketplace for teachers and institutions</li>
                                    </ul>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="1" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">8. Is the content aligned with academic standards?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Yes. Kridemy offers content structured by <span className="fw-semibold text-theme4">grade, subject, and topic</span>, aligned with:
                                <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3 mt-2">
                                    <li>U.S. Common Core</li>
                                    <li>Indian state, CBSE &amp; ICSE</li>
                                    <li>And customizable for your institution’s needs</li>
                                </ul>
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="2" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">9. Can I monitor student progress?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Absolutely. With the <span className="fw-semibold text-theme4">Teacher Dashboard</span>, you’ll be able to see:
                                <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3 mt-2">
                                    <li>Quiz scores</li>
                                    <li>Time spent per lesson</li>
                                    <li>Accuracy and mastery levels</li>
                                    <li>Reward achievements</li>
                                    <li>Group vs. individual performance</li>
                                </ul>
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="3" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">10. Do teachers earn money for their content?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Yes. When you publish comics or quizzes and they’re reused or completed by students,
                                you earn a <span className="fw-semibold text-theme4">share of the revenue</span> through our <span className="fw-semibold text-theme4">Creator Economy</span> model.
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>

                {/* For Parents */}
                <div className="info-wrapper bg-theme1 border rounded-4 mb-4 px-3 px-md-4 py-4">
                    <div className="fs-4 fw-bold text-warning mb-3">For Parents -</div>

                    <Accordion defaultActiveKey="0" alwaysOpen flush className="d-flex flex-column gap-3">
                        {/* Q11 */}
                        <Accordion.Item eventKey="0" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">11. Is Kridemy safe for my child?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Yes, Kridemy is designed to be a safe, age-appropriate, and child-friendly platform:
                                <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3 mt-2">
                                    <li>No personal data is collected</li>
                                    <li>No chat or open forums</li>
                                    <li>Ads shown are non-personalized, kid-safe, and spaced out to avoid disruption</li>
                                </ul>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Q12 */}
                        <Accordion.Item eventKey="1" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">12. Will there be ads on the app?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Yes. To keep Kridemy free, we show non-personalized, age-appropriate ads. These:
                                <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3 mt-2">
                                    <li>Do not track users</li>
                                    <li>Are carefully vetted for educational or child-safe content</li>
                                    <li>Are limited in frequency based on market tier</li>
                                </ul>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Q13 */}
                        <Accordion.Item eventKey="2" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">13. What can I do as a parent on Kridemy?</span>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="wrapper mb-3 ps-3">
                                    <div className="fs-14 fw-semibold text-primary mb-2">Phase 1: Beta Launch</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3">
                                        <li>View child's progress via dashboard</li>
                                        <li>Track quiz completions and earned rewards</li>
                                    </ul>
                                </div>
                                <hr />
                                <div className="wrapper mb-3 ps-3">
                                    <div className="fs-14 fw-semibold text-primary mb-2">Phase 2: Coming Soon</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3">
                                        <li>Get performance notifications</li>
                                        <li>Set usage alerts and recommended daily learning goals</li>
                                    </ul>
                                </div>
                                <hr />
                                <div className="wrapper mb-3 ps-3">
                                    <div className="fs-14 fw-semibold text-primary mb-2">Phase 3: Future Features</div>
                                    <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3">
                                        <li>Set screen time controls and topic restrictions</li>
                                        <li>Receive weekly reports</li>
                                        <li>Gift in-app items to encourage learning</li>
                                    </ul>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Q14 */}
                        <Accordion.Item eventKey="3" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">14. How do I ensure my child isn't spending too much time?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Time-tracking tools and parental controls are being rolled out in upcoming phases.
                                You’ll soon be able to:
                                <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3 mt-2">
                                    <li>Set limits</li>
                                    <li>View detailed activity logs</li>
                                    <li>Disable or restrict advanced challenge modes</li>
                                </ul>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Q15 */}
                        <Accordion.Item eventKey="4" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">15. Will my child’s data ever be shared or sold?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Never. Kridemy does not collect or store any user-identifiable information.
                                We comply with COPPA, FERPA, and global data privacy standards.
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>

                {/* General / Technical FAQs */}
                <div className="info-wrapper bg-theme1 border rounded-4 px-3 px-md-4 py-4 mt-4">
                    <div className="fs-4 fw-bold text-warning mb-3">General / Technical FAQs -</div>

                    <Accordion defaultActiveKey="0" alwaysOpen flush className="d-flex flex-column gap-3">
                        {/* Q16 */}
                        <Accordion.Item eventKey="0" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">16. Is Kridemy free to use?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Yes! All educational features are free. Users can optionally purchase coins or gems for
                                aesthetic items, boosters, or premium features — but they can also be earned through gameplay.
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Q17 */}
                        <Accordion.Item eventKey="1" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">17. Which devices is Kridemy available on?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Currently available for Android smartphones. iOS and tablet versions are under development and will be announced soon.
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Q18 */}
                        <Accordion.Item eventKey="2" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">18. Is Kridemy available in other languages?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Multilingual support (Hindi, Spanish, French, and more) is planned. Our future versions will include
                                translated comics, voice narration, and subtitles.
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Q19 */}
                        <Accordion.Item eventKey="3" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">19. Can schools or educational institutions partner with Kridemy?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                Yes! Schools can:
                                <ul className="list-disc d-flex flex-column gap-2 m-0 ps-3 mt-2">
                                    <li>Use custom dashboards</li>
                                    <li>Align Kridemy content with internal curriculum</li>
                                    <li>Create multiple roles (admin, teacher, student)</li>
                                    <li>Co-brand learning campaigns and pilot programs</li>
                                </ul>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Q20 */}
                        <Accordion.Item eventKey="4" className="border">
                            <Accordion.Header>
                                <span className="fs-16 fw-bold text-theme4">20. How do I contact Kridemy for help or feedback?</span>
                            </Accordion.Header>
                            <Accordion.Body className="description">
                                We’re always listening!
                                <div>Email: <a href="mailto:customercare@kridemy.com" className="text-primary">customercare@kridemy.com</a></div>
                                <div>Contact Form: Available on our website under <span className="fw-semibold">Contact Us</span></div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>

            </div>
        </div>
    );
}

export default FAQLanding;
