// PrimeFit Sports & Fitness center frontend logic
const STORAGE_KEYS = {
  bookings: 'primefit_bookings',
  members: 'primefit_members',
};

const SLOT_PRICING = {
  2: 15000,
  4: 25000,
};

const TESTIMONIALS = [
  {
    name: 'Amina Johnson',
    review: 'PrimeFit gave me the structure I needed. The gym is clean, the coaches are supportive and the booking tool is easy to use.',
    contact: 'amina@example.com',
    photo: 'https://images.unsplash.com/photo-1544411437-3f3d45b3b0fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Michael Adewale',
    review: 'The football turf is excellent and the booking experience is seamless. I can reserve my team’s slot in seconds.',
    contact: 'michael@example.com',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Sade Olanipekun',
    review: 'Membership plans are clear and affordable. The staff helped me choose the best program and the mobile-friendly site is intuitive.',
    contact: 'sade@example.com',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  },
];

const AVAILABLE_SLOTS = ['8AM-10AM', '10AM-12PM', '12PM-2PM', '2PM-4PM'];
let currentTestimonial = 0;

function dom(id) {
  return document.getElementById(id);
}

function hasEl(id) {
  return !!dom(id);
}

function addListener(id, event, handler) {
  const el = dom(id);
  if (el) el.addEventListener(event, handler);
  return el;
}

function getLocalData(key) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

function setLocalData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatCurrency(amount) {
  return `₦${amount.toLocaleString()}`;
}

function createBookingId() {
  return `BK-${Date.now()}-${Math.floor(Math.random() * 999)}`;
}

function createMemberId() {
  return `MB-${Date.now()}-${Math.floor(Math.random() * 999)}`;
}

function mapBookingsByDate(date) {
  return getLocalData(STORAGE_KEYS.bookings).filter((booking) => booking.date === date);
}

function getSlotStatus(date, slot) {
  const bookings = mapBookingsByDate(date);
  return bookings.some((booking) => booking.slot === slot) ? 'Booked' : 'Available';
}

function renderSchedule(date) {
  const scheduleList = dom('scheduleList');
  if (!scheduleList) return;
  scheduleList.innerHTML = AVAILABLE_SLOTS.map((slot) => {
    const status = getSlotStatus(date, slot);
    const pillClass = status === 'Available' ? 'available' : 'booked';
    return `
      <div class="schedule-item">
        <span>${slot}</span>
        <span class="status-pill ${pillClass}"><span class="status-dot ${pillClass}"></span>${status}</span>
      </div>
    `;
  }).join('');
}

function updateBookingFormDate(date) {
  const bookDate = dom('bookDate');
  if (bookDate) bookDate.value = date;
  renderSchedule(date);
}

function handleDateChange() {
  const bookingDate = dom('bookingDate');
  if (!bookingDate) return;
  const selectedDate = bookingDate.value || new Date().toISOString().split('T')[0];
  updateBookingFormDate(selectedDate);
}

function calculateBookingPrice() {
  const durationEl = dom('bookDuration');
  const duration = durationEl ? parseInt(durationEl.value, 10) : 2;
  return SLOT_PRICING[duration] || SLOT_PRICING[2];
}

function renderBookingTotal() {
  const bookingTotalEl = dom('bookingTotal');
  if (!bookingTotalEl) return;
  bookingTotalEl.textContent = formatCurrency(calculateBookingPrice());
}

function renderSubscriptionTotal() {
  const planEl = dom('memberPlan');
  const totalEl = dom('subscriptionTotal');
  if (!planEl || !totalEl) return;
  const plan = planEl.value;
  const length = dom('subscriptionLength').value;
  const basePrice = plan === 'Standard' ? 25000 : plan === 'Premium' ? 40000 : 15000;
  let multiplier = 1;
  let discount = 0;

  if (length === 'quarterly') {
    multiplier = 3;
    discount = 0.1;
  } else if (length === 'yearly') {
    multiplier = 12;
    discount = 0.2;
  }

  const total = basePrice * multiplier * (1 - discount);
  dom('subscriptionTotal').textContent = formatCurrency(Math.round(total));
}

function updatePaymentForm() {
  const amountEl = dom('paymentAmount');
  const emailEl = dom('paymentEmail');
  if (!amountEl || !emailEl) return;
  amountEl.value = calculateBookingPrice();
  const bookEmail = dom('bookEmail');
  const memberEmail = dom('memberEmail');
  emailEl.value = (bookEmail && bookEmail.value) || (memberEmail && memberEmail.value) || '';
}

