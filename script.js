// ========== 粒子背景系统 ==========
function createParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 6 + 2;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 15 + 10;
        const animationDelay = Math.random() * 10;
        const color = Math.random() > 0.5 ? '#00ffff' : '#ff00ff';
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.background = color;
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
        particle.style.animationDuration = `${animationDuration}s`;
        particle.style.animationDelay = `${animationDelay}s`;
        
        container.appendChild(particle);
    }
}

// ========== 终端打字机效果 ==========
function typeTerminal() {
    const terminalContent = document.getElementById('terminal-content');
    const lines = [
        { type: 'prompt', text: 'whoami' },
        { type: 'output', text: '袁沁 | 一个在数字海洋中游荡的灵魂' },
        { type: 'blank' },
        { type: 'prompt', text: 'cat /etc/interests.txt' },
        { type: 'output', text: '🎹 钢琴 - 黑白键上的赛博朋克' },
        { type: 'output', text: '🌊 深海迷航 - 压力越大，越要发光' },
        { type: 'output', text: '🎵 音乐 - 频率与灵魂的共振实验' },
        { type: 'blank' },
        { type: 'prompt', text: 'echo $PHILOSOPHY' },
        { type: 'output', text: '"生活就像潜水，有时候你会被压力压垮，但只要你继续发光，总能找到出路。"' },
        { type: 'blank' },
        { type: 'prompt', text: 'uptime' },
        { type: 'output', text: '已运行 20+ 年，偶尔蓝屏，但总能重启' },
        { type: 'blank' },
        { type: 'prompt', text: 'sudo make coffee' },
        { type: 'output', text: '☕ 正在酿造赛博咖啡... 完成！' },
    ];
    
    let delay = 0;
    lines.forEach((line, index) => {
        if (line.type === 'blank') {
            delay += 200;
            return;
        }
        
        setTimeout(() => {
            const lineElement = document.createElement('div');
            lineElement.classList.add('terminal-line');
            lineElement.style.animationDelay = '0s';
            
            if (line.type === 'prompt') {
                lineElement.innerHTML = `<span class="prompt">yuanqin@cyber:~$ </span>${line.text}`;
            } else {
                lineElement.textContent = line.text;
            }
            
            terminalContent.appendChild(lineElement);
        }, delay);
        
        delay += line.type === 'prompt' ? 800 : 400;
    });
}

// ========== 88键钢琴交互 ==========
class Piano {
    constructor() {
        this.audioContext = null;
        this.whiteKeyWidth = 36;
        this.blackKeyWidth = 24;
        this.isMouseDown = false;
        this.buildPiano();
        this.initKeyboard();
    }
    
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // 钢琴音色合成：基频 + 泛音列 + ADSR包络
    playNote(midi) {
        this.initAudioContext();
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const freq = 440 * Math.pow(2, (midi - 69) / 12);
        
        // 创建主增益节点
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        
        // ADSR包络 - 钢琴特性：快速起音，自然衰减
        const attack = 0.005;
        const decay = 0.3;
        const sustainLevel = 0.25;
        const release = 1.2;
        const peakGain = 0.28;
        
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(peakGain, now + attack);
        masterGain.gain.exponentialRampToValueAtTime(sustainLevel * peakGain, now + attack + decay);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay + release);
        
        // 泛音列模拟钢琴音色
        const harmonics = [
            { ratio: 1, gain: 1.0 },    // 基频
            { ratio: 2, gain: 0.5 },    // 2倍频
            { ratio: 3, gain: 0.25 },   // 3倍频
            { ratio: 4, gain: 0.12 },   // 4倍频
            { ratio: 5, gain: 0.06 },   // 5倍频
            { ratio: 6, gain: 0.03 },   // 6倍频
        ];
        
        const oscillators = [];
        
