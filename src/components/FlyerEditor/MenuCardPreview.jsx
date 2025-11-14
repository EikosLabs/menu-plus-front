import { forwardRef } from 'react';
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
  fontFamily = "'Poppins', sans-serif"
}, ref) => {
  const paper = PAPER_SIZES[paperSize];
  const colors = getColorScheme(business);
  const branding = getBusinessBranding(business);
  const contactInfo = formatContactInfo(branding);
  const socialMedia = formatSocialMedia(branding);

  const containerStyle = {
    width: `${paper.pxWidth}px`,
    height: `${paper.pxHeight}px`,
    backgroundColor: colors.background,
    fontFamily: fontFamily,
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div
      ref={ref}
      style={containerStyle}
      className="menu-card-preview neo-border shadow-2xl"
    >
      {/* Header */}
      <div
        style={{
          height: template.headerHeight,
          backgroundColor: colors.primary,
          borderBottom: `4px solid ${colors.text}`,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1 }}>
          {branding.logo && (
            <img
              src={branding.logo}
              alt="Logo"
              style={{
                maxHeight: '80px',
                maxWidth: '150px',
                objectFit: 'contain',
                marginBottom: '10px',
              }}
              crossOrigin="anonymous"
            />
          )}
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: 0,
              textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
            }}
          >
            {branding.name}
          </h1>
          {branding.slogan && (
            <p
              style={{
                fontSize: '16px',
                color: '#ffffff',
                margin: '8px 0 0 0',
                opacity: 0.95,
              }}
            >
              {branding.slogan}
            </p>
          )}
        </div>

        <div style={{ textAlign: 'right', color: '#ffffff' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '600',
              margin: 0,
              textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
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
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: template.itemsPerRow === 1 ? '1fr' : '1fr 1fr',
            gap: template.itemSpacing === 'compact' ? '10px' : template.itemSpacing === 'generous' ? '24px' : '16px',
            height: '100%',
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: template.itemSpacing === 'compact' ? `1px solid ${colors.text}` : `2px solid ${colors.text}`,
                borderRadius: '8px',
                padding: template.itemSpacing === 'compact' ? '8px' : '12px',
                backgroundColor: '#ffffff',
                display: 'flex',
                gap: template.itemSpacing === 'compact' ? '10px' : '12px',
                alignItems: template.showImages ? 'flex-start' : 'center',
              }}
            >
              {template.showImages && item.imageUri && (
                <img
                  src={item.imageUri}
                  alt={item.name}
                  style={{
                    width: template.imageSize === 'large' ? '100px' : template.imageSize === 'medium' ? '80px' : '60px',
                    height: template.imageSize === 'large' ? '100px' : template.imageSize === 'medium' ? '80px' : '60px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: template.itemSpacing === 'compact' ? `1px solid ${colors.text}` : `2px solid ${colors.text}`,
                    flexShrink: 0,
                  }}
                  crossOrigin="anonymous"
                />
              )}

                <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: template.itemSpacing === 'compact' ? '4px' : '6px' }}>
                  <h3
                    style={{
                      fontSize: template.itemsPerRow === 1 ? (template.itemSpacing === 'compact' ? '16px' : '18px') : (template.itemSpacing === 'compact' ? '14px' : '16px'),
                      fontWeight: 'bold',
                      color: colors.text,
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.name}
                  </h3>
                  <span
                    style={{
                      fontSize: template.itemsPerRow === 1 ? (template.itemSpacing === 'compact' ? '18px' : '20px') : (template.itemSpacing === 'compact' ? '16px' : '18px'),
                      fontWeight: 'bold',
                      color: colors.primary,
                      marginLeft: '8px',
                      flexShrink: 0,
                    }}
                  >
                    ${item.price.toFixed(2)}
                  </span>
                </div>

                {template.showImages && item.description && (
                  <p
                    style={{
                      fontSize: template.itemsPerRow === 1 ? (template.itemSpacing === 'compact' ? '12px' : '13px') : (template.itemSpacing === 'compact' ? '11px' : '12px'),
                      color: colors.textLight,
                      margin: 0,
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: template.itemSpacing === 'compact' ? 2 : 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          height: template.footerHeight,
          backgroundColor: colors.primary,
          borderTop: `4px solid ${colors.text}`,
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
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
