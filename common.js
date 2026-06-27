
window.addEventListener('DOMContentLoaded', () => {
    const mainHeading = document.querySelector('h1');
    if (mainHeading) mainHeading.focus();
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    generateStars();
});

function generateStars() {
    // Create a container element if it doesn't exist yet
    let starfield = document.getElementById('starfield');
    if (!starfield) {
        starfield = document.createElement('div');
        starfield.id = 'starfield';
        document.body.appendChild(starfield);
    }

    const starCount = 65; // High enough to look pretty, sparse enough to stay chill
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Distribute randomly across dimensions safely
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // De-synchronize animations so they don't pulse together in lockstep
        star.style.setProperty('--duration', `${3 + Math.random() * 4}s`);
        star.style.setProperty('--delay', `${Math.random() * 5}s`);
        
        starfield.appendChild(star);
    }
}
