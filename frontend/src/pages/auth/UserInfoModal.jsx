import React, { useState } from 'react';
import ModalWrapper from '../../components/ModalWrapper';
import styles from './Auth.module.css';

export default function UserInfoModal({ open, onClose, onSubmit, initialData = {} }) {
  const [name, setName] = useState(initialData.name || '');
  const [gender, setGender] = useState(initialData.gender || 'male');
  const [age, setAge] = useState(initialData.age || '');
  const [unit, setUnit] = useState(initialData.unit || 'us');
  const [height, setHeight] = useState(initialData.height || '');
  const [weight, setWeight] = useState(initialData.weight || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ name, gender, age, unit, height, weight });
    onClose && onClose();
  };

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <form className={styles.modalForm} onSubmit={handleSubmit}>
        <header className={styles.modalHeader}>
          <div className="h1" style={{ marginBottom: 16 }}>Welcome to Nutrica!</div>
        </header>
        <div className={styles.modalInputWrapper}>
          <label className="h5" style={{ marginBottom: 16, display: 'block' }}>Let us know your first name:</label>
          <input className={`${styles.modalInput} body1`} value={name} onChange={e => setName(e.target.value)} required style={{ marginBottom: 24, width: '100%', boxSizing: 'border-box', borderRadius: 8, border: '1px solid #CDD3C4', background: '#FCFCF8', padding: '20px 16px' }} />
          <hr className={styles.modalDivider} />
          <div className="h5" style={{ fontWeight: 700, marginBottom: 16, textAlign: 'left' }}>
            Tell us some info so that we can estimate your Basal Metabolic Rate (BMR) and Marcos needed for healthy eating.
          </div>
          <div className="body2" style={{ fontSize: 13, color: '#22221B', marginBottom: 16, textAlign: 'left' }}>
            * <span className="body2" style={{ fontWeight: 700, color: '#22221B'}}>Your data will remain private.</span> You may skip this section now and we will estimate based on the <a href="https://www.nal.usda.gov/human-nutrition-and-food-safety/usda-nutrition-recommendations" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'underline' }}>USDA recommendation</a>. Come back anytime from the account page.
          </div>
          <div className="h2" style={{ fontWeight: 700, marginTop: 24, marginBottom: 8, textAlign: 'left' }}>Gender</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16}}>
            <button type="button" className={`${styles.modalOptionBtn} ${gender === 'male' ? styles.modalOptionBtnActive : ''}`} onClick={() => setGender('male')}>Male</button>
            <button type="button" className={`${styles.modalOptionBtn} ${gender === 'female' ? styles.modalOptionBtnActive : ''}`} onClick={() => setGender('female')}>Female</button>
            <button type="button" className={`${styles.modalOptionBtn} ${gender === 'other' ? styles.modalOptionBtnActive : ''}`} onClick={() => setGender('other')}>Other</button>
          </div>
          {/* Age 行 */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 8px 0', width: '100%', height: 48 }}>
            <div className="h2" style={{ fontWeight: 700, textAlign: 'left', minWidth: 48, height: 48, display: 'flex', alignItems: 'center' }}>Age</div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 48 }}>
              <input
                className={`${styles.modalInput} h5`}
                type="number"
                min="0"
                value={age}
                onChange={e => setAge(e.target.value)}
                style={{
                  width: 96,
                  height: 48,
                  lineHeight: '48px',
                  borderRadius: 12,
                  border: '1.5px solid #CDD3C4',
                  background: '#F3F3EC',
                  textAlign: 'center',
                  display: 'block',
                  boxSizing: 'border-box',
                  margin: 0
                }}
              />
            </div>
          </div>
          <div style={{ fontWeight: 700, margin: '16px 0 8px 0', textAlign: 'left' }}>Units</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button type="button" className={unit === 'us' ? styles.modalBtn : styles.modalBtnOutline} style={{ flex: 1 }} onClick={() => setUnit('us')}>US Units</button>
            <button type="button" className={unit === 'metric' ? styles.modalBtn : styles.modalBtnOutline} style={{ flex: 1 }} onClick={() => setUnit('metric')}>Metric Units</button>
          </div>
          <div style={{ fontWeight: 700, margin: '16px 0 8px 0', textAlign: 'left' }}>Height</div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <input className={styles.modalInput} type="number" min="0" value={height} onChange={e => setHeight(e.target.value)} style={{ width: 100, marginRight: 8 }} />
            <span style={{ color: '#888', fontSize: 16 }}>{unit === 'us' ? 'in' : 'cm'}</span>
          </div>
          <div style={{ fontWeight: 700, margin: '16px 0 8px 0', textAlign: 'left' }}>Weight</div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <input className={styles.modalInput} type="number" min="0" value={weight} onChange={e => setWeight(e.target.value)} style={{ width: 100, marginRight: 8 }} />
            <span style={{ color: '#888', fontSize: 16 }}>{unit === 'us' ? 'lb' : 'kg'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 32, justifyContent: 'center' }}>
          <button type="button" className={styles.modalBtnOutline} onClick={onClose}>Skip</button>
          <button type="submit" className={styles.modalBtn}>Next</button>
        </div>
      </form>
    </ModalWrapper>
  );
}
