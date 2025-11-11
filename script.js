// Configurações globais
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Menu Mobile Toggle
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Fechar menu ao clicar em um link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Scroll Spy - Destacar seção ativa
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Navegação suave com offset para navbar - otimizado
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#' || !targetId) return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        const navbarHeight = navbar.offsetHeight;
        const targetPosition = targetElement.offsetTop - navbarHeight;
        
        // Usar requestAnimationFrame para scroll suave
        let start = null;
        const startPos = window.pageYOffset;
        const distance = targetPosition - startPos;
        const duration = Math.min(Math.abs(distance) * 0.5, 800);
        
        function smoothScroll(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const ease = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            window.scrollTo(0, startPos + distance * ease);
            
            if (progress < 1) {
                requestAnimationFrame(smoothScroll);
            }
        }
        
        requestAnimationFrame(smoothScroll);
    });
});

// Animação de entrada dos elementos - otimizado com IntersectionObserver
let scrollAnimObserver = null;

function initScrollAnimations() {
    if ('IntersectionObserver' in window) {
        scrollAnimObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    if (entry.target.classList.contains('reveal-section')) {
                        entry.target.classList.add('active');
                    }
                    scrollAnimObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        document.querySelectorAll('.fade-in, .slide-up, .reveal-section').forEach(el => {
            scrollAnimObserver.observe(el);
        });
    } else {
        // Fallback para navegadores antigos
        animateOnScrollFallback();
    }
}

function animateOnScrollFallback() {
    const elements = document.querySelectorAll('.fade-in, .slide-up, .reveal-section');
    
    elements.forEach(element => {
        if (element.classList.contains('visible')) return;
        
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
            if (element.classList.contains('reveal-section')) {
                element.classList.add('active');
            }
        }
    });
}

// Navbar scroll effect
function handleNavbarScroll() {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Formulário de contato
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Validação básica
        if (!name || !email || !message) {
            showNotification('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Por favor, insira um e-mail válido.', 'error');
            return;
        }
        
        // Simular envio (aqui você integraria com seu backend)
        showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
        this.reset();
    });
}

// Validação de e-mail
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    // Remove notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#00A86B' : type === 'error' ? '#e74c3c' : '#0066CC'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Botão de fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Parallax removido para melhor performance - usando CSS puro se necessário

// Lazy loading para imagens
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;
    if (!('IntersectionObserver' in window)) {
        images.forEach(img => { img.src = img.dataset.src; img.classList.remove('lazy'); });
        return;
    }
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.addEventListener('load', () => img.classList.remove('lazy'));
                imageObserver.unobserve(img);
            }
        });
    }, { rootMargin: '200px' });
    images.forEach(img => imageObserver.observe(img));
}

// Smooth reveal para cards - otimizado
function revealCards() {
    const cards = document.querySelectorAll('.service-card, .plan-card, .blog-card');
    
    cards.forEach((card) => {
        const cardTop = card.getBoundingClientRect().top;
        const cardVisible = 150;
        
        if (cardTop < window.innerHeight - cardVisible && !card.classList.contains('revealed')) {
            card.classList.add('revealed');
        }
    });
}

// Contador animado para estatísticas (se necessário)
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Otimização de scroll com requestAnimationFrame
let ticking = false;
let lastScrollY = 0;

function onScroll() {
    lastScrollY = window.scrollY;
    
    if (!ticking) {
        requestAnimationFrame(() => {
            updateActiveNavLink();
            handleNavbarScroll();
            revealCards();
            if (!scrollAnimObserver) {
                animateOnScrollFallback();
            }
            ticking = false;
        });
        ticking = true;
    }
}

// Event Listeners
window.addEventListener('scroll', onScroll, { passive: true });

window.addEventListener('load', () => {
    initScrollAnimations();
    lazyLoadImages();
    animateCounters();
    if (!scrollAnimObserver) {
        animateOnScrollFallback();
    }
});

