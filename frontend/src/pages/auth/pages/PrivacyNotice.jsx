import React from 'react';
import styles from '../styles/SafariCameraPermission.module.css';

export default function PrivacyNotice() {
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
        <h1 className={`${styles.title} h1`} style={{textAlign: 'left', alignSelf: 'flex-start', width: '100%'}}>Privacy Notice</h1>
        <div className={styles.introduction}>
          <p>
            We are collecting basic user information (such as email address and activity data) for the purpose of improving our website and application. This information is also necessary for the website to function as intended.
          </p>
          <br />
          <p>
            We use carefully selected service providers to operate Nutrica, including Supabase for authentication and data storage and OpenAI to analyze food descriptions or label images that you choose to submit. We do not sell your personal information. Collected information is used to provide and improve the service.
          </p>
          <br />
          <p>
            You may delete your account and all associated data at any time by using the “Delete Account” option available on the Account page.
          </p>
          <br />
          <p>
            By creating an account, you consent to the collection and use of your data as described above.
          </p>
          <br />
          <p>
            If you would like your data to be deleted, please contact us at Nutrica.life.app@gmail.com.
          </p>
          <br />
          <p>
            This website is operated by an independent project team and is not part of a registered company.
          </p>
        </div>
      </div>
    </div>
  );
}
