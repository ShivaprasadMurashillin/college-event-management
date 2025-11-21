// ===================================
// Navigation & Theme
// ===================================

// Mobile Menu Toggle
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        if (navMenu.classList.contains('active')) {
            document.body.classList.add('nav-menu-active');
        } else {
            document.body.classList.remove('nav-menu-active');
        }
        
        const icon = mobileToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });
    
    // Close menu when clicking on nav links
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open', 'nav-menu-active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('active') && 
        !e.target.closest('.nav-menu') && 
        !e.target.closest('.mobile-toggle')) {
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open', 'nav-menu-active');
        const icon = mobileToggle?.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
});

// Sticky Navbar on Scroll
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check for saved theme preference or default to 'light'
const currentTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', currentTheme);

if (themeToggle) {
    // Update icon based on current theme
    const icon = themeToggle.querySelector('i');
    if (currentTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
    
    themeToggle.addEventListener('click', () => {
        let theme = html.getAttribute('data-theme');
        
        if (theme === 'light') {
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            html.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}

// ===================================
// Counter Animation
// ===================================
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Intersection Observer for counters
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Observe all stat numbers
document.querySelectorAll('.stat-number').forEach(counter => {
    counterObserver.observe(counter);
});

// ===================================
// Event Carousel
// ===================================
const carousel = document.getElementById('eventCarousel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (carousel && prevBtn && nextBtn) {
    const scrollAmount = 420; // Card width + gap
    
    prevBtn.addEventListener('click', () => {
        carousel.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });
    
    nextBtn.addEventListener('click', () => {
        carousel.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Auto scroll carousel every 5 seconds
    let autoScrollInterval = setInterval(() => {
        if (carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 10) {
            carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }, 5000);
    
    // Pause auto scroll on hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoScrollInterval);
    });
    
    carousel.addEventListener('mouseleave', () => {
        autoScrollInterval = setInterval(() => {
            if (carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 10) {
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }, 5000);
    });
}

// ===================================
// Toast Notification
// ===================================
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (toast) {
        const messageElement = toast.querySelector('span');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
}

// Show welcome toast on page load
window.addEventListener('load', () => {
    setTimeout(() => {
        showToast('Welcome to CampusEvents!');
    }, 1000);
});

// ===================================
// Smooth Scroll
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#!') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ===================================
// Form Validation (Visual Feedback)
// ===================================
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const value = input.value.trim();
        const formGroup = input.closest('.form-group');
        
        if (!value) {
            isValid = false;
            if (formGroup) {
                formGroup.classList.add('error');
                formGroup.classList.remove('success');
            }
        } else {
            if (formGroup) {
                formGroup.classList.remove('error');
                formGroup.classList.add('success');
            }
        }
    });
    
    return isValid;
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Phone validation
function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\D/g, ''));
}

// Add real-time validation to forms
document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('blur', function() {
        const formGroup = this.closest('.form-group');
        if (this.value && !validateEmail(this.value)) {
            if (formGroup) {
                formGroup.classList.add('error');
                formGroup.classList.remove('success');
            }
        } else if (this.value) {
            if (formGroup) {
                formGroup.classList.remove('error');
                formGroup.classList.add('success');
            }
        }
    });
});

document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('blur', function() {
        const formGroup = this.closest('.form-group');
        if (this.value && !validatePhone(this.value)) {
            if (formGroup) {
                formGroup.classList.add('error');
                formGroup.classList.remove('success');
            }
        } else if (this.value) {
            if (formGroup) {
                formGroup.classList.remove('error');
                formGroup.classList.add('success');
            }
        }
    });
});

// ===================================
// Modal Functions
// ===================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            closeModal(modal.id);
        });
    }
});

// ===================================
// Tab Switching
// ===================================
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Initialize tabs if they exist
if (document.querySelector('.tab-btn')) {
    initTabs();
}

