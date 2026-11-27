(() => {
  const config = window.AMPLOP_PORTFOLIO;
  if (!config) return;

  document.querySelectorAll('.whatsapp-link').forEach(link => {
    const message = link.dataset.design
      ? config.orderMessage(link.dataset.design)
      : config.generalMessage;
    link.href = `${config.whatsappBaseUrl}?text=${encodeURIComponent(message)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
})();