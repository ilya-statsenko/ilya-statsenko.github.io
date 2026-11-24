if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);} });
  }, {threshold: .12});
  document.querySelectorAll('.grid-plane, .paper, .questions').forEach(el => observer.observe(el));
}
