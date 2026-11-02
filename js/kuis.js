const quizData = [
  {
    category: "Seni Lukis",
    question:
      "Gaya lukisan klasik tradisional Bali yang berpusat di Klungkung dan mengisahkan epik Ramayana serta Mahabharata adalah...",
    options: [
      "Seni Lukis Ubud",
      "Seni Lukis Wayang Kamasan",
      "Seni Lukis Batuan",
      "Seni Lukis Pengosekan",
    ],
    answer: 1,
    explanation:
      "Seni Lukis Wayang Kamasan berpusat di Desa Kamasan, Klungkung, dan terkenal dengan motif pewayangan klasik serta warna alaminya.",
  },
  {
    category: "Arsitektur & Tradisi",
    question:
      "Dalam tradisi Bali, Barong merupakan sosok simbol keberuntungan dan kesehatan yang bertarung melawan...",
    options: ["Rangda", "Garuda", "Jatayu", "Kumbhakarna"],
    answer: 0,
    explanation:
      "Barong adalah lambang penjaga kebaikan dan kesehatan yang sentral berhadapan dengan sosok Rangda.",
  },
  {
    category: "Budaya & Cerita Rakyat",
    question:
      "Siapakah pengikut atau pelayan Rangda dalam kisah Calonarang yang bertaring dan berwajah seram namun sering berperan jenaka?",
    options: ["Hanoman", "Celuluk", "Sugriwa", "Rawana"],
    answer: 1,
    explanation:
      "Celuluk dikenal sebagai pelayan Rangda yang berpenampilan seram namun membawa unsur humor jenaka dalam pertunjukan Calonarang.",
  },
  {
    category: "Kerajinan Kuno",
    question:
      "Media naskah kuno Bali dari daun kering yang diikat dengan tali dan koin berlubang serta ditulis dengan aksara Bali dinamakan...",
    options: ["Prasasti", "Perkamen", "Lontar", "Gebang"],
    answer: 2,
    explanation:
      "Lontar merupakan naskah kuno pada daun lontar yang memuat ajaran agama, sastra, pengobatan, dan aturan hidup.",
  },
  {
    category: "Pusaka Militer",
    question:
      "Pusaka senjata tikam tradisional tidak simetris yang diakui UNESCO sebagai Warisan Budaya Takbenda Manusia adalah...",
    options: ["Tombak", "Keris", "Pedang", "Rencong"],
    answer: 1,
    explanation:
      "Keris diakui UNESCO sebagai Karya Agung Warisan Budaya Lisan dan Takbenda Manusia.",
  },
  {
    category: "Pembuatan Senjata",
    question:
      "Istilah bagi pengrajin logam Bali yang menempa besi menjadi perkakas dan senjata menggunakan alat sederhana dinamakan...",
    options: ["Undagi", "Sangging", "Memande", "Subak"],
    answer: 2,
    explanation:
      "Memande adalah sebutan untuk pengrajin logam/pande yang mahir menempa senjata dan perkakas.",
  },
  {
    category: "Upacara & Pusaka",
    question:
      "Hari suci Hindu Bali di mana umat memberikan persembahan untuk benda logam serta menyucikan keris dan tombak adalah...",
    options: [
      "Tumpek Landep",
      "Hari Raya Galungan",
      "Hari Raya Kuningan",
      "Saraswati",
    ],
    answer: 0,
    explanation:
      "Tumpek Landep adalah hari penyucian khusus untuk benda-benda dari logam, termasuk keris dan tombak pusaka.",
  },
];

const defaultProfile = {
  name: 'Penjelajah Pusaka',
  email: 'Belum terhubung',
  totalPoints: 0,
  scannedItems: 0,
  activities: [],
  quizCompleted: false,
  completedQuiz: null
};

function getProfileData() {
  try {
    const activeEmail = localStorage.getItem('pusakaActiveEmail');
    const accounts = JSON.parse(localStorage.getItem('pusakaAccounts')) || {};
    if (activeEmail && accounts[activeEmail]) {
      return {
        ...defaultProfile,
        ...accounts[activeEmail],
        activities: Array.isArray(accounts[activeEmail].activities) ? accounts[activeEmail].activities : []
      };
    }
    const savedProfile = JSON.parse(localStorage.getItem('pusakaProfile'));
    if (!savedProfile) return { ...defaultProfile };
    return {
      ...defaultProfile,
      ...savedProfile,
      activities: Array.isArray(savedProfile.activities) ? savedProfile.activities : []
    };
  } catch (error) {
    return { ...defaultProfile };
  }
}

