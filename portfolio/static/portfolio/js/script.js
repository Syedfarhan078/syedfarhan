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
        if (theme === 'dark') {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    }

    // ---------------------------------------------
    // 2. Generate GitHub Contributions Heatmap
    // ---------------------------------------------
    const heatmap = document.getElementById('github-heatmap');
    if (heatmap) {
        const rows = 7;
        const cols = 24; // 24 weeks representation
        const totalCells = rows * cols;
        
        // Generate grid cells with random commit densities (clumping heavier weights to look natural)
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            
            // Random distribution:
            // 0: no commits (weight 0)
            // 1: low commits (weight 1)
            // 2: medium commits (weight 2)
            // 3: high commits (weight 3)
            // 4: max commits (weight 4)
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
            
            // Subtle tooltip displaying date/activity simulation on hover
            const simulatedCommits = weight === 0 ? 'No commits' : `${weight * 2 + Math.floor(Math.random() * 3)} commits`;
            cell.title = `${simulatedCommits} on simulated day ${i + 1}`;
            
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
});
