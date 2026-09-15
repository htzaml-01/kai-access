// KAI Access App Logic

document.addEventListener('DOMContentLoaded', () => {
    try { initAuthSystem(); } catch (e) { console.error('Auth system error:', e); }
    try { setupGlobalModalHandlers(); } catch (e) { console.error(e); }
    try { initGreeting(); } catch (e) { console.error(e); }
    try { initPageNavigation(); } catch (e) { console.error(e); }
    try { initRailpoinHistory(); } catch (e) { console.error(e); }
    try { initTrainServices(); } catch (e) { console.error(e); }
    try { initTrainSearchEngine(); } catch (e) { console.error(e); }
    try { initPopularDestinations(); } catch (e) { console.error(e); }
    try { initMyTickets(); } catch (e) { console.error(e); }
    try { initCommuterModal(); } catch (e) { console.error(e); }
    try { initPromotions(); } catch (e) { console.error(e); }
    try { initArticles(); } catch (e) { console.error(e); }
    try { initAccountSystem(); } catch (e) { console.error(e); }
    try { initSeatAndPaymentHandlers(); } catch (e) { console.error(e); }
});

// 1. Dynamic Greeting
function initGreeting() {
    const greetingEl = document.getElementById('greeting-time');
    if (!greetingEl) return;
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
        greetingEl.textContent = 'Good Morning';
    } else if (hour >= 11 && hour < 15) {
        greetingEl.textContent = 'Good Afternoon';
    } else if (hour >= 15 && hour < 18) {
        greetingEl.textContent = 'Good Evening';
    } else {
        greetingEl.textContent = 'Good Night';
    }
}

// 2. Navigation Page Switcher (Home, Train, My Tickets, Promotion, Account)
function initPageNavigation() {
    const navLinks = document.querySelectorAll('[data-page]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            switchPage(targetPage);
        });
    });
}

function switchPage(pageId) {
    const pages = document.querySelectorAll('.page-container');
    const desktopLinks = document.querySelectorAll('.desktop-nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-bottom-nav .nav-item');

    pages.forEach(p => {
        if (p.id === `page-${pageId}`) {
            p.classList.add('active');
        } else {
            p.classList.remove('active');
        }
    });

    desktopLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    mobileLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageId === 'my-tickets') {
        renderMyTicketsPage();
    } else if (pageId === 'train') {
        renderPopularDestinations();
    } else if (pageId === 'promotion') {
        renderFullPromotionsPage();
    }
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast-notify');
    const toastMsg = document.getElementById('toast-msg');
    if (!toast) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// 3. Railpoin History Modal System
function initRailpoinHistory() {
    const openBtn = document.getElementById('open-history-btn');
    const triggerRow = document.getElementById('open-history-trigger');
    const closeBtn = document.getElementById('close-history-modal');
    const modal = document.getElementById('history-modal');
    const listContainer = document.getElementById('history-list-container');

    if (document.getElementById('main-railpoin-amount')) {
        document.getElementById('main-railpoin-amount').textContent = `${RAILPOIN_DATA.balance.toLocaleString('id-ID')} Poin`;
        document.getElementById('sub-railpoin-amount').textContent = RAILPOIN_DATA.balance.toLocaleString('id-ID');
    }

    if (listContainer) {
        listContainer.innerHTML = RAILPOIN_DATA.history.map(item => `
            <div class="history-item">
                <div class="hist-left">
                    <div class="hist-icon-circle ${item.type}">
                        <i class="fa-solid ${item.type === 'earn' ? 'fa-arrow-down-left' : 'fa-arrow-up-right'}"></i>
                    </div>
                    <div>
                        <div class="hist-title">${item.title}</div>
                        <div class="hist-desc">${item.desc} • ${item.date}</div>
                    </div>
                </div>
                <div class="hist-points ${item.type}">
                    ${item.points > 0 ? '+' : ''}${item.points}
                </div>
            </div>
        `).join('');
    }

    if (openBtn) openBtn.addEventListener('click', () => modal.classList.add('active'));
    if (triggerRow) triggerRow.addEventListener('click', () => modal.classList.add('active'));
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}

// 4. Train Category Buttons in Home and Train Page
function initTrainServices() {
    const serviceItems = document.querySelectorAll('.service-item[data-mode]');
    const commuterModal = document.getElementById('commuter-modal');
    const bookingModal = document.getElementById('train-booking-modal');

    serviceItems.forEach(item => {
        item.addEventListener('click', () => {
            const mode = item.getAttribute('data-mode');
            if (mode === 'Commuter') {
                commuterModal.classList.add('active');
                calculateAndRenderCommuterRoute();
            } else {
                openBookingSearchModal(mode);
            }
        });
    });
}

function openBookingSearchModal(modeName = 'Intercity', destCode = 'BD') {
    const bookingModal = document.getElementById('train-booking-modal');
    const closeBtn = document.getElementById('close-booking-modal');

    selectModePill(modeName, destCode);
    bookingModal.classList.add('active');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => bookingModal.classList.remove('active'));
    }

    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) bookingModal.classList.remove('active');
    });
}

function selectModePill(modeName, targetDestCode = null) {
    const pills = document.querySelectorAll('.mode-pill');
    pills.forEach(p => {
        if (p.getAttribute('data-mode') === modeName) {
            p.classList.add('active');
        } else {
            p.classList.remove('active');
        }
    });

    updateModalHeadersAndButtons(modeName);
    populateStationOptions(modeName, targetDestCode);
    renderTrainResults();
}

