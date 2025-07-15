import React, { useState } from 'react';
import CameraPermissionModal from './CameraPermissionModal';
import EnterValueModal from './EnterValueModal';
import DescribeModal from './DescribeModal';
import DescribeFoodModal from './DescribeFoodModal';
// 移除本地ScanLabelPage引用，后续用路由跳转
import './EatModal.css';
import { useNavigate } from 'react-router-dom';
import { foodApi, handleApiError } from '../../utils/api';

export default function EatModal({ onClose, foods = [], onDescribe, onEnterValue, userId }) {
  const [step, setStep] = useState('main'); // 'main' | 'camera-permission' | 'scan' | 'enter-value' | 'describe' | 'describe-food'
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleScanLabel = () => setStep('camera-permission');
  const handleCameraPermissionOk = () => {
    // 跳转到 scan label 页面
    navigate('/eat/scan label');
  };
  const handleCloseScan = () => setStep('main');
  const handleEnterValue = () => setStep('enter-value');
  const handleCloseEnterValue = () => setStep('main');
  const handleDescribe = () => setStep('describe');
  const handleCloseDescribe = () => setStep('main');
  const handleCloseDescribeFood = () => setStep('main');
  const handleBackDescribeFood = () => setStep('describe');
  const handleBackEnterValue = () => setStep('main');
  const handleBackDescribe = () => setStep('main');
  
  const handleDescribeNext = async (description) => {
    setLoading(true);
    setError('');
    try {
      const response = await foodApi.parseFoodDescription(description);
      if (response.success) {
        setAiData(response.data);
        setStep('describe-food');
      } else {
        setError(response.error || 'AI analysis failed');
      }
    } catch (error) {
      setError(handleApiError(error, 'AI analysis failed'));
    } finally {
      setLoading(false);
    }
  };

  // 在EatModal内部定义CloseButton
  function CloseButton({ onClick }) {
    return (
      <button className="eat-modal-close-btn" onClick={onClick}>
        <span className="close-fill">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.9996 14.122L17.3026 19.425C17.584 19.7064 17.9657 19.8645 18.3636 19.8645C18.7616 19.8645 19.1432 19.7064 19.4246 19.425C19.706 19.1436 19.8641 18.762 19.8641 18.364C19.8641 17.9661 19.706 17.5844 19.4246 17.303L14.1196 12L19.4236 6.697C19.5629 6.55767 19.6733 6.39227 19.7487 6.21025C19.824 6.02823 19.8628 5.83315 19.8627 5.63615C19.8627 5.43915 19.8238 5.24409 19.7484 5.0621C19.673 4.88012 19.5624 4.71477 19.4231 4.5755C19.2838 4.43624 19.1184 4.32578 18.9364 4.25043C18.7543 4.17509 18.5592 4.13633 18.3623 4.13638C18.1653 4.13642 17.9702 4.17527 17.7882 4.2507C17.6062 4.32613 17.4409 4.43667 17.3016 4.576L11.9996 9.879L6.6966 4.576C6.5583 4.43267 6.39284 4.31832 6.20987 4.23963C6.0269 4.16093 5.83009 4.11946 5.63092 4.11763C5.43176 4.11581 5.23422 4.15367 5.04984 4.229C4.86546 4.30434 4.69793 4.41564 4.55703 4.55641C4.41612 4.69718 4.30466 4.86461 4.22916 5.04891C4.15365 5.23322 4.1156 5.43072 4.11724 5.62989C4.11887 5.82906 4.16016 6.02591 4.23869 6.20895C4.31721 6.39199 4.43141 6.55757 4.5746 6.696L9.8796 12L4.5756 17.304C4.43241 17.4424 4.31821 17.608 4.23969 17.7911C4.16116 17.9741 4.11987 18.1709 4.11824 18.3701C4.1166 18.5693 4.15465 18.7668 4.23016 18.9511C4.30566 19.1354 4.41712 19.3028 4.55803 19.4436C4.69893 19.5844 4.86646 19.6957 5.05084 19.771C5.23522 19.8463 5.43276 19.8842 5.63192 19.8824C5.83109 19.8806 6.0279 19.8391 6.21087 19.7604C6.39384 19.6817 6.5593 19.5673 6.6976 19.424L11.9996 14.122Z" fill="black"/>
          </svg>
        </span>
      </button>
    );
  }

  return (
    <>
      <div className="eat-modal-overlay" onClick={onClose}></div>
      {step === 'main' && (
        <div className="eat-modal">
          <div className="eat-modal-group1">
            <span className="eat-modal-title h1">Eat</span>
            <CloseButton onClick={onClose} />
          </div>
          {/* group2: 最近食物 */}
          <div className="eat-modal-group2">
            <div className="eat-modal-group2-1">
              <span className="eat-modal-recent-text">Recent</span>
              <span className="eat-modal-history-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21C9.9 21 8.04167 20.3627 6.425 19.088C4.80833 17.8133 3.75833 16.184 3.275 14.2C3.20833 13.95 3.25833 13.721 3.425 13.513C3.59167 13.305 3.81667 13.184 4.1 13.15C4.36667 13.1167 4.60833 13.1667 4.825 13.3C5.04167 13.4333 5.19167 13.6333 5.275 13.9C5.675 15.4 6.5 16.625 7.75 17.575C9 18.525 10.4167 19 12 19C13.95 19 15.6043 18.321 16.963 16.963C18.3217 15.605 19.0007 13.9507 19 12C18.9993 10.0493 18.3203 8.39533 16.963 7.038C15.6057 5.68067 13.9513 5.00133 12 5C10.85 5 9.775 5.26667 8.775 5.8C7.775 6.33333 6.93333 7.06667 6.25 8H8C8.28333 8 8.521 8.096 8.713 8.288C8.905 8.48 9.00067 8.71733 9 9C8.99933 9.28267 8.90333 9.52033 8.712 9.713C8.52067 9.90567 8.28333 10.0013 8 10H4C3.71667 10 3.47933 9.904 3.288 9.712C3.09667 9.52 3.00067 9.28267 3 9V5C3 4.71667 3.096 4.47933 3.288 4.288C3.48 4.09667 3.71733 4.00067 4 4C4.28267 3.99933 4.52033 4.09533 4.713 4.288C4.90567 4.48067 5.00133 4.718 5 5V6.35C5.85 5.28333 6.88767 4.45833 8.113 3.875C9.33833 3.29167 10.634 3 12 3C13.25 3 14.421 3.23767 15.513 3.713C16.605 4.18833 17.555 4.82967 18.363 5.637C19.171 6.44433 19.8127 7.39433 20.288 8.487C20.7633 9.57967 21.0007 10.7507 21 12C20.9993 13.2493 20.762 14.4203 20.288 15.513C19.814 16.6057 19.1723 17.5557 18.363 18.363C17.5537 19.1703 16.6037 19.812 15.513 20.288C14.4223 20.764 13.2513 21.0013 12 21ZM13 11.6L15.5 14.1C15.6833 14.2833 15.775 14.5167 15.775 14.8C15.775 15.0833 15.6833 15.3167 15.5 15.5C15.3167 15.6833 15.0833 15.775 14.8 15.775C14.5167 15.775 14.2833 15.6833 14.1 15.5L11.3 12.7C11.2 12.6 11.125 12.4877 11.075 12.363C11.025 12.2383 11 12.109 11 11.975V8C11 7.71667 11.096 7.47933 11.288 7.288C11.48 7.09667 11.7173 7.00067 12 7C12.2827 6.99933 12.5203 7.09533 12.713 7.288C12.9057 7.48067 13.0013 7.718 13 8V11.6Z" fill="#22221B"/>
                </svg>
              </span>
            </div>
            <div className="eat-modal-group2-2">
              {foods.map((food, idx) => (
                <div className="eat-modal-food-card" key={idx}>
                  <div className="eat-modal-food-wrapper">
                    <div className="eat-modal-food-heading">
                      <span className="eat-modal-food-icon" style={{fontSize: 'var(--h4-font-size)'}}>{food.emoji}</span>
                      <span className="eat-modal-food-name">{food.name}</span>
                    </div>
                    <span className="eat-modal-food-time">{food.time}</span>
                  </div>
                  <div className="eat-modal-nutrition-facts">
                    {food.nutrition.map((item, i) => (
                      <div className="eat-modal-nutrition-item" key={i} style={{borderRight: i === food.nutrition.length-1 ? 'none' : undefined}}>
                        <span className="eat-modal-nutrition-type">{item.type}</span>
                        <span className="eat-modal-nutrition-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* group3: 横线和AI按钮 */}
          <div className="eat-modal-group3">
            <div className="eat-modal-divider"></div>
          </div>
          <div className="eat-modal-group3-1">
            <button className="eat-modal-ai-btn" onClick={handleDescribe}>
              <span className="eat-modal-ai-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M11.953 2.25C9.636 2.25 7.835 2.25 6.433 2.4C5.015 2.553 3.892 2.87 2.996 3.586C2.076 4.322 1.646 5.279 1.443 6.486C1.25 7.638 1.25 9.104 1.25 10.932V11.115C1.25 12.897 1.25 14.13 1.45 15.049C1.558 15.544 1.728 15.974 1.995 16.372C2.259 16.764 2.595 17.094 2.996 17.414C3.627 17.919 4.371 18.224 5.25 18.414V21C5.25012 21.1314 5.28475 21.2605 5.35044 21.3743C5.41613 21.4881 5.51057 21.5826 5.62429 21.6484C5.73802 21.7143 5.86704 21.7491 5.99844 21.7493C6.12984 21.7496 6.259 21.7153 6.373 21.65C6.959 21.315 7.478 20.95 7.953 20.606L8.257 20.385C8.59525 20.1318 8.94073 19.8883 9.293 19.655C10.137 19.107 10.943 18.75 12 18.75H12.047C14.364 18.75 16.165 18.75 17.567 18.6C18.985 18.447 20.108 18.13 21.004 17.414C21.404 17.094 21.741 16.764 22.004 16.372C22.272 15.974 22.442 15.544 22.55 15.049C22.75 14.13 22.75 12.897 22.75 11.115V10.932C22.75 9.104 22.75 7.638 22.557 6.487C22.354 5.279 21.924 4.322 21.004 3.586C20.108 2.869 18.985 2.553 17.567 2.401C16.165 2.25 14.364 2.25 12.047 2.25H11.953Z" fill="#2A4E14"/>
                </svg>
              </span>
              <span className="eat-modal-ai-text">Describe</span>
            </button>
            <button className="eat-modal-ai-btn" onClick={handleEnterValue}>
              <span className="eat-modal-ai-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.51 4.938C11.067 4.904 11.478 4.505 11.494 3.947C11.5023 3.64906 11.5023 3.35094 11.494 3.053C11.478 2.495 11.067 2.096 10.5095 2.062C9.98 2.029 9.178 2 8 2C6.822 2 6.02 2.029 5.49 2.062C4.933 2.096 4.522 2.495 4.506 3.053C4.4974 3.35094 4.4974 3.64906 4.506 3.947C4.522 4.505 4.933 4.904 5.4905 4.938C5.7735 4.9555 6.1345 4.972 6.5895 4.9835C6.5475 6.1805 6.5 8.349 6.5 12C6.5 15.651 6.5475 17.8195 6.5895 19.0165C6.1345 19.028 5.7735 19.0445 5.49 19.0615C4.933 19.0965 4.522 19.495 4.506 20.053C4.4974 20.3509 4.4974 20.6491 4.506 20.947C4.522 21.505 4.933 21.9035 5.4905 21.938C6.02 21.971 6.823 22 8 22C9.177 22 9.98 21.971 10.51 21.938C11.067 21.9035 11.478 21.505 11.494 20.947C11.5023 20.6491 11.5023 20.3509 11.494 20.053C11.478 19.495 11.067 19.0965 10.5095 19.062C10.1436 19.0402 9.77741 19.0251 9.411 19.0165C9.4525 17.8195 9.5 15.651 9.5 12C9.5 8.349 9.4525 6.1805 9.411 4.9835C9.77756 4.9748 10.144 4.9593 10.51 4.938ZM11 12C11 9.8665 10.984 8.234 10.962 7.0015C11.298 7.0005 11.644 7 12 7C16.727 7 19.718 7.089 21.253 7.1525C22.2125 7.1925 23.091 7.8175 23.2655 8.84C23.389 9.565 23.5 10.605 23.5 12C23.5 13.395 23.389 14.435 23.265 15.16C23.091 16.1825 22.2125 16.808 21.253 16.8475C19.718 16.911 16.727 17 12 17C11.644 17 11.298 16.9995 10.962 16.9985C10.984 15.766 11 14.1335 11 12ZM5 12C5 14.09 5.0155 15.699 5.037 16.922C4.27348 16.9033 3.51012 16.8784 2.747 16.8475C1.7875 16.8075 0.909 16.1825 0.7345 15.16C0.611 14.435 0.5 13.395 0.5 12C0.5 10.605 0.611 9.565 0.735 8.84C0.909 7.8175 1.7875 7.1925 2.747 7.1525C3.31 7.129 4.0685 7.1025 5.037 7.0775C5.01055 8.7182 4.99821 10.3591 5 12Z" fill="#2A4E14"/>
                </svg>
              </span>
              <span className="eat-modal-ai-text">Enter Value</span>
            </button>
            <button className="eat-modal-ai-btn" onClick={handleScanLabel}>
              <span className="eat-modal-ai-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2.83333V7C22 7.22101 21.9122 7.43297 21.7559 7.58926C21.5996 7.74554 21.3877 7.83333 21.1667 7.83333C20.9457 7.83333 20.7337 7.74554 20.5774 7.58926C20.4211 7.43297 20.3333 7.22101 20.3333 7V3.66667H17C16.779 3.66667 16.567 3.57887 16.4107 3.42259C16.2545 3.26631 16.1667 3.05435 16.1667 2.83333C16.1667 2.61232 16.2545 2.40036 16.4107 2.24408C16.567 2.0878 16.779 2 17 2H21.1667C21.3877 2 21.5996 2.0878 21.7559 2.24408C21.9122 2.40036 22 2.61232 22 2.83333ZM7 20.3333H3.66667V17C3.66667 16.779 3.57887 16.567 3.42259 16.4107C3.26631 16.2545 3.05435 16.1667 2.83333 16.1667C2.61232 16.1667 2.40036 16.2545 2.24408 16.4107C2.0878 16.567 2 16.779 2 17V21.1667C2 21.3877 2.0878 21.5996 2.24408 21.7559C2.40036 21.9122 2.61232 22 2.83333 22H7C7.22101 22 7.43297 21.9122 7.58926 21.7559C7.74554 21.5996 7.83333 21.3877 7.83333 21.1667C7.83333 20.9457 7.74554 20.7337 7.58926 20.5774C7.43297 20.4211 7.22101 20.3333 7 20.3333ZM21.1667 16.1667C20.9457 16.1667 20.7337 16.2545 20.5774 16.4107C20.4211 16.567 20.3333 16.779 20.3333 17V20.3333H17C16.779 20.3333 16.567 20.4211 16.4107 20.5774C16.2545 20.7337 16.1667 20.9457 16.1667 21.1667C16.1667 21.3877 16.2545 21.5996 16.4107 21.7559C16.567 21.9122 16.779 22 17 22H21.1667C21.3877 22 21.5996 21.9122 21.7559 21.7559C21.9122 21.5996 22 21.3877 22 21.1667V17C22 16.779 21.9122 16.567 21.7559 16.4107C21.5996 16.2545 21.3877 16.1667 21.1667 16.1667ZM2.83333 7.83333C3.05435 7.83333 3.26631 7.74554 3.42259 7.58926C3.57887 7.43297 3.66667 7.22101 3.66667 7V3.66667H7C7.22101 3.66667 7.43297 3.57887 7.58926 3.42259C7.74554 3.26631 7.83333 3.05435 7.83333 2.83333C7.83333 2.61232 7.74554 2.40036 7.58926 2.24408C7.43297 2.0878 7.22101 2 7 2H2.83333C2.61232 2 2.40036 2.0878 2.24408 2.24408C2.0878 2.40036 2 2.61232 2 2.83333V7C2 7.22101 2.0878 7.43297 2.24408 7.58926C2.40036 7.74554 2.61232 7.83333 2.83333 7.83333ZM6.16667 7V17C6.16667 17.221 6.25446 17.433 6.41074 17.5893C6.56702 17.7455 6.77899 17.8333 7 17.8333H17C17.221 17.8333 17.433 17.7455 17.5893 17.5893C17.7455 17.433 17.8333 17.221 17.8333 17V7C17.8333 6.77899 17.7455 6.56702 17.5893 6.41074C17.433 6.25446 17.221 6.16667 17 6.16667H7C6.77899 6.16667 6.56702 6.25446 6.41074 6.41074C6.25446 6.56702 6.16667 6.77899 6.16667 7Z" fill="#2A4E14"/>
                </svg>
              </span>
              <span className="eat-modal-ai-text">Scan Label</span>
            </button>
          </div>
        </div>
      )}
      {step === 'camera-permission' && (
        <CameraPermissionModal onClose={() => setStep('main')} onOk={handleCameraPermissionOk} />
      )}
      {step === 'enter-value' && (
        <EnterValueModal 
          open={true} 
          onClose={handleCloseEnterValue}
          onBack={handleBackEnterValue}
          onCloseModal={onClose}
          userId={userId}
        />
      )}
      {step === 'describe' && (
        <DescribeModal 
          open={true} 
          onClose={handleCloseDescribe}
          onBack={handleBackDescribe}
          onCloseModal={onClose}
          onNext={handleDescribeNext}
        />
      )}
      {step === 'describe-food' && (
        <DescribeFoodModal 
          open={true} 
          onClose={handleCloseDescribeFood}
          onBack={handleBackDescribeFood}
          onCloseModal={onClose}
          aiData={aiData}
          userId={userId}
        />
      )}
      {/* 跳转到 scan label 页面，不再本地渲染 */}
    </>
  );
} 