// ===================================
// Filter Toggle
// ===================================
function initFilters() {
    const filterToggle = document.getElementById('filterToggle');
    const filterSidebar = document.getElementById('filterSidebar');
    
    if (filterToggle && filterSidebar) {
        filterToggle.addEventListener('click', () => {
            filterSidebar.classList.toggle('active');
        });
    }
    
    // Filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            this.classList.toggle('active');
            // Here you would typically trigger a filter update
        });
    });
    
    // Remove filter chip
    document.querySelectorAll('.chip-remove').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.closest('.filter-chip').remove();
            // Here you would typically update the filter
        });
    });
}

// Initialize filters if they exist
if (document.getElementById('filterToggle')) {
    initFilters();
}

// ===================================
// Search Functionality
// ===================================
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');

if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        if (searchModal) {
            openModal('searchModal');
            const searchInput = searchModal.querySelector('input');
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 100);
            }
        }
    });
}

// ===================================
// File Upload Preview
// ===================================
function handleFileUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = input.closest('.file-upload').querySelector('.file-preview');
            if (preview) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            }
        };
        reader.readAsDataURL(file);
    }
}

document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
        handleFileUpload(this);
    });
});

// ===================================
// Countdown Timer
// ===================================
function startCountdown(targetDate, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = new Date(targetDate).getTime() - now;
        
        if (distance < 0) {
            clearInterval(timer);
            element.innerHTML = '<span class="countdown-expired">Event Started!</span>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        element.innerHTML = `
            <div class="countdown-item">
                <span class="countdown-value">${days}</span>
                <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${hours}</span>
                <span class="countdown-label">Hours</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${minutes}</span>
                <span class="countdown-label">Minutes</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${seconds}</span>
                <span class="countdown-label">Seconds</span>
            </div>
        `;
    }, 1000);
}

// ===================================
// Intersection Observer for Animations
// ===================================
const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            animateOnScroll.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// Observe elements with animate-on-scroll class
document.querySelectorAll('.animate-on-scroll').forEach(element => {
    animateOnScroll.observe(element);
});

// ===================================
// Copy to Clipboard
// ===================================
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// ===================================
// Share Functionality
// ===================================
function shareEvent(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        }).then(() => {
            showToast('Shared successfully!');
        }).catch(err => {
            console.log('Error sharing:', err);
        });
    } else {
        // Fallback: copy link to clipboard
        copyToClipboard(url);
    }
}

// ===================================
// Local Storage Functions
// ===================================
function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
}

// ===================================
// Rating System
// ===================================
function initRating() {
    document.querySelectorAll('.rating-stars').forEach(container => {
        const stars = container.querySelectorAll('.star');
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const rating = index + 1;
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
                
                // Store rating
                container.setAttribute('data-rating', rating);
                showToast(`You rated ${rating} stars!`);
            });
            
            star.addEventListener('mouseenter', () => {
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.classList.add('hover');
                    } else {
                        s.classList.remove('hover');
                    }
                });
            });
        });
        
        container.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });
}

// Initialize rating if exists
if (document.querySelector('.rating-stars')) {
    initRating();
}

// ===================================
// Notification Badge Update
// ===================================
function updateNotificationBadge(count) {
    const badge = document.querySelector('.icon-btn .badge');
    if (badge) {
        badge.textContent = count;
        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
        }
    }
}

// ===================================
// Auto-save Form Data
// ===================================
function autoSaveForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Load saved data
        const savedValue = localStorage.getItem(`form_${formId}_${input.name}`);
        if (savedValue && input.type !== 'password') {
            input.value = savedValue;
        }
        
        // Save on change
        input.addEventListener('change', () => {
            if (input.type !== 'password') {
                localStorage.setItem(`form_${formId}_${input.name}`, input.value);
            }
        });
    });
}

// ===================================
// Initialize Page-Specific Features
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Add any page-specific initialization here
    console.log('CampusEvents loaded successfully!');
});

// ===================================
// Utility Functions
// ===================================

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Format time
function formatTime(time) {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// ===================================
// Export functions for other pages
// ===================================
window.CampusEvents = {
    showToast,
    openModal,
    closeModal,
    validateForm,
    validateEmail,
    validatePhone,
    copyToClipboard,
    shareEvent,
    startCountdown,
    saveToLocalStorage,
    getFromLocalStorage,
    updateNotificationBadge,
    autoSaveForm,
    formatDate,
    formatTime,
    truncateText
};
