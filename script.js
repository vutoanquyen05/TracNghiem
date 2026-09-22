/**
 * Cấu trúc dữ liệu Hàng đợi Queue (FIFO - First In First Out)
 */
class Queue {
    constructor() {
        this.items = [];
    }

    // Đưa phần tử vào cuối hàng đợi
    enqueue(element) {
        this.items.push(element);
    }

    // Lấy phần tử đầu tiên ra khỏi hàng đợi
    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift();
    }

    // Kiểm tra rỗng
    isEmpty() {
        return this.items.length === 0;
    }

    // Lấy tất cả phần tử dưới dạng Mảng
    toArray() {
        return [...this.items];
    }

    // Xóa sạch hàng đợi
    clear() {
        this.items = [];
    }
}

// Trạng thái ứng dụng
const state = {
    fileName: '',
    questions: [],          // Danh sách câu hỏi lấy từ Queue
    userAnswers: {},        // { questionIndex: selectedOptionKey (ví dụ 'A') }
    currentIndex: 0,        // Chỉ số câu hỏi hiện tại đang xem
    isSubmitted: false,     // Đã nộp bài hay chưa
    activeFilter: 'all'     // Bộ lọc chế độ xem sau khi nộp ('all', 'correct', 'wrong')
};

// Khởi tạo đối tượng Queue
const questionQueue = new Queue();

// DOM Elements
const elements = {
    uploadScreen: document.getElementById('uploadScreen'),
    quizScreen: document.getElementById('quizScreen'),
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    btnSelectFile: document.getElementById('btnSelectFile'),
    quizTitle: document.getElementById('quizTitle'),
    headerActions: document.getElementById('headerActions'),
    
    // Quiz View Elements
    questionGrid: document.getElementById('questionGrid'),
    progressBadge: document.getElementById('progressBadge'),
    filterGroup: document.getElementById('filterGroup'),
    questionNumber: document.getElementById('questionNumber'),
    reviewStatus: document.getElementById('reviewStatus'),
    questionText: document.getElementById('questionText'),
    optionsContainer: document.getElementById('optionsContainer'),
    explanationBox: document.getElementById('explanationBox'),
    explanationText: document.getElementById('explanationText'),
    
    // Action Buttons
    btnPrev: document.getElementById('btnPrev'),
    btnNext: document.getElementById('btnNext'),
    btnRestart: document.getElementById('btnRestart'),
    btnNewFile: document.getElementById('btnNewFile'),
    btnSubmit: document.getElementById('btnSubmit'),
    brandButton: document.getElementById('brandButton'),

    // Modal Elements
    resultModal: document.getElementById('resultModal'),
    finalScore: document.getElementById('finalScore'),
    totalCount: document.getElementById('totalCount'),
    correctCount: document.getElementById('correctCount'),
    wrongCount: document.getElementById('wrongCount'),
    modalBtnRestart: document.getElementById('modalBtnRestart'),
    modalBtnReview: document.getElementById('modalBtnReview')
};

// Đăng ký sự kiện
function initEventListeners() {
    // Tải file
    elements.btnSelectFile.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Kéo và thả file (Drag & Drop)
    elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('upload-card--dragover');
    });
    elements.dropZone.addEventListener('dragleave', () => {
        elements.dropZone.classList.remove('upload-card--dragover');
    });
    elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('upload-card--dragover');
        if (e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    });

    // Điều hướng câu hỏi
    elements.btnPrev.addEventListener('click', () => navigateQuestion(state.currentIndex - 1));
    elements.btnNext.addEventListener('click', () => navigateQuestion(state.currentIndex + 1));

    // Thao tác làm lại / chọn file mới / nộp bài
    elements.btnRestart.addEventListener('click', restartQuiz);
    elements.modalBtnRestart.addEventListener('click', () => {
        hideModal();
        restartQuiz();
    });
    elements.btnNewFile.addEventListener('click', resetToUploadScreen);
    elements.brandButton.addEventListener('click', resetToUploadScreen);
    elements.btnSubmit.addEventListener('click', submitQuiz);
    elements.modalBtnReview.addEventListener('click', hideModal);

    // Bộ lọc danh sách câu hỏi
    elements.filterGroup.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('filter-btn--active'));
            e.target.classList.add('filter-btn--active');
            state.activeFilter = e.target.dataset.filter;
            renderQuestionGrid();
        }
    });
}

// Xử lý chọn File
function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        processFile(e.target.files[0]);
    }
}

