// theme-manager.js

// Define a function to toggle the theme
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme');
    
    // Check the current theme and switch it
    if (currentTheme === 'dark') {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
}

// Function to apply the theme on page load
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Call applyTheme on page load
document.addEventListener('DOMContentLoaded', applyTheme);

// Expose toggleTheme to the global scope so it can be called from HTML
window.toggleTheme = toggleTheme;