function updateModalHeadersAndButtons(modeName) {
    const modalTitle = document.getElementById('booking-modal-title');
    const searchBtn = document.getElementById('btn-search-trains');
    
    if (modalTitle) {
        modalTitle.innerHTML = `<i class="fa-solid fa-train-subway"></i> ${modeName} Train Booking`;
    }
    if (searchBtn) {
        searchBtn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Search ${modeName} Train Schedule`;
    }
}

function populateStationOptions(modeName, targetDestCode = null) {
    const originSelect = document.getElementById('train-origin-select');
    const destSelect = document.getElementById('train-dest-select');

    if (!originSelect || !destSelect) return;

    const dataset = MODE_STATIONS_DATA[modeName] || MODE_STATIONS_DATA.Intercity;

    let htmlOptions = '';
    dataset.forEach(group => {
        htmlOptions += `<optgroup label="${group.cityName}">`;
        group.stations.forEach(st => {
            htmlOptions += `<option value="${st.code}">${st.fullName}</option>`;
        });
        htmlOptions += `</optgroup>`;
    });

    originSelect.innerHTML = htmlOptions;
    destSelect.innerHTML = htmlOptions;

    // Set smart default selections per mode
    if (dataset.length > 0 && dataset[0].stations.length > 0) {
        originSelect.selectedIndex = 0;
        
        if (targetDestCode && Array.from(destSelect.options).some(o => o.value === targetDestCode)) {
            destSelect.value = targetDestCode;
        } else if (dataset.length > 1 && dataset[1].stations.length > 0) {
            // Select first station of second city if available
            destSelect.value = dataset[1].stations[0].code;
        } else if (dataset[0].stations.length > 1) {
            destSelect.selectedIndex = 1;
        } else {
            destSelect.selectedIndex = 0;
        }
    }
}

// 5. Train Booking & Search Engine
function initTrainSearchEngine() {
    const modePills = document.querySelectorAll('.mode-pill');
    const searchBtn = document.getElementById('btn-search-trains');
    const swapBtn = document.getElementById('btn-swap-stations');
    const originSelect = document.getElementById('train-origin-select');
    const destSelect = document.getElementById('train-dest-select');

    modePills.forEach(pill => {
        pill.addEventListener('click', () => {
            const modeName = pill.getAttribute('data-mode');
            selectModePill(modeName);
        });
    });

    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            if (!originSelect || !destSelect) return;
            const tempVal = originSelect.value;
            originSelect.value = destSelect.value;
            destSelect.value = tempVal;
            renderTrainResults();
        });
    }

    if (originSelect) originSelect.addEventListener('change', () => renderTrainResults());
    if (destSelect) destSelect.addEventListener('change', () => renderTrainResults());

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            renderTrainResults();
            showToast('Menampilkan jadwal kereta sesuai pencarian');
        });
    }

    // Initial station population
    populateStationOptions('Intercity');
    renderTrainResults();
}

function renderTrainResults() {
    const resultsContainer = document.getElementById('train-results-container');
    if (!resultsContainer) return;

    const activePill = document.querySelector('.mode-pill.active');
    const selectedMode = activePill ? activePill.getAttribute('data-mode') : 'Intercity';

    const originSelect = document.getElementById('train-origin-select');
    const destSelect = document.getElementById('train-dest-select');

    const selectedOriginCode = originSelect ? originSelect.value : '';
    const selectedDestCode = destSelect ? destSelect.value : '';

    let filtered = TRAIN_SCHEDULES_DATA.filter(sch => {
        // Mode filter
        if (selectedMode !== 'ALL' && sch.category !== selectedMode) return false;

        // Station filter
        if (selectedOriginCode && selectedDestCode) {
            return (sch.originCode === selectedOriginCode && sch.destCode === selectedDestCode);
        }

        return true;
    });

    if (filtered.length === 0) {
        // Fallback: show Intercity trains for the category
        filtered = TRAIN_SCHEDULES_DATA.filter(sch => selectedMode === 'ALL' || sch.category === selectedMode);
    }

    if (filtered.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-ticket-state-sm">
                <p><i class="fa-solid fa-train-subway"></i> Tidak ada rute kereta ditemukan untuk stasiun yang dipilih.</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = filtered.map(sch => `
        <div class="train-schedule-card">
            <div class="sch-card-header">
                <div class="train-title-group">
                    <span class="train-cat-pill ${sch.category.toLowerCase()}">${sch.category}</span>
                    <h4 class="train-name">${sch.trainName}</h4>
                    <span class="train-code-sub">(${sch.trainCode})</span>
                </div>
                <span class="seat-badge"><i class="fa-solid fa-chair"></i> Tersisa ${sch.availableSeats} Kursi</span>
            </div>

            <div class="sch-journey-row">
                <div class="sch-node">
                    <span class="sch-time">${sch.originTime}</span>
                    <span class="sch-station">${sch.originName}</span>
                </div>

                <div class="sch-duration-box">
                    <span class="dur-text">${sch.duration}</span>
                    <div class="dur-line">
                        <i class="fa-solid fa-circle line-dot green"></i>
                        <span class="dur-dashed"></span>
                        <i class="fa-solid fa-train dur-icon"></i>
                        <span class="dur-dashed"></span>
                        <i class="fa-solid fa-location-dot line-dot red"></i>
                    </div>
                    <span class="class-text">${sch.classType}</span>
                </div>

                <div class="sch-node align-right">
                    <span class="sch-time">${sch.destTime}</span>
                    <span class="sch-station">${sch.destName}</span>
                </div>
            </div>

            <div class="sch-card-footer">
                <div class="price-box">
                    <span class="price-label">Harga per orang</span>
                    <h3 class="price-val">Rp ${sch.price.toLocaleString('id-ID')}</h3>
                </div>
                <button class="btn-book-train" onclick="bookTrainSchedule('${sch.id}')">
                    <i class="fa-solid fa-ticket"></i> Pesan Tiket
                </button>
            </div>
        </div>
    `).join('');
}

// Booking & Seat Management System State
let currentBookingSchedule = null;
let currentSelectedClass = 'Eksekutif';
let currentSelectedCoach = 'Gerbong 1';
let currentSelectedSeat = '2A';
let currentPaymentMethod = 'qris';
let BOOKED_SEATS_MAP = {
    'sch-1_Eksekutif_Gerbong 1': ['1A', '2C', '3D'],
    'sch-1_Bisnis_Gerbong 1': ['2B', '4A'],
    'sch-1_Ekonomi_Gerbong 1': ['1B', '3C', '5D']
};

// Booking Action Function
window.bookTrainSchedule = function(scheduleId) {
    if (!isLoggedIn) {
        document.getElementById('train-booking-modal')?.classList.remove('active');
        showToast('Silakan login terlebih dahulu untuk memesan tiket!');
        openLoginModal(() => {
            bookTrainSchedule(scheduleId);
        });
        return;
    }

    const sch = TRAIN_SCHEDULES_DATA.find(s => s.id === scheduleId);
    if (!sch) return;

    currentBookingSchedule = sch;
    currentSelectedClass = sch.classType.includes('Eksekutif') ? 'Eksekutif' : (sch.classType.includes('Bisnis') ? 'Bisnis' : 'Ekonomi');
    currentSelectedCoach = 'Gerbong 1';
    currentSelectedSeat = '2A';

    // Close train search modal if open
    document.getElementById('train-booking-modal')?.classList.remove('active');

    // Open Seat Selection Modal
    renderSeatSelectionModal();
    const seatModal = document.getElementById('seat-modal');
    if (seatModal) seatModal.classList.add('active');
};

function renderSeatSelectionModal() {
    if (!currentBookingSchedule) return;

    const sch = currentBookingSchedule;
    document.getElementById('seat-modal-title').innerHTML = `<i class="fa-solid fa-chair text-blue"></i> Pilih Gerbong & Kursi`;
    document.getElementById('seat-modal-sub').textContent = `${sch.trainName} (${sch.trainCode}) • ${sch.originName} ➔ ${sch.destName}`;

    // Base price per class
    const basePrice = sch.price || 150000;
    const priceEko = basePrice;
    const priceBis = Math.round(basePrice * 1.4);
    const priceEks = Math.round(basePrice * 2.0);

    const priceTabEko = document.getElementById('price-tab-ekonomi');
    const priceTabBis = document.getElementById('price-tab-bisnis');
    const priceTabEks = document.getElementById('price-tab-eksekutif');

    if (priceTabEko) priceTabEko.textContent = `Rp ${priceEko.toLocaleString('id-ID')}`;
    if (priceTabBis) priceTabBis.textContent = `Rp ${priceBis.toLocaleString('id-ID')}`;
    if (priceTabEks) priceTabEks.textContent = `Rp ${priceEks.toLocaleString('id-ID')}`;

    // Update Seat Counts
    const seatsEko = sch.availableSeatsEkonomi || Math.max(12, sch.availableSeats || 45);
    const seatsBis = sch.availableSeatsBisnis || Math.max(8, Math.round((sch.availableSeats || 45) * 0.6));
    const seatsEks = sch.availableSeatsEksekutif || Math.max(5, Math.round((sch.availableSeats || 45) * 0.3));

    const seatsTabEko = document.getElementById('seats-tab-ekonomi');
    const seatsTabBis = document.getElementById('seats-tab-bisnis');
    const seatsTabEks = document.getElementById('seats-tab-eksekutif');

    if (seatsTabEko) seatsTabEko.textContent = `Sisa ${seatsEko} Kursi`;
    if (seatsTabBis) seatsTabBis.textContent = `Sisa ${seatsBis} Kursi`;
    if (seatsTabEks) seatsTabEks.textContent = `Sisa ${seatsEks} Kursi`;

    // Highlight Active Class Tab
    const classTabs = document.querySelectorAll('#class-select-tabs .class-tab');
    classTabs.forEach(tab => {
        const cls = tab.getAttribute('data-class');
        if (cls === currentSelectedClass) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Highlight Active Coach Tab
    const coachTabs = document.querySelectorAll('#coach-tabs-container .coach-tab');
    coachTabs.forEach(tab => {
        const coach = tab.getAttribute('data-coach');
        if (coach === currentSelectedCoach) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Render Coach Seat Grid (10 rows of 4 seats: A, B - Aisle - C, D)
    const gridContainer = document.getElementById('seat-grid-container');
    if (!gridContainer) return;

    const key = `${sch.id}_${currentSelectedClass}_${currentSelectedCoach}`;
    const occupiedList = BOOKED_SEATS_MAP[key] || [];

    let gridHtml = '';
    for (let r = 1; r <= 10; r++) {
        const seatA = `${r}A`;
        const seatB = `${r}B`;
        const seatC = `${r}C`;
        const seatD = `${r}D`;

        const stateA = occupiedList.includes(seatA) ? 'occupied' : (currentSelectedSeat === seatA ? 'selected' : 'available');
        const stateB = occupiedList.includes(seatB) ? 'occupied' : (currentSelectedSeat === seatB ? 'selected' : 'available');
        const stateC = occupiedList.includes(seatC) ? 'occupied' : (currentSelectedSeat === seatC ? 'selected' : 'available');
        const stateD = occupiedList.includes(seatD) ? 'occupied' : (currentSelectedSeat === seatD ? 'selected' : 'available');

        gridHtml += `
            <div class="seat-row">
                <span class="seat-row-number">${r}</span>
                <div class="seat-pair">
                    <button class="seat-btn ${stateA}" onclick="selectSeat('${seatA}')">${seatA}</button>
                    <button class="seat-btn ${stateB}" onclick="selectSeat('${seatB}')">${seatB}</button>
                </div>
                <div class="aisle-gap">AISLE</div>
                <div class="seat-pair">
                    <button class="seat-btn ${stateC}" onclick="selectSeat('${seatC}')">${seatC}</button>
                    <button class="seat-btn ${stateD}" onclick="selectSeat('${seatD}')">${seatD}</button>
                </div>
            </div>
        `;
    }
    gridContainer.innerHTML = gridHtml;

    // Update label
    const label = document.getElementById('selected-seat-label');
    if (label) {
        label.textContent = `${currentSelectedClass} • ${currentSelectedCoach} / Kursi ${currentSelectedSeat || 'Belum Dipilih'}`;
    }
}

window.selectSeat = function(seatNo) {
    if (!currentBookingSchedule) return;
    const key = `${currentBookingSchedule.id}_${currentSelectedClass}_${currentSelectedCoach}`;
    const occupiedList = BOOKED_SEATS_MAP[key] || [];

    if (occupiedList.includes(seatNo)) {
        showToast(`Kursi ${seatNo} di ${currentSelectedCoach} sudah dipesan oleh penumpang lain!`);
        return;
    }

    currentSelectedSeat = seatNo;
    renderSeatSelectionModal();
};

function initSeatAndPaymentHandlers() {
    // Class Tabs Click Listener
    const classTabs = document.querySelectorAll('#class-select-tabs .class-tab');
    classTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            currentSelectedClass = tab.getAttribute('data-class');
            currentSelectedSeat = '2A';
            renderSeatSelectionModal();
        });
    });

    // Coach Tabs Click Listener
    const coachTabs = document.querySelectorAll('#coach-tabs-container .coach-tab');
    coachTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            currentSelectedCoach = tab.getAttribute('data-coach');
            currentSelectedSeat = '2A';
            renderSeatSelectionModal();
        });
    });

    // Close Modals
    document.getElementById('close-seat-modal')?.addEventListener('click', () => {
        document.getElementById('seat-modal')?.classList.remove('active');
    });

    document.getElementById('close-payment-modal')?.addEventListener('click', () => {
        document.getElementById('payment-modal')?.classList.remove('active');
    });

    // Confirm Seat Button -> Open Payment Modal
    document.getElementById('btn-confirm-seat')?.addEventListener('click', () => {
        if (!currentSelectedSeat) {
            showToast('Silakan pilih kursi terlebih dahulu!');
            return;
        }

        document.getElementById('seat-modal')?.classList.remove('active');
        openPaymentModal();
    });

    // Payment Methods Listener
    const payOptions = document.querySelectorAll('.pay-method-option');
    payOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            payOptions.forEach(o => {
                o.classList.remove('active');
                const check = o.querySelector('.fa-circle-check');
                if (check) check.className = 'fa-regular fa-circle text-gray';
            });
            opt.classList.add('active');
            const icon = opt.querySelector('.fa-circle, .fa-circle-check');
            if (icon) icon.className = 'fa-solid fa-circle-check text-blue';
            currentPaymentMethod = opt.getAttribute('data-method');
        });
    });

    // Apply Promo Code Listener in Payment Modal
    document.getElementById('btn-apply-promo')?.addEventListener('click', () => {
        applyPromoCodeToPayment();
    });

    // Pay Now Button Listener
    document.getElementById('btn-pay-now')?.addEventListener('click', () => {
        executeTicketPayment();
    });
}

let activeAppliedPromo = null;

function applyPromoCodeToPayment() {
    if (!currentBookingSchedule) return;

    const input = document.getElementById('pay-promo-input');
    const msgEl = document.getElementById('pay-promo-msg');
    if (!input || !msgEl) return;

    const rawCode = input.value.trim().toUpperCase();
    if (!rawCode) {
        msgEl.style.display = 'block';
        msgEl.style.color = '#ef4444';
        msgEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Masukkan kode promo terlebih dahulu.`;
        return;
    }

    const promo = PROMOTIONS_DATA.find(p => p.code === rawCode);

    if (!promo) {
        msgEl.style.display = 'block';
        msgEl.style.color = '#ef4444';
        msgEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Kode promo tidak ditemukan / salah!`;
        activeAppliedPromo = null;
        updatePaymentSummaryTotal();
        return;
    }

    // Category / Mode Verification: Promo must match current booking mode!
    const bookingMode = currentBookingSchedule.category;
    if (promo.trainMode !== bookingMode) {
        msgEl.style.display = 'block';
        msgEl.style.color = '#ef4444';
        msgEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Promo <strong>${promo.code}</strong> hanya berlaku untuk kereta <strong>${promo.trainMode}</strong>! (Kategori tiket Anda: ${bookingMode})`;
        activeAppliedPromo = null;
        updatePaymentSummaryTotal();
        return;
    }

    // Min Transaction Check
    const basePrice = currentBookingSchedule.price || 150000;
    let initialPrice = basePrice;
    if (currentSelectedClass === 'Bisnis') initialPrice = Math.round(basePrice * 1.4);
    if (currentSelectedClass === 'Eksekutif') initialPrice = Math.round(basePrice * 2.0);

    if (promo.minAmount && initialPrice < promo.minAmount) {
        msgEl.style.display = 'block';
        msgEl.style.color = '#ef4444';
        msgEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Minimal transaksi untuk promo ini adalah ${promo.minTransaction}`;
        activeAppliedPromo = null;
        updatePaymentSummaryTotal();
        return;
    }

    activeAppliedPromo = promo;
    const discAmount = Math.round(initialPrice * (promo.discountPercent / 100));

    msgEl.style.display = 'block';
    msgEl.style.color = '#16a34a';
    msgEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Kode promo berhasil dipasang! Diskon ${promo.discountPercent}% (Hemat Rp ${discAmount.toLocaleString('id-ID')})`;

    updatePaymentSummaryTotal();
}

function updatePaymentSummaryTotal() {
    if (!currentBookingSchedule) return;

    const basePrice = currentBookingSchedule.price || 150000;
    let initialPrice = basePrice;
    if (currentSelectedClass === 'Bisnis') initialPrice = Math.round(basePrice * 1.4);
    if (currentSelectedClass === 'Eksekutif') initialPrice = Math.round(basePrice * 2.0);

    let finalPrice = initialPrice;
    if (activeAppliedPromo) {
        const discAmount = Math.round(initialPrice * (activeAppliedPromo.discountPercent / 100));
        finalPrice = Math.max(0, initialPrice - discAmount);
    }

    const totalEl = document.getElementById('pay-summary-total');
    if (totalEl) {
        if (activeAppliedPromo) {
            totalEl.innerHTML = `<span style="text-decoration: line-through; font-size: 0.85rem; color: #cbd5e1; margin-right: 6px;">Rp ${initialPrice.toLocaleString('id-ID')}</span> Rp ${finalPrice.toLocaleString('id-ID')}`;
        } else {
            totalEl.textContent = `Rp ${finalPrice.toLocaleString('id-ID')}`;
        }
    }
    return finalPrice;
}

function openPaymentModal() {
    if (!currentBookingSchedule) return;

    activeAppliedPromo = null;
    const input = document.getElementById('pay-promo-input');
    const msgEl = document.getElementById('pay-promo-msg');
    if (input) input.value = '';
    if (msgEl) msgEl.style.display = 'none';

    const sch = currentBookingSchedule;
    document.getElementById('pay-summary-train').textContent = `${sch.trainName} (${sch.trainCode})`;
    document.getElementById('pay-summary-route').textContent = `${sch.originName} (${sch.originCode}) ➔ ${sch.destName} (${sch.destCode})`;
    document.getElementById('pay-summary-seat').textContent = `${currentSelectedClass} • ${currentSelectedCoach} / Kursi ${currentSelectedSeat}`;

    updatePaymentSummaryTotal();

    const payModal = document.getElementById('payment-modal');
    if (payModal) payModal.classList.add('active');
}

function executeTicketPayment() {
    if (!currentBookingSchedule) return;

    const finalPrice = updatePaymentSummaryTotal();
    const sch = currentBookingSchedule;

    const passengerName = currentUser ? currentUser.name : "AZZAM ANINDITA";

    const newBooking = {
        id: `TKT-${Math.floor(1000000 + Math.random() * 9000000)}`,
        scheduleId: sch.id,
        trainName: sch.trainName,
        trainCode: sch.trainCode,
        category: sch.category,
        classType: currentSelectedClass,
        coach: currentSelectedCoach,
        seatNo: currentSelectedSeat,
        seat: `${currentSelectedClass} • ${currentSelectedCoach} / Kursi ${currentSelectedSeat}`,
        originCode: sch.originCode,
        originName: sch.originName,
        originTime: sch.originTime,
        destCode: sch.destCode,
        destName: sch.destName,
        destTime: sch.destTime,
        date: "Selasa, 15 Sep 2026",
        passenger: passengerName,
        price: finalPrice,
        qrCode: `KAI-${sch.trainCode}-${Math.floor(100000 + Math.random() * 900000)}`,
        status: "TIKET AKTIF",
        paymentMethod: currentPaymentMethod
    };

    // Mark seat as occupied
    const key = `${sch.id}_${currentSelectedClass}_${currentSelectedCoach}`;
    BOOKED_SEATS_MAP[key] = BOOKED_SEATS_MAP[key] || [];
    if (!BOOKED_SEATS_MAP[key].includes(currentSelectedSeat)) {
        BOOKED_SEATS_MAP[key].push(currentSelectedSeat);
    }

    // Decrement available seat count
    if (sch.availableSeats && sch.availableSeats > 0) {
        sch.availableSeats -= 1;
    }

    USER_BOOKED_TICKETS.unshift(newBooking);

    // Reward +100 Railpoin per booking
    if (typeof RAILPOIN_DATA !== 'undefined') {
        RAILPOIN_DATA.balance = (RAILPOIN_DATA.balance || 0) + 100;
        RAILPOIN_DATA.tier = getTierByRailpoin(RAILPOIN_DATA.balance);
        if (!RAILPOIN_DATA.history) RAILPOIN_DATA.history = [];
        RAILPOIN_DATA.history.unshift({
            type: 'earn',
            title: 'Reward Pemesanan Tiket',
            desc: `${sch.trainName} (${sch.trainCode})`,
            points: 100,
            date: 'Hari ini'
        });
    }

    saveAuthToStorage(currentUser, isLoggedIn, RAILPOIN_DATA, USER_BOOKED_TICKETS);
    saveTicketsToStorage(USER_BOOKED_TICKETS);
    updateAuthUI();
    renderMyTicketsUI();

    document.getElementById('payment-modal')?.classList.remove('active');

    showToast(`Pembayaran Berhasil! Tiket ${sch.trainName} terbit (+100 Railpoin)`);
    switchPage('my-tickets');
}

// 6. Popular Destinations Renderer (Matching train.jpeg layout)
function initPopularDestinations() {
    renderPopularDestinations();
}

function renderPopularDestinations() {
    const destContainer = document.getElementById('popular-destinations-container');
    if (!destContainer) return;

    destContainer.innerHTML = POPULAR_DESTINATIONS_DATA.map(dest => `
        <div class="pop-dest-card" onclick="openPopularDestBooking('${dest.code}', '${dest.cityName}')">
            <img src="${dest.image}" alt="${dest.cityName}" class="pop-dest-img">
            <div class="pop-dest-overlay">
                <h3 class="pop-dest-city">${dest.cityName}</h3>
            </div>
        </div>
    `).join('');
}

window.openPopularDestBooking = function(destCode, cityName) {
    openBookingSearchModal('Intercity', destCode);
    showToast(`Pesan Tiket Kereta Tujuan ${cityName}`);
};

// 7. My Tickets Renderer
// 7. My Tickets Renderer (Matching ticket.jpeg Layout)
let currentTicketFilter = 'All';

function initMyTickets() {
    const toggleBtn = document.getElementById('toggle-ticket-btn');
    const ticketContainer = document.getElementById('my-ticket-container');
    const qrModal = document.getElementById('qr-modal');
    const closeQrBtn = document.getElementById('close-qr-modal');
    const printModal = document.getElementById('print-ticket-modal');
    const closePrintBtn = document.getElementById('close-print-modal');

    let hasTicket = true;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            hasTicket = !hasTicket;
            if (hasTicket) {
                if (USER_BOOKED_TICKETS.length === 0) {
                    USER_BOOKED_TICKETS = [{
                        id: "TKT-8839210",
                        trainName: "Argo Parahyangan",
                        trainCode: "KA 44",
                        category: "Intercity",
                        originCode: "GMR",
                        originName: "Gambir",
                        originTime: "08:15 WIB",
                        destCode: "BD",
                        destName: "Bandung",
                        destTime: "11:00 WIB",
                        date: "Selasa, 15 Sep 2026",
                        passenger: "AZZAM ANINDITA",
                        seat: "Eksekutif 2 / 12A",
                        price: 150000,
                        qrCode: "KAI-AP44-8839210-AZZAM",
                        status: "TIKET AKTIF"
                    }];
                }
                ticketContainer.classList.remove('hidden');
                toggleBtn.classList.add('active');
                toggleBtn.innerHTML = `<i class="fa-solid fa-ticket"></i> Ada Tiket Aktif`;
            } else {
                USER_BOOKED_TICKETS = [];
                ticketContainer.classList.add('hidden');
                toggleBtn.classList.remove('active');
                toggleBtn.innerHTML = `<i class="fa-solid fa-ticket-simple"></i> Tanpa Tiket (Kosong)`;
            }
            renderMyTicketsUI();
        });
    }

    // Filter pills listeners on My Tickets page
    const filterPills = document.querySelectorAll('.tkt-filter-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentTicketFilter = pill.getAttribute('data-filter');
            renderMyTicketsPage();
        });
    });

    if (closeQrBtn) closeQrBtn.addEventListener('click', () => qrModal.classList.remove('active'));
    if (qrModal) {
        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) qrModal.classList.remove('active');
        });
    }

    if (closePrintBtn) closePrintBtn.addEventListener('click', () => printModal.classList.remove('active'));
    if (printModal) {
        printModal.addEventListener('click', (e) => {
            if (e.target === printModal) printModal.classList.remove('active');
        });
    }

    renderMyTicketsUI();
}

