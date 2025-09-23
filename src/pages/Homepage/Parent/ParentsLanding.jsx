import React from 'react';

const ParentsLanding = () => {
  return (
    <div className="ForTeachers-Page pb-5">
      {/* Breadcrumb Banner Section */}
      <section className="breadcrumb-banner-section py-5">
        <div className="container-xl position-relative z-1">
          <div className="page-header text-white text-uppercase text-center">
            <div className="section-heading text-white mb-2">For Parents</div>
            <div className="label-heading mb-3">Stay Informed. Stay Engaged. Support Smarter Learning</div>
          </div>
        </div>
      </section>

      <div className="container-xl mt-5">
        <div className="product-offerings-wrapper mb-5">
          <div className="fs-4 fw-bold text-warning mb-2">Product Offerings -</div>
          <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4">
            <div className="col">
              <div data-aos="zoom-in-up" className="info-wrapper d-flex flex-column justify-content-between bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="content-wrapper mb-4">
                  <div className="fs-16 fw-bold text-theme4 mb-2">1. Progress & Performance Dashboard</div>
                  <ul className="list-disc d-flex flex-column gap-2 m-0">
                    <li>Visual progress across subjects and topics.</li>
                    <li>Alerts for lesson completion, low scores, and rewards.</li>
                  </ul>
                </div>
                <div className="activity-img">
                  <img src={require('../../../assets/images/activity-images/activity-img17.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                </div>
              </div>
            </div>
            <div className="col">
              <div data-aos="zoom-in-up" className="info-wrapper d-flex flex-column justify-content-between bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="content-wrapper mb-4">
                  <div className="fs-16 fw-bold text-theme4 mb-2">2. Learning Path Visibility</div>
                  <ul className="list-disc d-flex flex-column gap-2 m-0">
                    <li>View campaign map with completed and locked levels.</li>
                    <li>See what topics are being learned via comics.</li>
                  </ul>
                </div>
                <div className="activity-img">
                  <img src={require('../../../assets/images/activity-images/activity-img6.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                </div>
              </div>
            </div>
            <div className="col">
              <div data-aos="slide-right" className="info-wrapper d-flex flex-column justify-content-between bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="content-wrapper mb-4">
                  <div className="fs-16 fw-bold text-theme4 mb-2">3. Rewards Insight</div>
                  <ul className="list-disc d-flex flex-column gap-2 m-0">
                    <li>See coins earned, redeemed, and power-ups unlocked.</li>
                    <li>Monitor “Double or Nothing” challenges attempted.</li>
                  </ul>
                </div>
                <div className="activity-img">
                  <img src={require('../../../assets/images/activity-images/activity-img17.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                </div>
              </div>
            </div>
            <div className="col">
              <div data-aos="slide-left" className="info-wrapper d-flex flex-column justify-content-between bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="content-wrapper mb-4">
                  <div className="fs-16 fw-bold text-theme4 mb-2">4. Safe & Private Learning</div>
                  <ul className="list-disc d-flex flex-column gap-2 m-0">
                    <li>COPPA & FERPA compliant.</li>
                    <li>No public sharing or commenting.</li>
                  </ul>
                </div>
                <div className="activity-img">
                  <img src={require('../../../assets/images/activity-images/parent-mode.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div data-aos="zoom-in-up" className="info-wrapper d-flex flex-column justify-content-between bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="content-wrapper mb-4">
                  <div className="fs-16 fw-bold text-theme4 mb-2">5. Parent-Teacher Connect</div>
                  <ul className="list-disc d-flex flex-column gap-2 m-0">
                    <li>Message board for teachers to share feedback.</li>
                    <li>Option to join classroom challenges.</li>
                  </ul>
                </div>
                <div className="activity-img">
                  <img src={require('../../../assets/images/activity-images/activity-img12.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="phase-wise-details-wrapper">
          <div className="fs-4 fw-bold text-warning mb-2">Phase-wise Details -</div>
          <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4">
            <div className="col">
              <div data-aos="fade-up" className="info-wrapper d-flex flex-column justify-content-between bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="content-wrapper mb-4">
                  <div className="fs-16 fw-bold text-theme4 mb-2">Phase 1: Beta Launch</div>
                  <ul className="list-disc d-flex flex-column gap-2 m-0">
                    <li>Basic parent dashboard with quiz scores</li>
                    <li>View completed comics and unlocked rewards</li>
                    <li>No login required for testing (can use child mode)</li>
                  </ul>
                </div>
                <div className="activity-img">
                  <img src={require('../../../assets/images/activity-images/activity-img11.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                </div>
              </div>
            </div>
            <div className="col">
              <div data-aos="fade-up" className="info-wrapper d-flex flex-column justify-content-between bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="content-wrapper mb-4">
                  <div className="fs-16 fw-bold text-theme4 mb-2">Phase 2: Near-Term Additions</div>
                  <ul className="list-disc d-flex flex-column gap-2 m-0">
                    <li>Push notifications for progress or drop-offs</li>
                    <li>Screen time + engagement analytics</li>
                    <li>Weekly performance report via email/app</li>
                  </ul>
                </div>
                <div className="activity-img">
                  <img src={require('../../../assets/images/activity-images/activity-img7.png')} alt="Activity" className="img-fluid animate-bounce-effect" />
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div data-aos="fade-up" className="info-wrapper d-flex flex-column justify-content-between bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="content-wrapper mb-4">
                  <div className="fs-16 fw-bold text-theme4 mb-2">Phase 3: Long-Term Vision</div>
                  <ul className="list-disc d-flex flex-column gap-2 m-0">
                    <li>Parental control over time limits, challenge types</li>
                    <li>In-app token gifting for motivation</li>
                    <li>Parent leaderboard (based on engagement/support)</li>
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

export default ParentsLanding;