function saveProfileData(data) {
  try {
    localStorage.setItem('pusakaProfile', JSON.stringify(data));
    const activeEmail = localStorage.getItem('pusakaActiveEmail') || data.email;
    if (activeEmail && activeEmail !== 'Belum terhubung') {
      let accounts = JSON.parse(localStorage.getItem('pusakaAccounts')) || {};
      accounts[activeEmail] = data;
      localStorage.setItem('pusakaAccounts', JSON.stringify(accounts));
    }
  } catch (error) {
    console.warn('Gagal menyimpan profil');
  }
}

const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

let currentQuestionIndex = 0;
let score = 0;
let answered = false;

const startScreen = document.getElementById("quiz-start-screen");
const quizContainer = document.getElementById("quiz-container");
const resultScreen = document.getElementById("result-screen");
const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

const questionCategory = document.getElementById("question-category");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const questionTracker = document.getElementById("question-tracker");
const scoreTracker = document.getElementById("score-tracker");
const progressBar = document.getElementById("progress-bar");
const explanationBox = document.getElementById("explanation-box");
const explanationStatus = document.getElementById("explanation-status");
const explanationText = document.getElementById("explanation-text");

if (startBtn) startBtn.addEventListener("click", startQuiz);
if (nextBtn) nextBtn.addEventListener("click", loadNextQuestion);
if (restartBtn) restartBtn.addEventListener("click", startQuiz);

document.addEventListener("DOMContentLoaded", () => {
  checkQuizCompletionOnLoad();
});

function checkQuizCompletionOnLoad() {
  const profile = getProfileData();
  if (profile.quizCompleted || profile.completedQuiz) {
    if (startScreen) startScreen.classList.add("hidden");
    if (quizContainer) quizContainer.classList.add("hidden");
    if (resultScreen) resultScreen.classList.remove("hidden");

    const scoreToDisplay = profile.completedQuiz ? profile.completedQuiz.score : (quizData.length * 10);
    const totalPossibleScore = quizData.length * 10;
    const finalScoreElem = document.getElementById("final-score");
    if (finalScoreElem) {
      finalScoreElem.textContent = `${scoreToDisplay} / ${totalPossibleScore}`;
    }

    const badgeTitle = document.getElementById("badge-title");
    const badgeDesc = document.getElementById("badge-desc");
    if (badgeTitle && badgeDesc) {
      badgeTitle.textContent = "Kuis Telah Diselesaikan";
      badgeDesc.textContent = `Anda sudah menyelesaikan kuis ini di akun ini dan mendapatkan ${scoreToDisplay} poin. Kuis hanya dapat diselesaikan satu kali per akun.`;
    }

    if (restartBtn) {
      restartBtn.style.display = 'none';
      let notice = document.getElementById('completed-notice');
      if (!notice) {
        notice = document.createElement('div');
        notice.id = 'completed-notice';
        notice.className = 'p-4 rounded-2xl bg-amber-950/50 border border-amber-500/30 text-amber-200 text-xs font-semibold mt-3 text-center';
        notice.textContent = 'Akun Anda telah tercatat menyelesaikan kuis ini. Poin telah ditambahkan ke profil Anda.';
        restartBtn.parentNode.insertBefore(notice, restartBtn);
      }
    }
  }
}

function startQuiz() {
  let profile = getProfileData();
  if (profile.quizCompleted || profile.completedQuiz) {
    alert('Anda sudah menyelesaikan kuis ini. Kuis tidak dapat diulang pada akun yang sama.');
    checkQuizCompletionOnLoad();
    return;
  }
  currentQuestionIndex = 0;
  score = 0;
  answered = false;
  if (startScreen) startScreen.classList.add("hidden");
  if (resultScreen) resultScreen.classList.add("hidden");
  if (quizContainer) quizContainer.classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  answered = false;
  if (nextBtn) nextBtn.classList.add("hidden");
  if (explanationBox) explanationBox.classList.add("hidden");

  const currentQ = quizData[currentQuestionIndex];
  if (questionCategory) questionCategory.textContent = currentQ.category;
  if (questionText) questionText.textContent = currentQ.question;
  if (questionTracker) questionTracker.textContent = `Pertanyaan ${currentQuestionIndex + 1} dari ${quizData.length}`;
  if (scoreTracker) scoreTracker.textContent = `Skor: ${score}`;

  const progressPercent = ((currentQuestionIndex + 1) / quizData.length) * 100;
  if (progressBar) progressBar.style.width = `${progressPercent}%`;

  if (optionsContainer) {
    optionsContainer.innerHTML = "";
    currentQ.options.forEach((opt, index) => {
      const button = document.createElement("button");
      button.className =
        "w-full text-left p-4 rounded-2xl bg-[#12100e] border border-amber-500/20 hover:border-amber-400 hover:bg-amber-500/10 text-stone-200 text-sm md:text-base font-medium transition-all duration-200 flex items-center justify-between group";
      button.innerHTML = `
            <span>${opt}</span>
            <span class="w-6 h-6 rounded-full border border-amber-500/30 group-hover:border-amber-400 flex items-center justify-center text-xs font-bold text-amber-400">
              ${String.fromCharCode(65 + index)}
            </span>
          `;
      button.addEventListener("click", () => selectAnswer(index, button));
      optionsContainer.appendChild(button);
    });
  }
}

