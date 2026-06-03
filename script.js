document.addEventListener('DOMContentLoaded', () => {
    createMatrixRain();
    createParticles();
    createBubbles();
    addPianoInteraction();
    addScrollAnimations();
    addDepthMeterInteraction();
});

function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (8 + Math.random() * 4) + 's';
        
        if (Math.random() > 0.5) {
            particle.style.background = '#ff00ff';
            particle.style.boxShadow = '0 0 10px #ff00ff, 0 0 20px #ff00ff';
        }
        
        container.appendChild(particle);
    }
}

function createBubbles() {
    const container = document.getElementById('bubbles');
    const bubbleCount = 15;
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        const size = 10 + Math.random() * 30;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.animationDuration = (8 + Math.random() * 10) + 's';
        bubble.style.animationDelay = Math.random() * 10 + 's';
        
        container.appendChild(bubble);
    }
}

function createMatrixRain() {
    const container = document.querySelector('.matrix-rain');
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    
    const chars = '袁沁ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    function draw() {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ffff';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 33);
}

function addPianoInteraction() {
    const keys = document.querySelectorAll('.piano-keys .key');
    
    keys.forEach((key) => {
        key.addEventListener('click', () => {
            const noteIndex = parseInt(key.dataset.note);
            playNote(noteIndex);
            key.style.transform = 'scaleY(0.95)';
            setTimeout(() => {
                key.style.transform = 'scaleY(1)';
            }, 100);
        });
    });
}

function playNote(index) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88];
    oscillator.frequency.value = frequencies[index % frequencies.length];
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function addScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

let depth = 0;
function addDepthMeterInteraction() {
    const depthMeter = document.querySelector('.depth-meter');
    const depthValue = document.getElementById('depthValue');
    const depthProgress = document.getElementById('depthProgress');
    
    if (depthMeter && depthValue && depthProgress) {
        depthMeter.addEventListener('click', () => {
            depth += Math.floor(Math.random() * 200) + 50;
            if (depth > 4500) depth = 0;
            
            depthValue.textContent = depth + 'm';
            depthProgress.style.width = (depth / 4500 * 100) + '%';
            
            if (depth >= 4500) {
                setTimeout(() => {
                    alert('🌊 恭喜！你已到达马里亚纳海沟底部！利维坦向你发出了钢琴演奏邀请！');
                }, 300);
            } else if (depth >= 2000) {
                depthValue.style.color = '#ff00ff';
            } else if (depth >= 1000) {
                depthValue.style.color = '#00ffff';
            }
        });
    }
}

let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateKonami();
    }
});

function activateKonami() {
    const body = document.body;
    body.style.animation = 'rainbow 2s linear infinite';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createConfetti();
        }, i * 100);
    }
    
    setTimeout(() => {
        body.style.animation = '';
        style.remove();
    }, 5000);
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${['#ff00ff', '#00ffff', '#ffff00', '#00ff00', '#ff0000'][Math.floor(Math.random() * 5)]};
        left: ${Math.random() * 100}%;
        top: -10px;
        z-index: 9999;
        pointer-events: none;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
    `;
    document.body.appendChild(confetti);
    
    const duration = 2000 + Math.random() * 1000;
    const xOffset = (Math.random() - 0.5) * 200;
    
    confetti.animate([
        { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(100vh) translateX(${xOffset}px) rotate(720deg)`, opacity: 0 }
    ], {
        duration: duration,
        easing: 'ease-in'
    }).onfinish = () => confetti.remove();
}

console.log('%c欢迎来到袁沁的个人世界！', 'font-size: 24px; color: #00ffff; text-shadow: 2px 2px #ff00ff;');
console.log('%c试试输入科乐美秘籍：↑↑↓↓←→←→BA', 'font-size: 14px; color: #ff00ff;');
console.log('%c点击深海迷航深度计，开始你的深海之旅！', 'font-size: 12px; color: #0066ff;');