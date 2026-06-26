// layout.js
document.addEventListener('DOMContentLoaded', () => {
    // Get the data defined locally on the page
    const data = window.appPageData || {
        logo: 'assets/default-logo.png',
        logoAlt: 'App logo placeholder',
        name: 'Unnamed App',
        description: 'App description goes here.',
        policy: 'Privacy policy content goes here.'
    };

    // Set the browser page title dynamically
    document.title = `${data.name} | Box Cat Games`;

    // Inject the reusable layout structure into the body
    document.body.innerHTML = `
        <a href="#main-content" class="skip-link">Skip to main content</a>

        <header>
            <a href="index.html" class="back-link">← Back to Box Cat Games</a>
        </header>

        <main id="main-content">
            <article class="app-container">
                <img src="${data.logo}" alt="${data.logoAlt}" class="app-logo" width="180" height="180">
                
                <h1 id="app-title" class="app-title" tabindex="-1">${data.name}</h1>
                
                <div class="app-description">
                    ${data.description}
                </div>

                <hr class="divider" aria-hidden="true">

                <section class="privacy-section" aria-labelledby="privacy-heading">
                    <h2 id="privacy-heading">Privacy Policy</h2>
                    <div class="privacy-content">
                        ${data.policy}
                    </div>
                </section>
            </article>
        </main>

        <footer>
            <a href="mailto:boxcatgamesdev@gmail.com" class="footer-link">Contact: boxcatgamesdev@gmail.com</a>
            <p>&copy; ${new Date().getFullYear()} Box Cat Games. All rights reserved.</p>
        </footer>
    `;

    // Accessibility focus shift to the new dynamic H1
    const appTitle = document.getElementById('app-title');
    if (appTitle) appTitle.focus();
});
