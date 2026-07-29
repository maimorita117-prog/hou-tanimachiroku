const pins = document.querySelectorAll('.map-pin');
const popup = document.querySelector('.map-popup');
const closeButton = document.querySelector('.popup-close');
const filterButtons = document.querySelectorAll('.map-filter');
const propertyItems = document.querySelectorAll('[data-pin-target]');
const ownerPortrait = document.querySelector('.owner-portrait');
const ownerPortraitWrap = document.querySelector('.owner-portrait-wrap');
const ownerCards = document.querySelectorAll('.owner-bubble');
const tenantList = document.querySelector('.moe-tenant-list');
const opening = document.querySelector('#opening');
const openingSkip = document.querySelector('.opening-skip');
const openingAudio = document.querySelector('.opening-audio');
const openingEnter = document.querySelector('.opening-enter');
const openingTriggers = document.querySelectorAll('[data-opening-trigger]');
let ownerCardTimer;
let openingTimer;
let openingCloseTimer;
let openingSpeech;

document.querySelectorAll('.moe-logo').forEach((image) => {
  image.src = 'moe-logo.webp';
});
if (ownerPortrait) ownerPortrait.src = 'owner-smile.webp';

function createMoeLogo() {
  const wrapper = document.createElement('span');
  const image = document.createElement('img');
  wrapper.className = 'moe-inline-logo';
  image.src = 'moe-logo.webp';
  image.alt = '萌';
  wrapper.append(image);
  return wrapper;
}

function replaceMoeText(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!node.nodeValue.includes('萌') || parent?.closest('script, style')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const parts = node.nodeValue.split('萌');
    const fragment = document.createDocumentFragment();
    parts.forEach((part, index) => {
      if (part) fragment.append(document.createTextNode(part));
      if (index < parts.length - 1) fragment.append(createMoeLogo());
    });
    node.replaceWith(fragment);
  });
}

function showPin(pin) {
  pins.forEach((item) => item.classList.remove('selected'));
  pin.classList.add('selected');
  popup.querySelector('.popup-kicker').textContent = `PIN ${pin.querySelector('span').textContent}`;
  popup.querySelector('h3').textContent = pin.dataset.title;
  popup.querySelector('p').textContent = pin.dataset.text;
  const popupLink = popup.querySelector('a');
  popupLink.href = pin.dataset.link;
  popupLink.textContent = pin.dataset.type === 'vacancy' ? '募集内容を見る →' : '場所の詳細を見る →';
  replaceMoeText(popup);
  popup.classList.add('open');
}

pins.forEach((pin) => pin.addEventListener('click', () => showPin(pin)));
closeButton.addEventListener('click', () => {
  popup.classList.remove('open');
  pins.forEach((item) => item.classList.remove('selected'));
});

filterButtons.forEach((button) => button.addEventListener('click', () => {
  filterButtons.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  pins.forEach((pin) => {
    pin.style.display = filter === 'all' || pin.dataset.type === filter ? 'block' : 'none';
  });
}));

