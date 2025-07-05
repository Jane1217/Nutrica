import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './Detail.module.css';

export default function Detail({ meal, onClose, onUpdate, onDuplicate, onDelete }) {
  const [editMode, setEditMode] = useState(false);
  const [serving, setServing] = useState(meal.serving);
  const [nutrition, setNutrition] = useState({ ...meal.nutrition });
  const [name, setName] = useState(meal.name);

  const handleServingChange = (newServing) => {
    const ratio = newServing / serving;
    const newNutrition = {};
    Object.keys(nutrition).forEach(key => {
      newNutrition[key] = Math.round(meal.nutrition[key] * newServing);
    });
    setServing(newServing);
    setNutrition(newNutrition);
  };

  const handleSave = async () => {
    const { data } = await supabase.from('meals').update({
      name, serving, nutrition
    }).eq('id', meal.id).select().single();
    onUpdate(data);
    onClose();
  };

  const handleDuplicate = async () => {
    const now = new Date();
    const { data } = await supabase.from('meals').insert([{
      ...meal,
      id: undefined,
      time: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }]).select().single();
    onDuplicate(data);
    onClose();
    setTimeout(() => onUpdate(data), 0);
  };

  const handleDelete = async () => {
    await supabase.from('meals').delete().eq('id', meal.id);
    onDelete(meal.id);
  };

  return (
    <div className={styles['modal-backdrop']}>
      <div className={styles['modal-content']}>
        {/* 顶部：食物名+编辑+关闭 */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <input value={name} onChange={e => setName(e.target.value)} disabled={!editMode} style={{fontWeight:700,fontSize:20,border:'none',background:'transparent',outline:'none',flex:1}} />
          <button onClick={() => setEditMode(!editMode)} style={{marginLeft:8,border:'none',background:'none',cursor:'pointer',fontSize:20}} title="Edit"><span role="img" aria-label="edit">✏️</span></button>
          <button onClick={onClose} style={{marginLeft:8,border:'none',background:'none',cursor:'pointer',fontSize:20}} title="Close">✖️</button>
        </div>
        {/* 操作按钮区 */}
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          <button className={styles.btn} onClick={handleDuplicate}>Quick Duplicate</button>
          <button className={styles.btn} onClick={handleDelete}>Delete</button>
        </div>
        {/* 时间 */}
        <div style={{marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Time</div>
          <input value={new Date(meal.time).toLocaleString('en-US', { weekday:'long', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:true })} disabled className={styles.input} />
        </div>
        {/* 份数选择 */}
        <div style={{marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Serving</div>
          <div style={{display:'flex',gap:8}}>
            {[1,2,3].map(n => (
              <button key={n} onClick={() => setServing(n)} className={n===serving?`${styles['serving-btn']} ${styles['serving-btn-active']}`:styles['serving-btn']}>{n}</button>
            ))}
          </div>
        </div>
        {/* 营养信息 */}
        <div style={{marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
            <div style={{fontWeight:700,fontSize:14}}>Data Extracted</div>
            <button onClick={() => setEditMode(!editMode)} style={{border:'none',background:'none',cursor:'pointer',fontSize:16}} title="Edit"><span role="img" aria-label="edit">✏️</span></button>
          </div>
          <div style={{border:'1px solid #000',borderRadius:4,padding:8,background:'#fff'}}>
            {['Calories','Protein','Fiber','Sodium'].map(k => (
              <div key={k} className={styles['nutrition-row']}>
                <div className={styles['nutrition-label']}>{k}</div>
                <input value={nutrition[k]||''} onChange={e => setNutrition({ ...nutrition, [k]: Number(e.target.value) })} disabled={!editMode} className={editMode?`${styles['nutrition-input']} ${styles['nutrition-input-edit']}`:styles['nutrition-input']} />
              </div>
            ))}
          </div>
        </div>
        {/* Save按钮 */}
        <button onClick={handleSave} className={`${styles.btn} ${styles['btn-black']}`} style={{width:'100%',marginTop:12,fontSize:18}}>Save</button>
      </div>
    </div>
  );
} 