
// src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';
import GlobeNetworkAnimation from '../components/animations/GlobeNetworkAnimation';
import {
    Users,
    CheckSquare,
    MessageSquare,
    FileText,
    BarChart3,
    Shield,
    Zap,
    Clock,
    Star,
    ChevronRight,
    Menu,
    X,
    ArrowRight,
    Rocket,
    Globe,
    Award,
    TrendingUp,
    Check,
    Sparkles,
    Target,
    Zap as Lightning
} from 'lucide-react';

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const statsRef = useRef(null);
    const featuresRef = useRef(null);
    const heroRef = useRef(null);

    // Scroll effect for header
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        // Trigger once on mount to set initial state
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Particle animation for hero section
    useEffect(() => {
        const heroSection = heroRef.current;
        if (!heroSection) return;

        // Create particles
        const particlesContainer = document.createElement('div');
        particlesContainer.className = styles.particlesContainer;
        heroSection.appendChild(particlesContainer);

        // Create 50 particles
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = styles.particle;

            // Random properties
            const size = Math.random() * 4 + 1;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 5;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;

            // Random gradient color
            const colors = [
                'rgba(99, 102, 241, 0.8)',  // Indigo
                'rgba(139, 92, 246, 0.8)',  // Purple
                'rgba(192, 132, 252, 0.8)', // Light purple
                'rgba(129, 140, 248, 0.8)'  // Light indigo
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.background = `radial-gradient(circle, ${color}, transparent 70%)`;

            particlesContainer.appendChild(particle);
        }

        // Create floating elements
        const floatingElements = [
            { size: 60, posX: 10, posY: 20, duration: 20 },
            { size: 40, posX: 85, posY: 30, duration: 25 },
            { size: 50, posX: 15, posY: 70, duration: 30 },
            { size: 70, posX: 80, posY: 60, duration: 35 }
        ];

        floatingElements.forEach((elem, index) => {
            const element = document.createElement('div');
            element.className = styles.floatingElement;
            element.style.width = `${elem.size}px`;
            element.style.height = `${elem.size}px`;
            element.style.left = `${elem.posX}%`;
            element.style.top = `${elem.posY}%`;
            element.style.animationDuration = `${elem.duration}s`;
            element.style.animationDelay = `${index * 2}s`;

            // Create inner patterns
            const pattern = document.createElement('div');
            pattern.className = styles.elementPattern;
            element.appendChild(pattern);

            particlesContainer.appendChild(element);
        });

        return () => {
            if (particlesContainer && heroSection.contains(particlesContainer)) {
                heroSection.removeChild(particlesContainer);
            }
        };
    }, []);

    // Stats count-up animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Animate stats
                        const counters = document.querySelectorAll(`.${styles.statNumber}`);
                        counters.forEach(counter => {
                            const target = +counter.getAttribute('data-target');
                            const increment = target / 50;
                            let current = 0;

                            const updateCounter = () => {
                                if (current < target) {
                                    current += increment;
                                    if (current > target) current = target;
                                    counter.textContent = Math.floor(current).toLocaleString();
                                    setTimeout(updateCounter, 20);
                                } else {
                                    counter.textContent = target.toLocaleString();
                                }
                            };
                            updateCounter();
                        });
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (statsRef.current) observer.observe(statsRef.current);

        // Feature cards animation
        const featureObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add(styles.visible);
                        }, index * 100);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        document.querySelectorAll(`.${styles.featureCard}`).forEach(card => {
            featureObserver.observe(card);
        });

        return () => {
            if (statsRef.current) observer.unobserve(statsRef.current);
            featureObserver.disconnect();
        };
    }, []);

    const features = [
        {
            icon: <Users size={32} />,
            title: "Team Collaboration",
            description: "Work together in real-time with your entire team, no matter where they are located.",
            color: "#6366f1"
        },
        {
            icon: <CheckSquare size={32} />,
            title: "Task Management",
            description: "Assign, track, and complete tasks with intuitive kanban boards and timelines.",
            color: "#8b5cf6"
        },
        {
            icon: <MessageSquare size={32} />,
            title: "Team Chat",
            description: "Communicate seamlessly with built-in chat, voice, and video capabilities.",
            color: "#ec4899"
        },
        {
            icon: <FileText size={32} />,
            title: "File Sharing",
            description: "Share documents, images, and files instantly with advanced permission controls.",
            color: "#3b82f6"
        },
        {
            icon: <BarChart3 size={32} />,
            title: "Progress Tracking",
            description: "Monitor project progress with detailed analytics and reporting tools.",
            color: "#10b981"
        },
        {
            icon: <Shield size={32} />,
            title: "Enterprise Security",
            description: "Bank-level security with end-to-end encryption and compliance certifications.",
            color: "#f59e0b"
        }
    ];

    const steps = [
        {
            number: "01",
            title: "Create Your Organization",
            description: "Sign up as admin and set up your team workspace in under 5 minutes.",
            icon: <Rocket size={24} />
        },
        {
            number: "02",
            title: "Invite Your Team",
            description: "Add team members and assign roles with just a few clicks.",
            icon: <Users size={24} />
        },
        {
            number: "03",
            title: "Start Collaborating",
            description: "Create projects, assign tasks, and watch your productivity soar.",
            icon: <TrendingUp size={24} />
        }
    ];

    const stats = [
        { value: 10000, label: "Teams", suffix: "+", icon: <Users size={20} /> },
        { value: 500000, label: "Users", suffix: "+", icon: <Globe size={20} /> },
        { value: 99.9, label: "Uptime", suffix: "%", icon: <Zap size={20} /> },
        { value: 4.9, label: "Rating", suffix: "/5", icon: <Star size={20} /> }
    ];

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
                <div className={styles.headerContent}>
                    <Link to="/" className={styles.logo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className={styles.logoIcon}>
                            <span className={styles.logoTF}>TF</span>
                        </div>
                        <span className={styles.logoText}>TeamFlow</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className={styles.nav}>
                        <Link to="/" className={styles.navLink} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</Link>
                        <a href="#features" className={styles.navLink}>Features</a>
                        <a href="#how-it-works" className={styles.navLink}>How It Works</a>
                        <a href="#pricing" className={styles.navLink}>Pricing</a>
                        <a href="#about" className={styles.navLink}>About</a>
                    </nav>

                    <div className={styles.headerActions}>
                        <Link to="/login" className={styles.signInButton}>
                            Sign In
                        </Link>
                        <Link to="/signup" className={styles.getStartedButton}>
                            Get Started <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={styles.menuButton}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className={styles.mobileMenu}>
                        <nav className={styles.mobileNav}>
                            <Link to="/" className={styles.mobileNavLink} onClick={() => { setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                                Home
                            </Link>
                            <a href="#features" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                                Features
                            </a>
                            <a href="#how-it-works" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                                How It Works
                            </a>
                            <a href="#pricing" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                                Pricing
                            </a>
                            <a href="#about" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                                About
                            </a>
                            <div className={styles.mobileActions}>
                                <Link to="/login" className={styles.mobileSignIn} onClick={() => setIsMenuOpen(false)}>
                                    Sign In
                                </Link>
                                <Link to="/signup" className={styles.mobileGetStarted} onClick={() => setIsMenuOpen(false)}>
                                    Get Started
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Hero Section - UPDATED */}
            <section className={styles.hero} ref={heroRef}>
                <div className={styles.heroContent}>
                    <div className={styles.heroTextWrapper}>
                        <div className={styles.heroBadge}>
                            <Sparkles size={16} />
                            <span>Next-Gen Collaboration Platform</span>
                        </div>

                        <div className={styles.heroTitleContainer}>
                            <h1 className={styles.heroTitle}>
                                <span className={styles.titleLine}>Transform Your Team's</span>
                                <span className={styles.titleLine}>
                                    <span className={styles.gradientText}>Workflow with AI</span>
                                    <span className={styles.sparkleIcon}>
                                        <Sparkles size={48} />
                                    </span>
                                </span>
                            </h1>
                        </div>

                        <p className={styles.heroSubtitle}>
                            Experience the future of team collaboration with our intelligent platform that
                            combines cutting-edge technology with seamless workflow integration.
                        </p>

                        <div className={styles.heroActions}>
                            <Link to="/signup" className={styles.heroPrimary}>
                                <Lightning size={20} />
                                Start Free Trial
                                <ChevronRight size={20} />
                            </Link>
                            <Link to="/login" className={styles.heroSecondary}>
                                <Target size={20} />
                                Book a Demo
                            </Link>
                        </div>

                        <div className={styles.heroStats}>
                            <div className={styles.statItem}>
                                <div className={styles.statNumber}>99.9%</div>
                                <div className={styles.statLabel}>Uptime</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statNumber}>2.5x</div>
                                <div className={styles.statLabel}>Faster Workflow</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statNumber}>24/7</div>
                                <div className={styles.statLabel}>AI Support</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.heroVisual}>
                        <div className={styles.visualContainer}>
                            {/* Central Orb */}
                            <div className={styles.centralOrb}>
                                <div className={styles.orbGlow} />
                                <div className={styles.orbCore}>
                                    <div className={styles.orbRing} />
                                    <div className={styles.orbRing} style={{ '--ring-delay': '1s' }} />
                                    <div className={styles.orbRing} style={{ '--ring-delay': '2s' }} />
                                </div>
                            </div>

                            {/* Orbiting Elements */}
                            <div className={styles.orbitingElement} style={{ '--orbit-delay': '0s' }}>
                                <div className={styles.elementIcon}>
                                    <Users size={24} />
                                </div>
                            </div>
                            <div className={styles.orbitingElement} style={{ '--orbit-delay': '1s' }}>
                                <div className={styles.elementIcon}>
                                    <MessageSquare size={24} />
                                </div>
                            </div>
                            <div className={styles.orbitingElement} style={{ '--orbit-delay': '2s' }}>
                                <div className={styles.elementIcon}>
                                    <CheckSquare size={24} />
                                </div>
                            </div>

                            {/* Connection Lines */}
                            <svg className={styles.connectionLines} viewBox="0 0 400 400">
                                <path className={styles.connectionPath} d="M200,200 Q250,150 300,200" />
                                <path className={styles.connectionPath} d="M200,200 Q150,250 100,200" />
                                <path className={styles.connectionPath} d="M200,200 Q250,250 200,300" />
                            </svg>

                            {/* Floating Cards */}
                            <div className={`${styles.floatingCard} ${styles.card1}`}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}>
                                        <TrendingUp size={16} />
                                    </div>
                                    <span>Analytics</span>
                                </div>
                                <div className={styles.cardChart}>
                                    <div className={styles.chartBar} style={{ height: '60%' }} />
                                    <div className={styles.chartBar} style={{ height: '80%' }} />
                                    <div className={styles.chartBar} style={{ height: '40%' }} />
                                </div>
                            </div>

                            <div className={`${styles.floatingCard} ${styles.card2}`}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}>
                                        <Zap size={16} />
                                    </div>
                                    <span>Tasks</span>
                                </div>
                                <div className={styles.cardProgress}>
                                    <div className={styles.progressBar} style={{ width: '75%' }} />
                                </div>
                            </div>

                            <div className={`${styles.floatingCard} ${styles.card3}`}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}>
                                        <Globe size={16} />
                                    </div>
                                    <span>Team</span>
                                </div>
                                <div className={styles.cardAvatars}>
                                    <div className={styles.avatar} />
                                    <div className={styles.avatar} />
                                    <div className={styles.avatar} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background Elements */}
                <div className={styles.heroOrb1} />
                <div className={styles.heroOrb2} />
                <div className={styles.heroGrid} />
            </section>

            {/* Features Section */}
            <section id="features" className={styles.featuresSection} ref={featuresRef}>
                {/* ... Rest of the code remains exactly the same ... */}
                <div className={styles.sectionContainer}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            Everything Your Team Needs
                        </h2>
                        <p className={styles.sectionSubtitle}>
                            Powerful features designed to boost productivity and enhance collaboration
                        </p>
                    </div>

                    <div className={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={styles.featureCard}
                                style={{ '--feature-color': feature.color }}
                            >
                                <div
                                    className={styles.featureIconWrapper}
                                    style={{ background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}30)` }}
                                >
                                    <div className={styles.featureIcon} style={{ color: feature.color }}>
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDescription}>{feature.description}</p>
                                <div className={styles.featureHoverLine} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className={styles.statsSection} ref={statsRef}>
                <div className={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statItem}>
                            <div className={styles.statIconWrapper}>
                                {stat.icon}
                            </div>
                            <div className={styles.statNumber} data-target={stat.value}>
                                0
                            </div>
                            <div className={styles.statLabel}>
                                {stat.label}
                                <span className={styles.statSuffix}>{stat.suffix}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className={styles.stepsSection}>
                <div className={styles.sectionContainer}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            Get Started in Minutes
                        </h2>
                        <p className={styles.sectionSubtitle}>
                            Simple setup, immediate impact
                        </p>
                    </div>

                    <div className={styles.stepsContainer}>
                        {steps.map((step, index) => (
                            <div key={index} className={styles.stepCard}>
                                <div className={styles.stepNumber}>{step.number}</div>
                                <div className={styles.stepIcon}>{step.icon}</div>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepDescription}>{step.description}</p>
                                {index < steps.length - 1 && (
                                    <div className={styles.stepConnector}>
                                        <div className={styles.connectorLine} />
                                        <ChevronRight className={styles.connectorArrow} size={20} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className={styles.pricingSection}>
                <div className={styles.pricingContainer}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
                        <p className={styles.sectionSubtitle}>
                            Choose the perfect plan for your team's needs
                        </p>
                    </div>

                    <div className={styles.pricingGrid}>
                        {/* Starter Plan */}
                        <div className={styles.pricingCard}>
                            <h3 className={styles.planName}>Starter</h3>
                            <div className={styles.planPrice}>
                                Free
                                <span className={styles.planPeriod}>/ forever</span>
                            </div>
                            <p className={styles.planDescription}>
                                Perfect for small teams and startups getting started.
                            </p>
                            <ul className={styles.planFeatures}>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    Up to 5 team members
                                </li>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    Basic task management
                                </li>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    1GB file storage
                                </li>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    Community support
                                </li>
                            </ul>
                            <a href="#" className={`${styles.planButton} ${styles.secondary}`} onClick={(e) => e.preventDefault()}>
                                Start for Free
                            </a>
                        </div>

                        {/* Pro Plan */}
                        <div className={`${styles.pricingCard} ${styles.popular}`}>
                            <div className={styles.popularBadge}>Most Popular</div>
                            <h3 className={styles.planName}>Pro</h3>
                            <div className={styles.planPrice}>
                                $12
                                <span className={styles.planPeriod}>/ user / mo</span>
                            </div>
                            <p className={styles.planDescription}>
                                For growing teams that need more power and flexibility.
                            </p>
                            <ul className={styles.planFeatures}>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    Unlimited team members
                                </li>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    Advanced analytics
                                </li>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    20GB file storage
                                </li>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    Priority support
                                </li>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    Custom workflows
                                </li>
                            </ul>
                            <Link to="/signup" className={`${styles.planButton} ${styles.primary}`}>
                                Start Free Trial
                            </Link>
                        </div>

                        {/* Enterprise Plan */}
                        <div className={styles.pricingCard}>
                            <h3 className={styles.planName}>Enterprise</h3>
                            <div className={styles.planPrice}>
                                Custom
                            </div>
                            <p className={styles.planDescription}>
                                For large organizations with specific security compliances.
                            </p>
                            <ul className={styles.planFeatures}>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    Unlimited everything
                                </li>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    SSO & Advanced Security
                                </li>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    Dedicated success manager
                                </li>
                                <li className={styles.featureItem}>
                                    <Check className={styles.checkIcon} size={20} />
                                    SLA guarantee
                                </li>
                            </ul>
                            <a href="#" className={`${styles.planButton} ${styles.secondary}`} onClick={(e) => e.preventDefault()}>
                                Contact Sales
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className={styles.aboutSection}>
                <div className={styles.pricingContainer}> {/* Reusing container width */}
                    <div className={styles.aboutGrid}>
                        <div className={styles.aboutContent}>
                            <div className={styles.heroBadge} style={{ marginBottom: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                About TeamFlow
                            </div>
                            <h2 className={styles.aboutTitle}>
                                We're on a mission to transform how teams work together.
                            </h2>
                            <p className={styles.aboutText}>
                                Founded by Haroon Sajid in 2025, TeamFlow was born from a simple observation: modern teams need modern tools. We believe that collaboration should be seamless, intuitive, and actually enjoyable.
                            </p>
                            <p className={styles.aboutText}>
                                Our platform brings together the best of project management, communication, and resource planning into one unified solution, empowering teams to focus on what really matters—building great things.
                            </p>
                            <div className={styles.aboutStats}>
                                <div className={styles.aboutStatItem}>
                                    <h4>10k+</h4>
                                    <p>Global Teams</p>
                                </div>
                                <div className={styles.aboutStatItem}>
                                    <h4>50M+</h4>
                                    <p>Tasks Completed</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.aboutImageWrapper}>
                            <div className={styles.aboutGradient} />
                            <div className={styles.aboutOverlay} />
                            {/* Abstract visual representation instead of a real image for now, keeping it premium */}
                            {/* Abstract visual representation instead of a real image for now, keeping it premium */}
                            <div style={{ width: '100%', height: '100%' }}>
                                <GlobeNetworkAnimation />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className={styles.ctaSection}>
                <div className={styles.ctaContainer}>
                    <div className={styles.ctaContent}>
                        <h2 className={styles.ctaTitle}>
                            Ready to Transform Your Team's Productivity?
                        </h2>
                        <p className={styles.ctaSubtitle}>
                            Join thousands of teams who trust TeamFlow to power their collaboration.
                        </p>
                        <Link to="/signup" className={styles.ctaButton}>
                            Start Free Trial <ArrowRight size={20} />
                        </Link>
                        <p className={styles.ctaNote}>
                            Free 14-day trial • No setup fees • Cancel anytime
                        </p>
                    </div>
                    <div className={styles.ctaOrb} />
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContainer}>
                    <div className={styles.footerMain}>
                        <div className={styles.footerBrand}>
                            <div className={styles.footerLogo}>
                                <span className={styles.footerLogoTF}>TF</span>
                                <span className={styles.footerLogoText}>TeamFlow</span>
                            </div>
                            <p className={styles.footerTagline}>
                                Streamline your team's workflow with powerful collaboration tools
                            </p>
                        </div>

                        <div className={styles.footerLinks}>
                            <div className={styles.linkColumn}>
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#pricing">Pricing</a>
                                <a href="#" onClick={(e) => e.preventDefault()}>Integrations</a>
                                <a href="#" onClick={(e) => e.preventDefault()}>Releases</a>
                            </div>

                            <div className={styles.linkColumn}>
                                <h4>Company</h4>
                                <a href="#about">About</a>
                                <a href="#" onClick={(e) => e.preventDefault()}>Careers</a>
                                <a href="#" onClick={(e) => e.preventDefault()}>Blog</a>
                                <a href="#" onClick={(e) => e.preventDefault()}>Press</a>
                            </div>

                            <div className={styles.linkColumn}>
                                <h4>Resources</h4>
                                <a href="#" onClick={(e) => e.preventDefault()}>Help Center</a>
                                <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
                                <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                                <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
                            </div>

                            <div className={styles.linkColumn}>
                                <h4>Connect</h4>
                                <a href="#" onClick={(e) => e.preventDefault()}>Twitter</a>
                                <a href="#" onClick={(e) => e.preventDefault()}>LinkedIn</a>
                                <a href="#" onClick={(e) => e.preventDefault()}>GitHub</a>
                                <a href="#" onClick={(e) => e.preventDefault()}>YouTube</a>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footerBottom}>
                        <div className={styles.copyright}>
                            © {new Date().getFullYear()} TeamFlow. All rights reserved.
                        </div>
                        <div className={styles.footerSocial}>
                            <a href="#" aria-label="Twitter" className={styles.socialLink} onClick={(e) => e.preventDefault()}>
                                𝕏
                            </a>
                            <a href="#" aria-label="LinkedIn" className={styles.socialLink} onClick={(e) => e.preventDefault()}>
                                in
                            </a>
                            <a href="#" aria-label="GitHub" className={styles.socialLink} onClick={(e) => e.preventDefault()}>
                                ⚡
                            </a>
                            <a href="#" aria-label="YouTube" className={styles.socialLink} onClick={(e) => e.preventDefault()}>
                                ▶
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;