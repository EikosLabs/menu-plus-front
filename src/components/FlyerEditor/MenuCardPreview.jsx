import { forwardRef, Fragment } from 'react';
import { PAPER_SIZES } from './utils/templateDefaults';
import { getColorScheme, getBusinessBranding, formatContactInfo, formatSocialMedia } from './utils/flyerTemplates';

/**
 * Menu Card Preview Component
 * Renders the full menu card for PDF export
 */
const MenuCardPreview = forwardRef(({
  business,
  menu,
  items = [],
  template,
  paperSize = 'A4',
  fontFamily = "'Poppins', sans-serif",
  colorPalette = null,
  showCurrency = true
}, ref) => {
  const paper = PAPER_SIZES[paperSize];
  const colors = getColorScheme(business, colorPalette);
  const branding = getBusinessBranding(business);
  const contactInfo = formatContactInfo(branding);
  const socialMedia = formatSocialMedia(branding);

  const isDark = template.style === 'dark';
  const isCentered = template.style === 'centered';
  const isFresh = template.style === 'fresh';

  const containerStyle = {
    width: `${paper.pxWidth}px`,
    height: `${paper.pxHeight}px`,
    backgroundColor: isDark ? '#1a1a1a' : isFresh ? '#f9fcf9' : colors.background,
    fontFamily: fontFamily,
    position: 'relative',
    overflow: 'hidden',
    color: isDark ? '#ffffff' : colors.text,
  };

  // Helper to find section name
  const getSectionName = (itemId) => {
    if (!menu?.sections) return null;
    for (const section of menu.sections) {
      if (section.menuItems?.some(i => i.id === itemId)) {
        return section.name;
      }
    }
    return null;
  };

  // Header Styles
  const headerStyle = {
    height: template.headerHeight,
    backgroundColor: isDark ? '#000000' : isFresh ? '#ffffff' : colors.primary,
    borderBottom: isDark ? '2px solid #d4af37' : isFresh ? `4px solid ${colors.secondary}` : `4px solid ${colors.text}`,
    padding: '20px',
    display: 'flex',
    flexDirection: isCentered || isDark ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: isCentered || isDark ? 'center' : 'space-between',
    textAlign: isCentered || isDark ? 'center' : 'left',
    backgroundImage: isFresh ? `linear-gradient(to right, ${colors.primary}10, ${colors.secondary}10)` : 'none',
    gap: '20px',
  };

  return (
    <div
      ref={ref}
      style={containerStyle}
      className="menu-card-preview neo-border shadow-2xl"
    >
      {/* Header */}
      <div style={headerStyle}>
        {/* Logo for Left-Aligned Layouts */}
        {!isCentered && !isDark && branding.logo && (
          <div style={{ flexShrink: 0 }}>
            <img
              src={branding.logo}
              alt="Logo"
              style={{
                maxHeight: '80px',
                maxWidth: '120px',
                objectFit: 'contain',
                backgroundColor: '#ffffff',
                padding: '8px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
              crossOrigin="anonymous"
            />
          </div>
        )}

        <div style={{ flex: isCentered || isDark ? 'none' : 1, width: isCentered || isDark ? '100%' : 'auto' }}>
          {/* Logo for Centered/Dark Layouts */}
          {(isCentered || isDark) && branding.logo && (
            <img
              src={branding.logo}
              alt="Logo"
              style={{
                maxHeight: isDark ? '100px' : '90px',
                maxWidth: isDark ? '200px' : '180px',
                objectFit: 'contain',
                marginBottom: '12px',
                filter: isDark ? 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.3))' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))',
                display: 'block',
                margin: '0 auto 16px auto',
              }}
              crossOrigin="anonymous"
            />
          )}
          <h1
            style={{
              fontSize: isDark ? '42px' : '36px',
              fontWeight: isDark ? '300' : 'bold',
              color: isDark ? '#d4af37' : isFresh ? colors.primary : '#ffffff',
              margin: 0,
              textShadow: isDark ? 'none' : '2px 2px 0px rgba(0,0,0,0.2)',
              letterSpacing: isDark ? '2px' : '0',
              textTransform: isDark ? 'uppercase' : 'none',
            }}
          >
            {branding.name}
          </h1>
          {branding.slogan && (
            <p
              style={{
                fontSize: '16px',
                color: isDark ? '#cccccc' : isFresh ? colors.text : '#ffffff',
                margin: '8px 0 0 0',
                opacity: 0.95,
                fontStyle: isDark ? 'italic' : 'normal',
              }}
            >
              {branding.slogan}
            </p>
          )}
        </div>

        <div style={{ 
          textAlign: isCentered || isDark ? 'center' : 'right', 
          color: isDark ? '#ffffff' : isFresh ? colors.text : '#ffffff',
          marginTop: isCentered || isDark ? '16px' : '0',
          width: isCentered || isDark ? '100%' : 'auto',
          borderTop: isCentered ? `1px solid ${colors.text}40` : 'none',
          paddingTop: isCentered ? '12px' : '0',
        }}>
          <h2
            style={{
              fontSize: isDark ? '24px' : '28px',
              fontWeight: isDark ? '300' : '600',
              margin: 0,
              textShadow: isDark || isFresh ? 'none' : '2px 2px 0px rgba(0,0,0,0.2)',
              color: isDark ? '#d4af37' : 'inherit',
              letterSpacing: isDark ? '1px' : '0',
            }}
          >
            {menu?.name}
          </h2>
          {menu?.description && (
            <p
              style={{
                fontSize: '14px',
                margin: '8px 0 0 0',
                opacity: 0.9,
                fontStyle: 'italic',
              }}
            >
              {menu.description}
            </p>
          )}
        </div>
      </div>

      {/* Items Grid */}
      <div
        style={{
          padding: template.itemSpacing === 'compact' ? '16px' : '20px',
          height: `calc(100% - ${template.headerHeight} - ${template.footerHeight})`,
          overflow: 'hidden',
          backgroundImage: isDark 
            ? 'radial-gradient(circle at 50% 50%, #2a2a2a 0%, #1a1a1a 100%)' 
            : isFresh 
            ? `linear-gradient(180deg, #ffffff 0%, ${colors.background} 100%)`
            : 'none',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: template.itemsPerRow === 1 ? '1fr' : '1fr 1fr',
            gap: template.itemSpacing === 'compact' ? '8px' : template.itemSpacing === 'generous' ? '20px' : '12px',
            gridAutoRows: 'min-content',
            alignContent: 'start',
          }}
        >
          {items.map((item, index) => {
            const currentSection = getSectionName(item.id);
            const prevSection = index > 0 ? getSectionName(items[index - 1].id) : null;
            const showHeader = currentSection && currentSection !== prevSection;

            return (
              <Fragment key={item.id}>
                {showHeader && (
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      fontSize: isDark ? '18px' : '20px',
                      fontWeight: 'bold',
                      color: isDark ? '#d4af37' : isFresh ? colors.secondary : colors.primary,
                      marginTop: index === 0 ? '0' : '16px',
                      marginBottom: '8px',
                      borderBottom: isDark ? '1px solid #d4af37' : `2px solid ${isFresh ? colors.secondary : colors.primary}`,
                      paddingBottom: '4px',
                      fontFamily: isDark ? 'serif' : 'inherit',
                      textAlign: isCentered || isDark ? 'center' : 'left',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {currentSection}
                  </div>
                )}
                <div
                  style={{
                    borderBottom: isDark ? '1px solid #333' : `1px solid ${colors.textLight}20`,
                    padding: template.itemSpacing === 'compact' ? '6px 0' : '10px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: template.itemsPerRow === 1 ? (template.itemSpacing === 'compact' ? '14px' : '16px') : (template.itemSpacing === 'compact' ? '12px' : '14px'),
                        fontWeight: isDark ? '400' : '600',
                        color: isDark ? '#ffffff' : colors.text,
                        margin: 0,
                        lineHeight: 1.3,
                        letterSpacing: isDark ? '0.5px' : '0',
                      }}
                    >
                      {item.name}
                    </h3>
                    {item.description && (
                      <p
                        style={{
                          fontSize: template.itemSpacing === 'compact' ? '10px' : '11px',
                          color: isDark ? '#888888' : colors.textLight,
                          margin: '2px 0 0 0',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: template.itemsPerRow === 1 ? (template.itemSpacing === 'compact' ? '16px' : '18px') : (template.itemSpacing === 'compact' ? '14px' : '16px'),
                      fontWeight: 'bold',
                      color: isDark ? '#d4af37' : isFresh ? colors.secondary : colors.primary,
                      flexShrink: 0,
                      fontFamily: isDark ? 'serif' : 'inherit',
                    }}
                  >
                    {showCurrency ? '$' : ''}{item.price.toFixed(2)}
                  </span>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          height: template.footerHeight,
          backgroundColor: isDark ? '#000000' : isFresh ? '#ffffff' : colors.primary,
          borderTop: isDark ? '1px solid #333' : isFresh ? `2px solid ${colors.secondary}` : `4px solid ${colors.text}`,
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: isDark ? '#888888' : isFresh ? colors.text : '#ffffff',
        }}
      >
        <div style={{ fontSize: '12px' }}>
          {contactInfo.map((info, i) => (
            <div key={i} style={{ marginBottom: '4px' }}>
              {info}
            </div>
          ))}
        </div>

        {socialMedia.length > 0 && (
          <div style={{ textAlign: 'right', fontSize: '12px' }}>
            {socialMedia.map((social, i) => (
              <div key={i} style={{ marginBottom: '4px' }}>
                {social.icon} {social.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

MenuCardPreview.displayName = 'MenuCardPreview';

export default MenuCardPreview;