// Resize handler
window.addEventListener('resize', () => {
    // Fechar menu mobile em telas grandes
    if (window.innerWidth > 768) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Scroll otimizado já implementado acima com requestAnimationFrame

// Carousel removido - layout agora usa CSS Grid estático


// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar classe para animações CSS
    document.body.classList.add('loaded');
    
    // Inicializar animações com IntersectionObserver
    initScrollAnimations();

    // IntersectionObserver para revelar suavemente a seção de comunicação
    const communicationSection = document.querySelector('.communication-section');
    if (communicationSection) {
        // estado inicial invisível com leve deslocamento
        communicationSection.classList.add('reveal-init');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
                    communicationSection.classList.add('in-view');
                    observer.unobserve(communicationSection);
                }
            });
        }, { threshold: [0, 0.2, 0.5, 1] });
        observer.observe(communicationSection);
    }

    // Busca e filtros da seção Comunicações
    const searchInput = document.getElementById('comms-search');
    const filterSelect = document.getElementById('comms-filter');
    const catButtons = Array.from(document.querySelectorAll('.comms-cat-btn'));
    const commsCards = Array.from(document.querySelectorAll('.comms-card'));
    const emptyState = document.getElementById('comms-empty');

    function applyCommsFilter() {
        const term = (searchInput ? searchInput.value : '').trim().toLowerCase();
        const cat = (filterSelect ? filterSelect.value : '').trim();
        let visible = 0;
        commsCards.forEach(card => {
            const title = (card.querySelector('.comms-title')?.textContent || '').toLowerCase();
            const desc = (card.querySelector('.comms-desc')?.textContent || '').toLowerCase();
            const category = (card.getAttribute('data-category') || '').toLowerCase();
            const matchTerm = !term || title.includes(term) || desc.includes(term);
            const matchCat = !cat || category === cat;
            const show = matchTerm && matchCat;
            card.style.display = show ? '' : 'none';
            if (show) visible++;
        });
        if (emptyState) emptyState.style.display = visible === 0 ? '' : 'none';
    }

    if (searchInput) searchInput.addEventListener('input', applyCommsFilter);
    if (filterSelect) filterSelect.addEventListener('change', applyCommsFilter);
    if (catButtons.length) {
        catButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                catButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (filterSelect) filterSelect.value = btn.dataset.cat || '';
                applyCommsFilter();
            });
        });
    }
    applyCommsFilter();

    // Navegação dos botões de notícias para páginas individuais
    const blogSection = document.querySelector('.blog-section');
    if (blogSection) {
        // Destaque principal
        const featuredBtn = blogSection.querySelector('.comms-featured .service-btn');
        if (featuredBtn && !featuredBtn.__bound) {
            featuredBtn.__bound = true;
            featuredBtn.addEventListener('click', () => {
                window.location.href = 'noticia1.html';
            });
        }

    // Newsletter subscription removed (section deleted)
    // Plan modal removed: buttons will navigate to plan pages instead

    // Plans carousel for mobile: arrows, dots, swipe
    function initPlansCarousel(){
        const carousel = document.getElementById('plansCarousel');
        if (!carousel) return;
        const track = carousel.querySelector('.plans-track');
        const prevBtn = carousel.querySelector('.plans-prev');
        const nextBtn = carousel.querySelector('.plans-next');
        const dotsContainer = carousel.querySelector('.plans-dots');
        const cards = Array.from(track.querySelectorAll('.plan-card'));
        if (!track || !cards.length) return;
        // create dots and attach basic click to move the track
        cards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'plans-dot';
            dot.setAttribute('aria-label', `Ir para plano ${i+1}`);
            dotsContainer.appendChild(dot);
            dot.addEventListener('click', () => {
                track.scrollTo({ left: cards[i].offsetLeft, behavior: 'smooth' });
            });
        });

        // Attach a single click handler to plan buttons (navigate to plan pages)
        document.querySelectorAll('.plan-button').forEach(btn => {
            if (btn.__bound) return;
            btn.__bound = true;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.plan-card');
                const key = card && card.dataset && card.dataset.plan ? card.dataset.plan : null;
                if (!key) return;
                const map = {
                    basico: '/planos/basico.html',
                    profissional: '/planos/profissional.html',
                    premium: '/planos/premium.html',
                    corporativo: '/planos/corporativo.html'
                };
                const target = map[key] || '/planos/basico.html';
                window.location.href = target;
            });
        });

        // Lista de comunicações (grid)
        const gridButtons = Array.from(blogSection.querySelectorAll('.comms-grid .service-btn'));
        const gridTargets = ['noticia1.html', 'noticia2.html', 'noticia3.html', 'noticia4.html'];
        gridButtons.forEach((btn, idx) => {
            if (!btn.__bound) {
                btn.__bound = true;
                btn.addEventListener('click', () => {
                    const target = gridTargets[idx] || 'noticia1.html';
                    window.location.href = target;
                });
            }
        });
    }

    // invoke carousel init
    initPlansCarousel();

    }
});


// Service Worker removido para evitar bloqueios de renderização