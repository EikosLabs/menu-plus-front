/**
 * Brochure Preview Component
 * Renders the brochure preview based on selected template
 */

import { forwardRef } from 'react';
import { getTemplate } from '../config/brochureTemplates';
import { formatPrice, getImageUrl, sortByOrder } from '../services/pdfService';

const BrochurePreview = forwardRef(function BrochurePreview(
  { business, menus, template, title, subtitle },
  ref
) {
  const templateConfig = getTemplate(template);
  const styles = templateConfig.styles;

  if (!menus || menus.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        <p>Selecciona al menos un menú para ver la vista previa</p>
      </div>
    );
  }

  return (
    <div ref={ref} style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        {business?.logoUri && (
          <img
            src={getImageUrl(business.logoUri)}
            alt={business.name}
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain',
              margin: '0 auto 15px'
            }}
          />
        )}
        <h1 style={styles.title}>{title || business?.name || 'Menú'}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>

      {/* Menus */}
      {menus.map((menu, menuIndex) => (
        <div key={menu.id || menuIndex} style={{ marginBottom: '40px' }}>
          {/* Menu Title (if multiple menus) */}
          {menus.length > 1 && (
            <h2 style={{
              ...styles.sectionTitle,
              fontSize: '30px',
              marginBottom: '25px',
              textAlign: 'center'
            }}>
              {menu.name}
            </h2>
          )}

          {/* Sections */}
          {menu.sections && sortByOrder(menu.sections).map((section, sectionIndex) => (
            <div key={section.id || sectionIndex} style={styles.section}>
              <h3 style={styles.sectionTitle}>{section.name}</h3>
              {section.description && (
                <p style={{
                  fontSize: '14px',
                  color: templateConfig.colors.textLight,
                  marginBottom: '15px',
                  fontStyle: 'italic'
                }}>
                  {section.description}
                </p>
              )}

              {/* Menu Items */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: templateConfig.layout.columns === 2 ? '1fr 1fr' : '1fr',
                gap: '20px'
              }}>
                {section.menuItems && sortByOrder(section.menuItems).map((item, itemIndex) => (
                  <MenuItem
                    key={item.id || itemIndex}
                    item={item}
                    styles={styles}
                    templateConfig={templateConfig}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Uncategorized Items */}
          {menu.uncategorizedItems && menu.uncategorizedItems.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Otros Platos</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: templateConfig.layout.columns === 2 ? '1fr 1fr' : '1fr',
                gap: '20px'
              }}>
                {sortByOrder(menu.uncategorizedItems).map((item, itemIndex) => (
                  <MenuItem
                    key={item.id || itemIndex}
                    item={item}
                    styles={styles}
                    templateConfig={templateConfig}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Footer */}
      <div style={{
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: `2px solid ${templateConfig.colors.accent}`,
        textAlign: 'center',
        fontSize: '12px',
        color: templateConfig.colors.textLight
      }}>
        {business?.name && <p>{business.name}</p>}
        <p>Generado con MenuPlus</p>
      </div>
    </div>
  );
});

// Menu Item Component
function MenuItem({ item, styles, templateConfig }) {
  const showImage = templateConfig.layout.showImages && item.imageUri;
  const showPrice = templateConfig.layout.showPrices && item.price !== null && item.price !== undefined;
  const showDescription = templateConfig.layout.showDescriptions && item.description;

  return (
    <div style={styles.item}>
      {showImage && (
        <img
          src={getImageUrl(item.imageUri)}
          alt={item.name}
          style={styles.itemImage}
        />
      )}
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '5px'
        }}>
          <h4 style={styles.itemName}>{item.name}</h4>
          {showPrice && (
            <span style={styles.itemPrice}>{formatPrice(item.price)}</span>
          )}
        </div>
        {showDescription && (
          <p style={styles.itemDescription}>{item.description}</p>
        )}
        {!item.isAvailable && (
          <span style={{
            fontSize: '11px',
            color: '#ff0000',
            fontWeight: 'bold'
          }}>
            No disponible
          </span>
        )}
      </div>
    </div>
  );
}

export default BrochurePreview;
