// State & Config
const state = { cart: JSON.parse(localStorage.getItem('rb_cart')) || [], theme: localStorage.getItem('rb_theme') || 'light' };
const waNumber = '6281234567890'; // Ganti dengan nomor WA Anda

// DOM Elements
const $ = s => document.querySelector(s);
const app = $('#app');
const cartSidebar = $('#cart-sidebar');
const cartItems = $('#cart-items');
const cartTotal = $('#cart-total');
const cartCount = $('.cart-count');
const overlay = $('#overlay');

// Theme
const toggleTheme = () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem('rb_theme', state.theme);
};
$('#theme-toggle')?.addEventListener('click', toggleTheme);
document.documentElement.dataset.theme = state.theme;

// Cart Logic
const updateCartUI = () => {
  cartItems.innerHTML = state.cart.length ? '' : '<p style="text-align:center;color:#64748b;padding:2rem;">Keranjang kosong</p>';
  let total = 0;
  state.cart.forEach((item, i) => {
    total += item.price * item.qty;
    cartItems.innerHTML += `
      <div class="cart-item">
        <div><strong>${item.name}</strong><br><small>${item.qty}x @Rp${item.price.toLocaleString()}</small></div>
        <button onclick="removeItem(${i})" style="background:#ef4444;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Hapus</button>
      </div>`;
  });
  cartTotal.textContent = `Rp${total.toLocaleString()}`;
  cartCount.textContent = state.cart.reduce((a, c) => a + c.qty, 0);
  localStorage.setItem('rb_cart', JSON.stringify(state.cart));
};

window.addItem = (id, name, price) => {
  const exists = state.cart.find(i => i.id === id);
  if (exists) exists.qty++;
  else state.cart.push({ id, name, price, qty: 1 });
  updateCartUI();
  cartSidebar.classList.add('open');
  overlay.classList.add('active');
};

window.removeItem = (i) => {
  state.cart.splice(i, 1);
  updateCartUI();
};

// Cart Sidebar Toggle
document.querySelector('.cart-btn').onclick = () => { cartSidebar.classList.add('open'); overlay.classList.add('active'); };
document.querySelector('.close-cart').onclick = () => { cartSidebar.classList.remove('open'); overlay.classList.remove('active'); };
overlay.onclick = () => { cartSidebar.classList.remove('open'); overlay.classList.remove('active'); };

// WhatsApp Checkout
$('#checkout-form').onsubmit = e => {
  e.preventDefault();
  const name = $('#cust-name').value;
  const wa = $('#cust-wa').value;
  const addr = $('#cust-address').value;
  const notes = $('#cust-notes').value;
  let msg = `🛒 *Pesanan Baru - Renjana Brew*\n\n👤 Nama: ${name}\n📱 WA: ${wa}\n📍 Alamat: ${addr}\n`;
  if (notes) msg += `📝 Catatan: ${notes}\n`;
  msg += `\n📦 *Detail Pesanan:*\n`;
  state.cart.forEach(i => msg += `- ${i.name} (${i.qty}x) @Rp${i.price.toLocaleString()}\n`);
  const total = state.cart.reduce((a, c) => a + c.price * c.qty, 0);
  msg += `\n💰 *Total: Rp${total.toLocaleString()}*\n\nMohon konfirmasi ketersediaan & ongkir. Terima kasih! 🙏`;
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
};

// Load Content (Simulated JSON fetch - ganti dengan fetch('/content/products.json') di production)
async function loadContent() {
  try {
    const res = await fetch('content/home.md').then(r => r.text());
    const products = await fetch('content/products.json').then(r => r.json());
    const bundles = await fetch('content/bundles.json').then(r => r.json());
    
    // Render Hero & Sections (simplified for demo)
    app.innerHTML = `
      <section id="home" class="hero">
        <h1>${res.split('\n')[0].replace('# ', '')}</h1>
        <p>${res.split('\n')[2]}</p>
        <a href="#products" class="btn">🛒 Belanja Sekarang</a>
      </section>
      <section id="products"><div class="container">
        <h2 style="text-align:center;margin-bottom:2rem;">🍃 Produk Kami</h2>
        <div class="grid">
          ${products.map(p => `
            <div class="card">
              ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
              <h3>${p.name}</h3>
              <p>${p.desc}</p>
              <div class="price">Rp${p.price.toLocaleString()} <span class="original">Rp${p.original.toLocaleString()}</span></div>
              <button class="btn-add" onclick="addItem('${p.id}', '${p.name}', ${p.price})">+ Tambah ke Keranjang</button>
            </div>`).join('')}
        </div>
      </div></section>
      <section id="bundles" style="background:var(--card);"><div class="container">
        <h2 style="text-align:center;margin-bottom:2rem;">📦 Paket Hemat</h2>
        <div class="grid">
          ${bundles.map(b => `
            <div class="card" style="border:2px solid ${b.popular ? 'var(--primary)' : 'var(--border)'}">
              ${b.popular ? '<span class="badge">🔥 Paling Laris</span>' : ''}
              <h3>${b.name}</h3>
              <p>${b.desc}</p>
              <div class="price">Rp${b.price.toLocaleString()} <span class="original">Rp${b.original.toLocaleString()}</span></div>
              <ul style="margin:0.5rem 0 1rem 1.2rem;">${b.includes.map(i => `<li>${i}</li>`).join('')}</ul>
              <button class="btn-add" onclick="addItem('${b.id}', '${b.name}', ${b.price})">+ Tambah ke Keranjang</button>
            </div>`).join('')}
        </div>
      </div></section>
    `;
    updateCartUI();
  } catch (err) {
    app.innerHTML = '<div class="container" style="text-align:center;padding:4rem;">Gagal memuat konten. Pastikan file JSON/MD tersedia.</div>';
  }
}

// Init
document.addEventListener('DOMContentLoaded', loadContent);