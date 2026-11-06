import React from "react";
import "./authentication.scss";

const BENEFITS = [
    { icon: "bi-magic", text: "Turn any topic into a comic with AI" },
    { icon: "bi-patch-question", text: "Auto-generated quizzes & fun facts" },
    { icon: "bi-shop", text: "Share and earn on the marketplace" },
];

// Login / Signup / OTP / Forgot password ka common layout:
// left = brand panel (desktop pe), right = form card
const AuthShell = ({ children, className = "", wide = false }) => (
    <div className={`auth-page ${className}`}>
        <div className="container-xl">
            <div className={`auth-shell ${wide ? "auth-shell-wide" : ""}`}>
                <aside className="auth-brand d-none d-lg-flex">
                    <div className="auth-brand-badge">
                        <i className="bi bi-rocket-takeoff-fill"></i> AI-Powered Learning
                    </div>
                    <h2 className="auth-brand-title">
                        Turn lessons into <span>engaging comics</span>
                    </h2>
                    <ul className="auth-brand-list">
                        {BENEFITS.map((b) => (
                            <li key={b.text}><i className={`bi ${b.icon}`}></i>{b.text}</li>
                        ))}
                    </ul>
                    <img
                        src={require("../../assets/images/kridemy-cat.png")}
                        alt="Kridemy superhero cat"
                        className="auth-brand-cat"
                    />
                </aside>

                <div className="auth-card">{children}</div>
            </div>
        </div>
    </div>
);

export default AuthShell;