function openModal() {
  const modal = dom('paymentModal');
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  updatePaymentForm();
}

function closeModal() {
  const modal = dom('paymentModal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  const result = dom('paymentResult');
  if (result) result.textContent = '';
}

function showPaymentSuccess(message) {
  dom('paymentResult').textContent = message;
}

function resetBookingForm() {
  const bookingForm = dom('bookingForm');
  if (!bookingForm) return;
  bookingForm.reset();
  const durationEl = dom('bookDuration');
  if (durationEl) durationEl.value = '2';
  renderBookingTotal();
  handleDateChange();
}

function resetMembershipForm() {
  const memberForm = dom('membershipForm');
  if (!memberForm) return;
  memberForm.reset();
  const planEl = dom('memberPlan');
  const lengthEl = dom('subscriptionLength');
  if (planEl) planEl.value = 'Basic';
  if (lengthEl) lengthEl.value = 'monthly';
  renderSubscriptionTotal();
}

function attachPlanButtons() {
  const buttons = document.querySelectorAll('.plan-select');
  if (!buttons.length) return;
  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const plan = event.currentTarget.dataset.plan;
      const planEl = dom('memberPlan');
      if (planEl) planEl.value = plan;
      renderSubscriptionTotal();
      const nameEl = dom('memberName');
      if (nameEl) nameEl.focus();
      const plansSection = document.querySelector('.plans-grid');
      if (plansSection) {
        window.scrollTo({ top: plansSection.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });
}

function handleBookingSubmit(event) {
  event.preventDefault();
  const booking = {
    id: createBookingId(),
    name: dom('bookName').value.trim(),
    phone: dom('bookPhone').value.trim(),
    email: dom('bookEmail').value.trim(),
    date: dom('bookDate').value,
    slot: dom('bookSlot').value,
    duration: parseInt(dom('bookDuration').value, 10),
    price: calculateBookingPrice(),
    status: 'Confirmed',
  };

  if (getSlotStatus(booking.date, booking.slot) === 'Booked') {
    window.alert('Selected slot is already booked. Please choose another time.');
    return;
  }

  const bookings = getLocalData(STORAGE_KEYS.bookings);
  bookings.push(booking);
  setLocalData(STORAGE_KEYS.bookings, bookings);
  openModal();
}

function handlePaymentSubmit(event) {
  event.preventDefault();
  const amountEl = dom('paymentAmount');
  const emailEl = dom('paymentEmail');
  const methodEl = dom('paymentMethod');
  if (!amountEl || !emailEl || !methodEl) return;
  const amount = parseInt(amountEl.value, 10);
  const email = emailEl.value.trim();
  const method = methodEl.value;

  if (!amount || !email) {
    showPaymentSuccess('Please provide amount and email to finish payment.');
    return;
  }

  setTimeout(() => {
    showPaymentSuccess(`Booking confirmed via ${method.toUpperCase()}. Transaction amount: ${formatCurrency(amount)}.`);
    closeModal();
    resetBookingForm();
  }, 600);
}

function handleMembershipSubmit(event) {
  event.preventDefault();
  const planEl = dom('memberPlan');
  const lengthEl = dom('subscriptionLength');
  if (!planEl || !lengthEl) return;
  const plan = planEl.value;
  const length = lengthEl.value;
  let basePrice = plan === 'Standard' ? 25000 : plan === 'Premium' ? 40000 : 15000;
  let months = 1;
  let discount = 0;

  if (length === 'quarterly') {
    months = 3;
    discount = 0.1;
  }
  if (length === 'yearly') {
    months = 12;
    discount = 0.2;
  }

  const total = Math.round(basePrice * months * (1 - discount));
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + months);

  const member = {
    id: createMemberId(),
    name: dom('memberName').value.trim(),
    email: dom('memberEmail').value.trim(),
    phone: dom('memberPhone').value.trim(),
    gender: dom('memberGender').value,
    dob: dom('memberDob').value,
    plan,
    subscriptionLength: length,
    paymentStatus: 'Paid',
    expiryDate: expiry.toISOString().split('T')[0],
    amount: total,
    registeredAt: new Date().toISOString(),
  };

  const members = getLocalData(STORAGE_KEYS.members);
  members.push(member);
  setLocalData(STORAGE_KEYS.members, members);

  window.alert(`Membership registered successfully. Amount paid: ${formatCurrency(total)}`);
  resetMembershipForm();
}

function handleContactSubmit(event) {
  event.preventDefault();
  const contactForm = dom('contactForm');
  if (!contactForm) return;
  window.alert('Thank you for contacting PrimeFit! We will follow up shortly.');
  contactForm.reset();
}

function filterGallery(category) {
  document.querySelectorAll('.gallery-card').forEach((card) => {
    const isVisible = category === 'all' || card.dataset.category === category;
    card.style.display = isVisible ? 'block' : 'none';
  });
}

function attachGalleryEvents() {
  document.querySelectorAll('.gallery-card').forEach((card) => {
    card.addEventListener('click', () => {
      const src = card.dataset.image;
      openLightbox(src);
    });
  });
}

function openLightbox(src) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-content">
      <img src="${src}" alt="Gallery preview" />
      <button class="lightbox-close" aria-label="Close preview">×</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target.classList.contains('lightbox-close')) {
      document.body.removeChild(overlay);
    }
  });
}