function renderMyTicketsUI() {
    const homeTicketCard = document.getElementById('home-active-ticket-card');
    if (!homeTicketCard) return;

    if (!USER_BOOKED_TICKETS || USER_BOOKED_TICKETS.length === 0) {
        homeTicketCard.innerHTML = `
            <div class="empty-ticket-state-sm">
                <p><i class="fa-solid fa-ticket-simple"></i> Tidak ada tiket aktif saat ini.</p>
            </div>
        `;
    } else {
        const tkt = USER_BOOKED_TICKETS[0]; // Most recent active ticket
        homeTicketCard.innerHTML = `
            <div class="ticket-card-header">
                <div class="train-badge">
                    <i class="fa-solid fa-train-fast"></i>
                    <span>${tkt.trainName} (${tkt.trainCode})</span>
                </div>
                <span class="status-badge">${tkt.status}</span>
            </div>

            <div class="ticket-body">
                <div class="station-node">
                    <span class="station-code">${tkt.originCode}</span>
                    <span class="station-name">${tkt.originName}</span>
                    <span class="time-label">${tkt.originTime}</span>
                </div>

                <div class="journey-line">
                    <i class="fa-solid fa-circle-dot line-start"></i>
                    <div class="dashed-connector">
                        <i class="fa-solid fa-train line-train-icon"></i>
                    </div>
                    <i class="fa-solid fa-location-dot line-end"></i>
                </div>

                <div class="station-node align-right">
                    <span class="station-code">${tkt.destCode}</span>
                    <span class="station-name">${tkt.destName}</span>
                    <span class="time-label">${tkt.destTime}</span>
                </div>
            </div>

            <div class="ticket-footer">
                <div class="ticket-meta">
                    <span class="meta-date"><i class="fa-regular fa-calendar"></i> ${tkt.date}</span>
                    <span class="meta-seat"><i class="fa-solid fa-chair"></i> ${tkt.seat}</span>
                </div>
                <div class="ticket-action-btns">
                    <button class="print-tkt-btn" onclick="openPrintTicketModal('${tkt.id}')">
                        <i class="fa-solid fa-print"></i> Print Tiket
                    </button>
                    <button class="qr-btn" onclick="openQrModal('${tkt.qrCode}', '${tkt.id}')">
                        <i class="fa-solid fa-qrcode"></i> Lihat QR
                    </button>
                </div>
            </div>
        `;
    }

    renderMyTicketsPage();
}

