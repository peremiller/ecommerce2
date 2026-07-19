import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookmarkSimple,
  CaretDown,
  Check,
  CreditCard,
  EnvelopeSimple,
  Headset,
  Heart,
  List,
  LockKey,
  MagnifyingGlass,
  Minus,
  Package,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingCartSimple,
  Star,
  Tag,
  Trash,
  Truck,
  User,
  X,
} from "@phosphor-icons/react";

const ASSET_ROOT = `${import.meta.env.BASE_URL}assets`;

const products = [
  {
    id: 1,
    name: "Wireless Earbuds",
    category: "Electronics",
    price: 1499,
    rating: 4.6,
    reviews: "1.2K",
    image: `${ASSET_ROOT}/product-earbuds.webp`,
    description: "Clear everyday audio, comfortable fit, and a pocket-ready charging case.",
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: 2799,
    rating: 4.5,
    reviews: "980",
    image: `${ASSET_ROOT}/product-watch.webp`,
    description: "Activity tracking, helpful notifications, and an all-day lightweight design.",
  },
  {
    id: 3,
    name: "Power Bank 20,000mAh",
    category: "Electronics",
    price: 899,
    rating: 4.7,
    reviews: "1.1K",
    image: `${ASSET_ROOT}/product-power-bank.webp`,
    description: "Reliable high-capacity charging with dual ports for busy days away from an outlet.",
  },
  {
    id: 4,
    name: "Denim Jacket",
    category: "Fashion",
    price: 1590,
    rating: 4.6,
    reviews: "634",
    image: `${ASSET_ROOT}/product-denim-jacket.webp`,
    description: "A timeless mid-wash layer with an easy unisex fit and durable cotton denim.",
  },
  {
    id: 5,
    name: "Aroma Diffuser",
    category: "Home & Living",
    price: 680,
    rating: 4.7,
    reviews: "412",
    image: `${ASSET_ROOT}/product-diffuser.webp`,
    description: "Quiet cool mist, warm wood styling, and a calming glow for any room.",
  },
  {
    id: 6,
    name: "Arabica Coffee Beans 500g",
    category: "Groceries",
    price: 435,
    rating: 4.8,
    reviews: "310",
    image: `${ASSET_ROOT}/product-coffee.webp`,
    description: "Fresh-roasted whole Arabica beans with chocolate, caramel, and citrus notes.",
  },
  {
    id: 7,
    name: "Yoga Mat 6mm",
    category: "Sports",
    price: 699,
    rating: 4.6,
    reviews: "332",
    image: `${ASSET_ROOT}/product-yoga-mat.webp`,
    description: "Supportive 6mm cushioning, a steady non-slip texture, and an easy carry strap.",
  },
];

const categories = ["Electronics", "Fashion", "Home & Living", "Groceries", "Sports"];
const demoCart = [{ id: 7, quantity: 1 }];

const formatMoney = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function IconButton({ label, children, className = "", ...props }) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