propertyItems.forEach((item) => item.addEventListener('click', () => {
  const pin = document.querySelector(`[data-id="${item.dataset.pinTarget}"]`);
  if (!pin) return;
  showPin(pin);
  document.querySelector('.map-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
}));

function toggleOwnerCards() {
  if (!ownerPortrait || !ownerPortraitWrap) return;
  const isOpen = ownerPortraitWrap.classList.toggle('cards-open');
  ownerPortrait.setAttribute('aria-expanded', String(isOpen));
  window.clearTimeout(ownerCardTimer);
  ownerCards.forEach((card) => card.classList.remove('is-active'));
  if (!isOpen) return;

  let cardIndex = 0;
  const showNextCard = () => {
    ownerCards.forEach((card, index) => card.classList.toggle('is-active', index === cardIndex));
    cardIndex += 1;
    if (cardIndex < ownerCards.length) {
      ownerCardTimer = window.setTimeout(showNextCard, 2400);
    }
  };
  ownerCardTimer = window.setTimeout(showNextCard, 400);
}

function setupTenantDirectory() {
  if (!tenantList) return;
  const tenantCards = [...tenantList.querySelectorAll('.moe-tenant')];
  if (!tenantCards.length) return;

  const picker = document.createElement('div');
  picker.className = 'moe-tenant-picker';
  picker.setAttribute('aria-label', '店舗を選ぶ');
  const label = document.createElement('p');
  label.className = 'moe-tenant-picker-label';
  label.textContent = '店舗番号を選ぶ';
  picker.append(label);

  const buttons = document.createElement('div');
  buttons.className = 'moe-tenant-number-list';
  picker.append(buttons);

  const selectTenant = (selectedIndex) => {
    tenantCards.forEach((card, index) => {
      const isSelected = index === selectedIndex;
      card.classList.toggle('is-active', isSelected);
      card.setAttribute('aria-hidden', String(!isSelected));
    });
    [...buttons.children].forEach((button, index) => {
      const isSelected = index === selectedIndex;
      button.classList.toggle('active', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });
  };

  tenantCards.forEach((card, index) => {
    const button = document.createElement('button');
    const number = String(index + 1).padStart(2, '0');
    button.type = 'button';
    button.textContent = number;
    button.setAttribute('aria-label', `${number} ${card.querySelector('h3')?.textContent ?? '店舗'}`);
    button.addEventListener('click', () => selectTenant(index));
    buttons.append(button);
  });

  tenantList.before(picker);
  selectTenant(0);
}

function addMoeBuildingPhoto() {
  const boardTitle = document.querySelector('.moe-board-title');
  if (!boardTitle) return;
  boardTitle.querySelector('strong')?.remove();
  const photo = document.createElement('img');
  photo.className = 'moe-building-photo';
  photo.src = 'naoki-building.jpg';
  photo.alt = '直木三十五記念館が入る複合施設の外観';
  boardTitle.querySelector('span')?.insertAdjacentElement('afterend', photo);
}

function addNaokiSign() {
  const museumCard = document.querySelector('.moe-tenant.is-museum');
  const heading = museumCard?.querySelector('h3');
  if (!museumCard || !heading) return;
  const titleRow = document.createElement('div');
  titleRow.className = 'naoki-title-row';
  const sign = document.createElement('img');
  sign.className = 'naoki-sign';
  sign.src = 'naoki-sign.webp';
  sign.alt = '直木三十五記念館の木製看板';
  heading.before(titleRow);
  titleRow.append(heading, sign);
}

function removeEditorialLabels() {
  [
    '.hero-street-footer span:first-child',
    '.hero-street-footer span:last-child',
    '.moe-building-heading .eyebrow',
    '.moe-board-title > span',
    '.moe-note',
    '.map-section > .section-heading .eyebrow',
    '.directory-heading .eyebrow',
    '.rental-callout .eyebrow',
    '.about-number',
    '.about > div:nth-child(2) .eyebrow',
    '.owner-caption',
    '.places > .section-heading .eyebrow',
  ].forEach((selector) => document.querySelector(selector)?.remove());
}

function closeOpening() {
  if (!opening) return;
  window.clearTimeout(openingTimer);
  window.clearTimeout(openingCloseTimer);
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  openingAudio?.classList.remove('is-speaking');
  openingAudio?.setAttribute('aria-pressed', 'false');
  const exitDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1200;
  opening.classList.add('is-closing');
  opening.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('opening-active');
  openingCloseTimer = window.setTimeout(() => {
    opening.classList.remove('is-playing', 'is-closing');
    opening.hidden = true;
  }, exitDuration);
}

function playOpening() {
  if (!opening) return;
  window.clearTimeout(openingTimer);
  window.clearTimeout(openingCloseTimer);
  opening.hidden = false;
  opening.setAttribute('aria-hidden', 'false');
  document.body.classList.add('opening-active');
  opening.classList.remove('is-playing', 'is-closing');
  window.requestAnimationFrame(() => opening.classList.add('is-playing'));
  const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1200 : 10000;
  openingTimer = window.setTimeout(closeOpening, duration);
}

function speakOpeningNarration() {
  if (!('speechSynthesis' in window) || !openingAudio) return;
  window.speechSynthesis.cancel();
  openingSpeech = new SpeechSynthesisUtterance('直木賞の名は、知っている。では、直木三十五という人を、知っていますか。大阪、空堀で生まれ育った作家の足跡を、記念館でたずねてみませんか。');
  openingSpeech.lang = 'ja-JP';
  openingSpeech.rate = 1.08;
  openingSpeech.pitch = .92;
  const japaneseVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.startsWith('ja'));
  if (japaneseVoice) openingSpeech.voice = japaneseVoice;
  openingAudio.classList.add('is-speaking');
  openingAudio.setAttribute('aria-pressed', 'true');
  openingSpeech.onend = openingSpeech.onerror = () => {
    openingAudio.classList.remove('is-speaking');
    openingAudio.setAttribute('aria-pressed', 'false');
  };
  window.speechSynthesis.speak(openingSpeech);
}

ownerPortrait?.addEventListener('click', toggleOwnerCards);
ownerPortrait?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleOwnerCards();
  }
});
openingSkip?.addEventListener('click', closeOpening);
openingEnter?.addEventListener('click', closeOpening);
openingAudio?.addEventListener('click', speakOpeningNarration);
openingTriggers.forEach((trigger) => trigger.addEventListener('click', (event) => {
  event.preventDefault();
  playOpening();
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && opening?.classList.contains('is-playing')) closeOpening();
});

replaceMoeText();
setupTenantDirectory();
addMoeBuildingPhoto();
addNaokiSign();
removeEditorialLabels();
playOpening();

