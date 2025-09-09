import React from 'react';
import "./Home.scss";
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner-section bg-theme1 d-flex align-items-center py-5">
        <div className="container-xl position-relative py-4">
          <div className="row align-items-center g-4">
            <div className="col-md-6">
              <div className="content-wrapper">
                <div className="heading text-light fs-1 fw-bold lh-sm mb-3">Turn Ideas Into <span className="text-primary">Comics.</span> <br />Learn. Teach. Earn.</div>
                <div className="sub-title text-white text-opacity-75">AI-generated educational comics and quizzes for schools, teachers, <br /> and curious minds.</div>
                <div className="btn-wrapper d-flex flex-wrap gap-3 mt-4 pt-3">
                  <Button variant='primary' className="btn-custom" onClick={() => navigate('/create-comic')}>Make Comics from Concepts</Button>
                  <Button variant='warning' className="btn-custom">Browse Our Library</Button>
                  <Button variant='info' className="btn-custom">Download App</Button>
                </div>
              </div>
            </div>
            <div className="col-md-6 text-center">
              <img src={require('../../assets/images/comic-process.png')} className="img-fluid rounded shadow" alt="Comic Transformation" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-5">
        <div className="container text-center">
          <div className="main-heading mb-3">About Kridemy</div>
          <p className="lead text-muted mb-4">
            Kridemy is an AI-powered education platform that helps you learn and teach complex academic concepts through fun, visually rich comic stories and gamified quizzes.
          </p>
          <div className="row g-4">
            <div className="col-md-3"><div className="p-3 border rounded">K–12 Focused</div></div>
            <div className="col-md-3"><div className="p-3 border rounded">AI Comic & Quiz Engine</div></div>
            <div className="col-md-3"><div className="p-3 border rounded">Built for Classroom Impact</div></div>
            <div className="col-md-3"><div className="p-3 border rounded">Revenue for Teachers</div></div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="main-heading text-center mb-3">What We Do</div>
          <div className="row g-4">
            <div className="col-md-6">
              <h5>AI Comic Generator</h5>
              <p>Turn any topic into a fully-illustrated, age-appropriate comic. Add narration, select a visual style, and let AI do the rest.</p>
            </div>
            <div className="col-md-6">
              <h5>Quiz Engine</h5>
              <p>Automatically generates interactive, difficulty-ranked quizzes from each comic, including FAQ and “Did You Know” sections.</p>
            </div>
            <div className="col-md-6">
              <h5>Creator Platform for Teachers</h5>
              <p>Publish your own comics, monitor student impact, and earn from your content.</p>
            </div>
            <div className="col-md-6">
              <h5>Safe, Modular Learning</h5>
              <p>COPPA/FERPA-considerate with school-friendly dashboards and privacy-aware moderation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-5">How It Works</h2>
          <div className="workflow-steps">
            <div className="workflow-step"><i className="bi bi-search fs-2 text-primary"></i><p>Choose Topic & Grade</p></div>
            <div className="workflow-step"><i className="bi bi-brush fs-2 text-success"></i><p>Select Style</p></div>
            <div className="workflow-step"><i className="bi bi-pencil-square fs-2 text-warning"></i><p>Edit or Use Script</p></div>
            <div className="workflow-step"><i className="bi bi-book fs-2 text-info"></i><p>Review Comic & Quiz</p></div>
            <div className="workflow-step"><i className="bi bi-question-circle fs-2 text-danger"></i><p>Add FAQs & Facts</p></div>
            <div className="workflow-step"><i className="bi bi-share fs-2 text-primary"></i><p>Publish & Share</p></div>
          </div>
          <div className="mt-4">
            <a href="#" className="btn btn-lg btn-primary">Start Creating</a>
          </div>
        </div>
      </section>
    </div>
  )
}
