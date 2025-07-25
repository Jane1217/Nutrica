import React from 'react';
import styles from '../styles/SafariCameraPermission.module.css';
import '../../../index.css';

export default function About() {
  return (
    <div className={styles.container}>
      {/* 顶部logo */}
      <div className={styles.header}>
        <img 
          src="/assets/logo.svg" 
          alt="Nutrica Logo" 
          className={styles.logo}
        />
      </div>
      <div className={styles.content}>
        <h1 className={`${styles.title} h1`} style={{textAlign: 'left', alignSelf: 'flex-start', width: '100%'}}>About</h1>
        <div className={`${styles.introduction} body1`}>
          <p>
            [Placeholder] Nutrica is a project made by a small but mighty team:
          </p>
        </div>
        
        {/* 团队成员介绍 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '24px',
          gap: '16px'
        }}>
          {/* Frank Gong */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              marginBottom: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/assets/Frank.jpg" 
                alt="Frank Gong" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div className="h4" style={{
              textAlign: 'center',
              marginBottom: '4px'
            }}>
              Frank Gong
            </div>
                         <div className="h5" style={{
               textAlign: 'center',
               color: 'var(--Neutral-Secondary-Text, #6A6A61)'
             }}>
               Designer
             </div>
          </div>

          {/* Yanxin Chen */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              marginBottom: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/assets/Yanxin.png" 
                alt="Yanxin Chen" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div className="h4" style={{
              textAlign: 'center',
              marginBottom: '4px'
            }}>
              Yanxin Chen
            </div>
                         <div className="h5" style={{
               textAlign: 'center',
               color: 'var(--Neutral-Secondary-Text, #6A6A61)'
             }}>
               Developer
             </div>
           </div>

           {/* Zijin Zhou */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              marginBottom: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/assets/Zijin.png" 
                alt="Zijin Zhou" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div className="h4" style={{
              textAlign: 'center',
              marginBottom: '4px'
            }}>
              Zijin Zhou
            </div>
                         <div className="h5" style={{
               textAlign: 'center',
               color: 'var(--Neutral-Secondary-Text, #6A6A61)'
             }}>
               Developer
             </div>
           </div>
         </div>

        {/* 联系方式 */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px'
        }}>
                                <p className="h4" style={{
             marginBottom: '0px',
             color: 'var(--Neutral-Primary-Text)'
           }}>
             We'd love to hear your feedback!
           </p>
           <p className="h4" style={{
             marginBottom: '8px',
             marginTop: '0px',
             color: 'var(--Neutral-Primary-Text)'
           }}> 
             Contact us at
           </p>
          <div className="h4" style={{
            color: 'var(--Brand-Dark)',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}>
            Nutrica.life.app@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
} 