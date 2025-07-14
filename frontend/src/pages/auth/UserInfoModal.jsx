import React, { useState, useEffect } from 'react';
import ModalWrapper from '../../components/ModalWrapper';
import styles from './Auth.module.css';

export default function UserInfoModal({ open, onClose, onSubmit, initialData = {} }) {
  const [name, setName] = useState(initialData.name || '');
  const [gender, setGender] = useState(initialData.gender || 'male');
  const [age, setAge] = useState(initialData.age || '');
  const [unit, setUnit] = useState(initialData.unit || 'us');
  const [height, setHeight] = useState(initialData.height || '');
  const [weight, setWeight] = useState(initialData.weight || '');

  // 关键：每次initialData变化时自动同步state
  useEffect(() => {
    setName(initialData.name || '');
    setGender(initialData.gender || 'male');
    setAge(initialData.age || '');
    setUnit(initialData.unit || 'us');
    setHeight(initialData.height || '');
    setWeight(initialData.weight || '');
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ name, gender, age, unit, height, weight });
    // 移除直接调用 onClose，让父组件在成功写入 Supabase 后决定是否关闭
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
          <div className="h5" style={{ marginBottom: 16, textAlign: 'left' }}>
            Tell us some info so that we can estimate your Basal Metabolic Rate (BMR) and Marcos needed for healthy eating.
          </div>
          <div className="body2" style={{ fontSize: 14, color: '#22221B', marginBottom: 16, textAlign: 'left' }}>
            * <span className="body2" style={{ color: '#22221B'}}>Your data will remain private.</span> <span className="body2" style={{ color: 'rgba(34, 34, 27, 0.60)'}}>
              You may skip this section now and we will estimate based on the <a href="https://www.nal.usda.gov/human-nutrition-and-food-safety/usda-nutrition-recommendations" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'underline' }}>USDA recommendation</a>. Come back anytime from the account page.
            </span>
          </div>
          <div className="h2" style={{ fontWeight: 700, marginTop: 24, marginBottom: 8, textAlign: 'left' }}>Gender</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16}}>
            <button type="button" className={`${styles.modalOptionBtn} ${gender === 'male' ? styles.modalOptionBtnActive : ''}`} onClick={() => setGender('male')}>Male</button>
            <button type="button" className={`${styles.modalOptionBtn} ${gender === 'female' ? styles.modalOptionBtnActive : ''}`} onClick={() => setGender('female')}>Female</button>
            <button type="button" className={`${styles.modalOptionBtn} ${gender === 'other' ? styles.modalOptionBtnActive : ''}`} onClick={() => setGender('other')}>Other</button>
          </div>
          {/* Age 行 */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '47px 0 46px 0', width: '100%', height: 48 }}>
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
          
          <div style={{ display: 'flex', gap: 16, marginBottom: 27 }}>
            <button
              type="button"
              onClick={() => setUnit('us')}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: 48,
                borderRadius: '999px',
                background: unit === 'us' ? '#26361B' : '#F3F3EC',
                color: unit === 'us' ? '#FFF' : '#26361B',
                border: unit === 'us' ? 'none' : '1px solid #CDD3C4',
                fontWeight: 500,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s, border 0.2s'
              }}
            >US Units</button>
            <button
              type="button"
              onClick={() => setUnit('metric')}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: 48,
                borderRadius: '999px',
                background: unit === 'metric' ? '#26361B' : '#F3F3EC',
                color: unit === 'metric' ? '#FFF' : '#26361B',
                border: unit === 'metric' ? 'none' : '1px solid #CDD3C4',
                fontWeight: 500,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s, border 0.2s'
              }}
            >Metric Units</button>
          </div>
          {/* Height 行 */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '37px 0', width: '100%', height: 48 }}>
            <div className="h2" style={{ fontWeight: 700, textAlign: 'left', minWidth: 90, height: 48, display: 'flex', alignItems: 'center' }}>Height</div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 48 }}>
              <div style={{ position: 'relative', width: 96, height: 48 }}>
                <input
                  className={`${styles.modalInput} h5`}
                  type="number"
                  min="0"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  style={{
                    width: 96,
                    height: 48,
                    lineHeight: '24px',
                    borderRadius: 12,
                    border: '1.5px solid #CDD3C4',
                    background: '#F3F3EC',
                    textAlign: 'left',
                    display: 'block',
                    boxSizing: 'border-box',
                    margin: 0,
                    fontWeight: 500,
                    padding: '12px 16px',
                    paddingRight: 38
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: 16,
                  top: 0,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(0,0,0,0.60)',
                  fontFamily: 'Kanit',
                  fontSize: 16,
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '24px',
                  textAlign: 'right',
                  pointerEvents: 'none'
                }}>{unit === 'us' ? 'in' : 'cm'}</span>
              </div>
            </div>
          </div>
          {/* Weight 行 */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '37px 0 74.5px 0', width: '100%', height: 48 }}>
            <div className="h2" style={{ fontWeight: 700, textAlign: 'left', minWidth: 90, height: 48, display: 'flex', alignItems: 'center' }}>Weight</div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 48 }}>
              <div style={{ position: 'relative', width: 96, height: 48 }}>
                <input
                  className={`${styles.modalInput} h5`}
                  type="number"
                  min="0"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  style={{
                    width: 96,
                    height: 48,
                    lineHeight: '24px',
                    borderRadius: 12,
                    border: '1.5px solid #CDD3C4',
                    background: '#F3F3EC',
                    textAlign: 'left',
                    display: 'block',
                    boxSizing: 'border-box',
                    margin: 0,
                    fontWeight: 500,
                    padding: '12px 16px',
                    paddingRight: 38
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: 16,
                  top: 0,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(0,0,0,0.60)',
                  fontFamily: 'Kanit',
                  fontSize: 16,
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '24px',
                  textAlign: 'right',
                  pointerEvents: 'none'
                }}>{unit === 'us' ? 'lb' : 'kg'}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 32, justifyContent: 'center', marginBottom: 24 }}>
          <button
            type="button"
            className="h5"
            onClick={onClose}
            style={{
              display: 'flex',
              width: 119,
              height: 80,
              padding: '12px 24px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
              borderRadius: 36,
              background: '#E7E7D5',
              border: 'none',
              cursor: 'pointer'
            }}
          >Skip</button>
          <button
            type="submit"
            className="h5"
            style={{
              display: 'flex',
              width: 200,
              height: 80,
              padding: '13px 21px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
              borderRadius: 36,
              background: 'var(--Brand-Dark, #2A4E14)',
              color: '#FFF',
              border: 'none',
              cursor: 'pointer'
            }}
          >Next</button>
        </div>
      </form>
    </ModalWrapper>
  );
}
