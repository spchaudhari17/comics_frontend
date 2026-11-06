import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackClick } from '../utility/analytics';
import { SHOP_PAGES, SOCIAL_LINKS, SUPPORT_EMAIL } from '../utility/shopLinks';
import './Footer.scss';

const trackSocial = (platform) => trackClick('social_link_click', { platform, location: 'footer' });
const trackFooterLink = (linkName) => trackClick('footer_link_click', { link_name: linkName, location: 'footer' });

// shop.kridemy.com footer jaisa. `to` = app ka page, `href` = shop ka page
const QUICK_LINKS = [
    { label: 'Home', href: SHOP_PAGES.home, track: 'home' },
    { label: 'For Teachers', href: SHOP_PAGES.forTeachers, track: 'for_teacher' },
    { label: 'Students & Parent', href: SHOP_PAGES.studentsParents, track: 'for_student' },
    { label: 'For Creators', href: SHOP_PAGES.forCreators, track: 'for_creators' },
    { label: 'Marketplace', href: SHOP_PAGES.marketplace, track: 'marketplace' },
];

const RESOURCE_LINKS = [
    { label: 'About Us', href: SHOP_PAGES.about, track: 'about_us' },
    { label: 'Contact Us', to: '/contact', track: 'contact_us' },
    { label: 'FAQ', to: '/faq', track: 'faq' },
    { label: 'Terms & Conditions', to: '/terms-and-condition', track: 'terms_and_conditions' },
    { label: 'Privacy Policy', to: '/privacy-policy', track: 'privacy_policy' },
    { label: 'Blog', href: SHOP_PAGES.blog, track: 'blog' },
    { label: 'Support', href: SHOP_PAGES.support, track: 'support' },
];

const FooterLink = ({ item }) =>
    item.to ? (
        <Link to={item.to} onClick={() => trackFooterLink(item.track)}>{item.label}</Link>
    ) : (
        <a href={item.href} onClick={() => trackFooterLink(item.track)}>{item.label}</a>
    );

export const Footer = () => {
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowTop(window.pageYOffset > 300);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <footer className="kridemy-footer">
            <div className="container-xl">
                <div className="kf-grid">
                    {/* About */}
                    <div>
                        <a href={SHOP_PAGES.home} className="kf-logo">
                            <img src={require('../assets/images/kridemy-logo-light.png')} alt="Kridemy" />
                        </a>
                        <p className="kf-about">
                            Making learning fun, visual, and effective with AI-powered comics, quizzes, and interactive stories.
                        </p>
                        <div className="kf-social">
                            {SOCIAL_LINKS.map((s) => (
                                <a
                                    key={s.id}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    onClick={() => trackSocial(s.id)}
                                >
                                    <i className={`bi ${s.icon}`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h4 className="kf-heading">Quick Links</h4>
                        <ul className="kf-list">
                            {QUICK_LINKS.map((item) => <li key={item.label}><FooterLink item={item} /></li>)}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="kf-heading">Resources</h4>
                        <ul className="kf-list">
                            {RESOURCE_LINKS.map((item) => <li key={item.label}><FooterLink item={item} /></li>)}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="kf-heading">Get in Touch</h4>
                        <p className="kf-contact-desc">Have questions or need support? Reach out to us anytime.</p>

                        <div className="kf-contact-item">
                            <span className="kf-contact-icon kf-icon-purple"><i className="bi bi-geo-alt-fill"></i></span>
                            <div>
                                <span className="kf-contact-label">Address</span>
                                <span className="kf-contact-value">New Brunswick, New Jersey, USA</span>
                            </div>
                        </div>

                        <div className="kf-contact-item">
                            <span className="kf-contact-icon kf-icon-green"><i className="bi bi-envelope-fill"></i></span>
                            <div>
                                <span className="kf-contact-label">Email us</span>
                                <a href={`mailto:${SUPPORT_EMAIL}`} className="kf-contact-value">{SUPPORT_EMAIL}</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="kf-bottom">
                    © {new Date().getFullYear()} Kridemy. All rights reserved by Sham Insights LLC.
                </div>
            </div>

            <button
                type="button"
                className={`kf-scroll-top ${showTop ? 'active' : ''}`}
                aria-label="Scroll to top"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                <i className="bi bi-chevron-up"></i>
            </button>
        </footer>
    );
};
