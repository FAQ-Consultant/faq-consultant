import {
  companyInfo,
  products,
  trustBadges,
  formatPriceVnd,
  getStockStatus,
} from '../data/products.js';

const NAV_LINKS = ['Trang chủ', 'Danh mục sản phẩm', 'Chính sách', 'Về chúng tôi', 'Liên hệ'];

export default function LandingPage({ onEnterChat }) {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="landing-nav__brand">
          <span className="landing-nav__brand-name">{companyInfo.name}</span>
          <span className="landing-nav__brand-tagline">{companyInfo.tagline}</span>
        </div>
        <nav className="landing-nav__links">
          {NAV_LINKS.map((label) => (
            <span key={label} className="landing-nav__link">
              {label}
            </span>
          ))}
        </nav>
        <button type="button" className="landing-nav__cta" onClick={onEnterChat}>
          Đặt lịch tư vấn
        </button>
      </header>

      <section className="landing-hero">
        <div className="landing-hero__content">
          <h1 className="landing-hero__headline">{companyInfo.headline}</h1>
          <p className="landing-hero__subheadline">{companyInfo.subheadline}</p>
          <button type="button" className="landing-hero__btn" onClick={onEnterChat}>
            Khám phá sản phẩm →
          </button>
        </div>
      </section>

      <section className="landing-products">
        <h2 className="landing-products__title">Danh mục sản phẩm</h2>
        <p className="landing-products__subtitle">
          Đa dạng chủng loại máy móc, đáp ứng mọi nhu cầu của doanh nghiệp sản xuất
        </p>

        <div className="landing-products__grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <h3 className="product-card__name">{product.name}</h3>
              <p className="product-card__desc">{product.shortDescription}</p>
              <p className="product-card__price">{formatPriceVnd(product.price)}</p>
              <p
                className={
                  'product-card__stock' +
                  (product.stock === 0 ? ' product-card__stock--out' : '')
                }
              >
                {getStockStatus(product.stock)}
              </p>
              <button
                type="button"
                className="product-card__link"
                onClick={onEnterChat}
              >
                Tìm hiểu thêm →
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-badges">
        {trustBadges.map((badge) => (
          <div key={badge.title} className="landing-badges__item">
            <p className="landing-badges__title">{badge.title}</p>
            <p className="landing-badges__detail">{badge.detail}</p>
          </div>
        ))}
      </section>

      <section className="landing-cta">
        <h2 className="landing-cta__title">Minh Phát – Đồng hành cùng sự phát triển của bạn</h2>
        <p className="landing-cta__subtitle">
          Cung cấp giải pháp máy móc tối ưu, nâng cao năng suất và hiệu quả sản xuất
        </p>
        <button type="button" className="landing-cta__btn" onClick={onEnterChat}>
          Liên hệ ngay →
        </button>
        <p className="landing-cta__hint">
          Bấm vào đây để trò chuyện với trợ lý ảo của chúng tôi
        </p>
      </section>
    </div>
  );
}
