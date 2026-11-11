import React from "react";
import styles from "./SelectableCard.module.css";
import { buttonProps } from "../../utils/helpers/a11y";

export default function SelectableCard({
  title,
  desc,
  img,
  bgColor = "#FFB279",
  inCollection = false,
  onAdd,
  children,
  isSelected,
  locked = false,
  lockedHint = '',
  style,
}) {
  return (
    <div
      className={styles.card + (isSelected ? ' ' + styles.selected : '') + (locked ? ' ' + styles.locked : '')}
      {...buttonProps(locked ? () => {} : onAdd, locked ? `${title} (locked)` : title)}
      aria-disabled={locked || undefined}
      style={{ background: bgColor, ...style }}
    >
      <div className={styles.topRow}>
        <div className={styles.contentArea}>
          <div className={`${styles.selectTitle} h2`}>{title}</div>
          <div className={`${styles.selectDesc} body2`}>{desc}</div>
        </div>
        <div className={styles.imgBox}>
          {typeof img === "string" ? (
            <img src={img} alt={title} className={styles.img} />
          ) : (
            img
          )}
        </div>
      </div>
      {/* 右下角状态指示器 - 不再是独立按钮 */}
      <div className={styles.addBtnAbsolute}>
        {locked ? (
          <div className={styles.lockBadge} aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="9" rx="2" fill="#22221B"/>
              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#22221B" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        ) : isSelected ? (
          <div className={styles.selectedCircleBtn}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M10.0912 16C9.98756 16 9.8904 15.985 9.79972 15.9549C9.70904 15.9253 9.62484 15.8747 9.54711 15.8031L6.20481 12.7248C6.06231 12.5936 5.99417 12.4234 6.00039 12.2144C6.00713 12.0058 6.08174 11.8359 6.22425 11.7047C6.36675 11.5735 6.54811 11.5078 6.76834 11.5078C6.98857 11.5078 7.16993 11.5735 7.31243 11.7047L10.0912 14.264L16.6786 8.19687C16.8211 8.06562 17.0059 8 17.2328 8C17.4593 8 17.6437 8.06562 17.7862 8.19687C17.9288 8.32811 18 8.49802 18 8.70658C18 8.91562 17.9288 9.08576 17.7862 9.217L10.6353 15.8031C10.5576 15.8747 10.4734 15.9253 10.3827 15.9549C10.292 15.985 10.1948 16 10.0912 16Z" fill="white"/>
            </svg>
          </div>
        ) : (
          <div className={styles.addIconDisplay}>
            <svg className={styles.addIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="#22221B" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 12H19" stroke="#22221B" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        )}
      </div>
      {locked && lockedHint && <div className={styles.lockedHint}>{lockedHint}</div>}
      {/* In your collection 标识 */}
      {inCollection && (
                 <div className={styles.inCollection}>
           <div className={styles.check}>
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none">
               <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
             </svg>
           </div>
           In your collection
         </div>
      )}
      {/* 下面的inCollection和addBtn等可按需保留 */}
      {children}
    </div>
  );
} 