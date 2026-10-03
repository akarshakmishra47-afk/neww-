import os

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Opportunity Engine</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <style>
        /* Natural Editorial Styles */
        :root {
            --brand-forest: #173F35;
            --brand-ivory: #F5F0E8;
            --brand-terracotta: #D9785B;
            --brand-sage: #A8B9A5;
            --brand-sand: #DED4C5;
            --text-dark: #17211D;
            --text-muted: #68736C;
            --white: #FFFDF9;
            --font-main: 'Inter', sans-serif;
        }

        body {
            font-family: var(--font-main);
            background-color: var(--brand-ivory);
            color: var(--text-dark);
            -webkit-font-smoothing: antialiased;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
        }

        a { text-decoration: none; color: inherit; transition: all 0.3s ease; }
        
        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        /* Typography */
        h1, h2, h3, .editorial-heading {
            letter-spacing: -0.03em;
            line-height: 1.1;
            font-weight: 700;
        }
        
        .text-forest { color: var(--brand-forest); }
        .text-terracotta { color: var(--brand-terracotta); }
        .text-sage { color: var(--brand-sage); }
        .text-muted { color: var(--text-muted); }

        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem 2rem;
            border-radius: 9999px; /* Soft round */
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
            border: 2px solid transparent;
        }

        .btn-terracotta { background: var(--brand-terracotta); color: var(--white); }
        .btn-terracotta:hover { background: #C56649; }
        
        .btn-forest-outline { background: transparent; border-color: var(--brand-forest); color: var(--brand-forest); }
        .btn-forest-outline:hover { background: rgba(23,63,53,0.05); }

        .btn-ivory { background: var(--brand-ivory); color: var(--brand-forest); border-color: var(--brand-ivory); }
        .btn-ivory:hover { background: #e3dccf; }

        /* Navbar */
        .lp-navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            position: absolute;
            top: 0; left: 0; right: 0;
            z-index: 100;
        }
        
        .lp-brand {
            font-weight: 700; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem; color: var(--brand-forest);
        }
        .lp-brand-mark {
            background: var(--brand-forest); color: var(--brand-ivory); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem;
        }
        
        .lp-nav-links { display: flex; gap: 2rem; align-items: center; }
        .lp-nav-links a { color: var(--brand-forest); font-weight: 500; }
        .lp-nav-links a:hover { color: var(--brand-terracotta); }

        /* Sections */
        .section { padding: 8rem 0; }
        
        .bg-ivory { background-color: var(--brand-ivory); color: var(--text-dark); }
        .bg-forest { background-color: var(--brand-forest); color: var(--brand-ivory); }
        .bg-sage { background-color: var(--brand-sage); color: var(--brand-forest); }
        .bg-sand { background-color: var(--brand-sand); color: var(--text-dark); }
        .bg-white { background-color: var(--white); color: var(--text-dark); }

        /* Organic Shapes & Borders */
        .card-ui {
            background: var(--white);
            border: 1px solid var(--brand-sand);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 4px 12px rgba(23, 33, 29, 0.05);
            color: var(--text-dark);
        }

        /* Hero */
        .hero {
            padding: 12rem 0 6rem 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            position: relative;
        }
        .hero h1 { font-size: 4.5rem; color: var(--brand-forest); margin-bottom: 2rem; }
        .hero p { font-size: 1.25rem; color: var(--text-muted); margin-bottom: 2.5rem; max-width: 450px; line-height: 1.6; }

        /* Problem */
        .problem-grid {
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-top: 4rem;
        }
        .num-editorial { font-size: 3rem; color: var(--brand-sage); font-family: serif; font-style: italic; margin-bottom: 1rem; }

        /* Split screens */
        .split { display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: center; }

        /* Process Steps */
        .road-step {
            display: flex; gap: 1rem; margin-bottom: 2rem; align-items: flex-start;
        }
        .road-icon {
            width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
            border: 2px solid var(--brand-sand); margin-top: 4px; font-size: 0.75rem;
        }
        .road-step.done .road-icon { background: var(--brand-forest); border-color: var(--brand-forest); color: var(--white); }
        .road-step.current .road-icon { border-color: var(--brand-terracotta); color: var(--brand-terracotta); }

        /* UI elements */
        .ui-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; }
        .bg-terracotta-light { background: rgba(217, 120, 91, 0.15); color: var(--brand-terracotta); }
        .bg-forest-light { background: rgba(23, 63, 53, 0.1); color: var(--brand-forest); }
        
        .organic-line {
            width: 100%; height: 1px; background: var(--brand-sand); margin: 2rem 0;
        }
        
        .footer { padding: 4rem 0; border-top: 1px solid var(--brand-sand); }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 4rem; }
    </style>