// Đọc và phân tích cấu trúc File TXT
function processFile(file) {
    if (!file.name.endsWith('.txt')) {
        alert('Vui lòng chọn file định dạng .txt!');
        return;
    }

    // Đặt tên tiêu đề theo tên file (loại bỏ .txt)
    state.fileName = file.name.replace(/\.[^/.]+$/, "");
    elements.quizTitle.textContent = state.fileName;

    const reader = new FileReader();
    reader.onload = function (e) {
        const textContent = e.target.result;
        parseTxtToQueue(textContent);
    };
    reader.readAsText(file, 'UTF-8');
}

/**
 * Phân tích nội dung văn bản và đưa vào Hàng đợi Queue (FIFO)
 */
function parseTxtToQueue(text) {
    questionQueue.clear();
    
    // Tách các khối câu hỏi dựa trên 1 hoặc nhiều dòng trống
    const blocks = text.split(/\n\s*\n/);

    blocks.forEach(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) return;

        let questionTitle = '';
        let options = [];
        let correctAnswer = '';
        let explanation = '';

        lines.forEach(line => {
            // Kiểm tra dòng Giải thích
            if (line.toLowerCase().startsWith('giải thích:')) {
                explanation = line.replace(/^giải thích:/i, '').trim();
            } 
            // Kiểm tra dòng Đáp án có dấu sao ở đầu (Ví dụ: *A. Đáp án)
            else if (/^\*?[A-D]\./i.test(line)) {
                let isCorrect = line.startsWith('*');
                let cleanLine = line.replace(/^\*/, '').trim(); // Bỏ dấu *
                
                let optionKey = cleanLine.charAt(0).toUpperCase(); // Lấy ký tự A, B, C, D
                let optionContent = cleanLine.substring(2).trim(); // Lấy nội dung sau dấu chấm

                options.push({
                    key: optionKey,
                    text: optionContent
                });

                if (isCorrect) {
                    correctAnswer = optionKey;
                }
            } 
            // Tên câu hỏi
            else {
                if (!questionTitle) {
                    questionTitle = line;
                } else {
                    questionTitle += ' ' + line;
                }
            }
        });

        // Nếu hợp lệ thì nạp vào Queue theo thứ tự xuất hiện (FIFO)
        if (questionTitle && options.length > 0) {
            questionQueue.enqueue({
                title: questionTitle,
                options: options,
                correctAnswer: correctAnswer,
                explanation: explanation
            });
        }
    });

    // Xuất dữ liệu từ Queue ra mảng ứng dụng
    state.questions = questionQueue.toArray();

    if (state.questions.length === 0) {
        alert('Không tìm thấy câu hỏi hợp lệ trong file. Vui lòng kiểm tra định dạng!');
        return;
    }

    startQuiz();
}

// Bắt đầu làm bài
function startQuiz() {
    state.currentIndex = 0;
    state.userAnswers = {};
    state.isSubmitted = false;
    state.activeFilter = 'all';

    elements.uploadScreen.style.display = 'none';
    elements.quizScreen.style.display = 'block';
    elements.headerActions.style.display = 'flex';
    elements.filterGroup.style.display = 'none';

    renderQuestionGrid();
    renderCurrentQuestion();
}

// Render Danh sách câu hỏi bên Sidebar trái
function renderQuestionGrid() {
    elements.questionGrid.innerHTML = '';

    state.questions.forEach((q, index) => {
        // Áp dụng bộ lọc khi đã nộp bài
        if (state.isSubmitted) {
            const isCorrect = state.userAnswers[index] === q.correctAnswer;
            if (state.activeFilter === 'correct' && !isCorrect) return;
            if (state.activeFilter === 'wrong' && isCorrect) return;
        }

        const btn = document.createElement('button');
        btn.className = 'grid-btn';
        btn.textContent = index + 1;

        // Trạng thái nút câu hỏi
        if (index === state.currentIndex) {
            btn.classList.add('grid-btn--current');
        }

        if (state.isSubmitted) {
            const isCorrect = state.userAnswers[index] === q.correctAnswer;
            btn.classList.add(isCorrect ? 'grid-btn--correct' : 'grid-btn--wrong');
        } else if (state.userAnswers[index] !== undefined) {
            btn.classList.add('grid-btn--answered');
        }

        btn.addEventListener('click', () => navigateQuestion(index));
        elements.questionGrid.appendChild(btn);
    });

    // Cập nhật Badge tiến độ
    const answeredCount = Object.keys(state.userAnswers).length;
    elements.progressBadge.textContent = `${answeredCount}/${state.questions.length}`;
}