function renderMyTicketsPage() {
    const fullContainer = document.getElementById('my-tickets-full-container');
    if (!fullContainer) return;

    let filteredTickets = USER_BOOKED_TICKETS;
    if (currentTicketFilter !== 'All') {
        filteredTickets = USER_BOOKED_TICKETS.filter(t => t.category === currentTicketFilter);
    }

    if (!filteredTickets || filteredTickets.length === 0) {
        fullContainer.innerHTML = `
            <div class="empty-ticket-state">
                <div class="empty-clipboard-illustration">
                    <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M40 50L43 40L46 50L56 53L46 56L43 66L40 56L30 53L40 50Z" fill="#3B82F6" opacity="0.4"/>
                        <path d="M170 80L172 72L174 80L182 82L174 84L172 92L170 84L162 82L170 80Z" fill="#3B82F6" opacity="0.4"/>
                        <circle cx="150" cy="170" r="45" fill="#EFF6FF"/>
                        <g transform="rotate(-12 110 110)">
                            <rect x="60" y="45" width="95" height="135" rx="14" fill="#C084FC"/>
                            <rect x="68" y="55" width="79" height="115" rx="8" fill="#FFFFFF"/>
                            <rect x="85" y="38" width="45" height="14" rx="4" fill="#1E3A8A"/>
                            <circle cx="107.5" cy="45" r="3" fill="#FFFFFF"/>
                        </g>
                        <g transform="rotate(6 110 110)">
                            <rect x="65" y="50" width="100" height="140" rx="14" fill="#9333EA"/>
                            <rect x="73" y="60" width="84" height="120" rx="8" fill="#FFFFFF"/>
                            <rect x="85" y="80" width="60" height="6" rx="3" fill="#E2E8F0"/>
                            <rect x="85" y="94" width="60" height="6" rx="3" fill="#F1F5F9"/>
                            <rect x="85" y="108" width="60" height="6" rx="3" fill="#F1F5F9"/>
                            <rect x="85" y="122" width="60" height="6" rx="3" fill="#F1F5F9"/>
                            <rect x="85" y="136" width="60" height="6" rx="3" fill="#F1F5F9"/>
                            <rect x="85" y="150" width="40" height="6" rx="3" fill="#F1F5F9"/>
                            <rect x="90" y="42" width="50" height="16" rx="4" fill="#1E1B4B"/>
                            <circle cx="115" cy="50" r="3.5" fill="#FFFFFF"/>
                        </g>
                    </svg>
                </div>
                <h2 class="empty-ticket-title">No Tickets Stored yet</h2>
                <p class="empty-ticket-desc">Belum ada tiket aktif yang tersimpan. Pesan tiket Anda sekarang!</p>
            </div>
        `;
        return;
    }

    fullContainer.innerHTML = filteredTickets.map(tkt => `
        <div class="ticket-card" style="margin-bottom: 24px;">
            <div class="ticket-card-header">
                <div class="train-badge">
                    <i class="fa-solid fa-train-fast"></i>
                    <span>${tkt.trainName} (${tkt.trainCode})</span>
                </div>
                <span class="status-badge">${tkt.status}</span>
            </div>

            <div class="ticket-body">
                <div class="station-node">
                    <span class="station-code">${tkt.originCode}</span>
                    <span class="station-name">${tkt.originName}</span>
                    <span class="time-label">${tkt.originTime}</span>
                </div>

                <div class="journey-line">
                    <i class="fa-solid fa-circle-dot line-start"></i>
                    <div class="dashed-connector">
                        <i class="fa-solid fa-train line-train-icon"></i>
                    </div>
                    <i class="fa-solid fa-location-dot line-end"></i>
                </div>

                <div class="station-node align-right">
                    <span class="station-code">${tkt.destCode}</span>
                    <span class="station-name">${tkt.destName}</span>
                    <span class="time-label">${tkt.destTime}</span>
                </div>
            </div>

            <div class="ticket-footer">
                <div class="ticket-meta">
                    <span class="meta-date"><i class="fa-regular fa-calendar"></i> ${tkt.date}</span>
                    <span class="meta-seat"><i class="fa-solid fa-chair"></i> ${tkt.seat}</span>
                </div>
                <div class="ticket-action-btns">
                    <button class="print-tkt-btn" onclick="openPrintTicketModal('${tkt.id}')">
                        <i class="fa-solid fa-print"></i> Print Tiket
                    </button>
                    <button class="qr-btn" onclick="openQrModal('${tkt.qrCode}', '${tkt.id}')">
                        <i class="fa-solid fa-qrcode"></i> Lihat QR
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

window.openPrintTicketModal = function(ticketId) {
    const tkt = USER_BOOKED_TICKETS.find(t => t.id === ticketId);
    if (!tkt) return;

    const modal = document.getElementById('print-ticket-modal');
    document.getElementById('print-booking-code').textContent = tkt.id.replace('TKT-', '');
    document.getElementById('print-passenger').textContent = tkt.passenger || 'AZZAM ANINDITA';
    document.getElementById('print-train-name').textContent = `${tkt.trainName} (${tkt.trainCode})`;
    document.getElementById('print-seat').textContent = tkt.seat;
    document.getElementById('print-origin-time').textContent = tkt.originTime;
    document.getElementById('print-origin-name').textContent = `${tkt.originName} (${tkt.originCode})`;
    document.getElementById('print-origin-date').textContent = tkt.date;
    document.getElementById('print-dest-time').textContent = tkt.destTime;
    document.getElementById('print-dest-name').textContent = `${tkt.destName} (${tkt.destCode})`;
    document.getElementById('print-dest-date').textContent = tkt.date;

    const qrImg = document.getElementById('print-qr-img');
    if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(tkt.qrCode)}`;

    if (modal) modal.classList.add('active');
};

window.openQrModal = function(qrData, bookingId) {
    const qrModal = document.getElementById('qr-modal');
    const qrImg = document.getElementById('qr-image-src');
    const codeEl = document.getElementById('qr-modal-booking-code');

    if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`;
    if (codeEl) codeEl.textContent = bookingId;

    if (qrModal) qrModal.classList.add('active');
};

// 8. Commuter Modal Calculator
function initCommuterModal() {
    const modal = document.getElementById('commuter-modal');
    const closeBtn = document.getElementById('close-commuter-modal');
    const originSelect = document.getElementById('commuter-origin-select');
    const destSelect = document.getElementById('commuter-dest-select');
    const swapBtn = document.getElementById('swap-stations-btn');
    const searchBtn = document.getElementById('search-route-btn');

    if (!originSelect) return;

    const optionsHtml = COMMUTER_STATIONS.map(st => `
        <option value="${st.id}">${st.name} (${st.line})</option>
    `).join('');

    originSelect.innerHTML = optionsHtml;
    destSelect.innerHTML = optionsHtml;

    originSelect.value = 'DP';
    destSelect.value = 'MRI';

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const temp = originSelect.value;
            originSelect.value = destSelect.value;
            destSelect.value = temp;
            calculateAndRenderCommuterRoute();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            calculateAndRenderCommuterRoute();
        });
    }
}

function calculateAndRenderCommuterRoute() {
    const originId = document.getElementById('commuter-origin-select').value;
    const destId = document.getElementById('commuter-dest-select').value;

    const originSt = COMMUTER_STATIONS.find(s => s.id === originId);
    const destSt = COMMUTER_STATIONS.find(s => s.id === destId);

    if (!originSt || !destSt) return;

    let distanceKm = 0;
    if (originSt.line.includes(destSt.line.split(' ')[1]) || originSt.line === destSt.line) {
        distanceKm = Math.abs(originSt.distanceKm - destSt.distanceKm);
    } else {
        distanceKm = Math.abs(originSt.distanceKm - destSt.distanceKm) + 8.5;
    }
    if (distanceKm === 0) distanceKm = 5.0;

    distanceKm = parseFloat(distanceKm.toFixed(1));

    const fare = calculateCommuterFare(distanceKm);

    document.getElementById('result-fare-price').textContent = `Rp ${fare.toLocaleString('id-ID')}`;
    document.getElementById('result-distance').innerHTML = `<i class="fa-solid fa-route"></i> ${distanceKm} km`;
    
    let calcText = `Skema Tarif Progresif: Rp 3.000 (25 km pertama)`;
    if (distanceKm > 25) {
        const extraUnits = Math.ceil((distanceKm - 25) / 10);
        calcText += ` + ${extraUnits} x Rp 1.000 (tambahan jarak ${distanceKm - 25} km)`;
    }
    document.getElementById('fare-calc-info').innerHTML = `<i class="fa-solid fa-circle-info"></i> ${calcText}`;

    document.getElementById('res-origin-name').textContent = originSt.name;
    document.getElementById('res-origin-line').textContent = originSt.line;
    document.getElementById('res-dest-name').textContent = destSt.name;
    document.getElementById('res-dest-line').textContent = destSt.line;

    let transitText = "Perjalanan Langsung (Tanpa Transit)";
    if (originSt.line !== destSt.line && !originSt.line.includes("Transit")) {
        transitText = `Transit di Stasiun Manggarai / Tanah Abang`;
    }
    document.getElementById('res-transit-info').textContent = transitText;

    const now = new Date();
    let times = [];
    for (let i = 1; i <= 4; i++) {
        let t = new Date(now.getTime() + (i * 12 + Math.floor(Math.random() * 5)) * 60000);
        let hrs = String(t.getHours()).padStart(2, '0');
        let mins = String(t.getMinutes()).padStart(2, '0');
        times.push(`${hrs}:${mins} WIB`);
    }

    const scheduleContainer = document.getElementById('schedule-chips-container');
    scheduleContainer.innerHTML = times.map(tm => `<span class="time-chip"><i class="fa-solid fa-train-subway"></i> ${tm}</span>`).join('');
}

// 9. Interactive Promotions & Information System (Matching Promo.jpeg & Info.jpeg)
let selectedPromoModeFilter = 'ALL';

function initPromotions() {
    const promoContainer = document.getElementById('promotions-container');
    const promoModal = document.getElementById('promo-modal');
    const closePromoModal = document.getElementById('close-promo-modal');
    const copyCodeBtn = document.getElementById('copy-code-btn');
    const copyToast = document.getElementById('copy-toast');

    // Tab Switchers for Promotion vs Information
    const btnPromotion = document.getElementById('tab-btn-promotion');
    const btnInformation = document.getElementById('tab-btn-information');
    const viewPromotion = document.getElementById('view-promotion');
    const viewInformation = document.getElementById('view-information');

    if (btnPromotion && btnInformation) {
        btnPromotion.addEventListener('click', () => {
            btnPromotion.classList.add('active');
            btnInformation.classList.remove('active');
            viewPromotion.classList.add('active');
            viewInformation.classList.remove('active');
            renderFullPromotionsPage();
        });

        btnInformation.addEventListener('click', () => {
            btnInformation.classList.add('active');
            btnPromotion.classList.remove('active');
            viewInformation.classList.add('active');
            viewPromotion.classList.remove('active');
            renderFullInformationPage();
        });
    }

    // Dropdown filter listener
    const modeDropdown = document.getElementById('promo-mode-dropdown');
    if (modeDropdown) {
        modeDropdown.addEventListener('change', (e) => {
            selectedPromoModeFilter = e.target.value;
            renderFullPromotionsPage();
        });
    }

    // Home Page Horizontal Promo Carousel
    if (promoContainer) {
        promoContainer.innerHTML = PROMOTIONS_DATA.map(promo => `
            <div class="promo-card" data-id="${promo.id}" style="background: ${promo.bgGradient};">
                <div class="promo-card-top">
                    <span class="promo-tag"><i class="fa-solid ${promo.trainModeIcon}"></i> ${promo.trainMode}</span>
                    <span class="promo-disc-badge">${promo.discountTag}</span>
                </div>
                <div class="promo-card-body">
                    <h4 class="promo-title">${promo.title}</h4>
                    <p class="promo-valid">S.d. ${promo.validUntil}</p>
                </div>
                <div class="promo-card-footer">
                    <span class="use-promo-btn">Gunakan Voucher <i class="fa-solid fa-chevron-right"></i></span>
                </div>
            </div>
        `).join('');

        attachPromoCardClickEvents();
    }

    if (closePromoModal) closePromoModal.addEventListener('click', () => promoModal.classList.remove('active'));
    if (promoModal) {
        promoModal.addEventListener('click', (e) => {
            if (e.target === promoModal) promoModal.classList.remove('active');
        });
    }

    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', () => {
            const codeText = document.getElementById('pmodal-code').textContent;
            navigator.clipboard.writeText(codeText).then(() => {
                copyToast.classList.add('show');
                setTimeout(() => copyToast.classList.remove('show'), 3000);
            });
        });
    }

    renderFullPromotionsPage();
}

function attachPromoCardClickEvents() {
    const promoModal = document.getElementById('promo-modal');
    const copyToast = document.getElementById('copy-toast');

    document.querySelectorAll('.promo-card').forEach(card => {
        card.addEventListener('click', () => {
            const promoId = card.getAttribute('data-id');
            const promo = PROMOTIONS_DATA.find(p => p.id === promoId);
            if (promo) {
                document.getElementById('promo-modal-header-bg').style.background = promo.bgGradient;
                document.getElementById('pmodal-mode-tag').innerHTML = `<i class="fa-solid ${promo.trainModeIcon}"></i> Kereta ${promo.trainMode}`;
                document.getElementById('pmodal-title').textContent = promo.title;
                document.getElementById('pmodal-code').textContent = promo.code;
                document.getElementById('pmodal-valid').textContent = promo.validUntil;
                document.getElementById('pmodal-min').textContent = promo.minTransaction;
                document.getElementById('pmodal-desc').textContent = promo.description;
                document.getElementById('pmodal-terms').innerHTML = promo.terms.map(t => `<li><i class="fa-solid fa-check"></i> ${t}</li>`).join('');

                if (copyToast) copyToast.classList.remove('show');
                if (promoModal) promoModal.classList.add('active');
            }
        });
    });
}

function renderFullPromotionsPage() {
    const fullContainer = document.getElementById('promotions-full-container');
    if (!fullContainer) return;

    let filteredPromos = PROMOTIONS_DATA;
    if (selectedPromoModeFilter !== 'ALL') {
        filteredPromos = PROMOTIONS_DATA.filter(p => p.trainMode === selectedPromoModeFilter);
    }

    if (filteredPromos.length === 0) {
        fullContainer.innerHTML = `<p class="empty-msg" style="padding: 24px; text-align: center; color: #64748b;">Belum ada promo khusus untuk kategori ini.</p>`;
        return;
    }

    fullContainer.innerHTML = filteredPromos.map(promo => `
        <div class="promo-card vertical-promo-card" data-id="${promo.id}" style="background: ${promo.bgGradient}; min-height: 170px; margin-bottom: 20px;">
            <div class="promo-card-top">
                <span class="promo-tag"><i class="fa-solid ${promo.trainModeIcon}"></i> ${promo.trainMode}</span>
                <span class="promo-disc-badge">${promo.discountTag}</span>
            </div>
            <div class="promo-card-body">
                <h4 class="promo-title">${promo.title}</h4>
                <p class="promo-valid">S.d. ${promo.validUntil}</p>
            </div>
            <div class="promo-card-footer">
                <span class="use-promo-btn">Gunakan Voucher <i class="fa-solid fa-chevron-right"></i></span>
            </div>
        </div>
    `).join('');

    attachPromoCardClickEvents();
}

function renderFullInformationPage() {
    const infoContainer = document.getElementById('information-full-container');
    const articleModal = document.getElementById('article-modal');
    if (!infoContainer) return;

    infoContainer.innerHTML = KAI_INFORMATION_DATA.map(info => `
        <div class="info-card-vertical" data-id="${info.id}">
            <div class="info-card-img-wrapper">
                <img src="${info.image}" alt="${info.title}" class="info-card-img">
            </div>
            <div class="info-card-content">
                <h3 class="info-card-title">${info.title}</h3>
                <span class="info-read-link">Lihat Detail Informasi <i class="fa-solid fa-arrow-right"></i></span>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.info-card-vertical').forEach(card => {
        card.addEventListener('click', () => {
            const infoId = card.getAttribute('data-id');
            const info = KAI_INFORMATION_DATA.find(i => i.id === infoId);
            if (info && articleModal) {
                document.getElementById('art-modal-cat').textContent = info.category;
                document.getElementById('art-modal-title').textContent = info.title;
                document.getElementById('art-modal-date').textContent = info.date;
                document.getElementById('art-modal-img').src = info.image;
                document.getElementById('art-modal-content').textContent = info.content;
                articleModal.classList.add('active');
            }
        });
    });
}

