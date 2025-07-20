import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Nav-Logo.module.css';
import SidebarMenu from './SidebarMenu';
import { icons } from '../../utils/icons';

// hideEat 控制是否显示Eat+按钮，向后兼容hideCtaButtons
// hideMenu 控制是否显示侧边栏菜单按钮
export default function NavLogo({ hideEat = false, hideCtaButtons = false, hideMenu = false, isAuth = false, onEatClick, isLoggedIn = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const shouldHideEat = hideEat || hideCtaButtons;
  const navigate = useNavigate();
  
  return (
    <>
      <div className={styles.navBar}>
        {/* Logo Module */}
        <div className={styles.logoModule}>
          <img 
            src={icons.menu} 
            alt="Menu" 
            className={styles.menu}
            onClick={() => setSidebarOpen(true)}
          />
          <img 
            src={icons.logo} 
            alt="Logo" 
            className={styles.logo}
          />
        </div>
        
        {/* Actions */}
        <div className={styles.actions}>
        {!shouldHideEat && (
            <button 
              className={styles.ctaButton} 
              onClick={() => {
            // 设置URL参数并调用onEatClick
            navigate('/?eat=1');
            onEatClick && onEatClick();
              }}
            >
              <span className={`${styles.buttonText} h4`}>Eat</span>
              <img 
                src={icons.add} 
                alt="Add" 
                className={styles.add}
              />
          </button>
        )}
        </div>
      </div>
      <SidebarMenu open={sidebarOpen} onClose={() => setSidebarOpen(false)} isLoggedIn={isLoggedIn} />
    </>
  );
} 