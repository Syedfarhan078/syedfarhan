document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------
    // 1. Dark/Light Theme Handler
    // ---------------------------------------------
    const themeBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;

    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlEl.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = systemPrefersDark ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', initialTheme);
        updateThemeIcon(initialTheme);
    }

    themeBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeBtn.querySelector('i');
        icon.style.transform = 'scale(0.1) rotate(-180deg)';
        
        setTimeout(() => {
            if (theme === 'dark') {
                icon.className = 'fas fa-moon';
            } else {
                icon.className = 'fas fa-sun';
            }
            icon.style.transform = 'scale(1) rotate(0deg)';
            
            // Clean up inline styles so hover transforms work correctly
            setTimeout(() => {
                icon.style.transform = '';
            }, 400);
        }, 150);
    }

    // ---------------------------------------------
    // 2. Generate GitHub Contributions Heatmap
    // ---------------------------------------------
    const heatmap = document.getElementById('github-heatmap');
    if (heatmap) {
        const rows = 7;
        const cols = 24; // 24 weeks representation
        const totalCells = rows * cols;
        
        // Generate single dynamic floating tooltip element
        let tooltipEl = document.getElementById('heatmap-tooltip');
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'heatmap-tooltip';
            tooltipEl.className = 'heatmap-tooltip';
            document.body.appendChild(tooltipEl);
        }
        
        // Generate grid cells with random commit densities (clumping heavier weights to look natural)
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            
            let weight = 0;
            const rand = Math.random();
            
            if (rand > 0.88) {
                weight = 4;
            } else if (rand > 0.72) {
                weight = 3;
            } else if (rand > 0.50) {
                weight = 2;
            } else if (rand > 0.28) {
                weight = 1;
            }
            
            cell.classList.add(`cell-weight-${weight}`);
            
            // Calculate a real simulated date going back day-by-day
            const cellDate = new Date();
            cellDate.setDate(cellDate.getDate() - (totalCells - 1 - i));
            const dateString = cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            const simulatedCommits = weight === 0 ? 'No contributions' : `${weight * 2 + Math.floor(Math.random() * 3)} contributions`;
            const tooltipText = `${simulatedCommits} on ${dateString}`;
            
            // Mouse event listeners for premium floating tooltip positioning
            cell.addEventListener('mouseenter', () => {
                tooltipEl.innerText = tooltipText;
                tooltipEl.classList.add('visible');
            });
            
            cell.addEventListener('mousemove', (e) => {
                tooltipEl.style.left = `${e.pageX}px`;
                tooltipEl.style.top = `${e.pageY - 12}px`;
            });
            
            cell.addEventListener('mouseleave', () => {
                tooltipEl.classList.remove('visible');
            });
            
            heatmap.appendChild(cell);
        }
    }

    // ---------------------------------------------
    // 3. AJAX Contact Form Submission
    // ---------------------------------------------
    const contactForm = document.getElementById('bento-contact-form');
    const successAlert = document.getElementById('contact-success');
    const errorAlert = document.getElementById('contact-error');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Reset states
            successAlert.style.display = 'none';
            errorAlert.style.display = 'none';
            document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');

            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Transmitting... <i class="fas fa-spinner fa-spin"></i>';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const data = await response.json();

                if (response.ok && data.status === 'success') {
                    successAlert.innerText = data.message;
                    successAlert.style.display = 'block';
                    contactForm.reset();
                } else {
                    if (data.errors) {
                        for (const [key, msg] of Object.entries(data.errors)) {
                            const errEl = document.getElementById(`err-${key}`);
                            if (errEl) {
                                errEl.innerText = msg;
                                errEl.style.display = 'block';
                            }
                        }
                    } else {
                        errorAlert.innerText = data.message || 'Transmission failed. Try again.';
                        errorAlert.style.display = 'block';
                    }
                }
            } catch (err) {
                errorAlert.innerText = 'Server unreachable. Check connection parameters.';
                errorAlert.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // ---------------------------------------------
    // 4. Update Footer Copyright Year
    // ---------------------------------------------
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.innerText = new Date().getFullYear();

    // ---------------------------------------------
    // 5. Back to Top Button Controller
    // ---------------------------------------------
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ---------------------------------------------
    // 6. Fetch and Render Live Stats (LeetCode & Codewars)
    // ---------------------------------------------
    const updateLiveStats = async () => {
        const leetcodeComment = document.getElementById('leetcode-comment');
        const codewarsComment = document.getElementById('codewars-comment');
        
        if (!leetcodeComment && !codewarsComment) return;
        
        try {
            const response = await fetch('/api/stats/');
            if (response.ok) {
                const data = await response.json();
                
                if (leetcodeComment && data.leetcode && !data.leetcode.error) {
                    leetcodeComment.innerText = `(${data.leetcode.solved} solved)`;
                }
                
                if (codewarsComment && data.codewars && !data.codewars.error) {
                    codewarsComment.innerText = `(${data.codewars.rank} / ${data.codewars.solved} solved)`;
                }
            }
        } catch (err) {
            console.warn('Failed to fetch live developer stats:', err);
        }
    };
    
    updateLiveStats();

    // ---------------------------------------------
    // 7. Scroll Reveal Animation Effects
    // ---------------------------------------------
    const initScrollReveal = () => {
        const cards = document.querySelectorAll('.bento-card');
        
        const observerOptions = {
            root: null,
            threshold: 0.05,
            rootMargin: '0px 0px -40px 0px'
        };
        
        const revealCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                } else {
                    entry.target.classList.remove('reveal-visible');
                }
            });
        };
        
        const observer = new IntersectionObserver(revealCallback, observerOptions);
        
        cards.forEach(card => {
            card.classList.add('reveal-hidden');
            observer.observe(card);
        });
    };

    if ('IntersectionObserver' in window) {
        initScrollReveal();
    }

    // ---------------------------------------------
    // 8. Projects Tag Filter System
    // ---------------------------------------------
    const initProjectsFilter = () => {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectBoxes = document.querySelectorAll('.project-box');
        
        if (filterBtns.length === 0 || projectBoxes.length === 0) return;
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Toggle active button highlight
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filterVal = btn.getAttribute('data-filter').toLowerCase().trim();
                
                projectBoxes.forEach(box => {
                    const tagsAttr = box.getAttribute('data-tags') || '';
                    const tags = tagsAttr.split(',').map(t => t.trim().toLowerCase());
                    
                    if (filterVal === 'all' || tags.includes(filterVal)) {
                        box.style.display = 'flex';
                        setTimeout(() => {
                            box.classList.remove('filtered-out');
                        }, 10);
                    } else {
                        box.classList.add('filtered-out');
                        setTimeout(() => {
                            if (box.classList.contains('filtered-out')) {
                                box.style.display = 'none';
                            }
                        }, 300);
                    }
                });
            });
        });
    };

    initProjectsFilter();

    // ---------------------------------------------
    // 9. Sticky Header Border Scroll Controller
    // ---------------------------------------------
    const headerEl = document.querySelector('.bento-header');
    if (headerEl) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                headerEl.style.borderColor = 'var(--border-color)';
            } else {
                headerEl.style.borderColor = 'transparent';
            }
        });
    }

    // ---------------------------------------------
    // 10. Scrollspy Navigation Highlighter
    // ---------------------------------------------
    const initScrollspy = () => {
        const sections = document.querySelectorAll('section[id], div[id="projects"], div[id="work"], div[id="contact"]');
        const navLinks = document.querySelectorAll('.header-nav a');
        
        if (sections.length === 0 || navLinks.length === 0) return;
        
        const observerOptions = {
            root: null,
            threshold: 0.2,
            rootMargin: '-80px 0px -40% 0px'
        };
        
        const spyCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href === `#${id}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        };
        
        const observer = new IntersectionObserver(spyCallback, observerOptions);
        sections.forEach(section => observer.observe(section));
    };

    if ('IntersectionObserver' in window) {
        initScrollspy();
    }
});
