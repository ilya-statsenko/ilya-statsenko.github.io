const portraitZones = [...document.querySelectorAll('#reading-column .portrait-zone')];

function closePortraitTooltips() {
  portraitZones.forEach(zone => zone.setAttribute('aria-expanded', 'false'));
}

portraitZones.forEach(zone => {
  zone.addEventListener('click', event => {
    if (event.pointerType === 'mouse') return;
    const wasOpen = zone.getAttribute('aria-expanded') === 'true';
    closePortraitTooltips();
    if (!wasOpen) zone.setAttribute('aria-expanded', 'true');
  });
});

document.addEventListener('pointerdown', event => {
  if (!portraitZones.some(zone => zone.contains(event.target))) closePortraitTooltips();
});
