document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    // Learn Section
    const tabBtns = document.querySelectorAll('.tab-btn');
    const learnContent = document.getElementById('learn-content');
    
    // Test Section
    const startTestBtns = document.querySelectorAll('.test-start-btn');
    const testSetup = document.getElementById('test-setup');
    const testActive = document.getElementById('test-active');
    const testSummary = document.getElementById('test-summary');
    const questionText = document.getElementById('question-text');
    const optionsGrid = document.getElementById('options-grid');
    const feedbackMsg = document.getElementById('feedback');
    const progressFill = document.getElementById('progress-fill');
    const scoreDisplay = document.getElementById('score-display');
    const testTitle = document.getElementById('test-title');
    const btnReturnSetup = document.getElementById('btn-return-setup');
    
    // State
    let currentTestMode = null;
    let questionQueue = [];
    let currentQuestion = null;
    let totalQuestions = 0;
    let initialTotalQuestions = 0;
    let correctAnswers = 0;
    let reviewItems = new Set();
    
    // --- Navigation Logic ---
    navBtns.forEach(btn => {
        if(btn.id === 'btn-return-setup') return; // Handled separately
        btn.addEventListener('click', () => {
            navBtns.forEach(b => {
                if(b.id !== 'btn-return-setup') b.classList.remove('active');
            });
            btn.classList.add('active');
            
            sections.forEach(sec => sec.classList.remove('active'));
            if(btn.id === 'nav-learn') {
                document.getElementById('learn-section').classList.add('active');
            } else {
                document.getElementById('test-section').classList.add('active');
                resetTestView();
            }
        });
    });

    // --- Learn Logic ---
    function renderTables() {
        let html = '<div class="grid-container">';
        for(let i = 1; i <= 20; i++) {
            html += `<div class="math-card"><h3>Table of ${i}</h3>`;
            for(let j = 1; j <= 10; j++) {
                html += `<div class="math-row"><span>${i} × ${j}</span> <span>${i*j}</span></div>`;
            }
            html += `</div>`;
        }
        html += '</div>';
        learnContent.innerHTML = html;
    }

    function renderSquares() {
        let html = '<div class="grid-container">';
        let numCards = 3;
        let itemsPerCard = 10;
        
        for(let c = 0; c < numCards; c++) {
            let start = c * itemsPerCard + 1;
            let end = start + itemsPerCard - 1;
            html += `<div class="math-card"><h3>Squares ${start}-${end}</h3>`;
            for(let i = start; i <= end; i++) {
                html += `<div class="math-row"><span>${i}²</span> <span>${i*i}</span></div>`;
            }
            html += `</div>`;
        }
        html += '</div>';
        learnContent.innerHTML = html;
    }

    function renderCubes() {
        let html = '<div class="grid-container">';
        let numCards = 2;
        let itemsPerCard = 10;
        
        for(let c = 0; c < numCards; c++) {
            let start = c * itemsPerCard + 1;
            let end = start + itemsPerCard - 1;
            html += `<div class="math-card"><h3>Cubes ${start}-${end}</h3>`;
            for(let i = start; i <= end; i++) {
                html += `<div class="math-row"><span>${i}³</span> <span>${i*i*i}</span></div>`;
            }
            html += `</div>`;
        }
        html += '</div>';
        learnContent.innerHTML = html;
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const target = btn.getAttribute('data-target');
            if(target === 'tables') renderTables();
            if(target === 'squares') renderSquares();
            if(target === 'cubes') renderCubes();
        });
    });

    // Initial render
    renderTables();

    // --- Test Logic ---
    function resetTestView() {
        testSetup.classList.remove('hidden');
        testActive.classList.add('hidden');
        testSummary.classList.add('hidden');
    }

    startTestBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            startTest(type);
        });
    });

    function generateQuestions(type) {
        let questions = [];
        if(type === 'tables') {
            for(let k=0; k<20; k++) {
                let i = Math.floor(Math.random() * 19) + 2; // 2 to 20
                let j = Math.floor(Math.random() * 9) + 2; // 2 to 10
                questions.push({ text: `${i} × ${j}`, answer: i * j, type: 'tables' });
            }
        } else if(type === 'squares') {
            for(let k=0; k<15; k++) {
                let i = Math.floor(Math.random() * 29) + 2; // 2 to 30
                questions.push({ text: `${i}²`, answer: i * i, type: 'squares' });
            }
        } else if(type === 'cubes') {
            for(let k=0; k<15; k++) {
                let i = Math.floor(Math.random() * 19) + 2; // 2 to 20
                questions.push({ text: `${i}³`, answer: i * i * i, type: 'cubes' });
            }
        }
        return questions.sort(() => Math.random() - 0.5);
    }

    function startTest(type) {
        currentTestMode = type;
        testTitle.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ' Test';
        
        questionQueue = generateQuestions(type);
        initialTotalQuestions = questionQueue.length;
        totalQuestions = questionQueue.length;
        correctAnswers = 0;
        reviewItems.clear();
        
        testSetup.classList.add('hidden');
        testActive.classList.remove('hidden');
        
        updateProgress();
        nextQuestion();
    }

    function updateProgress() {
        let answered = totalQuestions - questionQueue.length;
        let percentage = (answered / totalQuestions) * 100;
        progressFill.style.width = `${percentage}%`;
        scoreDisplay.textContent = `Score: ${correctAnswers}`;
    }

    function generateOptions(correctAnswer, type) {
        let options = [correctAnswer];
        let attempts = 0;
        while(options.length < 4 && attempts < 50) {
            attempts++;
            let offset = Math.floor(Math.random() * 20) - 10;
            if (offset === 0) offset = 5;
            
            let wrongAnswer = correctAnswer + offset;
            
            if(type === 'squares' || type === 'cubes') {
               let baseApprox = type === 'squares' ? Math.sqrt(correctAnswer) : Math.cbrt(correctAnswer);
               let wrongBase = Math.round(baseApprox) + (Math.random() > 0.5 ? 1 : -1);
               if(wrongBase < 1) wrongBase = 2;
               wrongAnswer = type === 'squares' ? wrongBase * wrongBase : wrongBase * wrongBase * wrongBase;
               
               if(wrongAnswer === correctAnswer) wrongAnswer += (Math.floor(Math.random() * 10) + 1);
            }

            if(wrongAnswer > 0 && !options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }
        }
        
        let fallback = correctAnswer + 1;
        while(options.length < 4) {
            if(!options.includes(fallback)) options.push(fallback);
            fallback++;
        }
        
        return options.sort(() => Math.random() - 0.5);
    }

    function nextQuestion() {
        if(questionQueue.length === 0) {
            endTest();
            return;
        }
        
        currentQuestion = questionQueue.shift();
        questionText.textContent = currentQuestion.text + ' = ?';
        
        const options = generateOptions(currentQuestion.answer, currentQuestion.type);
        
        optionsGrid.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => handleAnswer(opt, btn));
            optionsGrid.appendChild(btn);
        });
        
        feedbackMsg.textContent = '';
        feedbackMsg.className = 'feedback-msg';
    }

    function handleAnswer(selectedAnswer, btnElement) {
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => btn.disabled = true);
        
        if(selectedAnswer === currentQuestion.answer) {
            btnElement.classList.add('correct');
            feedbackMsg.textContent = 'Correct! Awesome!';
            feedbackMsg.classList.add('correct-text');
            correctAnswers++;
            
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6, x: 0 },
                    disableForReducedMotion: true
                });
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6, x: 1 },
                    disableForReducedMotion: true
                });
            }
        } else {
            btnElement.classList.add('wrong');
            feedbackMsg.textContent = `Incorrect. ${currentQuestion.text} = ${currentQuestion.answer}`;
            feedbackMsg.classList.add('wrong-text');
            
            let insertIndex = Math.min(questionQueue.length, 3);
            questionQueue.splice(insertIndex, 0, currentQuestion);
            totalQuestions++;
            
            reviewItems.add(`${currentQuestion.text} = ${currentQuestion.answer}`);
            
            optionBtns.forEach(b => {
                if(parseInt(b.textContent) === currentQuestion.answer) {
                    b.classList.add('correct');
                }
            });
        }
        
        updateProgress();
        
        setTimeout(() => {
            nextQuestion();
        }, 500);
    }

    function endTest() {
        testActive.classList.add('hidden');
        testSummary.classList.remove('hidden');
        
        progressFill.style.width = '100%';
        
        document.getElementById('summary-total').textContent = initialTotalQuestions;
        document.getElementById('summary-correct').textContent = correctAnswers;
        
        let mistakes = reviewItems.size;
        let accuracy = Math.round(((initialTotalQuestions - mistakes) / initialTotalQuestions) * 100);
        document.getElementById('summary-accuracy').textContent = accuracy;
        
        const reviewSection = document.getElementById('review-section');
        const reviewList = document.getElementById('review-list');
        
        if(reviewItems.size > 0) {
            reviewSection.classList.remove('hidden');
            reviewList.innerHTML = '';
            reviewItems.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                reviewList.appendChild(li);
            });
        } else {
            reviewSection.classList.add('hidden');
        }
    }

    btnReturnSetup.addEventListener('click', resetTestView);
});
