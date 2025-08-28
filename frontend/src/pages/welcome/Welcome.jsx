import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavLogo from '../../components/navbar/Nav-Logo';
import LogIn from '../auth/pages/Log In';
import SignUp from '../auth/pages/Sign up';
import ForgotPassword from '../auth/pages/ForgotPassword';
import Footer from '../../components/common/Footer';
import { icons } from '../../utils/media/icons';
import { mergeStyles, conditionalStyle } from '../../utils/helpers';
import { getModalHandlers, createModalState } from '../../utils/collections/uiHelpers';
import styles from './Welcome.module.css';

export default function Welcome() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const location = useLocation();

  // 检查是否从ResetPasswordSuccess页面跳转过来，需要显示登录模态框
  useEffect(() => {
    if (location.state?.showLoginModal) {
      setShowLoginModal(true);
      // 清除状态，避免重复触发
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className={styles.welcomeRoot}>
      {/* 顶部Logo和登录按钮 */}
      <div className={styles.header}>
        <NavLogo hideEat hideMenu />
        <button
          className={styles.loginBtn}
          onClick={() => setShowLoginModal(true)}
        >
          <span className="h4">Log in</span>
        </button>
      </div>
      {/* Hero Section - Tablet/Desktop Layout */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.value}>
              Collect your nutrition puzzles
            </div>
            <div className={styles.text}>
          Capture, savor, and share your everyday nutrition journey. Create a free account to celebrate your healthy eating moments.
            </div>
            <button
              className={styles.ctaButton}
              onClick={() => setShowSignUpModal(true)}
            >
              <span className={styles.label}>Get started</span>
            </button>
          </div>
          <div className={styles.heroImageContainer}>
            <img 
              src={icons.heroFrame} 
              alt="Hero illustration" 
              className={styles.heroImage}
            />
          </div>
        </div>
      </div>
      {/* How it works Section - Tablet/Desktop Layout */}
      <div className={styles.howItWorksSection}>
        <div 
          className="h1"
          style={{
            color: '#22221B',
            textAlign: 'center',
            margin: '0 0 48px 0'
          }}
        >
          How it works
        </div>
        <div className={styles.howItWorksGrid}>
          {/* Frame 191 */}
          <div className={styles.frame191}>
            <div className={styles.leftContent}>
              <div className={styles.iconContainer}>
                <img src={icons.collectionsIcon} alt="Collections icon" />
              </div>
              <div className={styles.textContent}>
                <div 
                  className="h2"
                  style={{
                    color: 'var(--Neutral-Primary-Text, #22221B)'
                  }}
                >
                  Pick nutrition puzzles
                </div>
                <div 
                  className="body1"
                  style={{
                    color: 'var(--Neutral-Primary-Text, #22221B)'
                  }}
                >
                  Choose from our well-crafted pixel art puzzle collections with affirmation as the visualization of your daily nutrition progress, and the celebration of your health eating achievement.
                </div>
              </div>
            </div>
            <div className={styles.cardImagesContainer}>
              <img src={icons.card1} alt="Card 1" className={styles.cardImage} />
              <img src={icons.card2} alt="Card 2" className={styles.cardImage} />
            </div>
          </div>
          
          {/* Frame 190 */}
          <div className={styles.frame190}>
            <div className={styles.leftContent}>
              <div className={styles.iconContainer}>
                <img src={icons.cameraIcon} alt="Camera icon" />
              </div>
              <div className={styles.textContent}>
                <div 
                  className="h2"
                  style={{
                    color: '#22221B'
                  }}
                >
                  Capture nutrition intake
                </div>
                <div 
                  className="body1"
                  style={{
                    color: '#22221B'
                  }}
                >
                  Record your nutrition intake by entering value, describing, or just simply taking a picture of the nutrition label.
                </div>
              </div>
            </div>
            <div className={styles.frame266}>
              <img 
                src={icons.bottomSheet} 
                alt="Bottom Sheet" 
                className={styles.frame266Image}
              />
              <img src={icons.scannerCamera} alt="Scanner Camera" className={styles.frame266Image} />
            </div>
          </div>
          
          {/* Frame 192 */}
          <div className={styles.frame192}>
            <div className={styles.leftContent}>
              <div className={styles.iconContainer}>
                <img src={icons.imagePixel} alt="Image pixel icon" />
              </div>
              <div className={styles.textContent}>
                <div 
                  className="h2"
                  style={{
                    color: '#22221B'
                  }}
                >
                  Savor nutrition progress in a fun and positive way
                </div>
                <div 
                  className="body1"
                  style={{
                    color: '#22221B'
                  }}
                >
                  The pixel art puzzle completes itself as your body is collecting important nutritions that keep you healthy.
                </div>
              </div>
            </div>
            <img 
              src={icons.frame265} 
              alt="Frame 265" 
              className={styles.cardImage}
            />
          </div>
        </div>
      </div>
      {/* Frame 193 */}
      <div className={styles.frame193}>
        <div className={styles.frame193Icon}>
          <img src={icons.trophy} alt="Trophy icon" />
        </div>
        <div 
          className="h2"
          style={{
            color: '#F3F3EC'
          }}
        >
          Celebrate and share your nutrition achievement
        </div>
        <div 
          className="body1"
          style={{
            color: '#F3F3EC'
          }}
        >
          After you meet your daily nutrition goal, the puzzle will be added to your collection to cheer your achievement, and available to share with others to celebrate and inspire healthy habits and mindful eating.
        </div>
        <img 
          src={icons.group170} 
          alt="Group 170" 
          className={styles.cardImage}
        />
      </div>
      {/* Frame 194 */}
      <div className={styles.frame194}>
        <div 
          className="h2"
          style={{
            alignSelf: 'stretch',
            color: 'var(--Neutral-Primary-Text, #22221B)',
            textAlign: 'center'
          }}
        >
          Celebrate your healthy and mindful eating moments.
        </div>
        <button
          className={styles.ctaButton}
          onClick={() => setShowSignUpModal(true)}
        >
          <span className={styles.label}>Get Started</span>
        </button>
      </div>
      {/* Footer Component */}
      <Footer />
      {/* 登录弹窗 */}
      <LogIn
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onAuth={() => setShowLoginModal(false)}
        onSwitchToSignUp={() => {
          setShowLoginModal(false);
          setShowSignUpModal(true);
        }}
        onSwitchToForgotPassword={() => {
          setShowLoginModal(false);
          setShowForgotPasswordModal(true);
        }}
      />
      {/* 注册弹窗 */}
      <SignUp
        open={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onAuth={() => setShowSignUpModal(false)}
        onSwitchToLogin={() => {
          setShowSignUpModal(false);
          setShowLoginModal(true);
        }}
      />
      {/* 忘记密码弹窗 */}
      <ForgotPassword
        open={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onBackToLogin={() => {
          setShowForgotPasswordModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
} 