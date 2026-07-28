const pins = document.querySelectorAll('.map-pin');
const popup = document.querySelector('.map-popup');
const closeButton = document.querySelector('.popup-close');
const filterButtons = document.querySelectorAll('.map-filter');
const propertyItems = document.querySelectorAll('[data-pin-target]');
const ownerPortrait = document.querySelector('.owner-portrait');
const ownerPortraitWrap = document.querySelector('.owner-portrait-wrap');
const ownerCards = document.querySelectorAll('.owner-bubble');
let ownerCardTimer;

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

ownerPortrait?.addEventListener('click', toggleOwnerCards);
ownerPortrait?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleOwnerCards();
  }
});

replaceMoeText();

