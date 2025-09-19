import React from 'react';

const StudentLanding = () => {
  return (
    <div className="ForStudent-Page pt-4 pb-5">
      <div className="container-xl">
        <div className="heading-wrapper text-center mx-auto mb-4" style={{ maxWidth: '600px' }}>
          <div className="section-heading mb-2">For Students</div>
          <div className="label-heading">Learn. Play. Win. Repeat.</div>
        </div>

        <div className="product-offerings-wrapper mb-5">
          <div className="fs-4 fw-bold text-warning mb-3">Product Offerings -</div>
          <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4">
            <div className="col">
              <div className="info-wrapper h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="fs-16 fw-bold text-theme4 mb-2">1. Gamified Learning Journey</div>
                <ul className="list-disc d-flex flex-column gap-2 m-0">
                  <li>Comic-style lessons with storylines and characters.</li>
                  <li>Embedded quizzes after every comic for instant rewards.</li>
                </ul>
              </div>
            </div>
            <div className="col">
              <div className="info-wrapper h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="fs-16 fw-bold text-theme4 mb-2">2. Dual Modes: Campaign & Short-form</div>
                <ul className="list-disc d-flex flex-column gap-2 m-0">
                  <li><span className="text-theme4 fw-semibold">Campaign Mode:</span> Subject-wise lessons presented in story arcs.</li>
                  <li><span className="text-theme4 fw-semibold">Short-form Mode:</span> TikTok-style videos with embedded quick quizzes.</li>
                </ul>
              </div>
            </div>
            <div className="col">
              <div className="info-wrapper h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="fs-16 fw-bold text-theme4 mb-2">3. Real-Time 1v1 Quiz Battles</div>
                <ul className="list-disc d-flex flex-column gap-2 m-0">
                  <li>Multiplayer quiz duels using earned energy points.</li>
                  <li>Win coins and climb up daily/weekly/monthly leaderboards.</li>
                </ul>
              </div>
            </div>
            <div className="col">
              <div className="info-wrapper h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="fs-16 fw-bold text-theme4 mb-2">4. Rewards & Customization</div>
                <ul className="list-disc d-flex flex-column gap-2 m-0">
                  <li>Earn <span className="text-theme4 fw-semibold">coins</span>, <span className="text-theme4 fw-semibold">gems</span>, and <span className="text-theme4 fw-semibold">energy points</span>.</li>
                  <li>
                    <div className="text-theme4 fw-semibold mb-2">Unlock:</div>
                    <ul className="list-disc d-flex flex-column gap-1 m-0">
                      <li>Ranked cards (bronze to diamond)</li>
                      <li>Cosmetic skins</li>
                      <li>Comic avatars</li>
                      <li>Real-world rewards and coupons</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="info-wrapper h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="fs-16 fw-bold text-theme4 mb-2">5. Double-or-Nothing Challenge</div>
                <ul className="list-disc d-flex flex-column gap-2 m-0">
                  <li>Post-quiz challenges to double rewards.</li>
                  <li>Higher stakes, harder questions, and more prestige cards.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="phase-wise-details-wrapper">
          <div className="fs-4 fw-bold text-warning mb-3">Phase-wise Details -</div>
          <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4">
            <div className="col">
              <div className="info-wrapper h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="fs-16 fw-bold text-theme4 mb-2">Phase 1: Beta Launch (Live Soon)</div>
                <ul className="list-disc d-flex flex-column gap-2 m-0">
                  <li>AI Comic Generator (pre-loaded in app)</li>
                  <li>Campaign mode with comic-based lessons (e.g. Photosynthesis, JIT, Subject-Verb Agreement)</li>
                  <li>Embedded quizzes with coins & badges</li>
                  <li>Offline play with pre-filled data (no login needed)</li>
                  <li>Energy + Coin system begins</li>
                </ul>
              </div>
            </div>
            <div className="col">
              <div className="info-wrapper h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="fs-16 fw-bold text-theme4 mb-2">Phase 2: Near-Term Additions</div>
                <ul className="list-disc d-flex flex-column gap-2 m-0">
                  <li>Real-time 1v1 Quiz Battles (using energy points)</li>
                  <li>Short-form vertical videos with interactive quizzes</li>
                  <li>Challenge boosters and power-ups</li>
                  <li>Coin-to-gem conversions, cosmetic upgrades</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="info-wrapper h-100 bg-theme1 border rounded-4 px-3 px-md-4 py-4">
                <div className="fs-16 fw-bold text-theme4 mb-2">Phase 3: Long-Term Vision</div>
                <ul className="list-disc d-flex flex-column gap-2 m-0">
                  <li>Adaptive AI tutoring system (personalized learning path)</li>
                  <li>Comic/video generation by students using AI</li>
                  <li>Avatar-level progression, boss battles, and storyline unlocks</li>
                  <li>Cross-subject missions & class-wide competitions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentLanding;