function selectAnswer(selectedIndex, selectedButton) {
  if (answered) return;
  answered = true;

  const currentQ = quizData[currentQuestionIndex];
  const buttons = optionsContainer.querySelectorAll("button");

  buttons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.remove("hover:border-amber-400", "hover:bg-amber-500/10");
  });

  if (selectedIndex === currentQ.answer) {
    score += 10;
    selectedButton.classList.add(
      "bg-emerald-950/60",
      "border-emerald-500",
      "text-emerald-200",
    );
    if (explanationStatus) {
      explanationStatus.innerHTML = `
            <svg class="w-5 h-5 text-emerald-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span class="text-emerald-400">Benar!</span>
          `;
    }
  } else {
    selectedButton.classList.add(
      "bg-rose-950/60",
      "border-rose-500",
      "text-rose-200",
    );
    buttons[currentQ.answer].classList.add(
      "bg-emerald-950/60",
      "border-emerald-500",
      "text-emerald-200",
    );
    if (explanationStatus) {
      explanationStatus.innerHTML = `
            <svg class="w-5 h-5 text-rose-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            <span class="text-rose-400">Salah!</span>
          `;
    }
  }

  if (explanationText) explanationText.textContent = currentQ.explanation;
  if (explanationBox) explanationBox.classList.remove("hidden");
  if (scoreTracker) scoreTracker.textContent = `Skor: ${score}`;

  if (currentQuestionIndex < quizData.length - 1) {
    if (nextBtn) nextBtn.classList.remove("hidden");
  } else {
    setTimeout(showResults, 1800);
  }
}

function loadNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  if (quizContainer) quizContainer.classList.add("hidden");
  if (resultScreen) resultScreen.classList.remove("hidden");

  const totalPossibleScore = quizData.length * 10;
  const finalScoreElem = document.getElementById("final-score");
  if (finalScoreElem) {
    finalScoreElem.textContent = `${score} / ${totalPossibleScore}`;
  }

  const badgeTitle = document.getElementById("badge-title");
  const badgeDesc = document.getElementById("badge-desc");

  if (score === totalPossibleScore) {
    if (badgeTitle) badgeTitle.textContent = "Maestro Kebudayaan Semarapura";
    if (badgeDesc) badgeDesc.textContent =
      "Sempurna! Anda memiliki pemahaman yang luar biasa mengenai seluruh sejarah dan kebudayaan Klungkung.";
  } else if (score >= 40) {
    if (badgeTitle) badgeTitle.textContent = "Pengembara Budaya Klungkung";
    if (badgeDesc) badgeDesc.textContent =
      "Sangat Baik! Anda memahami dengan baik sebagian besar tradisi dan pusaka Semarapura.";
  } else {
    if (badgeTitle) badgeTitle.textContent = "Pelestari Muda Semarapura";
    if (badgeDesc) badgeDesc.textContent =
      "Tetap semangat! Pelajari kembali materi kebudayaan Klungkung dan coba lagi kuis ini.";
  }

  let profile = getProfileData();
  if (!profile.quizCompleted) {
    profile.quizCompleted = true;
    profile.completedQuiz = {
      score: score,
      total: totalPossibleScore,
      date: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
    };
    profile.totalPoints = Number(profile.totalPoints) + score;

    if (!Array.isArray(profile.activities)) {
      profile.activities = [];
    }
    profile.activities.unshift({
      title: 'Kuis Kebudayaan Klungkung',
      points: score,
      date: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
    });

    saveProfileData(profile);
  }

  if (restartBtn) {
    restartBtn.style.display = 'none';
    let notice = document.getElementById('completed-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'completed-notice';
      notice.className = 'p-4 rounded-2xl bg-amber-950/50 border border-amber-500/30 text-amber-200 text-xs font-semibold mt-3 text-center';
      notice.textContent = `Selamat! Kuis telah selesai dan ${score} poin telah ditambahkan ke profil Anda. Kuis tidak dapat diulang.`;
      restartBtn.parentNode.insertBefore(notice, restartBtn);
    }
  }
}