// 10. Articles Horizontal Slider
function initArticles() {
    const articlesContainer = document.getElementById('articles-container');
    const articleModal = document.getElementById('article-modal');
    const closeArtModal = document.getElementById('close-article-modal');

    if (articlesContainer) {
        articlesContainer.innerHTML = KAI_ARTICLES.map(art => `
            <div class="article-slide-card" data-id="${art.id}">
                <img src="${art.image}" alt="${art.title}" class="article-slide-img">
                <div class="article-slide-content">
                    <div class="article-meta-top">
                        <span class="art-tag">${art.category}</span>
                        <span class="art-date">${art.date}</span>
                    </div>
                    <h4 class="article-slide-title">${art.title}</h4>
                    <span class="read-more-text">Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i></span>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.article-slide-card').forEach(card => {
            card.addEventListener('click', () => {
                const artId = card.getAttribute('data-id');
                const article = KAI_ARTICLES.find(a => a.id === artId);
                if (article) {
                    document.getElementById('art-modal-cat').textContent = article.category;
                    document.getElementById('art-modal-title').textContent = article.title;
                    document.getElementById('art-modal-date').textContent = article.date;
                    document.getElementById('art-modal-img').src = article.image;
                    document.getElementById('art-modal-content').textContent = article.content;
                    articleModal.classList.add('active');
                }
            });
        });
    }

    if (closeArtModal) closeArtModal.addEventListener('click', () => articleModal.classList.remove('active'));
    if (articleModal) {
        articleModal.addEventListener('click', (e) => {
            if (e.target === articleModal) articleModal.classList.remove('active');
        });
    }
}

// 11. Global Modal Controller & Back Button Handler
function setupGlobalModalHandlers() {
    document.querySelectorAll('.close-modal-btn, [data-close-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = btn.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        }
    });

    // Global Login Button Click Delegation
    document.addEventListener('click', (e) => {
        const loginBtn = e.target.closest('#open-login-btn, .btn-top-login, [data-open-login]');
        if (loginBtn) {
            e.preventDefault();
            if (typeof openLoginModal === 'function') {
                openLoginModal();
            }
        }
    });
}

// 12. Account & Account Detail Page Controller
function initAccountSystem() {
    const btnViewProfile = document.getElementById('btn-view-profile');
    const btnBackAccount = document.getElementById('btn-back-account');
    const menuAbout = document.getElementById('menu-about-access');
    const menuHelp = document.getElementById('menu-help-center');
    const menuLogout = document.getElementById('menu-logout');
    const confirmLogout = document.getElementById('confirm-logout-btn');

    if (btnViewProfile) {
        btnViewProfile.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isLoggedIn) {
                openLoginModal();
            } else {
                switchPage('account-detail');
            }
        });
    }

    if (btnBackAccount) {
        btnBackAccount.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage('account');
        });
    }

    if (menuAbout) {
        menuAbout.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('about-modal')?.classList.add('active');
        });
    }

    if (menuHelp) {
        menuHelp.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('help-modal')?.classList.add('active');
        });
    }

    if (menuLogout) {
        menuLogout.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isLoggedIn) {
                openLoginModal();
            } else {
                document.getElementById('logout-modal')?.classList.add('active');
            }
        });
    }

    if (confirmLogout) {
        confirmLogout.addEventListener('click', async () => {
            document.getElementById('logout-modal')?.classList.remove('active');
            isLoggedIn = false;
            currentUser = null;
            USER_BOOKED_TICKETS = [];
            RAILPOIN_DATA.balance = 0;
            await clearAuthStorage();
            updateAuthUI();
            showToast('Anda telah berhasil keluar (Logout).');
            switchPage('home');
        });
    }
}

// Global Authentication Modal Function (Hoisted Statement)
let pendingRedirectAction = null;

const LOCALHOST_API_URL = 'http://localhost:3000/api';

// Sync & Persistence Utilities for Localhost Server & LocalStorage
function saveAuthToStorage(userData, isLoggedInState, railpoinData, ticketsData) {
    // Synchronous LocalStorage Save (Instant)
    try {
        localStorage.setItem('kai_user', JSON.stringify(userData));
        localStorage.setItem('kai_is_logged_in', isLoggedInState ? 'true' : 'false');
        localStorage.setItem('kai_railpoin', JSON.stringify(railpoinData));
        localStorage.setItem('kai_tickets', JSON.stringify(ticketsData));
    } catch (e) {
        console.warn('LocalStorage save failed:', e);
    }

    // Non-blocking background sync to Localhost Server Backend API
    fetch(`${LOCALHOST_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    }).catch(err => {
        console.log('Localhost server API not reached, data saved to LocalStorage.');
    });
}

function saveTicketsToStorage(tickets) {
    try {
        localStorage.setItem('kai_tickets', JSON.stringify(tickets));
    } catch (e) {}

    fetch(`${LOCALHOST_API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket: tickets[0] })
    }).catch(() => {});
}

function clearAuthStorage() {
    try {
        localStorage.removeItem('kai_user');
        localStorage.removeItem('kai_is_logged_in');
        localStorage.removeItem('kai_railpoin');
        localStorage.removeItem('kai_tickets');
    } catch (e) {}

    fetch(`${LOCALHOST_API_URL}/logout`, { method: 'POST' }).catch(() => {});
}

function getTierByRailpoin(balance) {
    const pts = Number(balance) || 0;
    if (pts > 2000) return "Platinum Member";
    if (pts >= 1500) return "Gold Member";
    if (pts >= 1000) return "Silver Member";
    return "Basic Member";
}

function loadAuthFromStorage() {
    // 1. Instant Synchronous Restore from LocalStorage
    try {
        const savedIsLoggedIn = localStorage.getItem('kai_is_logged_in');
        const savedUser = localStorage.getItem('kai_user');
        const savedRailpoin = localStorage.getItem('kai_railpoin');
        const savedTickets = localStorage.getItem('kai_tickets');

        if (savedIsLoggedIn === 'true' && savedUser) {
            isLoggedIn = true;
            currentUser = JSON.parse(savedUser);
            if (savedRailpoin) {
                const parsedRp = JSON.parse(savedRailpoin);
                RAILPOIN_DATA.balance = parsedRp.balance || 0;
                RAILPOIN_DATA.tier = getTierByRailpoin(RAILPOIN_DATA.balance);
                RAILPOIN_DATA.userName = currentUser.shortName;
                if (parsedRp.history) RAILPOIN_DATA.history = parsedRp.history;
            }
            if (savedTickets) {
                USER_BOOKED_TICKETS = JSON.parse(savedTickets);
            }
        }
    } catch (e) {
        console.warn('Error reading from LocalStorage:', e);
    }

    prefillLoginForm();
    updateAuthUI();

    // 2. Background Sync with Localhost Server API (if server is running)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    fetch(`${LOCALHOST_API_URL}/user`, { signal: controller.signal })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            clearTimeout(timeoutId);
            if (data && data.isLoggedIn && data.currentUser) {
                isLoggedIn = true;
                currentUser = data.currentUser;
                if (data.railpoin) {
                    RAILPOIN_DATA.balance = data.railpoin.balance || 0;
                    RAILPOIN_DATA.tier = getTierByRailpoin(RAILPOIN_DATA.balance);
                    RAILPOIN_DATA.userName = currentUser.shortName;
                    if (data.railpoin.history) RAILPOIN_DATA.history = data.railpoin.history;
                }
                if (data.tickets && data.tickets.length > 0) {
                    USER_BOOKED_TICKETS = data.tickets;
                }
                prefillLoginForm();
                updateAuthUI();
            }
        })
        .catch(() => {
            clearTimeout(timeoutId);
        });
}

function prefillLoginForm() {
    if (!currentUser) return;
    const nameEl = document.getElementById('login-input-name');
    const genderEl = document.getElementById('login-input-gender');
    const nikEl = document.getElementById('login-input-nik');
    const emailEl = document.getElementById('login-input-email');

    if (nameEl) nameEl.value = currentUser.name || '';
    if (genderEl && currentUser.gender) genderEl.value = currentUser.gender;
    if (nikEl) nikEl.value = currentUser.nik || '';
    if (emailEl) emailEl.value = currentUser.email || '';
}

function openLoginModal(onSuccessCallback = null) {
    pendingRedirectAction = onSuccessCallback;
    prefillLoginForm();
    const modal = document.getElementById('login-modal');
    if (modal) modal.classList.add('active');
}
window.openLoginModal = openLoginModal;

function initAuthSystem() {
    // Load local auth instantly on start
    loadAuthFromStorage();

    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('login-input-name').value.trim();
            const gender = document.getElementById('login-input-gender').value;
            const rawDob = document.getElementById('login-input-dob').value;
            const nik = document.getElementById('login-input-nik').value.trim();
            const email = document.getElementById('login-input-email').value.trim();

            if (!name || !nik || !email) {
                showToast('Mohon lengkapi seluruh data identitas!');
                return;
            }

            // NIK Validation: Must be 16 numeric digits
            if (!/^\d{16}$/.test(nik)) {
                showToast('NIK KTP harus terdiri dari tepat 16 digit angka!');
                return;
            }

            // Format Date of Birth
            let formattedDob = rawDob;
            if (rawDob) {
                const parts = rawDob.split('-');
                if (parts.length === 3) {
                    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    const mIdx = parseInt(parts[1], 10) - 1;
                    formattedDob = `${parseInt(parts[2], 10)} ${months[mIdx] || ''} ${parts[0]}`;
                }
            }

            // Derive shortName and initials
            const nameParts = name.split(' ');
            const shortName = nameParts.slice(0, 2).join(' ').toUpperCase();
            let initials = "AD";
            if (nameParts.length >= 2) {
                initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
            } else if (nameParts.length === 1 && nameParts[0].length > 0) {
                initials = nameParts[0].substring(0, 2).toUpperCase();
            }

            // Keep balance if logging into same NIK, otherwise start with 0
            let startBalance = 0;
            if (currentUser && currentUser.nik === nik) {
                startBalance = RAILPOIN_DATA.balance || 0;
            }

            isLoggedIn = true;
            currentUser = {
                name: name.toUpperCase(),
                shortName: shortName,
                gender: gender,
                dob: formattedDob,
                nik: nik,
                email: email,
                phone: "0812-3456-7890",
                initials: initials
            };

            RAILPOIN_DATA.balance = startBalance;
            RAILPOIN_DATA.tier = getTierByRailpoin(startBalance);
            RAILPOIN_DATA.userName = currentUser.shortName;

            // 1. Instant UI update & modal close
            document.getElementById('login-modal')?.classList.remove('active');
            updateAuthUI();

            // 2. Save session locally & background sync to localhost server
            saveAuthToStorage(currentUser, isLoggedIn, RAILPOIN_DATA, USER_BOOKED_TICKETS);

            showToast(`Login Berhasil! Selamat Datang, ${currentUser.shortName}`);

            if (pendingRedirectAction && typeof pendingRedirectAction === 'function') {
                const callback = pendingRedirectAction;
                pendingRedirectAction = null;
                callback();
            }
        });
    }
}

function updateAuthUI() {
    const greetingTimeEl = document.getElementById('greeting-time');
    const greetingNameEl = document.getElementById('user-greeting-name');
    const topAuthActions = document.getElementById('top-auth-actions');
    const mainRailpoinEl = document.getElementById('main-railpoin-amount');
    const subRailpoinEl = document.getElementById('sub-railpoin-amount');

    const accAvatar = document.getElementById('acc-card-avatar');
    const accName = document.getElementById('acc-card-name');
    const accBadge = document.getElementById('acc-card-badge');
    const btnViewProfile = document.getElementById('btn-view-profile');

    if (!isLoggedIn) {
        if (greetingTimeEl) greetingTimeEl.textContent = "Selamat Datang di KAI Access";
        if (greetingNameEl) greetingNameEl.textContent = "Silakan Login / Masuk Akun";

        if (topAuthActions) {
            topAuthActions.innerHTML = `
                <button class="btn-top-login" onclick="openLoginModal()">
                    <i class="fa-solid fa-right-to-bracket"></i> Login / Masuk
                </button>
            `;
        }

        if (mainRailpoinEl) mainRailpoinEl.textContent = "0 Poin";
        if (subRailpoinEl) subRailpoinEl.textContent = "0";

        if (accAvatar) accAvatar.textContent = "?";
        if (accName) accName.textContent = "Pengguna KAI Access";
        if (accBadge) accBadge.innerHTML = `<i class="fa-solid fa-user-lock"></i> Belum Login`;

        if (btnViewProfile) {
            btnViewProfile.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login / Masuk Akun`;
        }
    } else {
        const hour = new Date().getHours();
        let timeSalutation = "Good Evening";
        if (hour >= 4 && hour < 11) timeSalutation = "Good Morning";
        else if (hour >= 11 && hour < 15) timeSalutation = "Good Afternoon";
        else if (hour >= 15 && hour < 18) timeSalutation = "Good Evening";
        else timeSalutation = "Good Night";

        if (greetingTimeEl) greetingTimeEl.textContent = timeSalutation;
        if (greetingNameEl) greetingNameEl.textContent = currentUser.shortName;

        if (topAuthActions) {
            topAuthActions.innerHTML = `
                <button class="icon-btn" title="Keranjang">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <span class="dot-badge"></span>
                </button>
                <button class="icon-btn" title="Notifikasi">
                    <i class="fa-regular fa-envelope"></i>
                    <span class="dot-badge"></span>
                </button>
            `;
        }

        const tierName = getTierByRailpoin(RAILPOIN_DATA.balance);
        RAILPOIN_DATA.tier = tierName;

        if (mainRailpoinEl) mainRailpoinEl.textContent = `${RAILPOIN_DATA.balance.toLocaleString('id-ID')} Poin`;
        if (subRailpoinEl) subRailpoinEl.textContent = RAILPOIN_DATA.balance.toLocaleString('id-ID');

        if (accAvatar) accAvatar.textContent = currentUser.initials;
        if (accName) accName.textContent = currentUser.name;

        let tierIcon = `<i class="fa-solid fa-star"></i>`;
        if (tierName.includes("Platinum")) tierIcon = `<i class="fa-solid fa-gem" style="color:#a855f7;"></i>`;
        else if (tierName.includes("Gold")) tierIcon = `<i class="fa-solid fa-crown" style="color:#eab308;"></i>`;
        else if (tierName.includes("Silver")) tierIcon = `<i class="fa-solid fa-award" style="color:#94a3b8;"></i>`;

        if (accBadge) accBadge.innerHTML = `${tierIcon} ${tierName}`;

        if (btnViewProfile) {
            btnViewProfile.innerHTML = `<i class="fa-regular fa-user"></i> View Profile`;
        }

        updateAccountDetailFields();
    }

    renderMyTicketsUI();
}

function updateAccountDetailFields() {
    if (!currentUser) return;

    const fieldCards = document.querySelectorAll('#page-account-detail .info-field-card');
    if (fieldCards.length >= 4) {
        // Phone
        const phoneVal = fieldCards[0].querySelector('.field-value-lg');
        if (phoneVal) phoneVal.textContent = currentUser.phone;

        // Email
        const emailVal = fieldCards[1].querySelector('.field-value-lg');
        if (emailVal) emailVal.textContent = currentUser.email;

        // NIK
        const nikVals = fieldCards[2].querySelectorAll('.field-value-lg');
        if (nikVals.length >= 2) {
            nikVals[0].textContent = "KTP";
            nikVals[1].textContent = currentUser.nik;
        }

        // Bio
        const nameVal = fieldCards[3].querySelector('.bio-full-name');
        if (nameVal) nameVal.textContent = currentUser.name;

        const bioGridVals = fieldCards[3].querySelectorAll('.bio-details-grid .field-value-lg');
        if (bioGridVals.length >= 2) {
            bioGridVals[0].textContent = currentUser.gender;
            bioGridVals[1].textContent = currentUser.dob;
        }
    }
}


