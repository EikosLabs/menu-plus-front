import { forwardRef } from 'react';
import { getColorScheme, getBusinessBranding, formatContactInfo, formatSocialMedia } from './utils/flyerTemplates';

/**
 * Promotional Flyer Preview Component
 * Renders the promotional flyer for PDF export
 */
const PromotionalFlyerPreview = forwardRef(({
  business,
  menu,
  items = [],
  template
}, ref) => {
  const colors = getColorScheme(business);
  const branding = getBusinessBranding(business);
  const contactInfo = formatContactInfo(branding);
  const socialMedia = formatSocialMedia(branding);

  // Calculate size based on format
  const getSizeForFormat = () => {
    switch (template.format) {
      case 'half-page':
        return { width: '595px', height: '421px' }; // A5 landscape in pixels
      case 'third-page':
        return { width: '595px', height: '281px' }; // ~1/3 of A4
      case 'quarter-page':
        return { width: '420px', height: '297px' }; // A6 landscape
      case 'story-vertical':
        return { width: '360px', height: '640px' }; // scaled preview for 9:16
      default:
        return { width: '595px', height: '421px' };
    }
  };

  const size = getSizeForFormat();

  const containerStyle = {
    width: size.width,
    height: size.height,
    backgroundColor: colors.background,
    fontFamily: 'Poppins, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    margin: '0 auto',
  };

  return (
    <div
      ref={ref}
      style={containerStyle}
      className="promotional-flyer-preview neo-border shadow-2xl"
    >
      {/* Header */}
      <div
        style={{
          height: template.headerHeight,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          borderBottom: `3px solid ${colors.text}`,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {branding.logo && (
            <img
              src={branding.logo}
              alt="Logo"
              style={{
                maxHeight: '50px',
                maxWidth: '80px',
                objectFit: 'contain',
              }}
              crossOrigin="anonymous"
            />
          )}
          <div>
            <h1
              style={{
                fontSize: template.format === 'quarter-page' ? '20px' : '24px',
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
                  fontSize: template.format === 'quarter-page' ? '10px' : '12px',
                  color: '#ffffff',
                  margin: '2px 0 0 0',
                  opacity: 0.95,
                }}
              >
                {branding.slogan}
              </p>
            )}
          </div>
        </div>

        {template.format !== 'quarter-page' && (
          <div
            style={{
              backgroundColor: colors.accent,
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              border: `2px solid ${colors.text}`,
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            {template.name === 'Especiales del Día' && '⭐ ESPECIALES'}
            {template.name === 'Promoción' && '🎯 PROMOCIÓN'}
            {template.name === 'Combo' && '🍽️ COMBO'}
            {template.name === 'Volante' && '📢 OFERTA'}
          </div>
        )}
      </div>

      {/* Items Content */}
      <div
        style={{
          padding: template.format === 'quarter-page' ? '12px' : '16px',
          height: `calc(100% - ${template.headerHeight} - ${template.footerHeight})`,
          overflow: 'hidden',
        }}
      >
        {template.style === 'featured' && (
          /* Featured style - Large items with images */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  border: `3px solid ${colors.text}`,
                  borderRadius: '12px',
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  boxShadow: '4px 4px 0px rgba(0,0,0,0.1)',
                }}
              >
                {item.imageUri && (
                  <img
                    src={item.imageUri}
                    alt={item.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: `2px solid ${colors.text}`,
                      flexShrink: 0,
                    }}
                    crossOrigin="anonymous"
                  />
                )}

                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: colors.text,
                      margin: '0 0 6px 0',
                    }}
                  >
                    {item.name}
                  </h3>

                  {item.description && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: colors.textLight,
                        margin: '0 0 8px 0',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.description}
                    </p>
                  )}

                  <div
                    style={{
                      backgroundColor: colors.primary,
                      color: '#ffffff',
                      display: 'inline-block',
                      padding: '6px 16px',
                      borderRadius: '6px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      border: `2px solid ${colors.text}`,
                    }}
                  >
                    ${item.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {template.style === 'grid' && (
          /* Grid style - Multiple columns */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: template.itemsPerRow === 1 ? '1fr' : '1fr 1fr',
              gap: '12px',
              height: '100%',
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  border: `2px solid ${colors.text}`,
                  borderRadius: '8px',
                  padding: '10px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '3px 3px 0px rgba(0,0,0,0.1)',
                }}
              >
                {item.imageUri && (
                  <img
                    src={item.imageUri}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: `2px solid ${colors.text}`,
                      marginBottom: '8px',
                    }}
                    crossOrigin="anonymous"
                  />
                )}

                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: colors.text,
                    margin: '0 0 4px 0',
                  }}
                >
                  {item.name}
                </h3>

                {item.description && (
                  <p
                    style={{
                      fontSize: '11px',
                      color: colors.textLight,
                      margin: '0 0 6px 0',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.description}
                  </p>
                )}

                <div
                  style={{
                    backgroundColor: colors.primary,
                    color: '#ffffff',
                    textAlign: 'center',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    border: `2px solid ${colors.text}`,
                    marginTop: 'auto',
                  }}
                >
                  ${item.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        {template.style === 'simple' && (
          /* Simple style - List format */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  border: `2px solid ${colors.text}`,
                  borderRadius: '8px',
                  padding: template.format === 'quarter-page' ? '8px' : '10px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                {item.imageUri && template.format !== 'quarter-page' && (
                  <img
                    src={item.imageUri}
                    alt={item.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: `2px solid ${colors.text}`,
                      flexShrink: 0,
                    }}
                    crossOrigin="anonymous"
                  />
                )}

                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: template.format === 'quarter-page' ? '13px' : '16px',
                      fontWeight: 'bold',
                      color: colors.text,
                      margin: 0,
                    }}
                  >
                    {item.name}
                  </h3>
                  {item.description && template.format !== 'quarter-page' && (
                    <p
                      style={{
                        fontSize: '11px',
                        color: colors.textLight,
                        margin: '2px 0 0 0',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.description.substring(0, 60)}...
                    </p>
                  )}
                </div>

                <div
                  style={{
                    backgroundColor: colors.primary,
                    color: '#ffffff',
                    padding: template.format === 'quarter-page' ? '4px 10px' : '6px 12px',
                    borderRadius: '6px',
                    fontSize: template.format === 'quarter-page' ? '13px' : '16px',
                    fontWeight: 'bold',
                    border: `2px solid ${colors.text}`,
                    flexShrink: 0,
                  }}
                >
                  ${item.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          height: template.footerHeight,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          borderTop: `3px solid ${colors.text}`,
          padding: template.format === 'quarter-page' ? '6px 12px' : '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          fontSize: template.format === 'quarter-page' ? '9px' : '11px',
        }}
      >
        <div>
          {contactInfo.slice(0, template.format === 'quarter-page' ? 2 : 3).map((info, i) => (
            <div key={i} style={{ marginBottom: '2px' }}>
              {info}
            </div>
          ))}
        </div>

        {socialMedia.length > 0 && template.format !== 'quarter-page' && (
          <div style={{ textAlign: 'right' }}>
            {socialMedia.slice(0, 2).map((social, i) => (
              <div key={i} style={{ marginBottom: '2px' }}>
                {social.icon} {social.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

PromotionalFlyerPreview.displayName = 'PromotionalFlyerPreview';

export default PromotionalFlyerPreview;