function setupGalleryFilters() {
  document.querySelectorAll('.filter-button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-button').forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      filterGallery(button.dataset.filter);
    });
  });
}

function renderTestimonial(index) {
  const testimonial = TESTIMONIALS[index];
  const testimonialCard = dom('testimonialCard');
  if (!testimonialCard) return;
  testimonialCard.innerHTML = `
    <img src="${testimonial.photo}" alt="${testimonial.name} photo" />
    <div>
      <strong>${testimonial.name}</strong>
      <p>${testimonial.review}</p>
      <span>${testimonial.contact}</span>
    </div>
  `;
}

function attachTestimonialControls() {
  const prev = dom('prevTestimonial');
  const next = dom('nextTestimonial');
  if (!prev || !next) return;
  prev.addEventListener('click', () => {
    currentTestimonial = (currentTestimonial + TESTIMONIALS.length - 1) % TESTIMONIALS.length;
    renderTestimonial(currentTestimonial);
  });

  next.addEventListener('click', () => {
    currentTestimonial = (currentTestimonial + 1) % TESTIMONIALS.length;
    renderTestimonial(currentTestimonial);
  });
}

function closeMobileNav() {
  const nav = document.querySelector('.main-nav');
  if (nav && nav.classList.contains('active')) {
    nav.classList.remove('active');
  }
}

function setupNavigationToggle() {
  const navToggle = dom('navToggle');
  const nav = document.querySelector('.main-nav');
  if (!navToggle || !nav) return;

  navToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
  });

  document.querySelectorAll('.main-nav a').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });
}

function addFadeInObserver() {
  const sections = document.querySelectorAll('section, .glass-card, .gallery-card, .testimonial-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  sections.forEach((section) => observer.observe(section));
}

function initialize() {
  const today = new Date().toISOString().split('T')[0];
  if (dom('bookingDate')) {
    dom('bookingDate').value = today;
    updateBookingFormDate(today);
    addListener('bookingDate', 'change', handleDateChange);
  }

  if (dom('bookDuration')) {
    addListener('bookDuration', 'change', () => {
      renderBookingTotal();
      updatePaymentForm();
    });
  }

  if (dom('bookEmail')) {
    addListener('bookEmail', 'input', updatePaymentForm);
  }

  if (dom('memberPlan')) {
    addListener('memberPlan', 'change', renderSubscriptionTotal);
  }

  if (dom('subscriptionLength')) {
    addListener('subscriptionLength', 'change', renderSubscriptionTotal);
  }

  if (dom('memberEmail')) {
    addListener('memberEmail', 'input', updatePaymentForm);
  }

  if (dom('bookingForm')) addListener('bookingForm', 'submit', handleBookingSubmit);
  if (dom('membershipForm')) addListener('membershipForm', 'submit', handleMembershipSubmit);
  if (dom('contactForm')) addListener('contactForm', 'submit', handleContactSubmit);
  if (dom('openPaymentModal')) addListener('openPaymentModal', 'click', openModal);
  if (dom('closeModal')) addListener('closeModal', 'click', closeModal);
  if (dom('paymentForm')) addListener('paymentForm', 'submit', handlePaymentSubmit);

  renderBookingTotal();
  renderSubscriptionTotal();
  attachPlanButtons();
  attachGalleryEvents();
  setupGalleryFilters();
  renderTestimonial(currentTestimonial);
  attachTestimonialControls();
  setupNavigationToggle();
  addFadeInObserver();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

window.addEventListener('load', () => {
  initialize();
  setTimeout(() => {
    dom('pageLoader').classList.add('hidden');
  }, 350);
});
