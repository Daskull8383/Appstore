import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpDown,
  Heart,
  Info,
  Menu,
  Minus,
  Moon,
  Plus,
  Search,
  ShoppingBag,
  Sun,
  Trash2,
  X,
} from 'lucide-react';

type Product = {
  id: string;
  name: string;
  category: string;
  label: string;
  price: string;
  knownPrice?: number;
  render: string;
};

type Cart = Record<string, number>;

const products: Product[] = [
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', category: 'iPhone', label: 'Apple / Смартфоны', price: 'Цена уточняется', render: 'phone' },
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', category: 'iPhone', label: 'Apple / Смартфоны', price: 'Цена уточняется', render: 'phone' },
  { id: 'iphone-16-pro', name: 'iPhone 16 Pro', category: 'iPhone', label: 'Apple / Смартфоны', price: 'Цена уточняется', render: 'phone' },
  { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', category: 'iPhone', label: 'Apple / Смартфоны', price: 'Цена уточняется', render: 'phone' },
  { id: 'iphone-17-pro', name: 'iPhone 17 Pro', category: 'iPhone', label: 'Apple / Смартфоны', price: 'от 96 500 ₽', knownPrice: 96500, render: 'phone' },
  { id: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', category: 'iPhone', label: 'Apple / Смартфоны', price: 'от 102 000 ₽', knownPrice: 102000, render: 'phone' },
  { id: 'iphone-18-pro', name: 'iPhone 18 Pro', category: 'iPhone', label: 'Apple / Смартфоны', price: 'от 133 000 ₽', knownPrice: 133000, render: 'phone' },
  { id: 'iphone-18-pro-max', name: 'iPhone 18 Pro Max', category: 'iPhone', label: 'Apple / Смартфоны', price: 'Цена уточняется', render: 'phone' },
  { id: 'airpods-pro', name: 'AirPods Pro', category: 'AirPods', label: 'Apple / Наушники', price: 'Цена уточняется', render: 'earbuds' },
  { id: 'airpods-4', name: 'AirPods 4', category: 'AirPods', label: 'Apple / Наушники', price: 'Цена уточняется', render: 'earbuds' },
  { id: 'apple-watch-series', name: 'Apple Watch Series', category: 'Apple Watch', label: 'Apple / Часы', price: 'Цена уточняется', render: 'watch' },
  { id: 'apple-watch-ultra', name: 'Apple Watch Ultra', category: 'Apple Watch', label: 'Apple / Часы', price: 'Цена уточняется', render: 'watch' },
  { id: 'ipad-air', name: 'iPad Air', category: 'iPad', label: 'Apple / Планшеты', price: 'Цена уточняется', render: 'tablet' },
  { id: 'ipad-pro', name: 'iPad Pro', category: 'iPad', label: 'Apple / Планшеты', price: 'Цена уточняется', render: 'tablet' },
  { id: 'macbook-air', name: 'MacBook Air', category: 'MacBook', label: 'Apple / Ноутбуки', price: 'Цена уточняется', render: 'laptop' },
  { id: 'macbook-pro', name: 'MacBook Pro', category: 'MacBook', label: 'Apple / Ноутбуки', price: 'Цена уточняется', render: 'laptop' },
  { id: 'samsung-galaxy-s', name: 'Samsung Galaxy S', category: 'Samsung', label: 'Samsung / Смартфоны', price: 'Цена уточняется', render: 'phone' },
  { id: 'samsung-galaxy-z', name: 'Samsung Galaxy Z', category: 'Samsung', label: 'Samsung / Смартфоны', price: 'Цена уточняется', render: 'phone' },
  { id: 'dyson', name: 'Dyson фен', category: 'Dyson', label: 'Dyson / Уход', price: 'Цена уточняется', render: 'dyson' },
  { id: 'playstation-5', name: 'PlayStation 5', category: 'Игровые приставки', label: 'Игры / Консоли', price: 'Цена уточняется', render: 'console' },
  { id: 'iphone-case', name: 'Чехол для iPhone', category: 'Чехлы', label: 'Защита / Чехлы', price: 'Цена уточняется', render: 'accessory' },
  { id: 'glass', name: 'Защитное стекло', category: 'Защитное стекло', label: 'Защита / Стёкла', price: 'Цена уточняется', render: 'glass' },
  { id: 'usb-c-adapter', name: 'Зарядный адаптер USB-C', category: 'Зарядные устройства', label: 'Зарядка / Адаптеры', price: 'Цена уточняется', render: 'accessory' },
  { id: 'usb-c-cable', name: 'Кабель USB-C', category: 'Зарядные устройства', label: 'Зарядка / Кабели', price: 'Цена уточняется', render: 'accessory' },
  { id: 'power-bank', name: 'Power bank', category: 'Аксессуары', label: 'Энергия / Power bank', price: 'Цена уточняется', render: 'accessory' },
  { id: 'car-holder', name: 'Автомобильный держатель', category: 'Аксессуары', label: 'Авто / Аксессуары', price: 'Цена уточняется', render: 'accessory' },
];

const filters = ['Все товары', 'iPhone', 'AirPods', 'Apple Watch', 'iPad', 'MacBook', 'Samsung', 'Аксессуары'];
const navItems = [
  ['Каталог', '#catalog'],
  ['Категории', '#categories'],
  ['Trade-in', '#trade-in'],
  ['Предложения', '#offers'],
  ['Новости', '#blog'],
  ['Доставка', '#delivery'],
  ['Контакты', '#contacts'],
];
const initialCart = (): Cart => {
  try {
    return JSON.parse(localStorage.getItem('app-store-cart') || '{}') as Cart;
  } catch {
    return {};
  }
};
const initialFavorites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('app-store-favorites') || '[]') as string[];
  } catch {
    return [];
  }
};

