document.addEventListener('DOMContentLoaded', () => {
    const fromLang = document.getElementById('from-lang');
    const toLang = document.getElementById('to-lang');
    const fromText = document.getElementById('from-text');
    const toText = document.getElementById('to-text');
    const fromChar = document.getElementById('from-char');
    const exchangeBtn = document.getElementById('exchange-btn');
    const translateBtn = document.getElementById('translate-btn');
    const btnCopyFrom = document.getElementById('btn-copy-from');
    const btnCopyTo = document.getElementById('btn-copy-to');
    const btnSpeak = document.getElementById('btn-speak');
    const btnSpeakFrom = document.getElementById('btn-speak-from');
    const btnMic = document.getElementById('btn-mic');
    const btnAutoSpeak = document.getElementById('btn-auto-speak');
    const speakingWave = document.getElementById('speaking-wave');

    let autoSpeakEnabled = false;

    // Populate selects
    for (let country_code in countries) {
        let selectedFrom = country_code === "en-GB" ? "selected" : "";
        let selectedTo = country_code === "hi-IN" ? "selected" : "";
        
        let optionFrom = `<option value="${country_code}" ${selectedFrom}>${countries[country_code]}</option>`;
        let optionTo = `<option value="${country_code}" ${selectedTo}>${countries[country_code]}</option>`;
        
        fromLang.insertAdjacentHTML("beforeend", optionFrom);
        toLang.insertAdjacentHTML("beforeend", optionTo);
    }

    // Exchange languages
    exchangeBtn.addEventListener('click', () => {
        let tempText = fromText.value;
        let tempLang = fromLang.value;
        
        fromText.value = toText.value;
        toText.value = tempText;
        
        fromLang.value = toLang.value;
        toLang.value = tempLang;
        
        updateCharCount();
    });

    // Char count
    fromText.addEventListener('input', () => {
        updateCharCount();
    });

    function updateCharCount() {
        fromChar.textContent = `${fromText.value.length} / 500`;
    }

    // Copy handlers
    btnCopyFrom.addEventListener('click', () => {
        if (!fromText.value) return;
        navigator.clipboard.writeText(fromText.value);
    });

    btnCopyTo.addEventListener('click', () => {
        if (!toText.value) return;
        navigator.clipboard.writeText(toText.value);
    });

    // ── Shared TTS helper with wave animation ──
    function speakText(text, lang) {
        if (!text) return;
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.onstart = () => speakingWave.classList.add('active');
        utterance.onend   = () => speakingWave.classList.remove('active');
        utterance.onerror = () => speakingWave.classList.remove('active');
        speechSynthesis.speak(utterance);
    }

    // Auto-speak toggle
    btnAutoSpeak.addEventListener('click', () => {
        autoSpeakEnabled = !autoSpeakEnabled;
        btnAutoSpeak.classList.toggle('auto-speak-on', autoSpeakEnabled);
        btnAutoSpeak.title = autoSpeakEnabled
            ? 'Auto-Speak Translation (On)'
            : 'Auto-Speak Translation (Off)';
    });

    // TTS — speak input text
    btnSpeakFrom.addEventListener('click', () => {
        speakText(fromText.value, fromLang.value);
    });

    // TTS — speak output text (manual)
    btnSpeak.addEventListener('click', () => {
        speakText(toText.value, toLang.value);
    });

    // Voice Input — Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isListening = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isListening = true;
            btnMic.classList.add('listening');
            btnMic.title = 'Stop Listening';
            fromText.setAttribute('placeholder', '🎤 Listening...');
        };

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            fromText.value = transcript;
            updateCharCount();
        };

        recognition.onend = () => {
            isListening = false;
            btnMic.classList.remove('listening');
            btnMic.title = 'Voice Input';
            fromText.setAttribute('placeholder', 'Enter text to translate...');
        };

        recognition.onerror = (event) => {
            isListening = false;
            btnMic.classList.remove('listening');
            btnMic.title = 'Voice Input';
            fromText.setAttribute('placeholder', 'Enter text to translate...');
            console.error('Speech recognition error:', event.error);
        };

        btnMic.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.lang = fromLang.value;
                recognition.start();
            }
        });
    } else {
        btnMic.title = 'Voice input not supported in this browser';
        btnMic.style.opacity = '0.4';
        btnMic.style.cursor = 'not-allowed';
    }

    // Translation logic
    translateBtn.addEventListener('click', async () => {
        let text = fromText.value.trim();
        let translateFrom = fromLang.value;
        let translateTo = toLang.value;
        
        if (!text) {
            toText.value = '';
            return;
        }

        toText.setAttribute('placeholder', 'Translating...');
        toText.value = '';
        translateBtn.classList.add('loading');
        translateBtn.querySelector('span').textContent = 'Translating...';

        try {
            let apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${translateFrom}|${translateTo}`;
            let response = await fetch(apiUrl);
            let data = await response.json();
            
            toText.value = data.responseData.translatedText;
            if (data.matches) {
                data.matches.forEach(dataMatch => {
                    if(dataMatch.id === 0) {
                        toText.value = dataMatch.translation;
                    }
                });
            }
            // Auto-speak the translated result if enabled
            if (autoSpeakEnabled) {
                speakText(toText.value, toLang.value);
            }
        } catch (error) {
            console.error('Translation error:', error);
            toText.value = "An error occurred during translation. Please try again.";
        } finally {
            translateBtn.classList.remove('loading');
            translateBtn.querySelector('span').textContent = 'Translate Now';
            toText.setAttribute('placeholder', 'Translation will appear here...');
        }
    });
});
