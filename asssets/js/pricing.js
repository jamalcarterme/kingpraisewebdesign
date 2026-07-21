// Country-aware pricing. No backend pricing endpoint exists, so this detects
// the visitor's country client-side and renders localized packages;
// visitors can also switch region manually.
(function () {
  const plans = {
    NG: {
      currency: '\u20a6', label: 'Nigeria (NGN)',
      tiers: [
        { name: 'Starter', price: '350,000', period: 'one-time', desc: 'A polished single site to launch your brand online.', features: ['Up to 5 pages', 'Mobile-responsive design', 'Basic SEO setup', 'Contact form integration', '2 rounds of revisions'] },
        { name: 'Business', price: '850,000', period: 'one-time', desc: 'For growing businesses that need more firepower.', features: ['Up to 12 pages', 'CMS / blog included', 'Advanced SEO + analytics', 'Payment integration', '4 rounds of revisions', '1 month free support'], featured: true },
        { name: 'Premium / App', price: '2,000,000+', period: 'project-based', desc: 'Custom web apps, e-commerce or mobile apps.', features: ['Custom web or mobile app', 'Admin dashboard & APIs', 'Third-party integrations', 'Dedicated project manager', '3 months free support'] }
      ]
    },
    INTL: {
      currency: '$', label: 'International (USD)',
      tiers: [
        { name: 'Starter', price: '450', period: 'one-time', desc: 'A polished single site to launch your brand online.', features: ['Up to 5 pages', 'Mobile-responsive design', 'Basic SEO setup', 'Contact form integration', '2 rounds of revisions'] },
        { name: 'Business', price: '1,200', period: 'one-time', desc: 'For growing businesses that need more firepower.', features: ['Up to 12 pages', 'CMS / blog included', 'Advanced SEO + analytics', 'Payment integration', '4 rounds of revisions', '1 month free support'], featured: true },
        { name: 'Premium / App', price: '3,000+', period: 'project-based', desc: 'Custom web apps, e-commerce or mobile apps.', features: ['Custom web or mobile app', 'Admin dashboard & APIs', 'Third-party integrations', 'Dedicated project manager', '3 months free support'] }
      ]
    }
  };

  function card(tier, currency) {
    return `
    <div class="reveal glass rounded-2xl p-8 card-hover ${tier.featured ? 'border-2 !border-[var(--brand)] relative' : ''}">
      ${tier.featured ? '<span class="absolute -top-3 left-8 badge bg-[var(--brand)] text-white">Most Popular</span>' : ''}
      <h3 class="font-display text-xl font-semibold text-white">${tier.name}</h3>
      <p class="text-slate-400 text-sm mt-2 min-h-[40px]">${tier.desc}</p>
      <div class="mt-6 flex items-end gap-1" data-narrate="${tier.name} plan: ${currency}${tier.price}, ${tier.period}.">
        <span class="text-3xl font-display font-bold text-white">${currency}${tier.price}</span>
        <span class="text-slate-500 text-sm mb-1">/ ${tier.period}</span>
      </div>
      <ul class="mt-6 space-y-3">
        ${tier.features.map(f => `<li class="flex items-start gap-2 text-sm text-slate-300"><svg class="w-5 h-5 text-[var(--brand-2)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>${f}</li>`).join('')}
      </ul>
      <a href="contact.html#schedule" class="mt-8 block text-center btn-primary rounded-lg py-3" data-narrate="Get started with the ${tier.name} plan">Get Started</a>
    </div>`;
  }

  function render(region) {
    const data = plans[region] || plans.INTL;
    document.getElementById('pricing-grid').innerHTML = data.tiers.map(t => card(t, data.currency)).join('');
    document.getElementById('region-label').textContent = data.label;
    document.querySelectorAll('.region-btn').forEach(b => b.classList.toggle('btn-primary', b.dataset.region === region));
    document.querySelectorAll('.region-btn').forEach(b => b.classList.toggle('btn-ghost', b.dataset.region !== region));
    window.KPWD_UI.initReveal();
  }

  async function detectRegion() {
    try {
      const res = await fetch('https://ipwho.is/');
      const data = await res.json();
      return data && data.country_code === 'NG' ? 'NG' : 'INTL';
    } catch (e) {
      return 'INTL';
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const region = await detectRegion();
    render(region);
    document.querySelectorAll('.region-btn').forEach(b => b.addEventListener('click', () => render(b.dataset.region)));
  });
})();
