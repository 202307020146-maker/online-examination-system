// Sample question data (hardcoded for demonstration)
const questions = [
    {
        type: 'mcq',
        question: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correct: 'Paris'
    },
    {
        type: 'mcq',
        question: 'Which programming language is used for web development?',
        options: ['Python', 'JavaScript', 'C++', 'Java'],
        correct: 'JavaScript'
    },
    {
        type: 'mcq',
        question: 'What does HTML stand for?',
        options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
        correct: 'HyperText Markup Language'
    },
    {
        type: 'mcq',
        question: 'Which of the following is a JavaScript framework?',
        options: ['Django', 'React', 'Laravel', 'Flask'],
        correct: 'React'
    },
    {
        type: 'mcq',
        question: 'What is the result of 2 + 2?',
        options: ['3', '4', '5', '6'],
        correct: '4'
    },
    {
        type: 'descriptive',
        question: 'Explain the concept of responsive web design in 2-3 sentences.',
        correct: 'Responsive web design is an approach to web development where a website automatically adjusts its layout, images, and content to fit different screen sizes and devices.'
    },
    {
        type: 'descriptive',
        question: 'Describe the difference between var, let, and const in JavaScript.',
        correct: 'var is function-scoped and can be redeclared, let is block-scoped and cannot be redeclared, const is also block-scoped but must be initialized at declaration and cannot be reassigned.'
    }
];

// Global variables
let shuffledQuestions = [];
let timerInterval;
let timeLeft = 600; // 10 minutes in seconds
let examSubmitted = false;

// DOM elements
const landingPage = document.getElementById('landing-page');
const examPage = document.getElementById('exam-page');
const resultsPage = document.getElementById('results-page');
const startExamBtn = document.getElementById('start-exam-btn');
const submitExamBtn = document.getElementById('submit-exam-btn');
const retakeExamBtn = document.getElementById('retake-exam-btn');
const timerDisplay = document.getElementById('timer-display');
const progressBar = document.getElementById('progress');
const questionsContainer = document.getElementById('questions-container');

// Initialize the application
function init() {
    // Event listeners
    startExamBtn.addEventListener('click', startExam);
    submitExamBtn.addEventListener('click', submitExam);
    retakeExamBtn.addEventListener('click', retakeExam);

    // Integrity checks
    window.addEventListener('beforeunload', (e) => {
        if (!examSubmitted) {
            e.preventDefault();
            e.returnValue = 'Are you sure you want to leave? Your exam progress will be lost.';
        }
    });

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    document.addEventListener('copy', (e) => {
        e.preventDefault();
    });

    document.addEventListener('paste', (e) => {
        e.preventDefault();
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
            e.preventDefault();
        }
    });
}

// Start the exam
function startExam() {
    // Shuffle questions for fairness
    shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);

    // Reset timer and variables
    timeLeft = 600;
    examSubmitted = false;

    // Switch to exam page
    landingPage.classList.remove('active');
    examPage.classList.add('active');

    // Render questions
    renderQuestions();

    // Start timer
    timerInterval = setInterval(updateTimer, 1000);
}

// Render questions dynamically
function renderQuestions() {
    questionsContainer.innerHTML = '';
    shuffledQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-card';

        let questionHTML = `<h3>${index + 1}. ${q.question}</h3>`;

        if (q.type === 'mcq') {
            questionHTML += '<div class="options">';
            q.options.forEach(option => {
                questionHTML += `
                    <label class="option">
                        <input type="radio" name="q${index}" value="${option}">
                        ${option}
                    </label>
                `;
            });
            questionHTML += '</div>';
        } else if (q.type === 'descriptive') {
            questionHTML += `<textarea class="descriptive-answer" name="q${index}" placeholder="Enter your answer here..."></textarea>`;
        }

        questionDiv.innerHTML = questionHTML;
        questionsContainer.appendChild(questionDiv);
    });
}

// Update timer and progress bar
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const progressPercent = ((600 - timeLeft) / 600) * 100;
    progressBar.style.width = `${progressPercent}%`;

    timeLeft--;

    if (timeLeft < 0) {
        clearInterval(timerInterval);
        submitExam(true); // Auto-submit on timeout
    }
}

