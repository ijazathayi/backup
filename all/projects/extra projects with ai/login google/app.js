document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // DOM Elements - Login & Dashboard
    // ==========================================
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailGroup = emailInput.closest('.input-group');
    const passwordGroup = passwordInput.closest('.input-group');
    
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    
    const togglePasswordBtn = document.getElementById('togglePassword');
    const submitBtn = document.getElementById('submitBtn');
    
    const loginCard = document.getElementById('loginCard');
    const successCard = document.getElementById('successCard');
    const welcomeUserText = document.getElementById('welcomeUser');
    const loginTimeText = document.getElementById('loginTime');
    const logoutBtn = document.getElementById('logoutBtn');

    // ==========================================
    // DOM Elements - Sign Up Card
    // ==========================================
    const signupCard = document.getElementById('signupCard');
    const signupForm = document.getElementById('signupForm');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const signupConfirmPassword = document.getElementById('signupConfirmPassword');
    
    const signupEmailGroup = signupEmail.closest('.input-group');
    const signupPasswordGroup = signupPassword.closest('.input-group');
    const signupConfirmPasswordGroup = signupConfirmPassword.closest('.input-group');
    
    const signupEmailError = document.getElementById('signupEmailError');
    const signupPasswordError = document.getElementById('signupPasswordError');
    const signupConfirmPasswordError = document.getElementById('signupConfirmPasswordError');
    
    const toggleSignupPasswordBtn = document.getElementById('toggleSignupPassword');
    const signupSubmitBtn = document.getElementById('signupSubmitBtn');
    
    // Toggle links
    const goToSignupBtn = document.getElementById('signupLink');
    const goToSigninBtn = document.getElementById('signinLink');

    // ==========================================
    // DOM Elements - OTP Card
    // ==========================================
    const otpCard = document.getElementById('otpCard');
    const otpForm = document.getElementById('otpForm');
    const otpInputs = Array.from(document.querySelectorAll('.otp-input'));
    const otpGroup = otpForm.querySelector('.input-group');
    const otpError = document.getElementById('otpError');
    const otpSubmitBtn = document.getElementById('otpSubmitBtn');
    
    const resendBtn = document.getElementById('resendBtn');
    const countdownSpan = document.getElementById('countdown');
    const backToSignupBtn = document.getElementById('backToSignupBtn');

    // Toast Container
    const toastContainer = document.getElementById('toastContainer');

    // Validation patterns
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    // Temporary registration credentials held in memory during OTP verification
    let tempEmail = '';
    let tempPassword = '';
    let timerInterval = null;

    // ==========================================
    // Toast Notification helper
    // ==========================================
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'error-toast' : ''}`;
        
        const icon = document.createElement('i');
        icon.className = type === 'error' 
            ? 'fa-solid fa-circle-exclamation' 
            : 'fa-solid fa-circle-check';
            
        const text = document.createElement('span');
        text.textContent = message;
        
        toast.appendChild(icon);
        toast.appendChild(text);
        toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-remove toast from DOM after animation completes (3.85s)
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ==========================================
    // View Navigation Toggles (Sign In <-> Sign Up)
    // ==========================================
    goToSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.add('hide');
        setTimeout(() => {
            signupForm.reset();
            clearErrors([signupEmailGroup, signupPasswordGroup, signupConfirmPasswordGroup]);
            signupCard.classList.remove('hide');
        }, 300);
    });

    goToSigninBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signupCard.classList.add('hide');
        setTimeout(() => {
            loginForm.reset();
            clearErrors([emailGroup, passwordGroup]);
            loginCard.classList.remove('hide');
        }, 300);
    });

    backToSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearInterval(timerInterval);
        otpCard.classList.add('hide');
        setTimeout(() => {
            signupCard.classList.remove('hide');
        }, 300);
    });

    function clearErrors(groups) {
        groups.forEach(group => {
            if (group) group.classList.remove('error');
        });
    }

    // ==========================================
    // Password Visibility Toggles
    // ==========================================
    function setupPasswordToggle(inputEl, buttonEl) {
        buttonEl.addEventListener('click', () => {
            const isPassword = inputEl.getAttribute('type') === 'password';
            inputEl.setAttribute('type', isPassword ? 'text' : 'password');
            
            const icon = buttonEl.querySelector('i');
            if (isPassword) {
                icon.classList.remove('fa-regular', 'fa-eye');
                icon.classList.add('fa-solid', 'fa-eye-slash');
            } else {
                icon.classList.remove('fa-solid', 'fa-eye-slash');
                icon.classList.add('fa-regular', 'fa-eye');
            }
        });
    }

    setupPasswordToggle(passwordInput, togglePasswordBtn);
    setupPasswordToggle(signupPassword, toggleSignupPasswordBtn);

    // ==========================================
    // OTP Inputs Auto-Focus Jump Logic
    // ==========================================
    otpInputs.forEach((input, index) => {
        // Handle input events (characters typed)
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            // Force numeric character validation
            e.target.value = value.replace(/[^0-9]/g, '');

            if (e.target.value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            
            // Clear error state if user starts writing
            if (otpGroup.classList.contains('error')) {
                otpGroup.classList.remove('error');
            }
        });

        // Handle keydown events (specifically Backspace navigation)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                if (!input.value && index > 0) {
                    otpInputs[index - 1].focus();
                    otpInputs[index - 1].value = '';
                } else {
                    input.value = '';
                }
                e.preventDefault();
            }
        });

        // Intercept clipboard paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
            
            // Match exactly 6 numeric digits
            if (/^\d{6}$/.test(pasteData)) {
                otpInputs.forEach((inp, idx) => {
                    inp.value = pasteData[idx];
                });
                otpInputs[5].focus();
                otpGroup.classList.remove('error');
            }
        });
    });

    // OTP Countdown Timer
    function startOtpTimer() {
        clearInterval(timerInterval);
        let timeLeft = 60;
        
        resendBtn.classList.add('disabled');
        resendBtn.innerHTML = `Resend Code (<span id="countdown">${timeLeft}</span>s)`;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            const countSpan = document.getElementById('countdown');
            if (countSpan) countSpan.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                resendBtn.classList.remove('disabled');
                resendBtn.innerHTML = 'Resend Code';
            }
        }, 1000);
    }

    // ==========================================
    // Form Input Error Handlers (Clear on Type)
    // ==========================================
    emailInput.addEventListener('input', () => {
        if (emailGroup.classList.contains('error')) validateEmail();
    });
    passwordInput.addEventListener('input', () => {
        if (passwordGroup.classList.contains('error')) validatePassword();
    });
    signupEmail.addEventListener('input', () => {
        if (signupEmailGroup.classList.contains('error')) validateSignupEmail();
    });
    signupPassword.addEventListener('input', () => {
        if (signupPasswordGroup.classList.contains('error')) validateSignupPassword();
    });
    signupConfirmPassword.addEventListener('input', () => {
        if (signupConfirmPasswordGroup.classList.contains('error')) validateSignupConfirmPassword();
    });

    // ==========================================
    // Frontend Validations
    // ==========================================
    function validateEmail() {
        const value = emailInput.value.trim();
        if (!value) {
            emailError.textContent = 'Gmail address is required';
            emailGroup.classList.add('error');
            return false;
        } else if (!gmailRegex.test(value)) {
            emailError.textContent = 'Please enter a valid Gmail address (e.g., user@gmail.com)';
            emailGroup.classList.add('error');
            return false;
        } else {
            emailGroup.classList.remove('error');
            return true;
        }
    }

    function validatePassword() {
        const value = passwordInput.value;
        if (!value) {
            passwordError.textContent = 'Password is required';
            passwordGroup.classList.add('error');
            return false;
        } else if (value.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters';
            passwordGroup.classList.add('error');
            return false;
        } else {
            passwordGroup.classList.remove('error');
            return true;
        }
    }

    function validateSignupEmail() {
        const value = signupEmail.value.trim();
        if (!value) {
            signupEmailError.textContent = 'Gmail address is required';
            signupEmailGroup.classList.add('error');
            return false;
        } else if (!gmailRegex.test(value)) {
            signupEmailError.textContent = 'Please enter a valid Gmail address (e.g., user@gmail.com)';
            signupEmailGroup.classList.add('error');
            return false;
        } else {
            signupEmailGroup.classList.remove('error');
            return true;
        }
    }

    function validateSignupPassword() {
        const value = signupPassword.value;
        if (!value) {
            signupPasswordError.textContent = 'Password is required';
            signupPasswordGroup.classList.add('error');
            return false;
        } else if (value.length < 6) {
            signupPasswordError.textContent = 'Password must be at least 6 characters';
            signupPasswordGroup.classList.add('error');
            return false;
        } else {
            signupPasswordGroup.classList.remove('error');
            return true;
        }
    }

    function validateSignupConfirmPassword() {
        const passwordValue = signupPassword.value;
        const confirmValue = signupConfirmPassword.value;
        if (!confirmValue) {
            signupConfirmPasswordError.textContent = 'Confirming password is required';
            signupConfirmPasswordGroup.classList.add('error');
            return false;
        } else if (passwordValue !== confirmValue) {
            signupConfirmPasswordError.textContent = 'Passwords do not match';
            signupConfirmPasswordGroup.classList.add('error');
            return false;
        } else {
            signupConfirmPasswordGroup.classList.remove('error');
            return true;
        }
    }

    // ==========================================
    // Submit Events
    // ==========================================
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        if (isEmailValid && isPasswordValid) {
            performLogin();
        }
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const isEmailValid = validateSignupEmail();
        const isPasswordValid = validateSignupPassword();
        const isConfirmValid = validateSignupConfirmPassword();

        if (isEmailValid && isPasswordValid && isConfirmValid) {
            requestRegistrationOtp();
        }
    });

    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Gather the 6 digits
        const code = otpInputs.map(input => input.value).join('');
        
        if (code.length !== 6) {
            otpError.textContent = 'Please enter the complete 6-digit verification code';
            otpGroup.classList.add('error');
        } else {
            otpGroup.classList.remove('error');
            verifyOtpAndRegister(code);
        }
    });

    resendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (resendBtn.classList.contains('disabled')) return;
        requestRegistrationOtp(true); // Is resend
    });

    // ==========================================
    // Backend API Actions
    // ==========================================
    
    // 1. Login API POST Request
    async function performLogin() {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: passwordInput.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                const gmail = data.user.email;

                // Setup success dashboard details
                welcomeUserText.innerHTML = `Welcome back, <strong>${gmail}</strong>`;
                
                const now = new Date();
                let hours = now.getHours();
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                loginTimeText.textContent = `${hours}:${minutes} ${ampm}`;

                loginCard.classList.add('hide');
                setTimeout(() => {
                    successCard.classList.remove('hide');
                    const checkmark = successCard.querySelector('.checkmark');
                    checkmark.classList.remove('draw');
                    void checkmark.offsetWidth; // Trigger reflow
                    checkmark.classList.add('draw');
                    showToast('Successfully signed in!', 'success');
                }, 300);
            } else {
                if (response.status === 401) {
                    passwordError.textContent = data.message || 'Invalid Gmail address or password';
                    passwordGroup.classList.add('error');
                    emailGroup.classList.add('error');
                    showToast('Authentication failed', 'error');
                } else if (response.status === 400 && data.field) {
                    if (data.field === 'email') {
                        emailError.textContent = data.message;
                        emailGroup.classList.add('error');
                    } else if (data.field === 'password') {
                        passwordError.textContent = data.message;
                        passwordGroup.classList.add('error');
                    }
                } else {
                    passwordError.textContent = data.message || 'Server error. Please try again.';
                    passwordGroup.classList.add('error');
                }
            }
        } catch (error) {
            console.error('API Error:', error);
            passwordError.textContent = 'Unable to connect to the server. Please check your connection.';
            passwordGroup.classList.add('error');
            showToast('Connection to server failed', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }

    // 2. Request OTP Code API POST Request (Step 1 of Signup)
    async function requestRegistrationOtp(isResend = false) {
        const emailVal = signupEmail.value.trim();
        const passwordVal = signupPassword.value;

        const targetBtn = isResend ? resendBtn : signupSubmitBtn;
        
        if (!isResend) {
            signupSubmitBtn.disabled = true;
            signupSubmitBtn.classList.add('loading');
        }

        try {
            const response = await fetch('/api/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailVal,
                    password: passwordVal
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store registration data in temp variables
                tempEmail = emailVal;
                tempPassword = passwordVal;

                showToast(data.message || 'Verification code generated!', 'success');

                // Switch UI card to OTP entry screen if not already there
                if (!isResend) {
                    signupCard.classList.add('hide');
                    setTimeout(() => {
                        otpInputs.forEach(input => input.value = '');
                        otpGroup.classList.remove('error');
                        otpCard.classList.remove('hide');
                        otpInputs[0].focus();
                        startOtpTimer();
                    }, 300);
                } else {
                    startOtpTimer();
                }
            } else {
                if (response.status === 409 && data.field === 'email') {
                    signupEmailError.textContent = data.message;
                    signupEmailGroup.classList.add('error');
                    showToast('Gmail address is already registered', 'error');
                } else if (response.status === 400 && data.field) {
                    if (data.field === 'email') {
                        signupEmailError.textContent = data.message;
                        signupEmailGroup.classList.add('error');
                    } else if (data.field === 'password') {
                        signupPasswordError.textContent = data.message;
                        signupPasswordGroup.classList.add('error');
                    }
                } else {
                    signupPasswordError.textContent = data.message || 'Server error. Please try again.';
                    signupPasswordGroup.classList.add('error');
                    showToast(data.message || 'OTP request failed', 'error');
                }
            }
        } catch (error) {
            console.error('API Error:', error);
            signupPasswordError.textContent = 'Unable to connect to the server. Please check your connection.';
            signupPasswordGroup.classList.add('error');
            showToast('Connection to server failed', 'error');
        } finally {
            if (!isResend) {
                signupSubmitBtn.disabled = false;
                signupSubmitBtn.classList.remove('loading');
            }
        }
    }

    // 3. Verify OTP and Register Account (Step 2 of Signup)
    async function verifyOtpAndRegister(otpCode) {
        otpSubmitBtn.disabled = true;
        otpSubmitBtn.classList.add('loading');

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: tempEmail,
                    otp: otpCode
                })
            });

            const data = await response.json();

            if (response.ok) {
                clearInterval(timerInterval);
                
                // Prefill login input
                emailInput.value = tempEmail;
                showToast(data.message || 'Account successfully created!', 'success');

                // Animate transition to login card
                otpCard.classList.add('hide');
                setTimeout(() => {
                    loginForm.reset();
                    emailInput.value = tempEmail; // Keep email prefilled
                    clearErrors([emailGroup, passwordGroup]);
                    loginCard.classList.remove('hide');
                }, 300);
            } else {
                // Render verification errors
                otpError.textContent = data.message || 'Invalid verification code';
                otpGroup.classList.add('error');
                showToast(data.message || 'Verification failed', 'error');
            }
        } catch (error) {
            console.error('API Error:', error);
            otpError.textContent = 'Unable to connect to the server. Please check your connection.';
            otpGroup.classList.add('error');
            showToast('Connection to server failed', 'error');
        } finally {
            otpSubmitBtn.disabled = false;
            otpSubmitBtn.classList.remove('loading');
        }
    }

    // ==========================================
    // Sign Out / Reset Portal
    // ==========================================
    logoutBtn.addEventListener('click', () => {
        successCard.classList.add('hide');
        setTimeout(() => {
            loginForm.reset();
            clearErrors([emailGroup, passwordGroup]);
            
            // Reset eye toggle to hidden state
            passwordInput.setAttribute('type', 'password');
            const icon = togglePasswordBtn.querySelector('i');
            icon.classList.remove('fa-solid', 'fa-eye-slash');
            icon.classList.add('fa-regular', 'fa-eye');

            loginCard.classList.remove('hide');
            showToast('Signed out successfully', 'success');
        }, 300);
    });
});