        harmonics.forEach(h => {
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq * h.ratio;
            
            // 高频泛音衰减更快
            const harmonicRelease = release / (1 + h.ratio * 0.3);
            oscGain.gain.setValueAtTime(h.gain, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay + harmonicRelease);
            
            osc.connect(oscGain);
            oscGain.connect(masterGain);
            
            osc.start(now);
            osc.stop(now + attack + decay + harmonicRelease + 0.1);
            
            oscillators.push(osc);
        });
    }
    
    buildPiano() {
        const container = document.getElementById('pianoKeys');
        if (!container) return;
        
        const pianoStartMidi = 21; // A0
        const pianoEndMidi = 108;  // C8
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const blackIndices = [1, 3, 6, 8, 10];
        
        // 键盘映射: 1~m 按键盘物理排列顺序
        const keys = '1234567890qwertyuiopasdfghjklzxcvbnm';
        this.keyMap = {};
        const keyLabels = {};
        const kbStartMidi = 60; // C4
        for (let i = 0; i < keys.length; i++) {
            this.keyMap[keys[i]] = kbStartMidi + i;
            keyLabels[kbStartMidi + i] = keys[i];
        }
        
        let whiteCount = 0;
        for (let m = pianoStartMidi; m <= pianoEndMidi; m++) {
            if (!blackIndices.includes(m % 12)) whiteCount++;
        }
        
        const whiteRow = document.createElement('div');
        whiteRow.className = 'white-keys-row';
        whiteRow.style.display = 'flex';
        container.appendChild(whiteRow);
        
        const blackRow = document.createElement('div');
        blackRow.className = 'black-keys-row';
        blackRow.style.position = 'absolute';
        blackRow.style.top = '0';
        blackRow.style.left = '0';
        blackRow.style.width = (whiteCount * this.whiteKeyWidth) + 'px';
        blackRow.style.height = '140px';
        blackRow.style.pointerEvents = 'none';
        container.appendChild(blackRow);
        
        let whiteIndex = 0;
        
        for (let midi = pianoStartMidi; midi <= pianoEndMidi; midi++) {
            const noteIdx = midi % 12;
            const octave = Math.floor(midi / 12) - 1;
            const isBlack = blackIndices.includes(noteIdx);
            const noteName = noteNames[noteIdx] + octave;
            
            const key = document.createElement('div');
            key.dataset.midi = midi;
            key.dataset.note = noteName;
            
            if (!isBlack) {
                key.className = 'key white';
                let label = noteName;
                if (keyLabels[midi]) {
                    label += `<br><span class="key-label">${keyLabels[midi].toUpperCase()}</span>`;
                }
                key.innerHTML = label;
                whiteRow.appendChild(key);
                whiteIndex++;
            } else {
                key.className = 'key black';
                const leftPos = whiteIndex * this.whiteKeyWidth - this.blackKeyWidth / 2;
                key.style.left = leftPos + 'px';
                key.style.pointerEvents = 'auto';
                if (keyLabels[midi]) {
                    key.innerHTML = `<span class="key-label-black">${keyLabels[midi].toUpperCase()}</span>`;
                }
                blackRow.appendChild(key);
            }
            
            key.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.triggerKey(key);
            });
            
            key.addEventListener('mouseenter', (e) => {
                if (this.isMouseDown) {
                    e.stopPropagation();
                    this.triggerKey(key);
                }
            });
            
            key.addEventListener('mouseleave', (e) => {
                e.stopPropagation();
            });
        }
        
        document.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
        
        container.addEventListener('mousedown', () => {
            this.isMouseDown = true;
        });
        
        let lastTouched = null;
        
        const handleTouch = (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                const el = document.elementFromPoint(touch.clientX, touch.clientY);
                if (el && el.closest && el.closest('.key')) {
                    const keyEl = el.closest('.key');
                    if (keyEl !== lastTouched) {
                        this.triggerKey(keyEl);
                        lastTouched = keyEl;
                    }
                }
            }
        };
        
        container.addEventListener('touchstart', handleTouch, { passive: false });
        container.addEventListener('touchmove', handleTouch, { passive: false });
        container.addEventListener('touchend', () => {
            lastTouched = null;
        });
    }
    
    triggerKey(keyEl) {
        const midi = parseInt(keyEl.dataset.midi);
        this.playNote(midi);
    }
    
    initKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const k = e.key.toLowerCase();
            const midi = this.keyMap[k];
            if (midi !== undefined) {
                this.playNote(midi);
                
                // 同步高亮对应琴键
                const keyEl = document.querySelector(`.key[data-midi="${midi}"]`);
                if (keyEl) keyEl.classList.add('active');
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const k = e.key.toLowerCase();
            const midi = this.keyMap[k];
            if (midi !== undefined) {
                const keyEl = document.querySelector(`.key[data-midi="${midi}"]`);
                if (keyEl) keyEl.classList.remove('active');
            }
        });
    }
}

// ========== 爱好卡片导航 ==========
function setupHobbyCards() {
    const cards = document.querySelectorAll('.hobby-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const target = card.dataset.target;
            const targetSection = document.getElementById(target);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ========== 深海深度计动画 ==========
function animateDepthMeter() {
    const depthFill = document.querySelector('.depth-fill');
    const depthValue = document.querySelector('.depth-value');
    const targetDepth = 20000;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 动画填充深度条
                let currentDepth = 0;
                const interval = setInterval(() => {
                    currentDepth += 200;
                    if (currentDepth >= targetDepth) {
                        currentDepth = targetDepth;
                        clearInterval(interval);
                    }
                    
                    const percentage = (currentDepth / targetDepth) * 100;
                    depthFill.style.width = `${percentage}%`;
                    depthValue.textContent = `${currentDepth}m / ${targetDepth}m`;
                }, 50);
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(document.getElementById('ocean'));
}

// ========== 滚动动画 (Intersection Observer) ==========
function setupScrollAnimations() {
    const fadeElements = document.querySelectorAll('.terminal, .hobby-card, .piano-container, .depth-meter, .wave-container');
    
    fadeElements.forEach(el => {
        el.classList.add('fade-in');
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(el => {
        observer.observe(el);
    });
}

// ========== 科乐美秘籍彩蛋 ==========
function setupKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let currentIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[currentIndex]) {
            currentIndex++;
            
            if (currentIndex === konamiCode.length) {
                activateEasterEgg();
                currentIndex = 0;
            }
        } else {
            currentIndex = 0;
        }
    });
}

function activateEasterEgg() {
    // 彩虹色相旋转
    document.body.classList.add('easter-egg-active');
    
    // 创建彩色纸屑
    const colors = ['#00ffff', '#ff00ff', '#00ff00', '#ff5f56', '#ffbd2e', '#0066ff'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 50);
    }
    
    // 5秒后恢复正常
    setTimeout(() => {
        document.body.classList.remove('easter-egg-active');
    }, 5000);
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    typeTerminal();
    const piano = new Piano();
    setupHobbyCards();
    animateDepthMeter();
    setupScrollAnimations();
    setupKonamiCode();
});
