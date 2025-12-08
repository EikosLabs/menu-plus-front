import { forwardRef } from 'react';
import { getColorScheme, getBusinessBranding, formatSocialMedia } from './utils/flyerTemplates';

/**
 * Promotional Flyer Preview Component
 * Renders promotional flyers WITHOUT images - text-based design
 * Optimized for Instagram formats
 */
const PromotionalFlyerPreview = forwardRef(({
  business,
  menu,
  items = [],
  template,
  colorPalette = null,
  showCurrency = true
}, ref) => {
  const colors = getColorScheme(business, colorPalette);
  const branding = getBusinessBranding(business);
  const socialMedia = formatSocialMedia(branding);

  // Calculate size based on format - All IG compatible
  const getSizeForFormat = () => {
    switch (template.format) {
      case 'story-vertical':
        return { width: '360px', height: '640px' };
      case 'instagram-portrait':
        return { width: '360px', height: '450px' };
      case 'instagram-square':
        return { width: '360px', height: '360px' };
      default:
        return { width: '360px', height: '450px' };
    }
  };

  const size = getSizeForFormat();
  const isStory = template.format === 'story-vertical';
  const isSquare = template.format === 'instagram-square';

  // Get badge text based on template style
  const getBadgeText = () => {
    switch (template.style) {
      case 'promo': return '🎯 PROMOCIÓN';
      case 'featured': return '⭐ ESPECIALES';
      case 'modern': return '✨ DESTACADOS';
      case 'minimalist': return ''; // No badge for minimalist
      case 'elegant': return '💎 SELECCIÓN';
      default: return '⭐ DESTACADOS';
    }
  };

  // Check if template is minimalist
  const isMinimalist = template.style === 'minimalist';
  const isElegant = template.style === 'elegant';

  const containerStyle = {
    width: size.width,
    height: size.height,
    background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundAlt} 100%)`,
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
      {/* Decorative background elements */}
      {!isMinimalist && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: `${colors.primary}15`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `${colors.secondary}15`,
            }}
          />
        </>
      )}

      {/* Header */}
      <div
        style={{
          height: template.headerHeight,
          background: isMinimalist 
            ? colors.background
            : isElegant
            ? `linear-gradient(135deg, ${colors.text} 0%, ${colors.primary} 100%)`
            : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          padding: isSquare ? '12px 16px' : '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          borderBottom: isMinimalist ? `2px solid ${colors.text}` : 'none',
        }}
      >
        {/* Logo */}
        {branding.logo && (
          <div
            style={{
              backgroundColor: isMinimalist ? 'transparent' : '#ffffff',
              padding: isMinimalist ? '0' : '8px',
              borderRadius: isMinimalist ? '0' : '12px',
              boxShadow: isMinimalist ? 'none' : '0 4px 8px rgba(0,0,0,0.15)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={branding.logo}
              alt="Logo"
              style={{
                maxHeight: isSquare ? '45px' : isStory ? '60px' : '50px',
                maxWidth: isSquare ? '90px' : '140px',
                objectFit: 'contain',
                filter: isMinimalist ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' : 'none',
              }}
              crossOrigin="anonymous"
            />
          </div>
        )}
        
        {/* Business name */}
        <h1
          style={{
            fontSize: isSquare ? '18px' : isMinimalist ? '24px' : '22px',
            fontWeight: isMinimalist ? '300' : 'bold',
            color: isMinimalist ? colors.text : '#ffffff',
            margin: 0,
            textShadow: isMinimalist ? 'none' : '2px 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: isMinimalist ? '2px' : '0.5px',
            textTransform: isMinimalist ? 'uppercase' : 'none',
          }}
        >
          {branding.name}
        </h1>

        {/* Badge */}
        {getBadgeText() && (
          <div
            style={{
              backgroundColor: isMinimalist ? 'transparent' : colors.accent,
              color: isMinimalist ? colors.primary : '#ffffff',
              padding: isMinimalist ? '4px 0' : '6px 16px',
              borderRadius: isMinimalist ? '0' : '20px',
              fontSize: isSquare ? '11px' : isMinimalist ? '12px' : '13px',
              fontWeight: isMinimalist ? '400' : 'bold',
              marginTop: '8px',
              boxShadow: isMinimalist ? 'none' : '0 2px 8px rgba(0,0,0,0.2)',
              borderTop: isMinimalist ? `1px solid ${colors.primary}` : 'none',
              borderBottom: isMinimalist ? `1px solid ${colors.primary}` : 'none',
              letterSpacing: isMinimalist ? '1px' : '0',
            }}
          >
            {getBadgeText()}
          </div>
        )}
      </div>

      {/* Items Content */}
      <div
        style={{
          padding: isSquare ? '12px 16px' : '16px 20px',
          height: `calc(100% - ${template.headerHeight} - ${template.footerHeight})`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: isSquare ? '8px' : isMinimalist ? '0' : '12px',
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              background: isMinimalist ? 'transparent' : '#ffffff',
              borderRadius: isMinimalist ? '0' : isElegant ? '16px' : '12px',
              padding: isSquare ? '10px 14px' : isMinimalist ? '12px 0' : '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: isMinimalist ? 'none' : isElegant ? '0 4px 12px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isMinimalist 
                ? 'none'
                : isElegant
                ? `1px solid ${colors.primary}30`
                : `2px solid ${colors.primary}20`,
              borderBottom: isMinimalist ? `1px solid ${colors.textLight}30` : undefined,
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* Item number badge */}
            <div
              style={{
                width: isMinimalist ? '32px' : isSquare ? '26px' : '30px',
                height: isMinimalist ? '32px' : isSquare ? '26px' : '30px',
                borderRadius: isMinimalist ? '0' : '50%',
                background: isMinimalist 
                  ? 'transparent'
                  : isElegant
                  ? colors.text
                  : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                color: isMinimalist ? colors.text : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMinimalist ? '16px' : isSquare ? '12px' : '14px',
                fontWeight: isMinimalist ? '300' : 'bold',
                flexShrink: 0,
                marginRight: isSquare ? '10px' : '14px',
                border: isMinimalist ? `1px solid ${colors.text}` : 'none',
              }}
            >
              {index + 1}
            </div>

            {/* Item details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontSize: isSquare ? '14px' : isMinimalist ? '15px' : '16px',
                  fontWeight: isMinimalist ? '400' : '600',
                  color: colors.text,
                  margin: 0,
                  lineHeight: 1.3,
                  letterSpacing: isMinimalist ? '0.5px' : '0',
                }}
              >
                {item.name}
              </h3>
              {item.description && !isSquare && (
                <p
                  style={{
                    fontSize: '11px',
                    color: colors.textLight,
                    margin: '2px 0 0 0',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: isMinimalist ? '300' : '400',
                  }}
                >
                  {item.description}
                </p>
              )}
            </div>

            {/* Price */}
            <div
              style={{
                background: isMinimalist 
                  ? 'transparent'
                  : isElegant
                  ? colors.text
                  : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                color: isMinimalist ? colors.primary : '#ffffff',
                padding: isMinimalist ? '0' : isSquare ? '6px 12px' : '8px 16px',
                borderRadius: isMinimalist ? '0' : '8px',
                fontSize: isSquare ? '15px' : isMinimalist ? '18px' : '17px',
                fontWeight: isMinimalist ? '600' : 'bold',
                flexShrink: 0,
                marginLeft: '10px',
                letterSpacing: isMinimalist ? '0.5px' : '0',
              }}
            >
              {showCurrency ? '$' : ''}{item.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          height: template.footerHeight,
          background: isMinimalist 
            ? colors.background
            : isElegant
            ? `linear-gradient(135deg, ${colors.text} 0%, ${colors.primary} 100%)`
            : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          padding: isSquare ? '8px 16px' : '12px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          color: isMinimalist ? colors.text : '#ffffff',
          borderTop: isMinimalist ? `2px solid ${colors.text}` : 'none',
        }}
      >
        {/* Social media */}
        {socialMedia.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', fontSize: isSquare ? '11px' : '12px' }}>
            {socialMedia.slice(0, 3).map((social, i) => (
              <span key={i} style={{ opacity: isMinimalist ? 0.7 : 0.95 }}>
                {social.icon}
              </span>
            ))}
          </div>
        )}

        {/* CTA text */}
        <div
          style={{
            fontSize: isSquare ? '11px' : isMinimalist ? '12px' : '13px',
            fontWeight: isMinimalist ? '300' : '600',
            textAlign: 'center',
            letterSpacing: isMinimalist ? '1px' : '0',
          }}
        >
          {branding.phone && `📞 ${branding.phone}`}
          {!branding.phone && branding.instagram && `@${branding.instagram.replace(/.*instagram\.com\//, '').replace(/\/$/, '')}`}
          {!branding.phone && !branding.instagram && '¡Visítanos!'}
        </div>
      </div>
    </div>
  );
});

PromotionalFlyerPreview.displayName = 'PromotionalFlyerPreview';

export default PromotionalFlyerPreview;
