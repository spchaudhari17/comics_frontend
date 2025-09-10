import React from 'react';
import "./Home.scss";
import { Row, Col, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner-section bg-theme1 d-flex align-items-center py-5">
        <div className="container-xl position-relative my-md-4">
          <Row className="align-items-center gx-4 gy-5">
            <Col md={6}>
              <div className="content-wrapper">
                <div className="heading text-light fs-1 fw-bold lh-sm mb-3">Turn Ideas Into <span className="text-primary">Comics.</span> <br />Learn. Teach. Earn.</div>
                <div className="sub-title text-white text-opacity-75">AI-generated educational comics and quizzes for schools, teachers, <br /> and curious minds.</div>
                <div className="btn-wrapper d-flex flex-column flex-sm-row flex-sm-wrap gap-2 gap-md-3 mt-4 pt-md-3">
                  <Button variant='primary' className="btn-custom" onClick={() => navigate('/create-comic')}>
                    <i class="bi bi-easel"></i> Make Comics from Concepts
                  </Button>
                  <Button variant='warning' className="btn-custom">
                    <i class="bi bi-folder2-open fs-18"></i> Browse Our Library
                  </Button>
                  <Button variant='success' className="btn-custom">
                    <i class="bi bi-google-play"></i> Download App
                  </Button>
                </div>
              </div>
            </Col>
            <Col md={6} className="text-center">
              <div className="img-wrapper text-center">
                <img src={require('../../assets/images/comic-process.png')} alt="Comic Transformation" className="img-fluid animate-bounce w-100" />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section bg-white py-5">
        <div className="container-xl my-md-4">
          <Row className="align-items-center g-5">
            <Col md={6} className="left-section">
              <div className="label-heading mb-2">About Us</div>
              <div className="section-heading mb-3">Kridemy Introduction</div>
              <div className="sub-title mb-4">Kridemy is an AI-powered education platform that helps you learn and teach complex academic concepts through fun, visually rich comic stories and gamified quizzes.</div>
              <ul className="d-flex flex-column gap-2 ps-3">
                <li>K–12 Focused</li>
                <li>AI Comic & Quiz Engine</li>
                <li>Built for Classroom Impact</li>
                <li>Revenue for Teachers</li>
              </ul>
              <div className="btn-wrapper d-flex flex-wrap gap-3 mt-4 pt-3">
                <Button variant='primary' className="btn-custom" onClick={() => navigate('/create-comic')}>
                  Learn More <i className="bi bi-arrow-right"></i>
                </Button>
              </div>
            </Col>
            <Col md={6} className="right-section">
              <div className="img-wrapper position-relative text-center">
                <img src={require('../../assets/images/about-image-2.png')} className="img-fluid animate-bounce border border-primary rounded-circle mx-auto" alt="" style={{ width: '370px' }} />
                {/* <div className="animated-img-wrapper position-absolute bottom-0 end-0">
                  <img src={require('../../assets/images/about-image-1.png')} className="img-fluid " alt="" />
                  <span className="animation-div"></span>
                </div> */}
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* What We Do */}
      <section className="what-we-do-section bg-theme2 py-5">
        <div className="container-xl my-md-4">
          <div className="heading-wrapper text-center mx-auto mb-4 pb-2 pb-md-4" style={{ maxWidth: '600px' }}>
            <div className="section-heading mb-2">What We Do</div>
            <div className="sub-title text-muted">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</div>
          </div>
          <Row className="g-3 g-xl-4">
            <Col sm={6} lg={3}>
              <div className="item-wrapper bg-primary bg-opacity-25 h-100 rounded-4 text-center">
                <div className="icon text-center mb-4">
                  <img src={require('../../assets/images/ai-generator.png')} alt="AI Generator" className="img-fluid" />
                </div>
                <div class="title-name fs-5 fw-bold text-black mb-2">AI Comic Generator</div>
                <div className="description text-muted">Turn any topic into a fully-illustrated, age-appropriate comic. Add narration, select a visual style, and let AI do the rest.</div>
              </div>
            </Col>
            <Col sm={6} lg={3}>
              <div className="item-wrapper bg-success bg-opacity-25 h-100 rounded-4 text-center">
                <div className="icon text-center mb-4">
                  <img src={require('../../assets/images/quiz-engine.png')} alt="Quiz Engine" className="img-fluid" />
                </div>
                <div class="title-name fs-5 fw-bold text-black mb-2">Quiz Engine</div>
                <div className="description text-muted">Automatically generates interactive, difficulty-ranked quizzes from each comic, including FAQ and “Did You Know” sections.</div>
              </div>
            </Col>
            <Col sm={6} lg={3}>
              <div className="item-wrapper bg-info bg-opacity-25 h-100 rounded-4 text-center">
                <div className="icon text-center mb-4">
                  <img src={require('../../assets/images/create-platform.png')} alt="Creator Platform" className="img-fluid" />
                </div>
                <div class="title-name fs-5 fw-bold text-black mb-2">Creator Platform for Teachers</div>
                <div className="description text-muted">Publish your own comics, monitor student impact, and earn from your content.</div>
              </div>
            </Col>
            <Col sm={6} lg={3}>
              <div className="item-wrapper bg-danger bg-opacity-25 h-100 rounded-4 text-center">
                <div className="icon text-center mb-4">
                  <img src={require('../../assets/images/safe-learning.png')} alt="Safe Learning" className="img-fluid" />
                </div>
                <div class="title-name fs-5 fw-bold text-black mb-2">Safe, Modular Learning</div>
                <div className="description text-muted">COPPA/FERPA-considerate with school-friendly dashboards and privacy-aware moderation.</div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section bg-theme1 py-5">
        <div className="container-xl my-md-4">
          <div className="heading-wrapper text-center mx-auto mb-4 pb-2 pb-md-4" style={{ maxWidth: '600px' }}>
            <div className="section-heading mb-2">How It Works</div>
            <div className="sub-title text-muted">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</div>
          </div>
          <Row className="g-3 g-xl-4">
            <Col md={4} sm={6}>
              <div className="item-wrapper h-100 border border-theme2 rounded-4 text-center">
                <div className="indicator-arrow">
                  <img src={require('../../assets/images/indicator-arrow-1.png')} alt="Indicator Arrow" />
                </div>
                <div className="icon-wrap animate-bounce mb-3">
                  <i className="bi bi-book"></i>
                </div>
                <div className="title-name fs-5 fw-bold text-black mb-2">Choose Topic & Grade</div>
                <div className="description text-muted">Pick a subject and level to start your journey.</div>
              </div>
            </Col>
            <Col md={4} sm={6}>
              <div className="item-wrapper h-100 border border-theme2 rounded-4 text-center">
                <div className="indicator-arrow d-sm-none d-md-block">
                  <img src={require('../../assets/images/indicator-arrow-2.png')} alt="Indicator Arrow" />
                </div>
                <div className="icon-wrap animate-bounce mb-3">
                  <i className="bi bi-palette"></i>
                </div>
                <div className="title-name fs-5 fw-bold text-black mb-2">Select Style</div>
                <div className="description text-muted">Go realistic, fantasy, or any creative theme you like.</div>
              </div>
            </Col>
            <Col md={4} sm={6}>
              <div className="item-wrapper h-100 border border-theme2 rounded-4 text-center">
                <div className="indicator-arrow d-block d-md-none">
                  <img src={require('../../assets/images/indicator-arrow-2.png')} alt="Indicator Arrow" />
                </div>
                <div className="icon-wrap animate-bounce mb-3">
                  <i className="bi bi-cpu"></i>
                </div>
                <div className="title-name fs-5 fw-bold text-black mb-2">Edit or Use AI Script</div>
                <div className="description text-muted">Write your own or let AI draft the storyline.</div>
              </div>
            </Col>
            <Col md={4} sm={6}>
              <div className="item-wrapper h-100 border border-theme2 rounded-4 text-center">
                <div className="indicator-arrow d-sm-none d-md-block">
                  <img src={require('../../assets/images/indicator-arrow-1.png')} alt="Indicator Arrow" />
                </div>
                <div className="icon-wrap animate-bounce mb-3">
                  <i className="bi bi-eye"></i>
                </div>
                <div className="title-name fs-5 fw-bold text-black mb-2">Review Comic & Quiz</div>
                <div className="description text-muted">Preview visuals and interactive learning questions.</div>
              </div>
            </Col>
            <Col md={4} sm={6}>
              <div className="item-wrapper h-100 border border-theme2 rounded-4 text-center">
                <div className="indicator-arrow d-block">
                  <img src={require('../../assets/images/indicator-arrow-2.png')} alt="Indicator Arrow" />
                </div>
                <div className="icon-wrap animate-bounce mb-3">
                  <i className="bi bi-question-circle"></i>
                </div>
                <div className="title-name fs-5 fw-bold text-black mb-2">Add FAQs & Fun Facts</div>
                <div className="description text-muted">Make learning fun and engaging with insights.</div>
              </div>
            </Col>
            <Col md={4} sm={6}>
              <div className="item-wrapper h-100 border border-theme2 rounded-4 text-center">
                <div className="icon-wrap animate-bounce mb-3">
                  <i className="bi bi-share"></i>
                </div>
                <div className="title-name fs-5 fw-bold text-black mb-2">Publish & Share</div>
                <div className="description text-muted">Go live and share your creation with the world.</div>
              </div>
            </Col>
          </Row>
          <div className="btn-wrapper text-center mt-5">
            <Button variant='primary' className="btn-custom" onClick={() => navigate('/create-comic')}>
              Start Creating <i className="bi bi-arrow-right"></i>
            </Button>
          </div>
        </div>
      </section>

      {/* Whoom To Experience Section */}
      <section className="whoom-to-experience-section how-it-works-section bg-success bg-opacity-10 py-5">
        <div className="container-xl my-md-4">
          <div className="heading-wrapper text-center mx-auto mb-4 pb-2 pb-md-4" style={{ maxWidth: '600px' }}>
            <div className="section-heading mb-2">Whoom to Experience</div>
            <div className="sub-title text-muted">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</div>
          </div>
          <Row className="g-3 g-xl-4">
            <Col md={6} lg={4}>
              <div className="item-wrapper bg-white h-100 rounded-4">
                <div className="icon animate-bounce mb-4">
                  <img src={require('../../assets/images/teacher.png')} alt="Teacher" className="img-fluid" />
                </div>
                <div class="title-name fs-5 fw-bold text-black mb-1">For Teachers</div>
                <div className="description text-muted mb-3">Kridemy empowers educators to <span className="text-black fw-semibold">create, customize, and earn</span> from interactive comic lessons.</div>
                <div className="list-wrapper">
                  <div className="fs-6 fw-semibold text-warning mb-2">Features:</div>
                  <ul className="list-wrapper d-flex flex-column gap-2 ps-3">
                    <li>Align comics with curriculum goals</li>
                    <li>Use AI-generated scripts, or write your own</li>
                    <li>Get FAQs, quizzes, and “Did You Know” facts pre-made</li>
                    <li>Track content views, quiz scores, and student performance</li>
                    <li>Revenue-share model for approved comics</li>
                    <li>Use in-class or assign as homework</li>
                  </ul>
                  <div className="fs-12 text-primary"><i class="bi bi-stars"></i> Pilot-ready platform — contact us for school deployments.</div>
                </div>
              </div>
            </Col>
            <Col md={6} lg={4}>
              <div className="item-wrapper bg-white h-100 rounded-4">
                <div className="icon animate-bounce mb-4">
                  <img src={require('../../assets/images/students.png')} alt="Students" className="img-fluid" />
                </div>
                <div class="title-name fs-5 fw-bold text-black mb-1">For Students</div>
                <div className="description text-muted mb-3">Whether you love comics, hate textbooks, or just want to learn faster — Kridemy is made for you.</div>
                <div className="list-wrapper">
                  <div className="fs-6 fw-semibold text-warning mb-2">What you get:</div>
                  <ul className="d-flex flex-column gap-2 ps-3">
                    <li>Comics that explain complex ideas simply</li>
                    <li>Interactive quizzes & mini games</li>
                    <li>Earn coins, XP, badges, and power-ups</li>
                    <li>Unlock content by watching or learning</li>
                    <li>learn on the go</li>
                    <li>Challenge friends in 1v1 quiz battles</li>
                  </ul>
                </div>
              </div>
            </Col>
            <Col lg={4}>
              <div className="item-wrapper bg-white h-100 rounded-4">
                <div className="icon animate-bounce mb-4">
                  <img src={require('../../assets/images/parents.png')} alt="parents" className="img-fluid" />
                </div>
                <div class="title-name fs-5 fw-bold text-black mb-1">For Parents</div>
                <div className="description text-muted mb-3">Finally — screen time that actually teaches.</div>
                <div className="list-wrapper">
                  <div className="fs-6 fw-semibold text-warning mb-2">Why parents love Kridemy:</div>
                  <ul className="d-flex flex-column gap-2 ps-3">
                    <li>Child-safe, teacher-moderated content</li>
                    <li>No chatrooms or distractions</li>
                    <li>Supports school topics with fun visual reinforcement</li>
                    <li>Track your child’s progress, performance & strengths</li>
                    <li>Designed for K–12, with age-level filters</li>
                  </ul>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Download Our App Section */}
      <div className="download-app-sec section-bg-image section-bg-overlay py-5">
        <div className="container-xl position-relative my-3 my-lg-5">
          <Row className="align-items-center gx-4 gy-5">
            <Col lg={6}>
              <div className="wrapper text-center text-lg-start">
                <div className="heading-wrapper mb-4 pb-2">
                  <div className="section-heading text-white mb-3">Download Our App</div>
                  <div className="sub-title text-white">Available for Android and iOS. Free for students and early creators.</div>
                </div>

                <div className="fs-18 fw-medium text-primary gap-4">
                  <div className="mb-2"><i class="bi bi-stars"></i> No sign-in required for basic use</div>
                  <div><i class="bi bi-stars"></i> One-tap install from browser (PWA supported)</div>
                </div>

                <div className="app-btn-wrapper d-flex flex-wrap justify-content-center justify-content-lg-start gap-3 mt-5">
                  <Link to={'https://appstoreconnect.apple.com/login'} target="_blank">
                    <img src={require('../../assets/images/app-store.png')} className="img-fluid" alt='App Store' />
                  </Link>
                  <Link className="text-md-end" to={'https://play.google.com/store/games'} target="_blank">
                    <img src={require('../../assets/images/play-store.png')} className="img-fluid" alt='Google Play Store' />
                  </Link>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="device-img-wrapper d-flex gap-4 animate-bounce mt-5 mt-lg-0">
                <img src={require('../../assets/images/comic-process.png')} alt="Website Mobile View" className="img-fluid" />
                <img src={require('../../assets/images/site-mobile-img.png')} alt="Website Mobile View" className="img-fluid mobile-device-frame" />
              </div>
            </Col>
          </Row>

        </div>
      </div>
    </div>
  )
}