// Submit the exam
function submitExam(autoSubmit = false) {
    if (examSubmitted) return; // Prevent multiple submissions

    clearInterval(timerInterval);
    examSubmitted = true;

    // Validation: Check if all questions are attempted
    let allAttempted = true;
    shuffledQuestions.forEach((q, index) => {
        const input = document.querySelector(`[name="q${index}"]`);
        if (q.type === 'mcq') {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            if (!selected) allAttempted = false;
        } else if (q.type === 'descriptive') {
            if (!input.value.trim()) allAttempted = false;
        }
    });

    if (!allAttempted && !autoSubmit) {
        alert('Please attempt all questions before submitting.');
        examSubmitted = false;
        timerInterval = setInterval(updateTimer, 1000); // Restart timer
        return;
    }

    // Evaluate answers
    const results = evaluateAnswers();

    // Switch to results page
    examPage.classList.remove('active');
    resultsPage.classList.add('active');

    // Show results
    showResults(results);
}

// Evaluate answers
function evaluateAnswers() {
    let correct = 0;
    let incorrect = 0;
    let attempted = 0;
    let unattempted = 0;
    const detailedResults = [];

    shuffledQuestions.forEach((q, index) => {
        const input = document.querySelector(`[name="q${index}"]`);
        let userAnswer = '';
        let isCorrect = false;

        if (q.type === 'mcq') {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            if (selected) {
                userAnswer = selected.value;
                attempted++;
                if (userAnswer === q.correct) {
                    correct++;
                    isCorrect = true;
                } else {
                    incorrect++;
                }
            } else {
                unattempted++;
            }
        } else if (q.type === 'descriptive') {
            userAnswer = input.value.trim();
            if (userAnswer) {
                attempted++;
                // For descriptive, we mark as attempted but don't auto-grade
                isCorrect = 'attempted'; // Custom flag for descriptive
            } else {
                unattempted++;
            }
        }

        detailedResults.push({
            question: q.question,
            userAnswer: userAnswer,
            correctAnswer: q.correct || 'N/A',
            isCorrect: isCorrect
        });
    });

    return {
        totalScore: correct, // 1 point per correct MCQ
        correct: correct,
        incorrect: incorrect,
        attempted: attempted,
        unattempted: unattempted,
        detailedResults: detailedResults
    };
}

// Show results
function showResults(results) {
    document.getElementById('total-score').textContent = results.totalScore;
    document.getElementById('correct-count').textContent = results.correct;
    document.getElementById('incorrect-count').textContent = results.incorrect;
    document.getElementById('attempted-count').textContent = results.attempted;
    document.getElementById('unattempted-count').textContent = results.unattempted;

    const detailedResultsDiv = document.getElementById('detailed-results');
    detailedResultsDiv.innerHTML = '';

    results.detailedResults.forEach((result, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'detailed-result';

        let status = '';
        if (result.isCorrect === true) {
            status = 'correct';
            resultDiv.classList.add('correct');
        } else if (result.isCorrect === false) {
            status = 'incorrect';
            resultDiv.classList.add('incorrect');
        } else if (result.isCorrect === 'attempted') {
            status = 'attempted (descriptive)';
            resultDiv.classList.add('unattempted'); // Using unattempted style for descriptive
        } else {
            status = 'unattempted';
            resultDiv.classList.add('unattempted');
        }

        resultDiv.innerHTML = `
            <strong>Question ${index + 1}:</strong> ${result.question}<br>
            <strong>Your Answer:</strong> ${result.userAnswer || 'Not answered'}<br>
            <strong>Correct Answer:</strong> ${result.correctAnswer}<br>
            <strong>Status:</strong> ${status}
        `;

        detailedResultsDiv.appendChild(resultDiv);
    });
}

// Retake the exam
function retakeExam() {
    // Reset and go back to landing page
    resultsPage.classList.remove('active');
    landingPage.classList.add('active');
    examSubmitted = false;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
