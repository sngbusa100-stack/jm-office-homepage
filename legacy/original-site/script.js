document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        });
    }

    // Contact Form Submission (Mock)
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('상담 신청이 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
            consultationForm.reset();
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Sticky Navbar on Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
        } else {
            navbar.style.boxShadow = "var(--shadow-sm)";
        }
    });

    // Floating Chatbot Interaction
    const chatBtn = document.getElementById('floatingChatBtn');
    const chatWindow = document.getElementById('floatingChatWindow');
    const closeChatBtn = document.getElementById('closeChatBtn');

    if (chatBtn && chatWindow) {
        chatBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
        });
    }

    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            chatWindow.classList.add('hidden');
        });
    }

    // Message Handling
    window.sendOption = function (option) {
        const chatBody = document.getElementById('chatBody');

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'message user';
        userMsg.style.alignSelf = 'flex-end';
        userMsg.style.backgroundColor = 'var(--primary-color)';
        userMsg.style.color = '#fff';
        userMsg.style.padding = '0.8rem 1rem';
        userMsg.style.borderRadius = '12px 12px 0 12px';
        userMsg.style.marginBottom = '1rem';
        userMsg.style.maxWidth = '80%';
        userMsg.style.fontSize = '0.95rem';
        userMsg.innerText = option;
        chatBody.appendChild(userMsg);

        chatBody.scrollTop = chatBody.scrollHeight;

        // Simulate bot response
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'message bot';

            let responseText = '';

            if (option === '영업정지 구제') {
                responseText = `<strong>[영업정지 구제]</strong><br>영업정지 처분을 받으셨나요? 집행정지 신청과 행정심판 청구를 통해 구제받을 수 있습니다. 자세한 상담을 원하시면 전화주세요.`;
            } else if (option === '법인 설립') {
                responseText = `<strong>[법인 설립]</strong><br>비영리 사단법인, 재단법인 등 까다로운 설립 절차를 대행해 드립니다. 필요 서류 목록을 문자로 보내드릴까요?`;
            } else {
                responseText = `<strong>[상담 예약]</strong><br>원하시는 날짜와 시간을 말씀해 주시면 일정을 조율해 드립니다.<br>📞 02-1234-5678`;
            }

            botMsg.innerHTML = responseText;
            chatBody.appendChild(botMsg);
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 800);
    };

    // Smooth Scroll used automatically by CSS scroll-behavior: smooth
    // But we can add active state to nav links based on scroll position
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href').includes(current)) {
                li.classList.add('active');
            }
        });
    });

    // View Toggle Logic
    const viewToggleBtn = document.getElementById('viewToggleBtn');
    if (viewToggleBtn) {
        viewToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('simulated-mobile');

            const isMobile = document.body.classList.contains('simulated-mobile');
            const icon = viewToggleBtn.querySelector('i');
            const span = viewToggleBtn.querySelector('span');

            if (isMobile) {
                icon.className = 'fa-solid fa-desktop';
                span.textContent = 'PC View';
            } else {
                icon.className = 'fa-solid fa-mobile-screen';
                span.textContent = 'Mobile View';
            }
        });
    }
});
