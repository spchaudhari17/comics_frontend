import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Row, Col } from 'react-bootstrap';

// react swiper slider
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export const AboutUs = () => {
    const navigate = useNavigate();

    const testimonials = [
        {
            name: "Stive Marlon",
            role: "Web Developer",
            image: "https://randomuser.me/api/portraits/men/32.jpg",
            feedback:
                "I had an amazing experience at EduVibe. The instructors were knowledgeable and passionate, and the coursework was challenging and relevant to my future career.",
        },
        {
            name: "James Carlson",
            role: "UI/UX Designer",
            image: "https://randomuser.me/api/portraits/men/44.jpg",
            feedback:
                "The online courses at EduVibe were the perfect fit for my busy schedule. I was able to work full-time while pursuing my degree, thanks to the flexibility and convenience of online learning.",
        },
        {
            name: "Nancy Phipps",
            role: "Digital Marketer",
            image: "https://randomuser.me/api/portraits/women/65.jpg",
            feedback:
                "Attending EduVibe School of Business was one of the best decisions I've ever made. The curriculum was practical and industry-focused, and I was able to apply what I learned in the classroom.",
        },
        {
            name: "Stive Marlon",
            role: "Web Developer",
            image: "https://randomuser.me/api/portraits/men/32.jpg",
            feedback:
                "I had an amazing experience at EduVibe. The instructors were knowledgeable and passionate, and the coursework was challenging and relevant to my future career.",
        },
        {
            name: "James Carlson",
            role: "UI/UX Designer",
            image: "https://randomuser.me/api/portraits/men/44.jpg",
            feedback:
                "The online courses at EduVibe were the perfect fit for my busy schedule. I was able to work full-time while pursuing my degree, thanks to the flexibility and convenience of online learning.",
        },
        {
            name: "Nancy Phipps",
            role: "Digital Marketer",
            image: "https://randomuser.me/api/portraits/women/65.jpg",
            feedback:
                "Attending EduVibe School of Business was one of the best decisions I've ever made. The curriculum was practical and industry-focused, and I was able to apply what I learned in the classroom.",
        },
    ];

    return (
        <div className="AboutUs-Page">
            {/* Breadcrumb Banner Section */}
            <section className="breadcrumb-banner-section py-5">
                <div className="container-xl position-relative z-1">
                    <div className="page-header text-white text-uppercase text-center">
                        <div className="section-heading text-white mb-2">About Us</div>
                        <ul className="list-unstyled d-flex justify-content-center gap-2 mb-0">
                            <li className="text-white">Home</li>
                            <li><span>/</span></li>
                            <li className="text-warning">About</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* About Company Section */}
            <section className="about-cmpny-sec bg-secondary bg-opacity-10 py-5">
                <div className="container-xl my-md-4">
                    <Row className="align-items-center gx-md-5 gy-4">
                        <Col lg={6}>
                            <div data-aos="slide-right" className="img-wrapper position-relative">
                                <img src={require('../assets/images/about-image-3.jpg')} className="img-fluid w-100" alt="About Company" />
                                <div className="img-frame position-absolute top-50 start-50 translate-middle z-1"></div>
                            </div>
                        </Col>

                        <Col lg={6}>
                            <div data-aos="slide-left" className="content-wrapper">
                                <div className="label-heading mb-2">About Us</div>
                                <div className="section-heading mb-3 mb-xl-4">Knowledge is power, Information is liberating.</div>
                                <div className="our-mission-wrapper mb-4">
                                    <div className="fs-5 fw-bold text-warning mb-2">Our Mission</div>
                                    <p className="mb-4">
                                        To make education engaging and accessible by transforming learning
                                        into interactive comics, empowering students and teachers with
                                        creativity and fun.
                                    </p>
                                    <p>
                                        Our mission is to revolutionize the way education is delivered by
                                        blending storytelling with technology. We aim to make complex topics
                                        simple, fun, and interactive through the power of comics and gamified
                                        learning.
                                    </p>
                                    <p>
                                        By providing teachers and students with an AI-driven platform, we
                                        foster creativity, boost engagement, and make learning an enjoyable
                                        experience for every learner—regardless of their age, background, or
                                        location.
                                    </p>
                                </div>
                                <div className="our-vision-wrapper">
                                    <div className="fs-5 fw-bold text-warning mb-2">Our Vision</div>
                                    <p>
                                        Our vision is to create a global community where education is not
                                        just a requirement, but a journey of imagination. We envision a world
                                        where textbooks transform into living stories, classrooms evolve into
                                        interactive hubs, and students discover their potential through
                                        curiosity and play.
                                    </p>
                                    <p>
                                        By bridging the gap between creativity and knowledge, we aspire to
                                        become the leading platform for innovative educational storytelling,
                                        inspiring generations to learn and grow.
                                    </p>
                                </div>
                                <div className="btn-wrapper mt-4 pt-3">
                                    <Button variant='primary' className="btn-custom" onClick={() => navigate('/create-comic')}>Create Comic <i className="bi bi-arrow-right"></i></Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* Counter Section */}
            {/* <section className="counters-section bg-black position-relative py-5">
                <div className="container-xl position-relative my-md-4">
                    <Row className="g-4">
                        <Col xs={6} md={3} className="counter-item">
                            <div className="counter-icon mb-2">
                                <img src={require('../assets/images/service1.png')} alt="Service" className="img-fluid" />
                            </div>
                            <div className="count-num fs-2 fw-bold text-primary mb-1">305</div>
                            <p className="counter-label text-uppercase">Comic Generated</p>
                        </Col>
                        <Col xs={6} md={3} className="counter-item">
                            <div className="counter-icon mb-2">
                                <img src={require('../assets/images/service2.png')} alt="Service" className="img-fluid" />
                            </div>
                            <div className="count-num fs-2 fw-bold text-primary mb-1">906</div>
                            <p className="counter-label text-uppercase">Active Users</p>
                        </Col>
                        <Col xs={6} md={3} className="counter-item">
                            <div className="counter-icon mb-2">
                                <img src={require('../assets/images/service3.png')} alt="Service" className="img-fluid" />
                            </div>
                            <div className="count-num fs-2 fw-bold text-primary mb-1">200</div>
                            <p className="counter-label text-uppercase">Service Providing</p>
                        </Col>
                        <Col xs={6} md={3} className="counter-item">
                            <div className="counter-icon mb-2">
                                <img src={require('../assets/images/service4.png')} alt="Service" className="img-fluid" />
                            </div>
                            <div className="count-num fs-2 fw-bold text-primary mb-1">760</div>
                            <p className="counter-label text-uppercase">Happy Customers</p>
                        </Col>
                    </Row>
                </div>
            </section> */}

            {/* Testimonials Section */}
            {/* <section className="testimonials-section bg-theme2 py-5">
                <div className="container-xl my-md-4">
                    <div className="heading-wrapper text-center mx-auto mb-4 pb-2 pb-md-4" style={{ maxWidth: '600px' }}>
                        <h1 className="section-heading mb-2">Our Testimonials</h1>
                        <div className="sub-title text-muted">Our Lovely Customers Feedback</div>
                    </div>

                    <Swiper className="custom-swiper"
                        modules={[Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        loop={true}
                        autoplay={{
                            delay: 3000, // 3 seconds
                            disableOnInteraction: false, // keep autoplay after user swipe
                        }}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            768: { slidesPerView: 2 },
                            992: { slidesPerView: 3 },
                        }}
                    >
                        {testimonials.map((t, i) => (
                            <SwiperSlide key={i}>
                                <div className="testimonial-card p-4 shadow-sm bg-white rounded-4 h-100">
                                    <div className="d-flex align-items-center mb-3">
                                        <img src={t.image} alt={t.name} className="rounded-circle me-3" width={50} height={50} />
                                        <div className="info">
                                            <div className="user-name fs-16 fw-bold text-black">{t.name}</div>
                                            <div className="user-role fs-14 text-muted">{t.role}</div>
                                        </div>
                                    </div>
                                    <div className="feedback-description fs-14 text-body mb-3">“ {t.feedback} ”</div>
                                    <div className="fs-5 text-primary d-flex gap-2">
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section> */}

            {/* Our Team Section */}
            <section className="our-team-sec bg-white py-5">
                <div className="container-xl my-md-4">
                    <div className="heading-wrapper text-center mx-auto mb-5 pb-sm-2" style={{ maxWidth: '600px' }}>
                        <h1 className="section-heading mb-2">Meet The Expert Team</h1>
                        <div className="sub-title text-muted">Leaders, innovators, and professionals dedicated to shaping the future.</div>
                    </div>

                    {/* <div className="team-wrapper mx-auto" style={{ maxWidth: '900px' }}>
                        <Row className="align-items-center g-4 gx-md-5">
                            <Col md={5}>
                                <div data-aos="zoom-in" className="img-cover border border-primary mx-auto p-3" style={{ maxWidth: '350px' }}>
                                    <img src={require('../assets/images/team1.jpeg')} className="img-fluid" alt="Team Member" />
                                </div>
                            </Col>
                            <Col md={7}>
                                <div className="team-info">
                                    <div className="name fs-4 fw-bold text-black text-capitalize mb-2">Ajinkya Sham Vidhate</div>
                                    <div className="designation fs-14 text-primary fw-medium mb-4">PMP® | MBA in Logistics & Supply Chain Management | M.S. in Supply Chain Analytics</div>
                                    <div className="description mb-2">
                                        <p>Founder of Kridemy and a certified project management professional, with dual master’s degrees in <span className="highlight">Supply Chain Analytics (Rutgers Business School, USA)</span> and <span className="highlight">Logistics & Supply Chain Management (XLRI Jamshedpur, India).</span></p>
                                        <p>Previously led the end-to-end development and operations of <span className="highlight">Shree Gurudatta Lawns</span>, a large-scale event venue in India, and managed multiple supply chain analytics projects across education and industry domains.</p>
                                        <p>Combining entrepreneurial experience with a passion for data and design, he is building Kridemy to make learning more engaging, gamified, and accessible — one scroll at a time.</p>
                                    </div>
                                    <div className="social-wrapper d-flex align-items-center justify-content-center gap-3 mt-2">
                                            <Link to="https://www.facebook.com/" className="fs-16"><i className="bi bi-facebook"></i></Link>
                                            <Link to="https://twitter.com/" className="fs-16"><i className="bi bi-twitter"></i></Link>
                                            <Link to="https://www.instagram.com/" className="fs-16"><i className="bi bi-instagram"></i></Link>
                                            <Link to="https://in.linkedin.com/" className="fs-16"><i className="bi bi-linkedin"></i></Link>
                                        </div>
                                </div>
                            </Col>
                        </Row>
                    </div> */}

                    <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 justify-content-center gx-md-4 gx-xxl-5 gy-5">
                        <div data-aos="slide-right" className="team-wrapper text-center">
                            <div className="img-wrapper p-3">
                                <img src={require('../assets/images/team1.jpeg')} className="img-fluid" alt="Team Member" />
                                <div className="member-description position-absolute start-0 top-0 end-0 bottom-0 z-2">
                                    <div className="content-wrapper p-3">
                                        <div className="mb-3">Founder of Kridemy and a certified project management professional, with dual master’s degrees in <span className="highlight">Supply Chain Analytics (Rutgers Business School, USA)</span> and <span className="highlight">Logistics & Supply Chain Management (XLRI Jamshedpur, India).</span></div>
                                        <div className="mb-3">Previously led the end-to-end development and operations of <span className="highlight">Shree Gurudatta Lawns</span>, a large-scale event venue in India, and managed multiple supply chain analytics projects across education and industry domains.</div>
                                        <div>Combining entrepreneurial experience with a passion for data and design, he is building Kridemy to make learning more engaging, gamified, and accessible — one scroll at a time.</div>
                                    </div>
                                </div>
                            </div>
                            <div className="team-info text-center mt-3">
                                <div className="name fs-16 fw-semibold text-black text-capitalize mb-1">Ajinkya Sham Vidhate</div>
                                <div className="designation fs-12 text-muted text-capitalize mb-2">PMP® | MBA in Logistics & Supply Chain Management | M.S. in Supply Chain Analytics</div>
                                <div className="social-wrapper d-flex align-items-center justify-content-center gap-3 mt-2">
                                    <Link to="https://www.facebook.com/" className="fs-16"><i className="bi bi-facebook"></i></Link>
                                    <Link to="https://twitter.com/" className="fs-16"><i className="bi bi-twitter"></i></Link>
                                    <Link to="https://www.instagram.com/" className="fs-16"><i className="bi bi-instagram"></i></Link>
                                    <Link to="https://in.linkedin.com/" className="fs-16"><i className="bi bi-linkedin"></i></Link>
                                </div>
                            </div>
                        </div>
                        <div data-aos="slide-right" className="team-wrapper text-center">
                            <div className="img-wrapper p-3">
                                <img src={require('../assets/images/team2.jpeg')} className="img-fluid" alt="Team Member" />
                                <div className="member-description position-absolute start-0 top-0 end-0 bottom-0 z-2">
                                    <div className="content-wrapper p-3">
                                        <div className="mb-3">Lead a cross-functional team of <span className="highlight">mobile developer, web developer, and web designer</span>, ensuring seamless coordination across all development streams. Defined and executed the technical strategy to align with project goals and milestones. <span className="highlight">Monitored team performance, tracked progress, and ensured timely delivery</span> with high-quality standards.</div>
                                        <div>Provided continuous mentorship, guidance, and technical support to the team, helping resolve challenges and maintaining overall project efficiency throughout the development lifecycle.</div>
                                    </div>
                                </div>
                            </div>
                            <div className="team-info text-center mt-3">
                                <div className="name fs-16 fw-semibold text-black text-capitalize mb-1">Mohammad Yunus</div>
                                <div className="designation fs-12 text-muted text-capitalize mb-2">Tech Lead (Mobile app and Website development)</div>
                                <div className="social-wrapper d-flex align-items-center justify-content-center gap-3 mt-2">
                                    <Link to="https://www.facebook.com/" className="fs-16"><i className="bi bi-facebook"></i></Link>
                                    <Link to="https://twitter.com/" className="fs-16"><i className="bi bi-twitter"></i></Link>
                                    <Link to="https://www.instagram.com/" className="fs-16"><i className="bi bi-instagram"></i></Link>
                                    <Link to="https://in.linkedin.com/" className="fs-16"><i className="bi bi-linkedin"></i></Link>
                                </div>
                            </div>
                        </div>
                        <div className="team-wrapper text-center">
                            <div className="img-wrapper p-3">
                                <img src={require('../assets/images/team3.jpeg')} className="img-fluid" alt="Team Member" />
                                <div className="member-description position-absolute start-0 top-0 end-0 bottom-0 z-2">
                                    <div className="content-wrapper p-3">
                                        <div className="mb-3">
                                            As a Senior Web Designer, I design <span className="highlight">responsive, modern, and user-focused</span> web interfaces. 
                                            I transform requirements into visually appealing web pages using <span className="highlight">React, Bootstrap, custom UI components, icons, images, and animations.</span>
                                        </div>
                                        <div>
                                            I ensure consistent branding, high usability, and smooth navigation across all devices. 
                                            I also contributed to the Kridemy project by building major pages with clean layouts, interactive features, animation effects, and fully responsive designs.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="team-info text-center mt-3">
                                <div className="name fs-16 fw-semibold text-black text-capitalize mb-1">Vasheem Ahmad</div>
                                <div className="designation fs-12 text-muted text-capitalize mb-2">Senior Web Designer (Expert in Website Design | Mobile-First Layouts)</div>
                                <div className="social-wrapper d-flex align-items-center justify-content-center gap-3 mt-2">
                                    <Link to="https://www.facebook.com/" className="fs-16"><i className="bi bi-facebook"></i></Link>
                                    <Link to="https://twitter.com/" className="fs-16"><i className="bi bi-twitter"></i></Link>
                                    <Link to="https://www.instagram.com/" className="fs-16"><i className="bi bi-instagram"></i></Link>
                                    <Link to="https://in.linkedin.com/" className="fs-16"><i className="bi bi-linkedin"></i></Link>
                                </div>
                            </div>
                        </div>
                        <div data-aos="slide-left" className="team-wrapper text-center">
                            <div className="img-wrapper p-3">
                                <img src={require('../assets/images/team4.jpeg')} className="img-fluid" alt="Team Member" />
                                <div className="member-description position-absolute start-0 top-0 end-0 bottom-0 z-2">
                                    <div className="content-wrapper p-3">
                                        <div className="mb-3">Founder of Kridemy and a certified project management professional, with dual master’s degrees in <span className="highlight">Supply Chain Analytics (Rutgers Business School, USA)</span> and <span className="highlight">Logistics & Supply Chain Management (XLRI Jamshedpur, India).</span></div>
                                        <div>Combining entrepreneurial experience with a passion for data and design, he is building Kridemy to make learning more engaging, gamified, and accessible — one scroll at a time.</div>
                                    </div>
                                </div>
                            </div>
                            <div className="team-info text-center mt-3">
                                <div className="name fs-16 fw-semibold text-black text-capitalize mb-1">Shubham Prakash Chaudhari</div>
                                <div className="designation fs-12 text-muted text-capitalize mb-2">Software Engineer (Designated role is Full Stack Developer)</div>
                                <div className="social-wrapper d-flex align-items-center justify-content-center gap-3 mt-2">
                                    <Link to="https://www.facebook.com/" className="fs-16"><i className="bi bi-facebook"></i></Link>
                                    <Link to="https://twitter.com/" className="fs-16"><i className="bi bi-twitter"></i></Link>
                                    <Link to="https://www.instagram.com/" className="fs-16"><i className="bi bi-instagram"></i></Link>
                                    <Link to="https://in.linkedin.com/" className="fs-16"><i className="bi bi-linkedin"></i></Link>
                                </div>
                            </div>
                        </div>
                        <div data-aos="slide-left" className="team-wrapper text-center">
                            <div className="img-wrapper p-3">
                                <img src={require('../assets/images/team4.jpeg')} className="img-fluid" alt="Team Member" />
                                <div className="member-description position-absolute start-0 top-0 end-0 bottom-0 z-2">
                                    <div className="content-wrapper p-3">
                                        <div className="mb-3">Founder of Kridemy and a certified project management professional, with dual master’s degrees in <span className="highlight">Supply Chain Analytics (Rutgers Business School, USA)</span> and <span className="highlight">Logistics & Supply Chain Management (XLRI Jamshedpur, India).</span></div>
                                        <div>Combining entrepreneurial experience with a passion for data and design, he is building Kridemy to make learning more engaging, gamified, and accessible — one scroll at a time.</div>
                                    </div>
                                </div>
                            </div>
                            <div className="team-info text-center mt-3">
                                <div className="name fs-16 fw-semibold text-black text-capitalize mb-1">Charul</div>
                                <div className="designation fs-12 text-muted text-capitalize mb-2">Software Engineer (Mobile App Development)</div>
                                <div className="social-wrapper d-flex align-items-center justify-content-center gap-3 mt-2">
                                    <Link to="https://www.facebook.com/" className="fs-16"><i className="bi bi-facebook"></i></Link>
                                    <Link to="https://twitter.com/" className="fs-16"><i className="bi bi-twitter"></i></Link>
                                    <Link to="https://www.instagram.com/" className="fs-16"><i className="bi bi-instagram"></i></Link>
                                    <Link to="https://in.linkedin.com/" className="fs-16"><i className="bi bi-linkedin"></i></Link>
                                </div>
                            </div>
                        </div>
                    </Row>
                </div>
            </section>
        </div>
    )
}