function Rating({ product }) {
  return (
    <div className="rating" aria-label={`${product.rating} out of 5 stars, ${product.reviews} reviews`}>
      <span className="rating-stars" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((star) => (
          <Star key={star} size={12} weight="fill" />
        ))}
      </span>
      <span>{product.rating}</span>
      <span>({product.reviews})</span>
    </div>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const first = panelRef.current?.querySelector("button, input, select, textarea");
    first?.focus();
    const handleKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal-panel ${wide ? "modal-panel--wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={panelRef}>
        <div className="modal-heading">
          <h2 id="modal-title">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={21} />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

function ProductCard({ product, quantity, saved, onAdd, onOpen, onToggleSave, onDecrease }) {
  return (
    <article className="product-card">
      <button className="product-image-button" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
        <img src={product.image} alt={product.name} className="product-image" />
      </button>
      <IconButton
        className={`save-button ${saved ? "is-saved" : ""}`}
        label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
        onClick={() => onToggleSave(product.id)}
      >
        <Heart size={18} weight={saved ? "fill" : "regular"} />
      </IconButton>
      <div className="product-card__body">
        <p className="product-category">{product.category}</p>
        <button className="product-name" onClick={() => onOpen(product)}>{product.name}</button>
        <Rating product={product} />
        <p className="product-price">{formatMoney(product.price)}</p>
        {quantity ? (
          <div className="quantity-control quantity-control--card" aria-label={`${product.name} quantity`}>
            <button onClick={() => onDecrease(product.id)} aria-label={`Decrease ${product.name} quantity`}><Minus size={15} /></button>
            <strong>{quantity}</strong>
            <button onClick={() => onAdd(product.id)} aria-label={`Increase ${product.name} quantity`}><Plus size={15} /></button>
            <span className="added-label"><Check size={15} weight="bold" /> Added</span>
          </div>
        ) : (
          <button className="add-button" onClick={() => onAdd(product.id)}>
            <ShoppingCartSimple size={18} /> Add to cart
          </button>
        )}
      </div>
    </article>
  );
}

export function App() {
  const productsRef = useRef(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [cart, setCart] = useStoredState("b20shop.cart", demoCart);
  const [saved, setSaved] = useStoredState("b20shop.saved", []);
  const [orders, setOrders] = useStoredState("b20shop.orders", []);
  const [account, setAccount] = useStoredState("b20shop.account", null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = !activeCategory || product.category === activeCategory;
      const matchesQuery = !normalized || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const cartLines = useMemo(
    () => cart.map((line) => ({ ...line, product: products.find((product) => product.id === line.id) })).filter((line) => line.product),
    [cart],
  );
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const cartTotal = cartLines.reduce((total, line) => total + line.product.price * line.quantity, 0);
  const overlayOpen = Boolean(selectedProduct || cartOpen || ordersOpen || accountOpen || checkoutOpen);

  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [overlayOpen]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const updateQuantity = (id, delta) => {
    setCart((current) => {
      const line = current.find((item) => item.id === id);
      if (!line && delta > 0) return [...current, { id, quantity: 1 }];
      return current
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0);
    });
    if (delta > 0) setToast("Added to cart");
  };

  const quantityFor = (id) => cart.find((line) => line.id === id)?.quantity || 0;

  const chooseCategory = (category) => {
    setActiveCategory(category);
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitNewsletter = (event) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterEmail("");
    setToast("You’re on the B20 list");
  };

  const placeOrder = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newOrder = {
      id: `B20-${String(Date.now()).slice(-8)}`,
      date: new Date().toISOString(),
      total: cartTotal,
      items: cartLines.map((line) => ({ id: line.id, name: line.product.name, quantity: line.quantity })),
      customer: form.get("name"),
      status: "Confirmed",
    };
    setOrders((current) => [newOrder, ...current]);
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    setOrdersOpen(true);
    setToast("Order confirmed");
  };

  const signIn = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    if ((username === "demo" && password === "demo123") || (username === "admin" && password === "admin123")) {
      setAccount({ name: username === "admin" ? "Site Admin" : "Demo Customer", username });
      setAccountOpen(false);
      setToast("Welcome back");
    } else {
      setToast("Use demo / demo123");
    }
  };

  return (
    <div className="storefront">
      <header className="site-header">
        <a className="brand" href={import.meta.env.BASE_URL} aria-label="B20 Shop home">
          <img src={`${ASSET_ROOT}/b20-logo.webp`} alt="B20 Shop" />
        </a>
        <button className="header-categories" onClick={() => chooseCategory("")}>
          <List size={21} /> <span>Categories</span>
        </button>
        <label className="header-search">
          <span className="sr-only">Search products</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands and more..." />
          <button aria-label="Search" onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })}>
            <MagnifyingGlass size={23} />
          </button>
        </label>
        <nav className="header-actions" aria-label="Store utilities">
          <button onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })}><Tag size={23} /><span>Deals</span></button>
          <button onClick={() => setOrdersOpen(true)}><Receipt size={23} /><span>Orders</span></button>
          <button onClick={() => setAccountOpen(true)}><User size={23} /><span>{account ? account.name.split(" ")[0] : "Account"}</span><CaretDown size={14} /></button>
        </nav>
        <button className="cart-summary" onClick={() => setCartOpen(true)} aria-label={`Cart with ${cartCount} items`}>
          <ShoppingCartSimple size={31} />
          <span><strong>Cart</strong><small>{formatMoney(cartTotal)}</small></span>
          <b>{cartCount}</b>
        </button>
      </header>

      <nav className="category-nav" aria-label="Product categories">
        {categories.map((category) => (
          <button key={category} className={activeCategory === category ? "is-active" : ""} onClick={() => chooseCategory(category)}>
            {category}
          </button>
        ))}
      </nav>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Trusted essentials for everyday life</p>
            <h1 id="hero-title">Good choices.<br />Every day.</h1>
            <p>Quality products across electronics, fashion, home, groceries, and sports—selected for value, reliability, and real life.</p>
            <button className="primary-cta" onClick={() => chooseCategory("")}>Shop essentials <ArrowRight size={20} /></button>
          </div>
          <div className="hero-media">
            <img src={`${ASSET_ROOT}/hero-lifestyle.webp`} alt="A curated collection of B20 everyday essentials" />
          </div>
        </section>

        <section className="service-strip" aria-label="Shopping benefits">
          <div><Truck size={33} /><span><strong>Nationwide delivery</strong><small>Fast and reliable to your door</small></span></div>
          <div><Package size={33} /><span><strong>Easy returns</strong><small>Hassle-free within 7 days</small></span></div>
          <div><ShieldCheck size={33} /><span><strong>Secure checkout</strong><small>Protected payments</small></span></div>
          <div><Headset size={33} /><span><strong>Customer support</strong><small>Here to help, every day</small></span></div>
        </section>

        <section className="products-section" ref={productsRef} aria-labelledby="products-title">
          <div className="section-heading">
            <div>
              {(activeCategory || query) && <p className="section-kicker">{activeCategory || "All categories"}</p>}
              <h2 id="products-title">{query ? "Search results" : "Popular right now"}</h2>
            </div>
            <button onClick={() => { setActiveCategory(""); setQuery(""); }}>View all <ArrowRight size={17} /></button>
          </div>
          {filteredProducts.length ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={quantityFor(product.id)}
                  saved={saved.includes(product.id)}
                  onAdd={(id) => updateQuantity(id, 1)}
                  onDecrease={(id) => updateQuantity(id, -1)}
                  onOpen={setSelectedProduct}
                  onToggleSave={(id) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <MagnifyingGlass size={34} />
              <h3>No products found</h3>
              <p>Try a different search or browse all categories.</p>
              <button onClick={() => { setQuery(""); setActiveCategory(""); }}>Browse everything</button>
            </div>
          )}
        </section>

        <section className="newsletter" aria-labelledby="newsletter-title">
          <div className="newsletter-message">
            <EnvelopeSimple size={32} />
            <span><strong id="newsletter-title">New finds. Better everyday.</strong><small>Get exclusive deals and new arrivals straight to your inbox.</small></span>
          </div>
          <form onSubmit={submitNewsletter}>
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" required value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="Enter your email address" />
            <button type="submit">Subscribe</button>
          </form>
          <p><ShieldCheck size={24} /> No spam. Unsubscribe anytime.</p>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 B20 Shop. Better everyday essentials.</p>
        <nav aria-label="Footer navigation"><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#support">Support</a></nav>
      </footer>

      {selectedProduct && (
        <Modal title={selectedProduct.name} onClose={() => setSelectedProduct(null)} wide>
          <div className="product-detail">
            <img src={selectedProduct.image} alt={selectedProduct.name} />
            <div>
              <p className="product-category">{selectedProduct.category}</p>
              <Rating product={selectedProduct} />
              <p className="product-detail__price">{formatMoney(selectedProduct.price)}</p>
              <p className="product-detail__description">{selectedProduct.description}</p>
              <div className="product-detail__actions">
                <button className="add-button" onClick={() => updateQuantity(selectedProduct.id, 1)}><ShoppingCartSimple size={20} /> Add to cart</button>
                <IconButton label="Save product" onClick={() => setSaved((current) => current.includes(selectedProduct.id) ? current.filter((id) => id !== selectedProduct.id) : [...current, selectedProduct.id])}>
                  <BookmarkSimple size={22} weight={saved.includes(selectedProduct.id) ? "fill" : "regular"} />
                </IconButton>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {cartOpen && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setCartOpen(false)}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div className="modal-heading"><h2 id="cart-title">Your cart <span>{cartCount}</span></h2><IconButton label="Close cart" onClick={() => setCartOpen(false)}><X size={21} /></IconButton></div>
            <div className="cart-lines">
              {cartLines.length ? cartLines.map((line) => (
                <article className="cart-line" key={line.id}>
                  <img src={line.product.image} alt="" />
                  <div><strong>{line.product.name}</strong><small>{formatMoney(line.product.price)}</small>
                    <div className="quantity-control"><button onClick={() => updateQuantity(line.id, -1)} aria-label="Decrease quantity"><Minus size={14} /></button><span>{line.quantity}</span><button onClick={() => updateQuantity(line.id, 1)} aria-label="Increase quantity"><Plus size={14} /></button></div>
                  </div>
                  <IconButton label={`Remove ${line.product.name}`} onClick={() => setCart((current) => current.filter((item) => item.id !== line.id))}><Trash size={18} /></IconButton>
                </article>
              )) : <div className="drawer-empty"><ShoppingCartSimple size={42} /><h3>Your cart is empty</h3><p>Find something useful and make it yours.</p></div>}
            </div>
            <div className="cart-checkout">
              <div><span>Subtotal</span><strong>{formatMoney(cartTotal)}</strong></div>
              <p>Shipping is calculated at checkout.</p>
              <button disabled={!cartLines.length} onClick={() => setCheckoutOpen(true)}>Secure checkout <LockKey size={19} /></button>
            </div>
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <Modal title="Secure checkout" onClose={() => setCheckoutOpen(false)}>
          <form className="checkout-form" onSubmit={placeOrder}>
            <label>Full name<input name="name" required defaultValue={account?.name || ""} autoComplete="name" /></label>
            <label>Email address<input name="email" type="email" required autoComplete="email" /></label>
            <label>Delivery address<textarea name="address" rows="3" required /></label>
            <label>Payment method<select name="payment"><option>Cash on delivery</option><option>Credit or debit card</option><option>Digital wallet</option></select></label>
            <div className="checkout-total"><span>Total</span><strong>{formatMoney(cartTotal)}</strong></div>
            <button className="modal-primary" type="submit"><CreditCard size={19} /> Place order</button>
          </form>
        </Modal>
      )}

      {ordersOpen && (
        <Modal title="Your orders" onClose={() => setOrdersOpen(false)} wide>
          {orders.length ? <div className="orders-list">{orders.map((order) => (
            <article key={order.id}>
              <div><strong>#{order.id}</strong><span>{new Date(order.date).toLocaleDateString("en-PH", { dateStyle: "medium" })}</span></div>
              <div>{order.items.map((item) => <p key={item.id}>{item.name} × {item.quantity}</p>)}</div>
              <footer><span className="status-badge"><Check size={14} /> {order.status}</span><strong>{formatMoney(order.total)}</strong></footer>
            </article>
          ))}</div> : <div className="drawer-empty"><Receipt size={42} /><h3>No orders yet</h3><p>Your confirmed orders will appear here.</p></div>}
        </Modal>
      )}

      {accountOpen && (
        <Modal title={account ? "Your account" : "Welcome to B20"} onClose={() => setAccountOpen(false)}>
          {account ? <div className="account-card"><User size={42} /><h3>{account.name}</h3><p>@{account.username}</p><button className="secondary-button" onClick={() => { setAccount(null); setAccountOpen(false); setToast("Signed out"); }}>Sign out</button></div> : (
            <form className="checkout-form" onSubmit={signIn}>
              <p className="form-intro">Sign in to keep orders and saved items together.</p>
              <label>Username<input name="username" required placeholder="demo" /></label>
              <label>Password<input name="password" type="password" required placeholder="demo123" /></label>
              <button className="modal-primary" type="submit"><User size={19} /> Sign in</button>
              <p className="demo-hint">Demo access: <strong>demo / demo123</strong></p>
            </form>
          )}
        </Modal>
      )}

      <div className={`toast ${toast ? "toast--visible" : ""}`} role="status" aria-live="polite"><Check size={18} weight="bold" /> {toast}</div>
    </div>
  );
}