// Render Chi tiết câu hỏi hiện tại ở cột Phải
function renderCurrentQuestion() {
    const q = state.questions[state.currentIndex];
    if (!q) return;

    elements.questionNumber.textContent = `Câu ${state.currentIndex + 1}`;
    elements.questionText.textContent = q.title;
    elements.optionsContainer.innerHTML = '';

    const selectedOption = state.userAnswers[state.currentIndex];

    // Render các đáp án A, B, C, D
    q.options.forEach(opt => {
        const optBtn = document.createElement('button');
        optBtn.className = 'option-btn';

        if (selectedOption === opt.key) {
            optBtn.classList.add('option-btn--selected');
        }

        // --- HIỂN THỊ ĐÚNG / SAI NGAY KHI ĐÃ CHỌN ĐÁP ÁN ---
        if (selectedOption !== undefined || state.isSubmitted) {
            // Khóa lựa chọn không cho bấm lại sau khi đã chọn
            optBtn.classList.add('option-btn--disabled');

            // Luôn đánh dấu màu XANH cho đáp án đúng của câu hỏi
            if (opt.key === q.correctAnswer) {
                optBtn.classList.add('option-btn--correct');
            } 
            // Nếu người dùng chọn ô này và ô này SAI -> Đánh dấu màu ĐỎ
            else if (selectedOption === opt.key && selectedOption !== q.correctAnswer) {
                optBtn.classList.add('option-btn--wrong');
            }
        }

        optBtn.innerHTML = `
            <span class="option-btn__prefix">${opt.key}.</span>
            <span class="option-btn__text">${opt.text}</span>
        `;

        // Chỉ cho phép click chọn nếu chưa chọn đáp án nào cho câu này và chưa nộp bài
        if (selectedOption === undefined && !state.isSubmitted) {
            optBtn.addEventListener('click', () => selectOption(opt.key));
        }

        elements.optionsContainer.appendChild(optBtn);
    });

    // Hiển thị Lời giải thích (khi đã chọn đáp án hoặc đã nộp bài)
    if ((selectedOption !== undefined || state.isSubmitted) && q.explanation) {
        elements.explanationBox.style.display = 'block';
        elements.explanationText.textContent = q.explanation;
    } else {
        elements.explanationBox.style.display = 'none';
    }

    // Trạng thái các nút Câu trước / Câu tiếp theo
    elements.btnPrev.disabled = state.currentIndex === 0;
    elements.btnNext.disabled = state.currentIndex === state.questions.length - 1;

    renderQuestionGrid();
}

// Chọn đáp án
function selectOption(key) {
    if (state.isSubmitted) return;
    state.userAnswers[state.currentIndex] = key;
    renderCurrentQuestion();
}

// Chuyển câu hỏi
function navigateQuestion(newIndex) {
    if (newIndex >= 0 && newIndex < state.questions.length) {
        state.currentIndex = newIndex;
        renderCurrentQuestion();
    }
}

// Reset về trạng thái ban đầu của file
function restartQuiz() {
    state.userAnswers = {};
    state.isSubmitted = false;
    state.currentIndex = 0;
    elements.filterGroup.style.display = 'none';
    renderCurrentQuestion();
}

// Quay lại màn hình Upload file khác
function resetToUploadScreen() {
    state.questions = [];
    state.userAnswers = {};
    state.isSubmitted = false;
    elements.fileInput.value = '';
    elements.uploadScreen.style.display = 'flex';
    elements.quizScreen.style.display = 'none';
    elements.headerActions.style.display = 'none';
    elements.quizTitle.textContent = 'Ôn Tập Trắc Nghiệm';
}

// Nộp bài & Chấm điểm
function submitQuiz() {
    const unansweredCount = state.questions.length - Object.keys(state.userAnswers).length;
    if (unansweredCount > 0 && !state.isSubmitted) {
        if (!confirm(`Bạn còn ${unansweredCount} câu hỏi chưa trả lời. Bạn có chắc chắn muốn nộp bài?`)) {
            return;
        }
    }

    state.isSubmitted = true;
    let correctCount = 0;

    state.questions.forEach((q, idx) => {
        if (state.userAnswers[idx] === q.correctAnswer) {
            correctCount++;
        }
    });

    const total = state.questions.length;
    const wrongCount = total - correctCount;
    const score = ((correctCount / total) * 10).toFixed(1);

    // Cập nhật thông số Modal Popup
    elements.finalScore.textContent = score;
    elements.totalCount.textContent = total;
    elements.correctCount.textContent = correctCount;
    elements.wrongCount.textContent = wrongCount;

    // Hiển thị bộ lọc ở Sidebar sau khi nộp bài
    elements.filterGroup.style.display = 'flex';

    showModal();
    renderCurrentQuestion();
}

// Điều khiển Popup Modal
function showModal() {
    elements.resultModal.style.display = 'flex';
}

function hideModal() {
    elements.resultModal.style.display = 'none';
}

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
});