</head>
<body class="bg-ivory">

    <!-- Navbar -->
    <nav class="lp-navbar">
        <a href="/" class="lp-brand">
            <span class="lp-brand-mark">SOE</span>
            Student Opportunity Engine
        </a>
        <div class="lp-nav-links">
            <a href="#problem">The Problem</a>
            <a href="#product">The Product</a>
            <a href="#about">About</a>
        </div>
        <div class="lp-nav-links">
            <a href="login.html">Log in</a>
            <a href="register.html" class="btn btn-terracotta">Get Started</a>
        </div>
    </nav>

    <!-- HERO SECTION -->
    <section class="section bg-ivory" style="padding-top: 12rem;">
        <div class="container hero">
            <div>
                <h1>YOUR NEXT<br>OPPORTUNITY<br><span class="text-terracotta">SHOULD FIT<br>YOU.</span></h1>
                <p>Student Opportunity Engine helps you discover internships, hackathons, scholarships and projects based on who you are and where you want to go.</p>
                <div style="display: flex; gap: 1rem;">
                    <a href="register.html" class="btn btn-terracotta">Get Started</a>
                    <a href="#product" class="btn btn-forest-outline">Explore</a>
                </div>
            </div>
            
            <!-- REAL DASHBOARD PREVIEW -->
            <div style="position: relative;">
                <div class="card-ui" style="background: var(--white); box-shadow: 0 20px 40px rgba(23,33,29,0.08);">
                    <div class="text-muted" style="margin-bottom: 2rem; font-size: 0.875rem;">Good morning, Akarshak</div>
                    <div style="font-size: 0.75rem; letter-spacing: 0.05em; color: var(--brand-terracotta); font-weight: 600; margin-bottom: 1rem;">TODAY'S MATCH</div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--brand-sand); padding-bottom: 1rem; margin-bottom: 1rem;">
                        <div style="font-size: 1.5rem; font-weight: 600; color: var(--brand-forest);">AI / ML Internship</div>
                        <div style="font-size: 2rem; font-weight: 700; color: var(--brand-forest);">94%</div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; font-size: 0.875rem;">
                        <div style="display: flex; justify-content: space-between;"><span>Python</span> <span class="text-forest">✓</span></div>
                        <div style="display: flex; justify-content: space-between;"><span>Machine Learning</span> <span class="text-forest">✓</span></div>
                        <div style="display: flex; justify-content: space-between;"><span>SQL</span> <span class="text-forest">✓</span></div>
                        <div style="display: flex; justify-content: space-between; color: var(--text-muted);"><span>TensorFlow</span> <span>○</span></div>
                    </div>
                    
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Why this matches you</div>
                    <div style="font-size: 0.875rem; display: flex; gap: 1rem; color: var(--brand-forest); margin-bottom: 2rem;">
                        <span>✓ Career goal</span>
                        <span>✓ Skills</span>
                        <span>✓ Eligibility</span>
                    </div>
                    
                    <div class="btn btn-forest-outline" style="width: 100%; box-sizing: border-box; text-align: center;">View Opportunity →</div>
                </div>
                <!-- Abstract organic shape behind -->
                <div style="position: absolute; top: -30px; right: -30px; width: 150px; height: 150px; border-radius: 50%; border: 1px solid var(--brand-sand); z-index: -1;"></div>
            </div>
        </div>
    </section>

    <!-- PROBLEM SECTION -->
    <section id="problem" class="section bg-white" style="border-top: 1px solid var(--brand-sand);">
        <div class="container">
            <h2 style="font-size: 4rem; color: var(--brand-forest); max-width: 800px; margin-bottom: 1rem;">Students don't need<br>more opportunities.</h2>
            <h2 style="font-size: 3.5rem; color: var(--text-muted); font-weight: 400; margin-bottom: 4rem;">They need the<br>right ones.</h2>
            
            <div class="problem-grid">
                <div>
                    <div class="num-editorial">500+</div>
                    <div style="font-weight: 600; font-size: 1.125rem;">Opportunities</div>
                    <div class="text-muted">Scattered everywhere</div>
                </div>
                <div>
                    <div class="num-editorial" style="color: var(--brand-terracotta);">→</div>
                    <div style="font-weight: 600; font-size: 1.125rem;">Too many choices</div>
                    <div class="text-muted">Overwhelming noise</div>
                </div>
                <div>
                    <div class="num-editorial" style="color: var(--brand-terracotta);">→</div>
                    <div style="font-weight: 600; font-size: 1.125rem;">No personalization</div>
                    <div class="text-muted">Irrelevant to your major</div>
                </div>
                <div>
                    <div class="num-editorial" style="color: var(--brand-terracotta);">→</div>
                    <div style="font-weight: 600; font-size: 1.125rem;">Missed chances</div>
                    <div class="text-muted">Finding out too late</div>
                </div>
            </div>
        </div>
    </section>

    <!-- PROFILE SECTION -->
    <section id="product" class="section bg-forest">
        <div class="container split">
            <div>
                <h2 style="font-size: 3.5rem; margin-bottom: 2rem;">We don't recommend<br>for everyone.</h2>
                <h2 style="font-size: 3rem; color: var(--brand-sage); font-weight: 400; margin-bottom: 2rem;">We recommend for you.</h2>
                <p style="font-size: 1.125rem; color: var(--brand-ivory); opacity: 0.8; max-width: 400px;">
                    Our engine starts by understanding your unique background, skills, and career goals.
                </p>
            </div>
            
            <div class="card-ui" style="background: var(--brand-ivory); color: var(--brand-forest); border: none;">
                <div style="font-size: 0.75rem; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 1rem;">YOUR PROFILE</div>
                <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">Akarshak Mishra</div>
                <div style="color: var(--text-muted); margin-bottom: 2rem;">B.Tech CSE · 2nd Year</div>
                
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">CAREER GOAL</div>
                <div style="font-weight: 600; margin-bottom: 1.5rem;">AI / ML Engineer</div>
                
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">SKILLS</div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><span>Python</span> <span class="text-muted">85</span></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><span>SQL</span> <span class="text-muted">72</span></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;"><span>Machine Learning</span> <span class="text-muted">58</span></div>
                
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">INTERESTS</div>
                <div>AI · Data Science · ML</div>
            </div>
        </div>
    </section>

    <!-- OPPORTUNITIES SECTION -->
    <section class="section bg-ivory">
        <div class="container split">
            <div>
                <div class="card-ui" style="padding: 3rem;">
                    <div style="font-size: 0.75rem; letter-spacing: 0.05em; font-weight: 600; color: var(--brand-terracotta); margin-bottom: 1rem;">94% MATCH</div>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--brand-forest); margin-bottom: 0.5rem;">AI Research Internship</div>
                    <div style="color: var(--text-muted); margin-bottom: 2rem;">Microsoft · Remote · 2 months</div>
                    
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap;">
                        <span class="ui-badge bg-forest-light">Python</span>
                        <span class="ui-badge bg-forest-light">Machine Learning</span>
                        <span class="ui-badge bg-forest-light">SQL</span>
                    </div>
                    
                    <div class="organic-line"></div>
                    
                    <div style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--brand-forest);">Why recommended</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 2rem;">Your skills and AI/ML goal match this opportunity perfectly.</div>
                    
                    <div class="btn btn-terracotta">View Opportunity</div>
                </div>
            </div>
            
            <div style="padding-left: 2rem;">
                <h2 style="font-size: 3.5rem; color: var(--brand-forest); margin-bottom: 2rem;">A whole world<br>of opportunities.</h2>
                <h2 style="font-size: 2.5rem; color: var(--text-muted); font-weight: 400; margin-bottom: 4rem;">One place to discover them.</h2>
                
                <div style="display: flex; flex-direction: column; gap: 1.5rem; font-size: 1.5rem; color: var(--brand-forest); font-weight: 600;">
                    <div style="border-bottom: 1px solid var(--brand-sand); padding-bottom: 1rem;">INTERNSHIPS</div>
                    <div style="border-bottom: 1px solid var(--brand-sand); padding-bottom: 1rem;">HACKATHONS</div>
                    <div style="border-bottom: 1px solid var(--brand-sand); padding-bottom: 1rem;">SCHOLARSHIPS</div>
                    <div style="border-bottom: 1px solid var(--brand-sand); padding-bottom: 1rem; color: var(--text-muted);">COMPETITIONS</div>
                    <div style="border-bottom: 1px solid var(--brand-sand); padding-bottom: 1rem; color: var(--text-muted);">PROJECTS</div>
                    <div style="color: var(--text-muted);">WORKSHOPS</div>
                </div>
            </div>
        </div>
    </section>

    <!-- SKILL GAP & PROJECTS SECTION -->
    <section class="section bg-sage">
        <div class="container split">
            <div>
                <h2 style="font-size: 3.5rem; color: var(--brand-forest); margin-bottom: 1rem;">Know what<br>you're missing.</h2>
                <h2 style="font-size: 2.5rem; color: var(--brand-ivory); font-weight: 400; margin-bottom: 4rem;">Know what to do next.</h2>
                
                <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 3rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--brand-forest);">
                        <span>YOUR SKILLS</span>
                        <span>TARGET ROLE</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(23,63,53,0.1); padding: 0.5rem 0;">
                        <span style="color: var(--brand-forest);">Python <span style="opacity: 0.6; font-family: monospace;">85%</span></span>
                        <span style="color: var(--brand-forest);">Python <span style="opacity: 0.6; font-family: monospace;">90%</span></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(23,63,53,0.1); padding: 0.5rem 0;">
                        <span style="color: var(--brand-forest);">SQL <span style="opacity: 0.6; font-family: monospace;">72%</span></span>
                        <span style="color: var(--brand-forest);">SQL <span style="opacity: 0.6; font-family: monospace;">80%</span></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(23,63,53,0.1); padding: 0.5rem 0;">
                        <span style="color: var(--brand-terracotta); font-weight: 600;">TensorFlow <span style="font-family: monospace;">0%</span></span>
                        <span style="color: var(--brand-forest);">TensorFlow <span style="opacity: 0.6; font-family: monospace;">70%</span></span>
                    </div>
                </div>
                
                <div style="font-size: 0.75rem; font-weight: 600; color: var(--brand-forest); margin-bottom: 1rem;">NEXT UP</div>
                <ol style="color: var(--brand-forest); padding-left: 1rem; line-height: 1.8; font-size: 1.125rem;">
                    <li>Learn TensorFlow</li>
                    <li>Build an ML project</li>
                    <li>Join an AI hackathon</li>
                </ol>
            </div>
            
            <div>
                <div class="card-ui" style="background: var(--brand-ivory); border: none;">
                    <h2 style="font-size: 2rem; color: var(--brand-forest); margin-bottom: 0.5rem;">Don't just learn<br>the skill. Build it.</h2>
                    <div class="organic-line"></div>
                    
                    <div style="font-size: 0.75rem; font-weight: 600; color: var(--brand-forest); margin-bottom: 0.5rem;">PROJECT RECOMMENDATION</div>
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--brand-terracotta); margin-bottom: 0.25rem;">AI Resume Analyzer</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem;">Intermediate</div>
                    
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem;">
                        <span class="ui-badge bg-white">Python</span>
                        <span class="ui-badge bg-white">NLP</span>
                        <span class="ui-badge bg-white">Machine Learning</span>
                    </div>
                    
                    <div style="background: rgba(217, 120, 91, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                        <div style="font-size: 0.75rem; font-weight: 600; color: var(--brand-terracotta); margin-bottom: 0.25rem;">Recommended because:</div>
                        <div style="font-size: 0.875rem; color: var(--brand-forest);">NLP is one of your current skill gaps.</div>
                    </div>
                    
                    <div class="btn btn-forest-outline">Explore Project →</div>
                </div>
            </div>
        </div>
    </section>

    <!-- ROADMAP & AI SECTION -->
    <section class="section bg-white">
        <div class="container split">
            <div>
                <div style="font-size: 0.75rem; font-weight: 600; color: var(--brand-terracotta); letter-spacing: 0.05em; margin-bottom: 2rem;">CAREER ROADMAP</div>
                <h3 style="font-size: 1.5rem; color: var(--brand-forest); margin-bottom: 3rem;">AI / ML ENGINEER</h3>
                
                <div class="road-step done">
                    <div class="road-icon">✓</div>
                    <div style="font-size: 1.125rem; font-weight: 500;">Python</div>
                </div>
                <div class="road-step done">
                    <div class="road-icon">✓</div>
                    <div style="font-size: 1.125rem; font-weight: 500;">SQL</div>
                </div>
                <div class="road-step current">
                    <div class="road-icon">●</div>
                    <div style="font-size: 1.125rem; font-weight: 600; color: var(--brand-terracotta);">Machine Learning</div>
                </div>
                <div class="road-step" style="opacity: 0.5;">
                    <div class="road-icon">○</div>
                    <div style="font-size: 1.125rem;">Deep Learning</div>
                </div>
                <div class="road-step" style="opacity: 0.5;">
                    <div class="road-icon">○</div>
                    <div style="font-size: 1.125rem;">Projects</div>
                </div>
                <div class="road-step" style="opacity: 0.5;">
                    <div class="road-icon">○</div>
                    <div style="font-size: 1.125rem;">Internship</div>
                </div>
            </div>
            
            <div style="padding-left: 3rem;">
                <h2 style="font-size: 3rem; color: var(--brand-forest); margin-bottom: 1rem;">Not another chatbot.</h2>
                <h2 style="font-size: 2rem; color: var(--text-muted); font-weight: 400; margin-bottom: 3rem;">A career copilot that<br>knows your profile.</h2>
                
                <div class="card-ui" style="background: var(--brand-forest); color: var(--white); border: none;">
                    <div style="font-size: 0.75rem; color: var(--brand-sage); margin-bottom: 0.5rem;">YOU</div>
                    <div style="font-size: 1.125rem; margin-bottom: 2rem;">Which opportunity should I apply for this week?</div>
                    
                    <div class="organic-line" style="background: rgba(255,255,255,0.1);"></div>
                    
                    <div style="font-size: 0.75rem; color: var(--brand-terracotta); font-weight: 600; margin-bottom: 0.5rem;">AI</div>
                    <div style="font-size: 1rem; line-height: 1.6; color: var(--brand-ivory);">
                        <p style="margin-bottom: 1rem;">Based on your profile, I'd start with:</p>
                        <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;"><strong>94%</strong> <span>AI Research Internship</span></div>
                        <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;"><strong>89%</strong> <span>ML Engineering Internship</span></div>
                        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;"><strong>84%</strong> <span>Data Challenge</span></div>
                        
                        <p>Your current gap to focus on: <span style="color: var(--brand-terracotta); font-weight: 600;">Deep Learning</span></p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ONE SYSTEM -->
    <section class="section bg-ivory" style="text-align: center;">
        <div class="container">
            <h2 style="font-size: 3.5rem; color: var(--brand-forest); margin-bottom: 1rem;">Everything connects.</h2>
            <h2 style="font-size: 2.5rem; color: var(--text-muted); font-weight: 400; margin-bottom: 4rem;">Because your career does too.</h2>
            
            <div style="display: flex; justify-content: center; align-items: center; gap: 1rem; flex-wrap: wrap; color: var(--brand-forest); font-weight: 600; font-size: 1.125rem;">
                <div class="card-ui" style="padding: 1rem 2rem;">PROFILE</div>
                <div style="color: var(--brand-terracotta);">→</div>
                <div class="card-ui" style="padding: 1rem 2rem;">OPPORTUNITIES</div>
                <div style="color: var(--brand-terracotta);">→</div>
                <div class="card-ui" style="padding: 1rem 2rem;">SKILLS</div>
                <div style="color: var(--brand-terracotta);">→</div>
                <div class="card-ui" style="padding: 1rem 2rem;">PROJECTS</div>
                <div style="color: var(--brand-terracotta);">→</div>
                <div class="card-ui" style="padding: 1rem 2rem;">ROADMAP</div>
            </div>
        </div>
    </section>

    <!-- FINAL CTA -->
    <section class="section bg-forest" style="text-align: center; padding: 10rem 0;">
        <div class="container">
            <h2 style="font-size: 4rem; color: var(--brand-ivory); margin-bottom: 2rem;">Your next opportunity<br>starts with knowing yourself.</h2>
            <p style="font-size: 1.5rem; color: var(--brand-sage); margin-bottom: 4rem;">Build your profile. Find your fit. Make your next move.</p>
            <a href="register.html" class="btn btn-ivory" style="font-size: 1.25rem;">Get Started →</a>
        </div>
    </section>

    <!-- Footer -->
    <footer id="about" class="footer bg-ivory">
        <div class="container footer-grid">
            <div>
                <div class="lp-brand" style="margin-bottom: 1.5rem;">
                    <span class="lp-brand-mark">SOE</span>
                    Student Opportunity Engine
                </div>
                <div style="font-size: 1.25rem; color: var(--text-muted);">Discover.<br>Build.<br>Grow.</div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1rem; font-weight: 500;">
                <a href="#">Opportunities</a>
                <a href="#">Skills</a>
                <a href="#">Projects</a>
                <a href="#">Roadmap</a>
                <a href="#">AI Assistant</a>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1rem; font-weight: 500;">
                <a href="login.html" style="color: var(--text-muted);">Log in</a>
                <a href="register.html" style="color: var(--brand-terracotta);">Get Started</a>
            </div>
        </div>
        <div class="container" style="font-size: 0.875rem; color: var(--text-muted); margin-top: 4rem;">
            © 2026 Student Opportunity Engine
        </div>
    </footer>

</body>
</html>
"""

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("Updated index.html")