function App() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Все товары');
  const [sort, setSort] = useState('default');
  const [favorites, setFavorites] = useState<string[]>(initialFavorites);
  const [cart, setCart] = useState<Cart>(initialCart);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('app-store-theme') === 'dark');
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem('app-store-cart', JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem('app-store-favorites', JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem('app-store-theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!cartOpen && !menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCartOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cartOpen, menuOpen]);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ru');
    const result = products.filter((product) => {
      const matchesSearch = !normalized || `${product.name} ${product.category} ${product.label}`.toLocaleLowerCase('ru').includes(normalized);
      const matchesFilter = filter === 'Все товары'
        || product.category === filter
        || (filter === 'Аксессуары' && ['Чехлы', 'Защитное стекло', 'Зарядные устройства', 'Аксессуары'].includes(product.category));
      return matchesSearch && matchesFilter && (!favoritesOnly || favorites.includes(product.id));
    });
    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    if (sort === 'price') result.sort((a, b) => {
      if (a.knownPrice === undefined) return b.knownPrice === undefined ? 0 : 1;
      if (b.knownPrice === undefined) return -1;
      return a.knownPrice - b.knownPrice;
    });
    return result;
  }, [favorites, favoritesOnly, filter, query, sort]);

  const itemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartProducts = products.filter((product) => cart[product.id]);

  const selectFilter = (nextFilter: string) => {
    setFilter(nextFilter);
    setFavoritesOnly(false);
  };
  const toggleFavorite = (id: string) => {
    setFavorites((current) => current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id]);
  };
  const addToCart = (id: string) => {
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
    setToast('Товар добавлен в корзину');
  };
  const changeQuantity = (id: string, delta: number) => {
    setCart((current) => {
      const nextQuantity = (current[id] || 0) + delta;
      const next = { ...current };
      if (nextQuantity <= 0) delete next[id];
      else next[id] = nextQuantity;
      return next;
    });
  };
  const showFavorites = () => {
    setFavoritesOnly((current) => !current);
    setFilter('Все товары');
    window.setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };
  const resetCatalog = () => {
    setQuery('');
    setFilter('Все товары');
    setFavoritesOnly(false);
    setSort('default');
  };
  const goToCategory = (category: string) => {
    selectFilter(category);
    setMenuOpen(false);
    window.setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  return (
    <div className={`app${dark ? ' dark' : ''}`}>
      <div className="announcement">
        <div className="shell">
          <span><strong>APP STORE</strong> · устройства и аксессуары</span>
          <span>Демо-витрина · стоимость и наличие подтвердим отдельно</span>
        </div>
      </div>
      <header className="site-header">
        <div className="shell">
          <div className="header-main">
            <a className="brand" href="#" aria-label="APP STORE — на главную">
              APP STORE
              <small>APPLE &amp; ACCESSORIES</small>
            </a>
            <form className="searchbar" onSubmit={(event) => { event.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <Search size={16} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти iPhone, AirPods, аксессуар…" aria-label="Поиск товаров" />
              <button type="submit">Найти</button>
            </form>
            <div className="header-actions">
              <button className="icon-action theme-action" onClick={() => setDark((current) => !current)} aria-label={dark ? 'Включить светлую тему' : 'Включить чёрную тему'}>
                {dark ? <Sun size={16} /> : <Moon size={16} />}<span className="action-label">{dark ? 'Светлая тема' : 'Чёрная тема'}</span>
              </button>
              <button className="icon-action favorites-action" onClick={showFavorites} aria-pressed={favoritesOnly} aria-label="Показать избранное">
                <Heart size={16} fill={favoritesOnly ? 'currentColor' : 'none'} /><span className="action-label">Избранное</span><span className="count">{favorites.length}</span>
              </button>
              <button className="icon-action" onClick={() => setCartOpen(true)} aria-label={`Открыть корзину, ${itemCount} товаров`}>
                <ShoppingBag size={16} /><span className="action-label">Корзина</span><span className="count">{itemCount}</span>
              </button>
              <button className="icon-action mobile-menu-button" onClick={() => setMenuOpen(true)} aria-label="Открыть меню"><Menu size={19} /></button>
            </div>
          </div>
          <nav className="main-nav" aria-label="Основная навигация">
            {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
        </div>
      </header>

      <main>
        <section className="hero shell">
          <div className="hero-panel">
            <div className="hero-copy">
              <div className="eyebrow">НОВОЕ ПОКОЛЕНИЕ УСТРОЙСТВ</div>
              <h1>Технологии,<br />которые ближе</h1>
              <p>iPhone, аксессуары и устройства для каждого дня</p>
              <a className="lime-link" href="#catalog">Смотреть каталог <ArrowRight size={15} /></a>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="hero-orbit" />
              <div className="hero-device" />
              <span className="art-label">Выбирай своё</span>
              <span className="hero-index">01 — APP STORE</span>
            </div>
          </div>
        </section>

        <section className="section shell" id="categories">
          <div className="section-head">
            <div><div className="section-kicker">Подборка APP STORE</div><h2>Найди своё</h2></div>
            <span className="section-meta">Основные категории</span>
          </div>
          <div className="category-grid">
            {[
              ['Смартфоны', 'iPhone', 'iPhone'],
              ['Наушники', 'AirPods', 'AirPods'],
              ['Часы', 'Apple Watch', 'Apple Watch'],
              ['Планшеты', 'iPad', 'iPad'],
              ['Компьютеры', 'MacBook', 'MacBook'],
              ['Аксессуары', 'Все категории', 'Аксессуары'],
            ].map(([title, subtitle, category]) => (
              <button className="category-tile" key={title} onClick={() => goToCategory(category)} aria-label={`Открыть категорию ${title}`}>
                <small>{subtitle}</small><strong>{title}</strong><span className="category-art" />
              </button>
            ))}
          </div>
        </section>

        <section className="section shell" id="catalog">
          <div className="section-head">
            <div><div className="section-kicker">Каталог товаров</div><h2>{favoritesOnly ? 'Избранное' : 'Выбор APP STORE'}</h2></div>
            <span className="section-meta">{visibleProducts.length} из {products.length} позиций</span>
          </div>
          <div className="catalog-toolbar">
            <div className="filter-list" role="group" aria-label="Фильтр по категориям">
              {filters.map((item) => (
                <button key={item} type="button" className={`filter-chip${filter === item ? ' active' : ''}`} onClick={() => selectFilter(item)} aria-pressed={filter === item}>
                  {item}
                </button>
              ))}
            </div>
            <div className="sort-controls">
              <ArrowUpDown size={14} aria-hidden="true" />
              <label htmlFor="sort-products">Сортировка</label>
              <select id="sort-products" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="default">По подборке</option>
                <option value="name">По названию</option>
                <option value="price">По цене (где известна)</option>
              </select>
              {favoritesOnly && <button className="reset-button" onClick={() => setFavoritesOnly(false)}>Все товары</button>}
              <button className="reset-button" onClick={resetCatalog}>Сбросить</button>
            </div>
          </div>
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <div className={`device-render render-${product.render}`} aria-hidden="true" />
                  <button className={`favorite-toggle${favorites.includes(product.id) ? ' is-favorite' : ''}`} onClick={() => toggleFavorite(product.id)} aria-label={favorites.includes(product.id) ? `Убрать ${product.name} из избранного` : `Добавить ${product.name} в избранное`} aria-pressed={favorites.includes(product.id)}>
                    <Heart size={16} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="product-label">{product.label}</div>
                <h3>{product.name}</h3>
                <div className="product-bottom">
                  <span className="price">{product.price}</span>
                  <button className="add-button" onClick={() => addToCart(product.id)}>В корзину</button>
                </div>
              </article>
            ))}
            {visibleProducts.length === 0 && (
              <div className="empty-results">
                <Search size={24} />
                <h3>Ничего не нашлось</h3>
                <p>Попробуйте изменить запрос или выбрать другую категорию.</p>
                <button onClick={resetCatalog}>Сбросить поиск и фильтры</button>
              </div>
            )}
          </div>
          <div className="provisional-note">
            <Info size={15} />
            <span>Цены «от» рассчитаны по найденным прайс-публикациям Big Sale Apple с наценкой +10 000 ₽. Уточняйте память, цвет, региональную версию, SIM/eSIM и актуальное наличие перед заказом. Для моделей без подтверждённой цены стоимость уточняется. Цены, комплектации и наличие моделей, особенно iPhone 18 Pro и 18 Pro Max, необходимо подтвердить перед продажей. Онлайн-оплата пока не подключена.</span>
          </div>
        </section>

        <section className="section shell" id="trade-in">
          <div className="trade-panel">
            <div className="trade-copy">
              <div className="eyebrow">APP STORE / TRADE-IN</div>
              <h2>Обнови устройство.<br />Сдай старое.</h2>
              <p>Расскажи о своём устройстве — поможем оценить состояние и обсудить возможный обмен. Условия Trade-in нужно подтвердить перед запуском.</p>
              <a href="#contacts">Узнать условия <ArrowRight size={14} /></a>
            </div>
            <div className="trade-visual" aria-hidden="true"><div className="trade-disc" /><div className="trade-old-phone" /></div>
          </div>
        </section>

        <section className="section shell" id="offers">
          <div className="section-head">
            <div><div className="section-kicker">Специальные предложения</div><h2>Больше пользы от покупки</h2></div>
            <span className="section-meta">Предложения появятся после подтверждения условий</span>
          </div>
          <div className="offer-strip">
            {[
              ['01 / Подборка', 'Выбери iPhone', 'iPhone'],
              ['02 / Музыка', 'Звук на каждый день', 'AirPods'],
              ['03 / Дополнения', 'Аксессуары к устройству', 'Аксессуары'],
              ['04 / Помощь', 'Подбор под бюджет', 'contacts'],
            ].map(([eyebrow, title, category]) => (
              <button className="offer-tile" key={eyebrow} onClick={() => category === 'contacts' ? document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' }) : goToCategory(category)}>
                <small>{eyebrow}</small><strong>{title}</strong><span><ArrowRight size={20} /></span>
              </button>
            ))}
          </div>
          <p className="offer-disclaimer">Предложения и специальные условия появятся после подтверждения условий продаж.</p>
        </section>

        <section className="section shell" id="blog">
          <div className="section-head">
            <div><div className="section-kicker">APPLE NEWSROOM · ОБНОВЛЕНО 11.10.2026</div><h2>Новости мира Apple</h2></div>
            <a className="section-meta" href="https://www.apple.com/newsroom/" target="_blank" rel="noreferrer">Все новости Apple ↗</a>
          </div>
          <div className="news-grid">
            <a className="news-card" href="https://www.apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/" target="_blank" rel="noreferrer">
              <div className="news-content"><span className="news-tag">НОВИНКА · IPHONE</span><h3>iPhone 18 Pro</h3><p>Новая камера с переменной диафрагмой, прирост производительности и ещё больше возможностей для творчества.</p><span>Читать новость ↗</span></div><span className="news-object" aria-hidden="true" />
            </a>
            <a className="news-card" href="https://www.apple.com/newsroom/2026/09/introducing-apple-watch-series-12-with-the-all-new-health-sensing-system/" target="_blank" rel="noreferrer">
              <div className="news-content"><span className="news-tag">APPLE WATCH</span><h3>Здоровье — в фокусе</h3><p>Apple Watch Series 12 получили обновлённую систему датчиков здоровья.</p><span>Подробнее ↗</span></div><span className="news-object" aria-hidden="true" />
            </a>
            <a className="news-card" href="https://www.apple.com/newsroom/2026/09/get-ready-to-experience-iphone-18-pro-the-new-apple-watch-lineup-and-airpods-5/" target="_blank" rel="noreferrer">
              <div className="news-content"><span className="news-tag">ЗВУК · AIRPODS</span><h3>AirPods 5 уже здесь</h3><p>Новое поколение наушников с активным шумоподавлением открытого типа.</p><span>Узнать больше ↗</span></div><span className="news-object" aria-hidden="true" />
            </a>
            <a className="news-card" href="https://www.apple.com/newsroom/2026/09/the-new-mac-mini-and-mac-studio-are-available-today/" target="_blank" rel="noreferrer">
              <div className="news-content"><span className="news-tag">MAC · ПРОИЗВОДИТЕЛЬНОСТЬ</span><h3>Новые Mac mini и Mac Studio</h3><p>Компактные настольные компьютеры Apple получили новое поколение чипов.</p><span>Читать новость ↗</span></div><span className="news-object" aria-hidden="true" />
            </a>
          </div>
          <p className="news-notice">Короткие обзоры App Store по материалам Apple Newsroom. Ссылки ведут на официальные публикации Apple; доступность устройств и сроки поставки в России уточняются отдельно. Публикации и формулировки требуют проверки актуальности перед размещением.</p>
        </section>

        <section className="section shell" id="delivery">
          <div className="section-head"><div><div className="section-kicker">Покупателям</div><h2>Условия — до оформления</h2></div></div>
          <div className="info-grid">
            {[
              ['01', 'Доставка', 'Способы, сроки и стоимость доставки будут опубликованы после выбора региона и настройки логистики.'],
              ['02', 'Оплата', 'Платёжные способы подключаются отдельно. Сейчас сайт не принимает реальные платежи.'],
              ['03', 'Гарантия', 'Условия гарантии и обслуживания нужно согласовать с поставщиком для каждой товарной категории.'],
              ['04', 'Возврат', 'Правила возврата и обмена должны быть опубликованы до приёма реальных заказов.'],
            ].map(([index, title, text]) => <div className="info-item" key={title}><span>{index}</span><h3>{title}</h3><p>{text}</p></div>)}
          </div>
        </section>

        <section className="section shell" id="contacts">
          <div className="section-head"><div><div className="section-kicker">APP STORE НА СВЯЗИ</div><h2>Поможем с выбором</h2></div></div>
          <div className="contact-cards">
            {[
              ['КАТАЛОГ', 'Подберём устройство', 'Сравним модели, характеристики и совместимые аксессуары.'],
              ['НАЛИЧИЕ', 'Уточним перед заказом', 'Не будем обещать цену или наличие без подтверждения поставщика.'],
              ['ВОПРОСЫ', 'Свяжитесь с нами', 'Контакты магазина нужно добавить перед публичным запуском.'],
              ['APP STORE', 'Ваш магазин техники', 'Собственный бренд и оригинальный дизайн.'],
            ].map(([eyebrow, title, text]) => <div className="contact-card" key={eyebrow}><small>{eyebrow}</small><strong>{title}</strong><p>{text}</p></div>)}
          </div>
        </section>

        <section className="section shell" id="benefits">
          <div className="section-head"><div><div className="section-kicker">Сервис APP STORE</div><h2>Покупка без лишних вопросов</h2></div></div>
          <div className="info-grid">
            {[
              ['01', 'Помощь с выбором', 'Подскажем совместимость и поможем выбрать подходящий аксессуар.'],
              ['02', 'Понятные условия', 'Оплата, доставка и возврат будут описаны до запуска продаж.'],
              ['03', 'Внимание к деталям', 'Уточняем комплектацию, характеристики и наличие до заказа.'],
              ['04', 'Поддержка', 'Каналы связи и часы работы появятся здесь перед запуском.'],
            ].map(([index, title, text]) => <div className="info-item" key={title}><span>{index}</span><h3>{title}</h3><p>{text}</p></div>)}
          </div>
        </section>
      </main>

      <footer className="footer" id="footer">
        <div className="shell">
          <div className="footer-grid">
            <div><a className="brand" href="#">APP STORE<small>APPLE &amp; ACCESSORIES</small></a><p>Аксессуары для смартфонов и повседневной техники.<br />Минималистичный выбор для каждого дня.</p></div>
            <div className="footer-links"><h4>Покупателям</h4><a href="#delivery">Доставка и оплата</a><a href="#delivery">Гарантия и возврат</a><a href="#contacts">Помощь с выбором</a><a href="#trade-in">Trade-in</a></div>
            <div className="footer-links"><h4>Информация</h4><a href="#contacts">Контакты</a><a href="#delivery">Условия покупки</a><a href="#delivery">Информация о продавце</a></div>
          </div>
          <div className="footer-bottom"><span>© APP STORE</span><span>Демонстрационная версия · цены и наличие уточняются</span></div>
        </div>
      </footer>

      {cartOpen && (
        <>
          <button className="drawer-backdrop" aria-label="Закрыть корзину" onClick={() => setCartOpen(false)} />
          <aside className="cart-drawer" aria-modal="true" role="dialog" aria-labelledby="cart-heading">
            <div className="drawer-head"><h2 id="cart-heading">Корзина <span className="count">{itemCount}</span></h2><button className="close-button" onClick={() => setCartOpen(false)} aria-label="Закрыть корзину"><X size={18} /></button></div>
            <p className="drawer-intro">Предварительный просмотр — заказы пока не отправляются продавцу.</p>
            {cartProducts.length ? (
              <>
                <div className="cart-list">
                  {cartProducts.map((product) => (
                    <div className="cart-row" key={product.id}>
                      <div><strong>{product.name}</strong><small>{product.price}</small></div>
                      <div className="quantity-controls">
                        <button onClick={() => changeQuantity(product.id, -1)} aria-label={`Уменьшить количество ${product.name}`}><Minus size={12} /></button>
                        <span>{cart[product.id]}</span>
                        <button onClick={() => changeQuantity(product.id, 1)} aria-label={`Увеличить количество ${product.name}`}><Plus size={12} /></button>
                        <button className="remove-button" onClick={() => setCart((current) => { const next = { ...current }; delete next[product.id]; return next; })} aria-label={`Удалить ${product.name}`}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total"><span>Итого</span><strong>Стоимость уточняется</strong></div>
                <button className="checkout-button" onClick={() => setCheckoutInfo((current) => !current)}>{checkoutInfo ? 'Понятно' : 'Перейти к оформлению'}</button>
                {checkoutInfo && <div className="checkout-message"><Info size={15} /><span>Оформление заказов и онлайн-оплата пока не подключены. Корзина сохранена только на этом устройстве.</span></div>}
              </>
            ) : (
              <div className="cart-empty"><ShoppingBag size={29} /><h3>В корзине пока пусто</h3><p>Добавьте понравившийся товар из каталога.</p><a href="#catalog" onClick={() => setCartOpen(false)}>Перейти в каталог <ArrowRight size={13} /></a></div>
            )}
          </aside>
        </>
      )}

      {menuOpen && (
        <>
          <button className="mobile-backdrop" aria-label="Закрыть меню" onClick={() => setMenuOpen(false)} />
          <aside className="mobile-menu" aria-modal="true" role="dialog" aria-label="Мобильная навигация">
            <div className="drawer-head"><h2>APP STORE · МЕНЮ</h2><button className="close-button" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню"><X size={18} /></button></div>
            <nav>{navItems.map(([label, href]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}<span>↗</span></a>)}</nav>
            <p>Цены, наличие и условия продаж требуют подтверждения перед заказом.</p>
          </aside>
        </>
      )}
      {toast && <div className="toast-message" role="status">{toast}</div>}
    </div>
  );
}

export default App;
